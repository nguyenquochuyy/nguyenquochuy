package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Employee struct {
	ID                     primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	EmployeeID             string             `bson:"id" json:"id"`
	Name                   string             `bson:"name" json:"name"`
	Email                  string             `bson:"email" json:"email"`
	Password               string             `bson:"password,omitempty" json:"-"`
	Phone                  string             `bson:"phone,omitempty" json:"phone,omitempty"`
	Role                   string             `bson:"role" json:"role"`     // OWNER | ACCOUNTANT | STAFF
	Status                 string             `bson:"status" json:"status"` // ACTIVE | LOCKED
	Avatar                 string             `bson:"avatar,omitempty" json:"avatar,omitempty"`
	Level2Password         string             `bson:"level2Password,omitempty" json:"-"`
	Level2PasswordAttempts int                `bson:"level2PasswordAttempts,omitempty" json:"level2PasswordAttempts,omitempty"`
	JoinedAt               time.Time          `bson:"joinedAt" json:"joinedAt"`
	LastActive             time.Time          `bson:"lastActive,omitempty" json:"lastActive,omitempty"`
}
