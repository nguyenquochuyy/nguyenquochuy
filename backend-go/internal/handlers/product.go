package handlers

import (
	"context"
	"fmt"
	"strconv"
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

type ProductHandler struct {
	col     *mongo.Collection
	histCol *mongo.Collection
}

func NewProductHandler(db *mongo.Database) *ProductHandler {
	return &ProductHandler{
		col:     db.Collection("products"),
		histCol: db.Collection("productHistory"),
	}
}

// GET /api/products — with search, filter, sort, pagination
func (h *ProductHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}

	// Search by name, SKU, description
	if search := c.Query("search"); search != "" {
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": search, "$options": "i"}},
			{"sku": bson.M{"$regex": search, "$options": "i"}},
			{"description": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	// Filter by category
	if category := c.Query("category"); category != "" && category != "All" {
		filter["category"] = category
	}

	// Filter by visibility
	if visible := c.Query("visible"); visible == "true" {
		filter["isVisible"] = true
	} else if visible == "false" {
		filter["isVisible"] = false
	}

	// Filter by low stock
	if lowStock := c.Query("lowStock"); lowStock == "true" {
		filter["stock"] = bson.M{"$lt": 10}
	}

	// Filter by price range
	if minPrice := c.Query("minPrice"); minPrice != "" {
		if v, err := strconv.ParseFloat(minPrice, 64); err == nil {
			if filter["price"] == nil {
				filter["price"] = bson.M{}
			}
			filter["price"].(bson.M)["$gte"] = v
		}
	}
	if maxPrice := c.Query("maxPrice"); maxPrice != "" {
		if v, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			if filter["price"] == nil {
				filter["price"] = bson.M{}
			}
			filter["price"].(bson.M)["$lte"] = v
		}
	}

	// Sort
	sortField := "createdAt"
	sortOrder := -1
	if sf := c.Query("sortBy"); sf != "" {
		sortField = sf
	}
	if so := c.Query("sortOrder"); so == "asc" {
		sortOrder = 1
	}

	opts := options.Find().SetSort(bson.D{{Key: sortField, Value: sortOrder}})

	// Pagination
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.ParseInt(limitStr, 10, 64); err == nil && l > 0 {
			opts.SetLimit(l)
		}
	}
	if skipStr := c.Query("skip"); skipStr != "" {
		if s, err := strconv.ParseInt(skipStr, 10, 64); err == nil && s >= 0 {
			opts.SetSkip(s)
		}
	}

	cursor, err := h.col.Find(ctx, filter, opts)
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
	utils.OK(c, products)
}

// GET /api/products/:id
func (h *ProductHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var product models.Product
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&product)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.NotFound(c, "Không tìm thấy sản phẩm")
			return
		}
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, product)
}

// GET /api/products/barcode/:code
func (h *ProductHandler) GetByBarcode(c *gin.Context) {
	code := c.Param("code")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var product models.Product
	err := h.col.FindOne(ctx, bson.M{"barcode": code}).Decode(&product)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.NotFound(c, "Không tìm thấy sản phẩm với mã vạch này")
			return
		}
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, product)
}

// POST /api/products
func (h *ProductHandler) Create(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	// Generate unique id
	product.ID = primitive.NilObjectID
	if product.Id == "" {
		product.Id = fmt.Sprintf("prod-%d", time.Now().UnixNano())
	}

	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := h.col.InsertOne(ctx, product)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	product.ID = res.InsertedID.(primitive.ObjectID)

	// Record history
	h.recordHistory(ctx, product.Id, product.Name, "info", "", product.Name, "Tạo sản phẩm mới", c)

	events.Global.Broadcast("products")
	utils.Created(c, product)
}

// PUT /api/products/:id
func (h *ProductHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	updates["updatedAt"] = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get old product for history tracking
	var oldProduct models.Product
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&oldProduct)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.NotFound(c, "Không tìm thấy sản phẩm")
			return
		}
		utils.InternalError(c, err)
		return
	}

	_, err = h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": updates})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	// Track changes to product history
	h.trackAndRecordHistory(ctx, oldProduct, updates, c)

	events.Global.Broadcast("products")
	utils.OK(c, gin.H{"message": "Cập nhật thành công"})
}

// DELETE /api/products/:id
func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get product name for history
	var product models.Product
	_ = h.col.FindOne(ctx, bson.M{"id": id}).Decode(&product)

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	if product.Id != "" {
		h.recordHistory(ctx, product.Id, product.Name, "info", product.Name, "deleted", "Xóa sản phẩm", c)
	}

	events.Global.Broadcast("products")
	utils.OK(c, gin.H{"message": "Đã xóa sản phẩm"})
}

// PUT /api/products/:id/toggle-visibility
func (h *ProductHandler) ToggleVisibility(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var product models.Product
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&product)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	newVisible := !product.IsVisible
	_, err = h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": bson.M{
		"isVisible": newVisible,
		"updatedAt": time.Now(),
	}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	oldVal := "hidden"
	newVal := "visible"
	if product.IsVisible {
		oldVal = "visible"
		newVal = "hidden"
	}
	h.recordHistory(ctx, id, product.Name, "visibility", oldVal, newVal, "Toggle visibility", c)

	events.Global.Broadcast("products")
	utils.OK(c, gin.H{"message": "Đã cập nhật hiển thị sản phẩm", "isVisible": newVisible})
}

