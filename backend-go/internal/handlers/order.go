package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"sync"
	"time"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Simple in-memory cache
type CacheItem struct {
	Data      []byte
	ExpiresAt time.Time
}

type Cache struct {
	items map[string]CacheItem
	mu    sync.RWMutex
}

func NewCache() *Cache {
	return &Cache{
		items: make(map[string]CacheItem),
	}
}

func (c *Cache) Get(key string) ([]byte, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	item, found := c.items[key]
	if !found || time.Now().After(item.ExpiresAt) {
		return nil, false
	}
	return item.Data, true
}

func (c *Cache) Set(key string, data []byte, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = CacheItem{
		Data:      data,
		ExpiresAt: time.Now().Add(ttl),
	}
}

func (c *Cache) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.items, key)
}

func (c *Cache) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = make(map[string]CacheItem)
}

var orderCache = NewCache()

type OrderHandler struct {
	col *mongo.Collection
}

func NewOrderHandler(db *mongo.Database) *OrderHandler {
	return &OrderHandler{col: db.Collection("orders")}
}

// POST /api/orders
func (h *OrderHandler) Place(c *gin.Context) {
	var order models.Order
	if err := c.ShouldBindJSON(&order); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Generate custom order ID
	orderID := fmt.Sprintf("%d", time.Now().UnixNano())
	order.OrderID = orderID
	order.Status = "PENDING"
	order.PaymentStatus = "PENDING"
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()

	// Add initial timeline event
	order.Timeline = []models.OrderTimelineEvent{
		{
			Status:    "PENDING",
			Timestamp: time.Now(),
			Note:      "Đơn hàng được tạo",
		},
	}

	res, err := h.col.InsertOne(ctx, order)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	order.ID = res.InsertedID.(primitive.ObjectID)

	// Clear cache when order is created
	orderCache.Clear()

	events.Global.Broadcast("orders")
	utils.Created(c, order)
}

