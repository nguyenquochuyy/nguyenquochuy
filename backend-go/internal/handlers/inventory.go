package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type InventoryHandler struct {
	logs     *mongo.Collection
	products *mongo.Collection
}

func NewInventoryHandler(db *mongo.Database) *InventoryHandler {
	return &InventoryHandler{
		logs:     db.Collection("inventoryLogs"),
		products: db.Collection("products"),
	}
}

// POST /api/inventory/adjust
func (h *InventoryHandler) Adjust(c *gin.Context) {
	var body struct {
		ProductID   string `json:"productId" binding:"required"`
		VariantID   string `json:"variantId"`
		Quantity    int    `json:"quantity" binding:"required"`
		Type        string `json:"type" binding:"required"`
		Reason      string `json:"reason"`
		PerformedBy string `json:"performedBy"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Fetch current stock
	var product models.Product
	if err := h.products.FindOne(ctx, bson.M{"id": body.ProductID}).Decode(&product); err != nil {
		utils.NotFound(c, "Không tìm thấy sản phẩm")
		return
	}

	stockBefore := product.Stock
	var stockAfter int
	switch body.Type {
	case "IN":
		stockAfter = stockBefore + body.Quantity
	case "OUT":
		stockAfter = stockBefore - body.Quantity
	default:
		stockAfter = body.Quantity
	}

	// Update product stock
	_, err := h.products.UpdateOne(ctx, bson.M{"id": body.ProductID}, bson.M{"$set": bson.M{"stock": stockAfter}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	// Save inventory log
	log := models.InventoryLog{
		ProductID:   body.ProductID,
		VariantID:   body.VariantID,
		ProductName: product.Name,
		Type:        body.Type,
		Quantity:    body.Quantity,
		StockBefore: stockBefore,
		StockAfter:  stockAfter,
		Reason:      body.Reason,
		PerformedBy: body.PerformedBy,
		CreatedAt:   time.Now(),
	}
	if _, err = h.logs.InsertOne(ctx, log); err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.OK(c, gin.H{"stockBefore": stockBefore, "stockAfter": stockAfter})
}

// GET /api/inventory/logs
func (h *InventoryHandler) Logs(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.logs.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var logs []models.InventoryLog
	if err = cursor.All(ctx, &logs); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, logs)
}
