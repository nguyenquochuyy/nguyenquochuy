package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Supplier struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Id        string             `bson:"id" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Contact   string             `bson:"contact" json:"contact"`
	Email     string             `bson:"email" json:"email"`
	Phone     string             `bson:"phone" json:"phone"`
	Address   string             `bson:"address" json:"address"`
	Status    string             `bson:"status" json:"status"` // ACTIVE, INACTIVE
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}