// POST /api/products/:id/clone
func (h *ProductHandler) Clone(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var original models.Product
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&original)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.NotFound(c, "Không tìm thấy sản phẩm gốc")
			return
		}
		utils.InternalError(c, err)
		return
	}

	// Create clone
	clone := original
	clone.ID = primitive.NilObjectID
	clone.Id = fmt.Sprintf("prod-%d", time.Now().UnixNano())
	clone.Name = original.Name + " (Copy)"
	clone.SKU = fmt.Sprintf("%s-COPY-%d", original.SKU, time.Now().Unix()%10000)
	clone.Stock = 0
	clone.IsVisible = false
	clone.CreatedAt = time.Now()
	clone.UpdatedAt = time.Now()

	// Clone variants with new IDs
	for i := range clone.Variants {
		clone.Variants[i].ID = fmt.Sprintf("var-%d-%d", time.Now().UnixNano(), i)
		clone.Variants[i].Stock = 0
	}

	res, err := h.col.InsertOne(ctx, clone)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	clone.ID = res.InsertedID.(primitive.ObjectID)

	h.recordHistory(ctx, clone.Id, clone.Name, "info", "", clone.Name, fmt.Sprintf("Clone từ sản phẩm %s", original.Name), c)

	events.Global.Broadcast("products")
	utils.Created(c, clone)
}

// POST /api/products/bulk-delete
func (h *ProductHandler) BulkDelete(c *gin.Context) {
	var body struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := h.col.DeleteMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("products")
	utils.OK(c, gin.H{"message": fmt.Sprintf("Đã xóa %d sản phẩm", result.DeletedCount), "deletedCount": result.DeletedCount})
}

// PUT /api/products/bulk-visibility
func (h *ProductHandler) BulkVisibility(c *gin.Context) {
	var body struct {
		IDs       []string `json:"ids" binding:"required"`
		IsVisible bool     `json:"isVisible"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := h.col.UpdateMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}}, bson.M{"$set": bson.M{
		"isVisible": body.IsVisible,
		"updatedAt": time.Now(),
	}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("products")
	utils.OK(c, gin.H{"message": "Đã cập nhật hiển thị hàng loạt"})
}

// PUT /api/products/bulk-category
func (h *ProductHandler) BulkCategory(c *gin.Context) {
	var body struct {
		IDs      []string `json:"ids" binding:"required"`
		Category string   `json:"category" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := h.col.UpdateMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}}, bson.M{"$set": bson.M{
		"category":  body.Category,
		"updatedAt": time.Now(),
	}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("products")
	utils.OK(c, gin.H{"message": "Đã cập nhật danh mục hàng loạt"})
}

// GET /api/products/:id/history
func (h *ProductHandler) GetHistory(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "changedAt", Value: -1}}).SetLimit(50)
	cursor, err := h.histCol.Find(ctx, bson.M{"productId": id}, opts)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var history []models.ProductHistory
	if err = cursor.All(ctx, &history); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, history)
}

// GET /api/products/history — all product history
func (h *ProductHandler) GetAllHistory(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "changedAt", Value: -1}}).SetLimit(100)
	cursor, err := h.histCol.Find(ctx, bson.M{}, opts)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var history []models.ProductHistory
	if err = cursor.All(ctx, &history); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, history)
}

// --- Internal helpers ---

func (h *ProductHandler) recordHistory(ctx context.Context, productId, productName, changeType string, oldValue, newValue any, notes string, c *gin.Context) {
	changedBy := "admin"
	if userId, exists := c.Get("userId"); exists {
		changedBy = userId.(string)
	}

	entry := models.ProductHistory{
		HistoryID:   fmt.Sprintf("hist-%d", time.Now().UnixNano()),
		ProductID:   productId,
		ProductName: productName,
		ChangeType:  changeType,
		OldValue:    fmt.Sprintf("%v", oldValue),
		NewValue:    fmt.Sprintf("%v", newValue),
		ChangedBy:   changedBy,
		ChangedAt:   time.Now().Format(time.RFC3339),
		Notes:       notes,
	}

	_, _ = h.histCol.InsertOne(ctx, entry)
}

func (h *ProductHandler) trackAndRecordHistory(ctx context.Context, oldProduct models.Product, updates map[string]any, c *gin.Context) {
	if newPrice, ok := updates["price"]; ok {
		h.recordHistory(ctx, oldProduct.Id, oldProduct.Name, "price", oldProduct.Price, newPrice, "Thay đổi giá", c)
	}
	if newStock, ok := updates["stock"]; ok {
		h.recordHistory(ctx, oldProduct.Id, oldProduct.Name, "stock", oldProduct.Stock, newStock, "Thay đổi tồn kho", c)
	}
	if newVis, ok := updates["isVisible"]; ok {
		oldVis := "hidden"
		if oldProduct.IsVisible {
			oldVis = "visible"
		}
		h.recordHistory(ctx, oldProduct.Id, oldProduct.Name, "visibility", oldVis, newVis, "Thay đổi hiển thị", c)
	}
	if newName, ok := updates["name"]; ok {
		h.recordHistory(ctx, oldProduct.Id, oldProduct.Name, "info", oldProduct.Name, newName, "Thay đổi tên", c)
	}
}
