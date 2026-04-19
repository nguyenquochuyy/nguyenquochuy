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

type WarehouseHandler struct {
	col *mongo.Collection
}

func NewWarehouseHandler(db *mongo.Database) *WarehouseHandler {
	return &WarehouseHandler{col: db.Collection("warehouses")}
}

func (h *WarehouseHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var warehouses []models.Warehouse
	if err = cursor.All(ctx, &warehouses); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, warehouses)
}

func (h *WarehouseHandler) Create(c *gin.Context) {
	var warehouse models.Warehouse
	if err := c.ShouldBindJSON(&warehouse); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	warehouse.ID = primitive.NilObjectID
	if warehouse.Id == "" {
		warehouse.Id = fmt.Sprintf("WH-%d", time.Now().UnixNano()/1000)
	}
	warehouse.Status = "ACTIVE"
	warehouse.CreatedAt = time.Now()
	warehouse.UpdatedAt = time.Now()

	res, err := h.col.InsertOne(ctx, warehouse)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	warehouse.ID = res.InsertedID.(primitive.ObjectID)

	events.Global.Broadcast("warehouses")
	utils.Created(c, warehouse)
}

func (h *WarehouseHandler) Update(c *gin.Context) {
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

	events.Global.Broadcast("warehouses")
	utils.OK(c, gin.H{"message": "Cập nhật thành công"})
}

func (h *WarehouseHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("warehouses")
	utils.OK(c, gin.H{"message": "Đã xóa kho"})
}
