package handlers

import (
	"context"
	"time"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ReviewHandler struct {
	col *mongo.Collection
}

func NewReviewHandler(db *mongo.Database) *ReviewHandler {
	return &ReviewHandler{col: db.Collection("reviews")}
}

// GET /api/reviews
func (h *ReviewHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var reviews []models.Review
	if err = cursor.All(ctx, &reviews); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, reviews)
}

// POST /api/reviews
func (h *ReviewHandler) Create(c *gin.Context) {
	var review models.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	review.CreatedAt = time.Now()
	review.UpdatedAt = time.Now()

	_, err := h.col.InsertOne(ctx, review)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("reviews")
	utils.Created(c, review)
}

// PUT /api/reviews/:id/reply
func (h *ReviewHandler) Reply(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Reply string `json:"reply" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"reply":     body.Reply,
			"replyDate": time.Now(),
			"updatedAt": time.Now(),
		},
	}
	_, err := h.col.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("reviews")
	utils.OK(c, gin.H{"message": "Đã trả lời đánh giá"})
}

// PUT /api/reviews/:id/toggle-hidden
func (h *ReviewHandler) ToggleHidden(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Find current review to toggle
	var review models.Review
	err := h.col.FindOne(ctx, bson.M{"_id": id}).Decode(&review)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	update := bson.M{
		"$set": bson.M{
			"isHidden":  !review.IsHidden,
			"updatedAt": time.Now(),
		},
	}
	_, err = h.col.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("reviews")
	utils.OK(c, gin.H{"message": "Đã cập nhật trạng thái đánh giá"})
}
