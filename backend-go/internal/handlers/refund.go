package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type RefundHandler struct {
	col *mongo.Collection
}

func NewRefundHandler(db *mongo.Database) *RefundHandler {
	return &RefundHandler{col: db.Collection("refunds")}
}

// GET /api/refunds
func (h *RefundHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var refunds []models.Refund
	if err = cursor.All(ctx, &refunds); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, refunds)
}

// POST /api/refunds
func (h *RefundHandler) Create(c *gin.Context) {
	var refund models.Refund
	if err := c.ShouldBindJSON(&refund); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Generate custom refund ID
	refund.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	refund.Status = "PENDING"
	refund.RequestDate = time.Now()

	_, err := h.col.InsertOne(ctx, refund)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("refunds")
	utils.Created(c, refund)
}

// PUT /api/refunds/:id/status
func (h *RefundHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Status      string `json:"status" binding:"required"`
		ProcessedBy string `json:"processedBy"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	setFields := bson.M{
		"status": body.Status,
	}
	if body.ProcessedBy != "" {
		setFields["processedBy"] = body.ProcessedBy
	}
	if body.Status == "PROCESSING" {
		setFields["processedDate"] = time.Now()
	}
	if body.Status == "COMPLETED" {
		setFields["completedDate"] = time.Now()
	}

	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": setFields})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("refunds")
	utils.OK(c, gin.H{"message": "Cập nhật trạng thái hoàn tiền thành công"})
}

// DELETE /api/refunds/:id
func (h *RefundHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("refunds")
	utils.OK(c, gin.H{"message": "Đã xóa yêu cầu hoàn tiền"})
}
