package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type ProductHistory struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	HistoryID   string             `bson:"id" json:"id"`
	ProductID   string             `bson:"productId" json:"productId"`
	ProductName string             `bson:"productName" json:"productName"`
	ChangeType  string             `bson:"changeType" json:"changeType"` // price, stock, info, visibility
	OldValue    string             `bson:"oldValue" json:"oldValue"`
	NewValue    string             `bson:"newValue" json:"newValue"`
	ChangedBy   string             `bson:"changedBy" json:"changedBy"`
	ChangedAt   string             `bson:"changedAt" json:"changedAt"`
	Notes       string             `bson:"notes,omitempty" json:"notes,omitempty"`
}
