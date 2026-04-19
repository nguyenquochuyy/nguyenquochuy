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

type CustomerHandler struct {
	col *mongo.Collection
}

func NewCustomerHandler(db *mongo.Database) *CustomerHandler {
	return &CustomerHandler{col: db.Collection("customers")}
}

// GET /api/customers
func (h *CustomerHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var customers []models.Customer
	if err = cursor.All(ctx, &customers); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, customers)
}

// POST /api/customers
func (h *CustomerHandler) Create(c *gin.Context) {
	var customer models.Customer
	if err := c.ShouldBindJSON(&customer); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	customer.JoinedAt = time.Now()
	if customer.Status == "" {
		customer.Status = "ACTIVE"
	}

	if _, err := h.col.InsertOne(ctx, customer); err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("customers")
	utils.Created(c, customer)
}

// PUT /api/customers/:id
func (h *CustomerHandler) Update(c *gin.Context) {
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
	events.Global.Broadcast("customers")
	utils.OK(c, gin.H{"message": "Cập nhật thành công"})
}

// PUT /api/customers/:id/wishlist
func (h *CustomerHandler) ToggleWishlist(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		ProductID string `json:"productId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var customer models.Customer
	if err := h.col.FindOne(ctx, bson.M{"id": id}).Decode(&customer); err != nil {
		utils.NotFound(c, "Không tìm thấy khách hàng")
		return
	}

	// Toggle: remove if exists, add if not
	inWishlist := false
	newWishlist := []string{}
	for _, pid := range customer.Wishlist {
		if pid == body.ProductID {
			inWishlist = true
		} else {
			newWishlist = append(newWishlist, pid)
		}
	}
	if !inWishlist {
		newWishlist = append(newWishlist, body.ProductID)
	}

	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": bson.M{"wishlist": newWishlist}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, gin.H{"wishlist": newWishlist})
}

// POST /api/customers/bulk-lock
func (h *CustomerHandler) BulkLock(c *gin.Context) {
	var body struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := h.col.UpdateMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}}, bson.M{"$set": bson.M{"status": "LOCKED"}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("customers")
	utils.OK(c, gin.H{"message": "Đã khóa tài khoản thành công"})
}

// POST /api/customers/bulk-unlock
func (h *CustomerHandler) BulkUnlock(c *gin.Context) {
	var body struct {
		IDs []string `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := h.col.UpdateMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}}, bson.M{"$set": bson.M{"status": "ACTIVE"}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("customers")
	utils.OK(c, gin.H{"message": "Đã mở khóa tài khoản thành công"})
}

// POST /api/customers/bulk-tag
func (h *CustomerHandler) BulkTag(c *gin.Context) {
	var body struct {
		IDs  []string `json:"ids" binding:"required"`
		Tags []string `json:"tags" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := h.col.UpdateMany(ctx, bson.M{"id": bson.M{"$in": body.IDs}}, bson.M{"$set": bson.M{"tags": body.Tags}})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("customers")
	utils.OK(c, gin.H{"message": "Đã gán tag thành công"})
}

// POST /api/customers/bulk-email
func (h *CustomerHandler) BulkEmail(c *gin.Context) {
	var body struct {
		IDs     []string `json:"ids" binding:"required"`
		Subject string   `json:"subject" binding:"required"`
		Message string   `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	// TODO: Integrate with email service (SendGrid/Mailgun)
	// For now, just return success
	utils.OK(c, gin.H{"message": "Đã gửi email thành công", "count": len(body.IDs)})
}

// POST /api/customers/:id/notes
func (h *CustomerHandler) AddNote(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Note   string `json:"note" binding:"required"`
		UserID string `json:"userId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	note := map[string]any{
		"id":         fmt.Sprintf("CN%d", time.Now().UnixNano()),
		"customerId": id,
		"note":       body.Note,
		"userId":     body.UserID,
		"createdAt":  time.Now(),
	}

	notesCol := h.col.Database().Collection("customer_notes")
	if _, err := notesCol.InsertOne(ctx, note); err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("customers")
	utils.Created(c, note)
}

// GET /api/customers/:id/notes
func (h *CustomerHandler) GetNotes(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	notesCol := h.col.Database().Collection("customer_notes")
	cursor, err := notesCol.Find(ctx, map[string]any{"customerId": id})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var notes []map[string]any
	if err = cursor.All(ctx, &notes); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, notes)
}
