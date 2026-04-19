package models

import "time"

type Review struct {
	ID         string    `bson:"_id,omitempty" json:"_id,omitempty"`
	ProductId  string    `bson:"productId" json:"productId"`
	CustomerId string    `bson:"customerId" json:"customerId"`
	CustomerName string  `bson:"customerName" json:"customerName"`
	Rating     int       `bson:"rating" json:"rating"`
	Comment    string    `bson:"comment" json:"comment"`
	Reply      string    `bson:"reply,omitempty" json:"reply,omitempty"`
	ReplyDate  time.Time `bson:"replyDate,omitempty" json:"replyDate,omitempty"`
	IsHidden   bool      `bson:"isHidden" json:"isHidden"`
	CreatedAt  time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time `bson:"updatedAt" json:"updatedAt"`
}
