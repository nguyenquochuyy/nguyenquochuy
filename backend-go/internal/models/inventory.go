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

type StockTake struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	TakeID      string             `bson:"id" json:"id"`
	ProductID   string             `bson:"productId" json:"productId"`
	VariantID   string             `bson:"variantId,omitempty" json:"variantId,omitempty"`
	ProductName string             `bson:"productName" json:"productName"`
	VariantName string             `bson:"variantName,omitempty" json:"variantName,omitempty"`
	Expected    int                `bson:"expected" json:"expected"`
	Actual      int                `bson:"actual" json:"actual"`
	Difference  int                `bson:"difference" json:"difference"` // Actual - Expected
	Note        string             `bson:"note" json:"note"`
	PerformedBy string             `bson:"performedBy" json:"performedBy"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
}
