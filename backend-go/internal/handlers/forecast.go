package handlers

import (
	"context"
	"fmt"
	"math"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type ForecastHandler struct {
	products      *mongo.Collection
	inventoryLogs *mongo.Collection
	dailySales    *mongo.Collection
	forecasts     *mongo.Collection
}

func NewForecastHandler(db *mongo.Database) *ForecastHandler {
	return &ForecastHandler{
		products:      db.Collection("products"),
		inventoryLogs: db.Collection("inventoryLogs"),
		dailySales:    db.Collection("daily_sales_stats"),
		forecasts:     db.Collection("stock_forecasts"),
	}
}

// GET /api/inventory/forecast
// Query params: days (default 30), productId (optional filter)
func (h *ForecastHandler) GetForecast(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Parse query params
	forecastDays := 30
	if d := c.Query("days"); d != "" {
		_, _ = fmt.Sscanf(d, "%d", &forecastDays)
	}
	if forecastDays < 7 {
		forecastDays = 7
	}
	if forecastDays > 90 {
		forecastDays = 90
	}

	filterProductID := c.Query("productId")

	// Fetch products
	productFilter := bson.M{}
	if filterProductID != "" {
		productFilter = bson.M{"id": filterProductID}
	}

	productCursor, err := h.products.Find(ctx, productFilter)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	var products []models.Product
	if err = productCursor.All(ctx, &products); err != nil {
		utils.InternalError(c, err)
		return
	}

	// Fetch inventory OUT logs for the last 90 days (sales proxy)
	since := time.Now().AddDate(0, 0, -90).Format("2006-01-02")
	logCursor, err := h.inventoryLogs.Find(ctx, bson.M{
		"type": "OUT",
		"createdAt": bson.M{"$gte": time.Now().AddDate(0, 0, -90)},
	})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	var logs []models.InventoryLog
	if err = logCursor.All(ctx, &logs); err != nil {
		utils.InternalError(c, err)
		return
	}
	_ = since

	// Build daily sales map: productId -> date -> quantity
	type dailyKey struct {
		productID string
		date      string
	}
	dailySalesMap := make(map[dailyKey]int)
	for _, log := range logs {
		dateStr := log.CreatedAt.Format("2006-01-02")
		key := dailyKey{productID: log.ProductID, date: dateStr}
		dailySalesMap[key] += log.Quantity
	}

	// Also merge from daily_sales_stats collection if exists
	statsCursor, err := h.dailySales.Find(ctx, bson.M{})
	if err == nil {
		var stats []models.DailySalesStat
		if statsCursor.All(ctx, &stats) == nil {
			for _, s := range stats {
				key := dailyKey{productID: s.ProductID, date: s.Date}
				dailySalesMap[key] += s.Quantity
			}
		}
	}

	results := make([]models.ProductForecastResult, 0, len(products))
	now := time.Now()

	for _, p := range products {
		// Collect all dates with sales data for this product (last 90 days)
		historicalSales := make(map[string]int)
		for key, qty := range dailySalesMap {
			if key.productID == p.Id {
				historicalSales[key.date] = qty
			}
		}

		// Calculate average daily sales over the last 30 days
		totalSold := 0
		activeDays := 0
		for i := 0; i < 30; i++ {
			day := now.AddDate(0, 0, -i).Format("2006-01-02")
			if qty, ok := historicalSales[day]; ok {
				totalSold += qty
				activeDays++
			}
		}

		var avgDailySales float64
		if activeDays > 0 {
			avgDailySales = float64(totalSold) / 30.0
		} else {
			// Fallback: estimate from stock change patterns using older data
			for i := 30; i < 90; i++ {
				day := now.AddDate(0, 0, -i).Format("2006-01-02")
				if qty, ok := historicalSales[day]; ok {
					totalSold += qty
					activeDays++
				}
			}
			if activeDays > 0 {
				avgDailySales = float64(totalSold) / 90.0
			}
		}

		currentStock := p.Stock
		if p.HasVariants {
			currentStock = 0
			for _, v := range p.Variants {
				currentStock += v.Stock
			}
		}

		// Days until empty
		daysUntilEmpty := 0
		if avgDailySales > 0 {
			daysUntilEmpty = int(math.Floor(float64(currentStock) / avgDailySales))
		} else {
			daysUntilEmpty = 999 // Not selling
		}

		// Reorder point = 7 days of supply buffer
		reorderPoint := int(math.Ceil(avgDailySales * 7))
		if reorderPoint < 5 {
			reorderPoint = 5
		}

		isLowStock := daysUntilEmpty < 14 || currentStock < reorderPoint

		// Build forecast points: past 14 days (actual) + next forecastDays (predicted)
		var forecastPoints []models.ForecastPoint

		// Past 14 days - actual stock snapshot approximated
		for i := 13; i >= 0; i-- {
			day := now.AddDate(0, 0, -i).Format("2006-01-02")
			// Reconstruct approximate past stock (work backwards from current)
			approxStock := currentStock
			for j := 0; j < i; j++ {
				d := now.AddDate(0, 0, -(i - j - 1)).Format("2006-01-02")
				sold := historicalSales[d]
				if sold == 0 && avgDailySales > 0 {
					approxStock += int(math.Round(avgDailySales))
				} else {
					approxStock += sold
				}
			}
			actualVal := approxStock
			soldToday := historicalSales[day]
			dailySalesVal := float64(soldToday)
			if soldToday == 0 && avgDailySales > 0 {
				dailySalesVal = avgDailySales
			}
			forecastPoints = append(forecastPoints, models.ForecastPoint{
				Date:           day,
				ActualStock:    &actualVal,
				PredictedStock: approxStock,
				DailySales:     dailySalesVal,
			})
		}

		// Future days - predicted
		predictedStock := currentStock
		for i := 1; i <= forecastDays; i++ {
			day := now.AddDate(0, 0, i).Format("2006-01-02")
			predictedStock -= int(math.Round(avgDailySales))
			if predictedStock < 0 {
				predictedStock = 0
			}
			forecastPoints = append(forecastPoints, models.ForecastPoint{
				Date:           day,
				PredictedStock: predictedStock,
				DailySales:     avgDailySales,
			})
		}

		// Sort by date
		sort.Slice(forecastPoints, func(i, j int) bool {
			return forecastPoints[i].Date < forecastPoints[j].Date
		})

		productImage := ""
		if len(p.Images) > 0 {
			productImage = p.Images[0]
		}

		result := models.ProductForecastResult{
			ProductID:      p.Id,
			ProductName:    p.Name,
			ProductImage:   productImage,
			CurrentStock:   currentStock,
			AvgDailySales:  math.Round(avgDailySales*100) / 100,
			DaysUntilEmpty: daysUntilEmpty,
			IsLowStock:     isLowStock,
			ReorderPoint:   reorderPoint,
			ForecastPoints: forecastPoints,
		}
		results = append(results, result)

		// Upsert forecast record into DB
		forecast := models.StockForecast{
			ForecastID:     fmt.Sprintf("fc-%s-%s", p.Id, now.Format("20060102")),
			ProductID:      p.Id,
			ProductName:    p.Name,
			CurrentStock:   currentStock,
			PredictedStock: predictedStock,
			AvgDailySales:  avgDailySales,
			DaysUntilEmpty: daysUntilEmpty,
			Date:           now.AddDate(0, 0, forecastDays).Format("2006-01-02"),
			IsLowStock:     isLowStock,
			CreatedAt:      now,
		}
		upsertOpt := options.Update().SetUpsert(true)
		_, _ = h.forecasts.UpdateOne(ctx,
			bson.M{"id": forecast.ForecastID},
			bson.M{"$set": forecast},
			upsertOpt,
		)
	}

	// Sort: low stock products first
	sort.Slice(results, func(i, j int) bool {
		if results[i].IsLowStock != results[j].IsLowStock {
			return results[i].IsLowStock
		}
		return results[i].DaysUntilEmpty < results[j].DaysUntilEmpty
	})

	utils.OK(c, gin.H{
		"forecasts":    results,
		"forecastDays": forecastDays,
		"generatedAt":  now.Format(time.RFC3339),
	})
}

// POST /api/inventory/daily-sales  — record daily sales stats manually
func (h *ForecastHandler) RecordDailySales(c *gin.Context) {
	var body struct {
		ProductID string `json:"productId" binding:"required"`
		Date      string `json:"date" binding:"required"` // YYYY-MM-DD
		Quantity  int    `json:"quantity" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	stat := models.DailySalesStat{
		StatID:    fmt.Sprintf("ds-%s-%s", body.ProductID, body.Date),
		ProductID: body.ProductID,
		Date:      body.Date,
		Quantity:  body.Quantity,
		CreatedAt: time.Now(),
	}

	upsertOpt := options.Update().SetUpsert(true)
	_, err := h.dailySales.UpdateOne(ctx,
		bson.M{"id": stat.StatID},
		bson.M{"$set": stat},
		upsertOpt,
	)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, stat)
}
