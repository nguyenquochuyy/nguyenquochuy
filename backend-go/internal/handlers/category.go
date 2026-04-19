package handlers

import (
	"context"
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

type CategoryHandler struct {
	col     *mongo.Collection
	prodCol *mongo.Collection
}

func NewCategoryHandler(db *mongo.Database) *CategoryHandler {
	return &CategoryHandler{
		col:     db.Collection("categories"),
		prodCol: db.Collection("products"),
	}
}

// GET /api/categories — with optional search, filter by active, parentId
func (h *CategoryHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}

	// Search by name
	if search := c.Query("search"); search != "" {
		filter["name"] = bson.M{"$regex": search, "$options": "i"}
	}

	// Filter by active status
	if active := c.Query("active"); active == "true" {
		filter["isActive"] = true
	} else if active == "false" {
		filter["isActive"] = false
	}

	// Filter by parentId
	if parentId := c.Query("parentId"); parentId != "" {
		if parentId == "root" {
			filter["parentId"] = bson.M{"$in": []any{nil, ""}}
		} else {
			filter["parentId"] = parentId
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "order", Value: 1}})

	cursor, err := h.col.Find(ctx, filter, opts)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var categories []models.Category
	if err = cursor.All(ctx, &categories); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, categories)
}

// GET /api/categories/:id
func (h *CategoryHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cat models.Category
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&cat)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.NotFound(c, "Không tìm thấy danh mục")
			return
		}
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, cat)
}

// POST /api/categories
func (h *CategoryHandler) Create(c *gin.Context) {
	var cat models.Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	// Generate ID if not provided
	if cat.CategoryID == "" {
		cat.CategoryID = primitive.NewObjectID().Hex()
	}

	// Default isActive to true
	cat.IsActive = true
	cat.CreatedAt = time.Now().Format(time.RFC3339)
	cat.UpdatedAt = cat.CreatedAt

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := h.col.InsertOne(ctx, cat)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	cat.ID = res.InsertedID.(primitive.ObjectID)
	events.Global.Broadcast("categories")
	utils.Created(c, cat)
}

// PUT /api/categories/:id
func (h *CategoryHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	updates["updatedAt"] = time.Now().Format(time.RFC3339)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": updates})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("categories")
	utils.OK(c, gin.H{"message": "Cập nhật danh mục thành công"})
}

// DELETE /api/categories/:id
func (h *CategoryHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Also delete child categories
	_, _ = h.col.DeleteMany(ctx, bson.M{"parentId": id})

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("categories")
	utils.OK(c, gin.H{"message": "Đã xóa danh mục"})
}

// PUT /api/categories/:id/toggle-active
func (h *CategoryHandler) ToggleActive(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cat models.Category
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&cat)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	newActive := !cat.IsActive
	_, err = h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": bson.M{
		"isActive":  newActive,
		"updatedAt": time.Now().Format(time.RFC3339),
	}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("categories")
	utils.OK(c, gin.H{"message": "Đã cập nhật trạng thái danh mục", "isActive": newActive})
}

// GET /api/categories/:id/products — get products in a category
func (h *CategoryHandler) GetProducts(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.prodCol.Find(ctx, bson.M{"category": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err = cursor.All(ctx, &products); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, gin.H{"products": products, "count": len(products)})
}

// POST /api/categories/bulk-delete
func (h *CategoryHandler) BulkDelete(c *gin.Context) {
	var body struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Also delete children of selected categories
	_, _ = h.col.DeleteMany(ctx, bson.M{"parentId": bson.M{"$in": body.IDs}})

	_, err := h.col.DeleteMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("categories")
	utils.OK(c, gin.H{"message": "Đã xóa danh mục hàng loạt"})
}

// POST /api/categories/bulk-reorder
func (h *CategoryHandler) BulkReorder(c *gin.Context) {
	var body struct {
		Updates []struct {
			ID    string `json:"id"`
			Order int    `json:"order"`
		} `json:"updates" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	now := time.Now().Format(time.RFC3339)
	for _, update := range body.Updates {
		_, err := h.col.UpdateOne(ctx, bson.M{"id": update.ID}, bson.M{"$set": bson.M{"order": update.Order, "updatedAt": now}})
		if err != nil {
			utils.InternalError(c, err)
			return
		}
	}
	events.Global.Broadcast("categories")
	utils.OK(c, gin.H{"message": "Đã cập nhật thứ tự danh mục hàng loạt"})
}
