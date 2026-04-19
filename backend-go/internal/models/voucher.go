package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Voucher struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	VoucherID    string             `bson:"id" json:"id"`
	Code         string             `bson:"code" json:"code"`
	Type         string             `bson:"type" json:"type"` // PERCENT | FIXED
	Value        float64            `bson:"value" json:"value"`
	MinOrderValue float64           `bson:"minOrderValue" json:"minOrderValue"`
	MaxDiscount  float64            `bson:"maxDiscount,omitempty" json:"maxDiscount,omitempty"`
	StartDate    time.Time          `bson:"startDate" json:"startDate"`
	EndDate      time.Time          `bson:"endDate" json:"endDate"`
	UsageLimit   int                `bson:"usageLimit" json:"usageLimit"`
	UsedCount    int                `bson:"usedCount" json:"usedCount"`
	Status       string             `bson:"status" json:"status"` // ACTIVE | DISABLED
	CreatedBy    string             `bson:"createdBy,omitempty" json:"createdBy,omitempty"`
}
