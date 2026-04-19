package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type SupplierHandler struct {
	col *mongo.Collection
}

func NewSupplierHandler(db *mongo.Database) *SupplierHandler {
	return &SupplierHandler{col: db.Collection("suppliers")}
}

func (h *SupplierHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var suppliers []models.Supplier
	if err = cursor.All(ctx, &suppliers); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, suppliers)
}

func (h *SupplierHandler) Create(c *gin.Context) {
	var supplier models.Supplier
	if err := c.ShouldBindJSON(&supplier); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	supplier.ID = primitive.NilObjectID
	if supplier.Id == "" {
		supplier.Id = fmt.Sprintf("sup-%d", time.Now().UnixNano())
	}
	supplier.Status = "ACTIVE"
	supplier.CreatedAt = time.Now()
	supplier.UpdatedAt = time.Now()

	res, err := h.col.InsertOne(ctx, supplier)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	supplier.ID = res.InsertedID.(primitive.ObjectID)

	events.Global.Broadcast("suppliers")
	utils.Created(c, supplier)
}

func (h *SupplierHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	updates["updatedAt"] = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": updates})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("suppliers")
	utils.OK(c, gin.H{"message": "Cập nhật thành công"})
}

func (h *SupplierHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("suppliers")
	utils.OK(c, gin.H{"message": "Đã xóa nhà cung cấp"})
}
