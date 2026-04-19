package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Warehouse struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Id        string             `bson:"id" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Address   string             `bson:"address" json:"address"`
	Manager   string             `bson:"manager" json:"manager"`
	Phone     string             `bson:"phone" json:"phone"`
	Status    string             `bson:"status" json:"status"` // ACTIVE, INACTIVE
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}