// GET /api/orders — with search, filter, sort, pagination
func (h *OrderHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	skip := (page - 1) * limit

	// Create cache key from query parameters
	cacheKey := fmt.Sprintf("orders:%d:%d:%s:%s:%s:%s:%s:%s:%s:%s",
		page, limit,
		c.Query("search"),
		c.Query("status"),
		c.Query("paymentStatus"),
		c.Query("paymentMethod"),
		c.Query("startDate"),
		c.Query("endDate"),
		c.Query("sortBy"),
		c.Query("sortOrder"),
	)

	// Try to get from cache
	if cached, found := orderCache.Get(cacheKey); found {
		c.Header("X-Cache", "HIT")
		c.Data(200, "application/json", cached)
		return
	}

	c.Header("X-Cache", "MISS")

	filter := bson.M{}

	// Search by customer name, phone, email, or order ID
	if search := c.Query("search"); search != "" {
		filter["$or"] = []bson.M{
			{"customerName": bson.M{"$regex": search, "$options": "i"}},
			{"customerPhone": bson.M{"$regex": search, "$options": "i"}},
			{"customerEmail": bson.M{"$regex": search, "$options": "i"}},
			{"id": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	// Filter by status
	if status := c.Query("status"); status != "" {
		filter["status"] = status
	}

	// Filter by payment status
	if paymentStatus := c.Query("paymentStatus"); paymentStatus != "" {
		filter["paymentStatus"] = paymentStatus
	}

	// Filter by payment method
	if paymentMethod := c.Query("paymentMethod"); paymentMethod != "" {
		filter["paymentMethod"] = paymentMethod
	}

	// Filter by date range
	if startDate := c.Query("startDate"); startDate != "" {
		if t, err := time.Parse(time.RFC3339, startDate); err == nil {
			filter["createdAt"] = bson.M{"$gte": t}
		}
	}
	if endDate := c.Query("endDate"); endDate != "" {
		if t, err := time.Parse(time.RFC3339, endDate); err == nil {
			if filter["createdAt"] == nil {
				filter["createdAt"] = bson.M{}
			}
			filter["createdAt"].(bson.M)["$lte"] = t
		}
	}

	// Filter by total range
	if minTotal := c.Query("minTotal"); minTotal != "" {
		if v, err := strconv.ParseFloat(minTotal, 64); err == nil {
			if filter["total"] == nil {
				filter["total"] = bson.M{}
			}
			filter["total"].(bson.M)["$gte"] = v
		}
	}
	if maxTotal := c.Query("maxTotal"); maxTotal != "" {
		if v, err := strconv.ParseFloat(maxTotal, 64); err == nil {
			if filter["total"] == nil {
				filter["total"] = bson.M{}
			}
			filter["total"].(bson.M)["$lte"] = v
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

	opts := options.Find().SetSort(bson.D{{Key: sortField, Value: sortOrder}}).SetSkip(int64(skip)).SetLimit(int64(limit))

	cursor, err := h.col.Find(ctx, filter, opts)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		utils.InternalError(c, err)
		return
	}

	// Cache the response
	responseData, _ := json.Marshal(orders)
	orderCache.Set(cacheKey, responseData, 30*time.Second)

	utils.OK(c, orders)
}

// GET /api/orders/:id
func (h *OrderHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var order models.Order
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&order)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			utils.NotFound(c, "Không tìm thấy đơn hàng")
			return
		}
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, order)
}

// PUT /api/orders/:id/status
func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Status string `json:"status" binding:"required"`
		UserID string `json:"userId"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get current order for timeline tracking
	var order models.Order
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&order)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	// Add timeline event
	newTimeline := append(order.Timeline, models.OrderTimelineEvent{
		Status:      body.Status,
		Timestamp:   time.Now(),
		ProcessedBy: body.UserID,
		Note:        fmt.Sprintf("Trạng thái thay đổi thành %s", body.Status),
	})

	update := bson.M{
		"$set": bson.M{
			"status":      body.Status,
			"updatedAt":   time.Now(),
			"processedBy": body.UserID,
			"timeline":    newTimeline,
		},
	}
	_, err = h.col.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("orders")
	utils.OK(c, gin.H{"message": "Cập nhật trạng thái đơn hàng thành công"})
}

// PUT /api/orders/:id/payment-status
func (h *OrderHandler) UpdatePaymentStatus(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		PaymentStatus        string `json:"paymentStatus" binding:"required"`
		PaymentTransactionID string `json:"paymentTransactionId,omitempty"`
		UserID               string `json:"userId"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"paymentStatus":        body.PaymentStatus,
			"paymentTransactionId": body.PaymentTransactionID,
			"updatedAt":            time.Now(),
		},
	}
	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("orders")
	utils.OK(c, gin.H{"message": "Cập nhật trạng thái thanh toán thành công"})
}

// PUT /api/orders/:id/tracking
func (h *OrderHandler) UpdateTracking(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		ShippingTracking string `json:"shippingTracking"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"shippingTracking": body.ShippingTracking,
			"updatedAt":        time.Now(),
		},
	}
	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("orders")
	utils.OK(c, gin.H{"message": "Cập nhật tracking thành công"})
}

// PUT /api/orders/:id/notes
func (h *OrderHandler) UpdateNotes(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		InternalNotes string `json:"internalNotes"`
		CustomerNotes string `json:"customerNotes"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{
		"$set": bson.M{
			"internalNotes": body.InternalNotes,
			"customerNotes": body.CustomerNotes,
			"updatedAt":     time.Now(),
		},
	}
	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, update)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("orders")
	utils.OK(c, gin.H{"message": "Cập nhật ghi chú đơn hàng thành công"})
}

// DELETE /api/orders/:id
func (h *OrderHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("orders")
	utils.OK(c, gin.H{"message": "Đã xóa đơn hàng"})
}

// POST /api/orders/bulk-delete
func (h *OrderHandler) BulkDelete(c *gin.Context) {
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

	events.Global.Broadcast("orders")
	utils.OK(c, gin.H{"message": fmt.Sprintf("Đã xóa %d đơn hàng", result.DeletedCount), "deletedCount": result.DeletedCount})
}

