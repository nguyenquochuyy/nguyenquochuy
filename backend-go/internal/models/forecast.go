package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// DailySalesStat tracks how many units of a product were sold each day
type DailySalesStat struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	StatID    string             `bson:"id" json:"id"`
	ProductID string             `bson:"productId" json:"productId"`
	Date      string             `bson:"date" json:"date"` // YYYY-MM-DD
	Quantity  int                `bson:"quantity" json:"quantity"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

// StockForecast stores the predicted stock level for a product on a future date
type StockForecast struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	ForecastID     string             `bson:"id" json:"id"`
	ProductID      string             `bson:"productId" json:"productId"`
	ProductName    string             `bson:"productName" json:"productName"`
	CurrentStock   int                `bson:"currentStock" json:"currentStock"`
	PredictedStock int                `bson:"predictedStock" json:"predictedStock"`
	AvgDailySales  float64            `bson:"avgDailySales" json:"avgDailySales"`
	DaysUntilEmpty int                `bson:"daysUntilEmpty" json:"daysUntilEmpty"`
	Date           string             `bson:"date" json:"date"` // YYYY-MM-DD (forecast horizon date)
	IsLowStock     bool               `bson:"isLowStock" json:"isLowStock"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
}

// ForecastPoint is used for chart rendering (predicted vs actual over time)
type ForecastPoint struct {
	Date           string  `json:"date"`
	ActualStock    *int    `json:"actualStock,omitempty"` // nil for future dates
	PredictedStock int     `json:"predictedStock"`
	DailySales     float64 `json:"dailySales"`
}

// ProductForecastResult wraps all forecast data for one product
type ProductForecastResult struct {
	ProductID      string          `json:"productId"`
	ProductName    string          `json:"productName"`
	ProductImage   string          `json:"productImage"`
	CurrentStock   int             `json:"currentStock"`
	AvgDailySales  float64         `json:"avgDailySales"`
	DaysUntilEmpty int             `json:"daysUntilEmpty"`
	IsLowStock     bool            `json:"isLowStock"`
	ReorderPoint   int             `json:"reorderPoint"`
	ForecastPoints []ForecastPoint `json:"forecastPoints"`
}
