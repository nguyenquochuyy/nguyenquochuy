package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Customer struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	CustomerID    string             `bson:"id" json:"id"`
	Name          string             `bson:"name" json:"name"`
	Phone         string             `bson:"phone" json:"phone"`
	Email         string             `bson:"email,omitempty" json:"email,omitempty"`
	Password      string             `bson:"password,omitempty" json:"-"`
	Address       string             `bson:"address" json:"address"`
	Status        string             `bson:"status" json:"status"` // ACTIVE | LOCKED
	LoyaltyPoints int                `bson:"loyaltyPoints" json:"loyaltyPoints"`
	Wishlist      []string           `bson:"wishlist" json:"wishlist"`
	JoinedAt      time.Time          `bson:"joinedAt" json:"joinedAt"`
}
