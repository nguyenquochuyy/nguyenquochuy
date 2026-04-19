package models

import "time"

type CustomerNote struct {
	ID         string    `bson:"id" json:"id"`
	CustomerID string    `bson:"customerId" json:"customerId"`
	Note       string    `bson:"note" json:"note"`
	UserID     string    `bson:"userId" json:"userId"`
	CreatedAt  time.Time `bson:"createdAt" json:"createdAt"`
}
