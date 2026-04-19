package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type VoucherHandler struct {
	col *mongo.Collection
}

func NewVoucherHandler(db *mongo.Database) *VoucherHandler {
	return &VoucherHandler{col: db.Collection("vouchers")}
}

// GET /api/vouchers
func (h *VoucherHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var vouchers []models.Voucher
	if err = cursor.All(ctx, &vouchers); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, vouchers)
}

// POST /api/vouchers
func (h *VoucherHandler) Create(c *gin.Context) {
	var voucher models.Voucher
	if err := c.ShouldBindJSON(&voucher); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	voucher.UsedCount = 0
	res, err := h.col.InsertOne(ctx, voucher)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	voucher.ID = res.InsertedID.(primitive.ObjectID)
	utils.Created(c, voucher)
}

// PUT /api/vouchers/:id
func (h *VoucherHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": updates})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, gin.H{"message": "Cập nhật voucher thành công"})
}

// DELETE /api/vouchers/:id
func (h *VoucherHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, gin.H{"message": "Đã xóa voucher"})
}
