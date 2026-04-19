package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CartItem struct {
	ProductID       string  `bson:"productId" json:"productId"`
	Name            string  `bson:"name" json:"name"`
	Price           float64 `bson:"price" json:"price"`
	Quantity        int     `bson:"quantity" json:"quantity"`
	SelectedVariant string  `bson:"selectedVariantId,omitempty" json:"selectedVariantId,omitempty"`
}

type Order struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	OrderID         string             `bson:"id" json:"id"`
	CustomerName    string             `bson:"customerName" json:"customerName"`
	CustomerPhone   string             `bson:"customerPhone" json:"customerPhone"`
	CustomerAddress string             `bson:"customerAddress" json:"customerAddress"`
	CustomerEmail   string             `bson:"customerEmail,omitempty" json:"customerEmail,omitempty"`
	Items           []CartItem         `bson:"items" json:"items"`
	Subtotal        float64            `bson:"subtotal" json:"subtotal"`
	DiscountAmount  float64            `bson:"discountAmount" json:"discountAmount"`
	VoucherCode     string             `bson:"voucherCode,omitempty" json:"voucherCode,omitempty"`
	VoucherDiscount float64            `bson:"voucherDiscount,omitempty" json:"voucherDiscount,omitempty"`
	PointsUsed      int                `bson:"pointsUsed,omitempty" json:"pointsUsed,omitempty"`
	PointsDiscount  float64            `bson:"pointsDiscount,omitempty" json:"pointsDiscount,omitempty"`
	ShippingFee     float64            `bson:"shippingFee" json:"shippingFee"`
	ShippingMethod  string             `bson:"shippingMethod" json:"shippingMethod"`
	TaxRate         float64            `bson:"taxRate" json:"taxRate"`
	TaxAmount       float64            `bson:"taxAmount" json:"taxAmount"`
	Total           float64            `bson:"total" json:"total"`
	Status          string             `bson:"status" json:"status"`               // PENDING|CONFIRMED|SHIPPING|COMPLETED|CANCELLED
	PaymentMethod   string             `bson:"paymentMethod" json:"paymentMethod"` // COD|BANKING|MOMO|VNPAY
	ProcessedBy     string             `bson:"processedBy,omitempty" json:"processedBy,omitempty"`
	InternalNotes   string             `bson:"internalNotes,omitempty" json:"internalNotes,omitempty"`
	CustomerNotes   string             `bson:"customerNotes,omitempty" json:"customerNotes,omitempty"`
	CreatedAt       time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
	// Timeline & Tracking
	Timeline             []OrderTimelineEvent `bson:"timeline,omitempty" json:"timeline,omitempty"`
	ShippingTracking     string               `bson:"shippingTracking,omitempty" json:"shippingTracking,omitempty"`
	PaymentStatus        string               `bson:"paymentStatus,omitempty" json:"paymentStatus,omitempty"` // PENDING|PAID|FAILED|REFUNDED
	PaymentTransactionID string               `bson:"paymentTransactionId,omitempty" json:"paymentTransactionId,omitempty"`
}

type OrderTimelineEvent struct {
	Status      string    `bson:"status" json:"status"`
	Timestamp   time.Time `bson:"timestamp" json:"timestamp"`
	Note        string    `bson:"note,omitempty" json:"note,omitempty"`
	ProcessedBy string    `bson:"processedBy,omitempty" json:"processedBy,omitempty"`
}
