package handlers

import (
	"context"
	"errors"
	"fmt"
	"time"

	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type InvoiceHandler struct {
	collection *mongo.Collection
}

func NewInvoiceHandler(db *mongo.Database) *InvoiceHandler {
	return &InvoiceHandler{
		collection: db.Collection("invoices"),
	}
}

func (h *InvoiceHandler) Create(c *gin.Context) {
	var body struct {
		OrderID    string  `json:"orderId"`
		CustomerID string  `json:"customerId"`
		Amount     float64 `json:"amount"`
		DueDate    string  `json:"dueDate"` // RFC3339 or date-only "2006-01-02"
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	// Try RFC3339 first, then date-only format
	dueDate, err := time.Parse(time.RFC3339, body.DueDate)
	if err != nil {
		dueDate, err = time.Parse("2006-01-02", body.DueDate)
		if err != nil {
			utils.BadRequest(c, "Invalid DueDate format, use RFC3339 or YYYY-MM-DD")
			return
		}
	}

	invoice := models.Invoice{
		InvoiceID:  fmt.Sprintf("INV-%s-%d", time.Now().Format("20060102"), time.Now().Unix()%10000),
		OrderID:    body.OrderID,
		CustomerID: body.CustomerID,
		Amount:     body.Amount,
		Status:     "PENDING",
		DueDate:    dueDate,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	result, err := h.collection.InsertOne(context.Background(), invoice)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	invoice.ID = result.InsertedID.(primitive.ObjectID)
	utils.Created(c, invoice)
}

func (h *InvoiceHandler) UpdateStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		utils.BadRequest(c, "Invalid ID")
		return
	}

	var body struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status":    body.Status,
			"updatedAt": time.Now(),
		},
	}

	_, err = h.collection.UpdateOne(context.Background(), bson.M{"_id": id}, update)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.OK(c, gin.H{"message": "Cập nhật trạng thái thành công"})
}

func (h *InvoiceHandler) GetAll(c *gin.Context) {
	cursor, err := h.collection.Find(context.Background(), bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(context.Background())

	var invoices []models.Invoice
	if err = cursor.All(context.Background(), &invoices); err != nil {
		utils.InternalError(c, errors.New("failed to decode invoices"))
		return
	}

	if invoices == nil {
		invoices = []models.Invoice{}
	}

	utils.OK(c, invoices)
}
