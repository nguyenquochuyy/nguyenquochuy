package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RefreshToken struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"-"`
	UserID    string             `bson:"userId"`
	Role      string             `bson:"role"`
	Token     string             `bson:"token"`
	ExpiresAt time.Time          `bson:"expiresAt"`
	CreatedAt time.Time          `bson:"createdAt"`
	Revoked   bool               `bson:"revoked"`
	UserAgent string             `bson:"userAgent,omitempty"`
	IP        string             `bson:"ip,omitempty"`
}
