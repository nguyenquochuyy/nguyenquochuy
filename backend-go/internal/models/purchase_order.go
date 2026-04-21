package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type PurchaseOrderItem struct {
	ProductID   string  `bson:"productId" json:"productId"`
	ProductName string  `bson:"productName" json:"productName"`
	Quantity    int     `bson:"quantity" json:"quantity"`
	UnitCost    float64 `bson:"unitCost" json:"unitCost"`
	TotalCost   float64 `bson:"totalCost" json:"totalCost"`
}

type PurchaseOrder struct {
	ID           primitive.ObjectID  `bson:"_id,omitempty" json:"_id,omitempty"`
	Id           string              `bson:"id" json:"id"`
	SupplierId   string              `bson:"supplierId" json:"supplierId"`
	SupplierName string              `bson:"supplierName" json:"supplierName"`
	Items        []PurchaseOrderItem `bson:"items" json:"items"`
	TotalAmount  float64             `bson:"totalAmount" json:"totalAmount"`
	Status       string              `bson:"status" json:"status"` // PENDING, PROCESSING, COMPLETED, CANCELLED
	Notes        string              `bson:"notes" json:"notes"`
	CreatedAt    time.Time           `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time           `bson:"updatedAt" json:"updatedAt"`
	ExpectedDate time.Time           `bson:"expectedDate" json:"expectedDate"`
}
