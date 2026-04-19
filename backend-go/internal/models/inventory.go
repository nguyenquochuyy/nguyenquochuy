package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InventoryLog struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	LogID       string             `bson:"id" json:"id"`
	ProductID   string             `bson:"productId" json:"productId"`
	VariantID   string             `bson:"variantId,omitempty" json:"variantId,omitempty"`
	ProductName string             `bson:"productName" json:"productName"`
	VariantName string             `bson:"variantName,omitempty" json:"variantName,omitempty"`
	Type        string             `bson:"type" json:"type"` // IN | OUT | ADJUSTMENT
	Quantity    int                `bson:"quantity" json:"quantity"`
	StockBefore int                `bson:"stockBefore" json:"stockBefore"`
	StockAfter  int                `bson:"stockAfter" json:"stockAfter"`
	Reason      string             `bson:"reason" json:"reason"`
	PerformedBy string             `bson:"performedBy,omitempty" json:"performedBy,omitempty"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
}
