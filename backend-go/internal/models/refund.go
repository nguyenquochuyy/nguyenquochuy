package models

import "time"

type RefundItem struct {
	ProductID   string  `bson:"productId" json:"productId"`
	ProductName string  `bson:"productName" json:"productName"`
	Quantity    int     `bson:"quantity" json:"quantity"`
	Price       float64 `bson:"price" json:"price"`
}

type Refund struct {
	ID            string       `bson:"id" json:"id"`
	OrderID       string       `bson:"orderId" json:"orderId"`
	OrderNumber   string       `bson:"orderNumber" json:"orderNumber"`
	CustomerID    string       `bson:"customerId" json:"customerId"`
	CustomerName  string       `bson:"customerName" json:"customerName"`
	CustomerPhone string       `bson:"customerPhone" json:"customerPhone"`
	Amount        float64      `bson:"amount" json:"amount"`
	Reason        string       `bson:"reason" json:"reason"`
	Status        string       `bson:"status" json:"status"`             // PENDING|APPROVED|PROCESSING|COMPLETED|REJECTED|CANCELLED
	RefundMethod  string       `bson:"refundMethod" json:"refundMethod"` // ORIGINAL|BANKING|CASH
	RefundAccount string       `bson:"refundAccount,omitempty" json:"refundAccount,omitempty"`
	ProcessedBy   string       `bson:"processedBy,omitempty" json:"processedBy,omitempty"`
	RequestDate   time.Time    `bson:"requestDate" json:"requestDate"`
	ProcessedDate time.Time    `bson:"processedDate,omitempty" json:"processedDate,omitempty"`
	CompletedDate time.Time    `bson:"completedDate,omitempty" json:"completedDate,omitempty"`
	Notes         string       `bson:"notes,omitempty" json:"notes,omitempty"`
	Items         []RefundItem `bson:"items" json:"items"`
}
