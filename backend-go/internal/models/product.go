package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProductVariant struct {
	ID    string  `bson:"id" json:"id"`
	Name  string  `bson:"name" json:"name"`
	SKU   string  `bson:"sku" json:"sku"`
	Price float64 `bson:"price" json:"price"`
	Stock int     `bson:"stock" json:"stock"`
}

type Product struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Id           string             `bson:"id" json:"id"`
	Name         string             `bson:"name" json:"name"`
	Category     string             `bson:"category" json:"category"`
	Price        float64            `bson:"price" json:"price"`
	CostPrice    float64            `bson:"costPrice" json:"costPrice"`
	Discount     float64            `bson:"discount" json:"discount"`
	DiscountType string             `bson:"discountType" json:"discountType"` // PERCENT | FIXED
	Stock        int                `bson:"stock" json:"stock"`
	SKU          string             `bson:"sku" json:"sku"`
	Description  string             `bson:"description" json:"description"`
	Images       []string           `bson:"images" json:"images"`
	IsVisible    bool               `bson:"isVisible" json:"isVisible"`
	HasVariants  bool               `bson:"hasVariants" json:"hasVariants"`
	Variants     []ProductVariant   `bson:"variants" json:"variants"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}
