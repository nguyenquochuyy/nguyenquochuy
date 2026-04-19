package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FinanceAccount struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	AccountID     string             `bson:"id" json:"id"`
	Name          string             `bson:"name" json:"name"`
	Type          string             `bson:"type" json:"type"` // CASH | BANK | WALLET
	Balance       float64            `bson:"balance" json:"balance"`
	AccountNumber string             `bson:"accountNumber,omitempty" json:"accountNumber,omitempty"`
}

type PaymentAccount struct {
	ID     int    `bson:"id" json:"id"`
	Bank   string `bson:"bank" json:"bank"`
	Number string `bson:"number" json:"number"`
	Holder string `bson:"holder" json:"holder"`
}

type Transaction struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	TxID        string             `bson:"id" json:"id"`
	Type        string             `bson:"type" json:"type"` // INCOME | EXPENSE
	Amount      float64            `bson:"amount" json:"amount"`
	Category    string             `bson:"category" json:"category"`
	Description string             `bson:"description" json:"description"`
	Date        time.Time          `bson:"date" json:"date"`
	AccountID   string             `bson:"accountId" json:"accountId"`
	RelatedID   string             `bson:"relatedId,omitempty" json:"relatedId,omitempty"`
	Status      string             `bson:"status" json:"status"` // COMPLETED | PENDING
	CreatedBy   string             `bson:"createdBy,omitempty" json:"createdBy,omitempty"`
}
