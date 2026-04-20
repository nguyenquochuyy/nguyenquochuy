package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Invoice struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	InvoiceID  string             `bson:"invoiceId" json:"invoiceId"` // Format: INV-YYYYMMDD-XXXX
	OrderID    string             `bson:"orderId" json:"orderId"`
	CustomerID string             `bson:"customerId" json:"customerId"`
	Amount     float64            `bson:"amount" json:"amount"`
	Status     string             `bson:"status" json:"status"` // PENDING, PAID, OVERDUE, CANCELLED
	DueDate    time.Time          `bson:"dueDate" json:"dueDate"`
	CreatedAt  time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time          `bson:"updatedAt" json:"updatedAt"`
}
