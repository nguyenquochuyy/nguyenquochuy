package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type SettingsHandler struct {
	col *mongo.Collection
}

func NewSettingsHandler(db *mongo.Database) *SettingsHandler {
	return &SettingsHandler{col: db.Collection("settings")}
}

// GET /api/settings
func (h *SettingsHandler) Get(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var settings models.StoreSettings
	if err := h.col.FindOne(ctx, bson.M{}).Decode(&settings); err != nil {
		utils.OK(c, models.StoreSettings{})
		return
	}
	utils.OK(c, settings)
}

// POST /api/settings
func (h *SettingsHandler) Update(c *gin.Context) {
	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Update().SetUpsert(true)
	_, err := h.col.UpdateOne(ctx, bson.M{}, bson.M{"$set": updates}, opts)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("settings")
	utils.OK(c, gin.H{"message": "Đã lưu cài đặt"})
}
