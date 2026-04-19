package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type PurchaseOrderHandler struct {
	col      *mongo.Collection
	products *mongo.Collection
}

func NewPurchaseOrderHandler(db *mongo.Database) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{
		col:      db.Collection("purchase_orders"),
		products: db.Collection("products"),
	}
}

func (h *PurchaseOrderHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := h.col.Find(ctx, bson.M{}, opts)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var orders []models.PurchaseOrder
	if err = cursor.All(ctx, &orders); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, orders)
}

func (h *PurchaseOrderHandler) Create(c *gin.Context) {
	var order models.PurchaseOrder
	if err := c.ShouldBindJSON(&order); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	order.ID = primitive.NilObjectID
	if order.Id == "" {
		order.Id = fmt.Sprintf("PO-%d", time.Now().UnixNano()/1000)
	}
	
	// Calculate total amount
	var total float64
	for _, item := range order.Items {
		total += item.TotalCost
	}
	order.TotalAmount = total
	order.Status = "PENDING"
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()

	res, err := h.col.InsertOne(ctx, order)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	order.ID = res.InsertedID.(primitive.ObjectID)

	events.Global.Broadcast("purchase_orders")
	utils.Created(c, order)
}

func (h *PurchaseOrderHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get existing PO
	var existing models.PurchaseOrder
	if err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&existing); err != nil {
		utils.NotFound(c, "Không tìm thấy đơn nhập hàng")
		return
	}

	// If changing to COMPLETED, update product stock
	if existing.Status != "COMPLETED" && body.Status == "COMPLETED" {
		for _, item := range existing.Items {
			_, err := h.products.UpdateOne(
				ctx,
				bson.M{"id": item.ProductID},
				bson.M{"$inc": bson.M{"stock": item.Quantity}},
			)
			if err != nil {
				utils.InternalError(c, fmt.Errorf("lỗi khi cập nhật tồn kho: %v", err))
				return
			}
		}
		// trigger product broadcast too since stock changed
		events.Global.Broadcast("products")
	}

	_, err := h.col.UpdateOne(
		ctx,
		bson.M{"id": id},
		bson.M{"$set": bson.M{
			"status":    body.Status,
			"updatedAt": time.Now(),
		}},
	)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("purchase_orders")
	utils.OK(c, gin.H{"message": "Cập nhật trạng thái thành công"})
}