// PUT /api/orders/bulk-status
func (h *OrderHandler) BulkStatus(c *gin.Context) {
	var body struct {
		IDs    []string `json:"ids" binding:"required"`
		Status string   `json:"status" binding:"required"`
		UserID string   `json:"userId"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := h.col.UpdateMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}}, bson.M{"$set": bson.M{
		"status":      body.Status,
		"updatedAt":   time.Now(),
		"processedBy": body.UserID,
	}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("orders")
	utils.OK(c, gin.H{"message": "Đã cập nhật trạng thái hàng loạt"})
}

// GET /api/orders/:id/labels/shipping
func (h *OrderHandler) GetShippingLabel(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var order models.Order
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&order)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(404, gin.H{"error": "Không tìm thấy đơn hàng"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Generate shipping label data
	labelData := gin.H{
		"orderId":         order.OrderID,
		"customerName":    order.CustomerName,
		"customerPhone":   order.CustomerPhone,
		"customerAddress": order.CustomerAddress,
		"shippingMethod":  order.ShippingMethod,
		"shippingFee":     order.ShippingFee,
		"trackingNumber":  order.ShippingTracking,
		"items":           order.Items,
		"subtotal":        order.Subtotal,
		"total":           order.Total,
		"createdAt":       order.CreatedAt.Format("2006-01-02 15:04"),
	}

	c.JSON(200, labelData)
}

// GET /api/orders/:id/labels/packing
func (h *OrderHandler) GetPackingLabel(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var order models.Order
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&order)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(404, gin.H{"error": "Không tìm thấy đơn hàng"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Generate packing list data
	itemsList := []gin.H{}
	for _, item := range order.Items {
		itemsList = append(itemsList, gin.H{
			"name":     item.Name,
			"quantity": item.Quantity,
			"price":    item.Price,
			"total":    item.Price * float64(item.Quantity),
		})
	}

	packingData := gin.H{
		"orderId":         order.OrderID,
		"customerName":    order.CustomerName,
		"customerPhone":   order.CustomerPhone,
		"customerAddress": order.CustomerAddress,
		"items":           itemsList,
		"totalItems":      len(order.Items),
		"totalQuantity":   sumQuantity(order.Items),
		"total":           order.Total,
		"createdAt":       order.CreatedAt.Format("2006-01-02 15:04"),
	}

	c.JSON(200, packingData)
}

// GET /api/orders/:id/labels/invoice
func (h *OrderHandler) GetInvoice(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var order models.Order
	err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&order)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(404, gin.H{"error": "Không tìm thấy đơn hàng"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Generate invoice data
	itemsList := []gin.H{}
	for _, item := range order.Items {
		itemsList = append(itemsList, gin.H{
			"name":     item.Name,
			"quantity": item.Quantity,
			"price":    item.Price,
			"total":    item.Price * float64(item.Quantity),
		})
	}

	invoiceData := gin.H{
		"orderId":              order.OrderID,
		"customerName":         order.CustomerName,
		"customerPhone":        order.CustomerPhone,
		"customerEmail":        order.CustomerEmail,
		"customerAddress":      order.CustomerAddress,
		"items":                itemsList,
		"subtotal":             order.Subtotal,
		"discountAmount":       order.DiscountAmount,
		"voucherCode":          order.VoucherCode,
		"voucherDiscount":      order.VoucherDiscount,
		"pointsUsed":           order.PointsUsed,
		"pointsDiscount":       order.PointsDiscount,
		"shippingFee":          order.ShippingFee,
		"shippingMethod":       order.ShippingMethod,
		"taxRate":              order.TaxRate,
		"taxAmount":            order.TaxAmount,
		"total":                order.Total,
		"paymentMethod":        order.PaymentMethod,
		"paymentStatus":        order.PaymentStatus,
		"paymentTransactionId": order.PaymentTransactionID,
		"status":               order.Status,
		"createdAt":            order.CreatedAt.Format("2006-01-02 15:04"),
	}

	c.JSON(200, invoiceData)
}

// Helper function to sum quantities
func sumQuantity(items []models.CartItem) int {
	total := 0
	for _, item := range items {
		total += item.Quantity
	}
	return total
}
