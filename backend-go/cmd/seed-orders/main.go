package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CartItem struct {
	ProductID       string  `bson:"productId" json:"productId"`
	Name            string  `bson:"name" json:"name"`
	Price           float64 `bson:"price" json:"price"`
	Quantity        int     `bson:"quantity" json:"quantity"`
	SelectedVariant string  `bson:"selectedVariantId,omitempty" json:"selectedVariantId,omitempty"`
}

type OrderTimelineEvent struct {
	Status      string    `bson:"status" json:"status"`
	Timestamp   time.Time `bson:"timestamp" json:"timestamp"`
	Note        string    `bson:"note,omitempty" json:"note,omitempty"`
	ProcessedBy string    `bson:"processedBy,omitempty" json:"processedBy,omitempty"`
}

type Order struct {
	ID                   primitive.ObjectID   `bson:"_id,omitempty" json:"_id,omitempty"`
	OrderID              string               `bson:"id" json:"id"`
	CustomerName         string               `bson:"customerName" json:"customerName"`
	CustomerPhone        string               `bson:"customerPhone" json:"customerPhone"`
	CustomerAddress      string               `bson:"customerAddress" json:"customerAddress"`
	CustomerEmail        string               `bson:"customerEmail,omitempty" json:"customerEmail,omitempty"`
	Items                []CartItem           `bson:"items" json:"items"`
	Subtotal             float64              `bson:"subtotal" json:"subtotal"`
	DiscountAmount       float64              `bson:"discountAmount" json:"discountAmount"`
	VoucherCode          string               `bson:"voucherCode,omitempty" json:"voucherCode,omitempty"`
	VoucherDiscount      float64              `bson:"voucherDiscount,omitempty" json:"voucherDiscount,omitempty"`
	PointsUsed           int                  `bson:"pointsUsed,omitempty" json:"pointsUsed,omitempty"`
	PointsDiscount       float64              `bson:"pointsDiscount,omitempty" json:"pointsDiscount,omitempty"`
	ShippingFee          float64              `bson:"shippingFee" json:"shippingFee"`
	ShippingMethod       string               `bson:"shippingMethod" json:"shippingMethod"`
	TaxRate              float64              `bson:"taxRate" json:"taxRate"`
	TaxAmount            float64              `bson:"taxAmount" json:"taxAmount"`
	Total                float64              `bson:"total" json:"total"`
	Status               string               `bson:"status" json:"status"`
	PaymentMethod        string               `bson:"paymentMethod" json:"paymentMethod"`
	ProcessedBy          string               `bson:"processedBy,omitempty" json:"processedBy,omitempty"`
	InternalNotes        string               `bson:"internalNotes,omitempty" json:"internalNotes,omitempty"`
	CustomerNotes        string               `bson:"customerNotes,omitempty" json:"customerNotes,omitempty"`
	CreatedAt            time.Time            `bson:"createdAt" json:"createdAt"`
	UpdatedAt            time.Time            `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
	Timeline             []OrderTimelineEvent `bson:"timeline,omitempty" json:"timeline,omitempty"`
	ShippingTracking     string               `bson:"shippingTracking,omitempty" json:"shippingTracking,omitempty"`
	PaymentStatus        string               `bson:"paymentStatus,omitempty" json:"paymentStatus,omitempty"`
	PaymentTransactionID string               `bson:"paymentTransactionId,omitempty" json:"paymentTransactionId,omitempty"`
}

var (
	customerNames = []string{
		"Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Minh Dung",
		"Hồ Thị E", "Đỗ Văn F", "Vũ Thị G", "Ngô Minh Hùng",
		"Dương Thị Lan", "Bùi Văn Minh", "Phan Thị Nga", "Đặng Văn Oanh",
		"Huỳnh Thị Phương", "Lý Văn Quân", "Hoàng Thị R", "Nguyễn Văn Sơn",
		"Trần Thị Thu", "Võ Văn Tùng", "Phạm Thị Uyên", "Đinh Văn Vương",
	}
	customerAddresses = []string{
		"123 Nguyễn Huệ, Quận 1, TP.HCM",
		"456 Lê Lợi, Quận 3, TP.HCM",
		"789 Hai Bà Trưng, Quận 5, TP.HCM",
		"321 Trần Hưng Đạo, Quận 1, TP.HCM",
		"654 Pasteur, Quận 3, TP.HCM",
		"987 Đồng Khởi, Quận 1, TP.HCM",
		"147 Sương Vọng, Quận 5, TP.HCM",
		"258 Nguyễn Trãi, Quận 5, TP.HCM",
		"369 Cách Mạng Tháng 8, Quận 3, TP.HCM",
		"741 Võ Văn Tần, Quận 3, TP.HCM",
	}
	productNames = []string{
		"iPhone 15 Pro Max 256GB",
		"Samsung Galaxy S24 Ultra",
		"MacBook Air M3 13 inch",
		"iPad Pro 12.9 inch M2",
		"AirPods Pro 2nd Gen",
		"Apple Watch Series 9",
		"Sony WH-1000XM5",
		"Logitech MX Master 3S",
		"Samsung 49\" Odyssey G9",
		"Dell UltraSharp U2723QE",
	}
	statuses        = []string{"PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"}
	paymentMethods  = []string{"COD", "BANKING", "MOMO", "VNPAY"}
	paymentStatuses = []string{"PENDING", "PAID", "FAILED"}
	shippingMethods = []string{"Standard", "Express", "Same Day"}
)

func main() {
	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() { _ = client.Disconnect(ctx) }()

	db := client.Database("unishop")
	collection := db.Collection("orders")

	// Clear existing orders
	_, err = collection.DeleteMany(ctx, bson.M{})
	if err != nil {
		log.Printf("Warning: failed to clear orders: %v", err)
	}
	log.Println("Cleared existing orders")

	// Generate fake orders
	numOrders := 50
	for i := 0; i < numOrders; i++ {
		order := generateFakeOrder(i + 1)
		_, err := collection.InsertOne(ctx, order)
		if err != nil {
			log.Printf("Failed to insert order %d: %v", i+1, err)
			continue
		}
		log.Printf("Inserted order %d: %s", i+1, order.OrderID)
	}

	log.Printf("Successfully inserted %d fake orders", numOrders)
}

func generateFakeOrder(index int) Order {
	// Generate order ID based on timestamp
	timestamp := time.Now().Add(-time.Duration(rand.Intn(30*24)) * time.Hour).UnixMilli()
	orderID := fmt.Sprintf("%d", timestamp)

	// Random customer
	customerName := customerNames[rand.Intn(len(customerNames))]
	customerPhone := fmt.Sprintf("0%09d", rand.Intn(1000000000))
	customerAddress := customerAddresses[rand.Intn(len(customerAddresses))]
	customerEmail := fmt.Sprintf("customer%d@example.com", rand.Intn(1000))

	// Random items (1-5 items)
	numItems := rand.Intn(5) + 1
	items := make([]CartItem, numItems)
	subtotal := 0.0
	for j := 0; j < numItems; j++ {
		productName := productNames[rand.Intn(len(productNames))]
		price := float64(rand.Intn(50000000)/100000+1) * 100000 // 100k - 50M
		quantity := rand.Intn(3) + 1
		items[j] = CartItem{
			ProductID: fmt.Sprintf("prod%d", rand.Intn(1000)),
			Name:      productName,
			Price:     price,
			Quantity:  quantity,
		}
		subtotal += price * float64(quantity)
	}

	// Random discounts
	discountAmount := 0.0
	voucherCode := ""
	voucherDiscount := 0.0
	pointsUsed := 0
	pointsDiscount := 0.0

	if rand.Float32() > 0.7 {
		discountAmount = subtotal * 0.1
	}

	if rand.Float32() > 0.8 {
		voucherCode = fmt.Sprintf("SAVE%d", rand.Intn(50))
		voucherDiscount = subtotal * 0.05
	}

	if rand.Float32() > 0.85 {
		pointsUsed = rand.Intn(1000)
		pointsDiscount = float64(pointsUsed) * 100
	}

	// Shipping
	shippingMethod := shippingMethods[rand.Intn(len(shippingMethods))]
	shippingFee := 0.0
	if shippingMethod == "Standard" {
		shippingFee = 30000
	} else if shippingMethod == "Express" {
		shippingFee = 50000
	} else {
		shippingFee = 80000
	}

	// Tax
	taxRate := 10.0
	taxAmount := (subtotal - discountAmount - voucherDiscount - pointsDiscount) * (taxRate / 100)

	// Total
	total := subtotal - discountAmount - voucherDiscount - pointsDiscount + shippingFee + taxAmount

	// Status and payment
	status := statuses[rand.Intn(len(statuses))]
	paymentMethod := paymentMethods[rand.Intn(len(paymentMethods))]
	paymentStatus := paymentStatuses[rand.Intn(len(paymentStatuses))]

	if status == "COMPLETED" || status == "SHIPPING" {
		paymentStatus = "PAID"
	}

	// Timeline
	timeline := []OrderTimelineEvent{
		{
			Status:    "PENDING",
			Timestamp: time.UnixMilli(timestamp),
		},
	}

	if status != "PENDING" {
		timeline = append(timeline, OrderTimelineEvent{
			Status:    "CONFIRMED",
			Timestamp: time.UnixMilli(timestamp + int64(rand.Intn(3600000))),
		})
	}

	if status == "SHIPPING" || status == "COMPLETED" {
		timeline = append(timeline, OrderTimelineEvent{
			Status:    "SHIPPING",
			Timestamp: time.UnixMilli(timestamp + int64(rand.Intn(86400000))),
		})
	}

	if status == "COMPLETED" {
		timeline = append(timeline, OrderTimelineEvent{
			Status:    "COMPLETED",
			Timestamp: time.UnixMilli(timestamp + int64(rand.Intn(172800000))),
		})
	}

	if status == "CANCELLED" {
		timeline = append(timeline, OrderTimelineEvent{
			Status:    "CANCELLED",
			Timestamp: time.UnixMilli(timestamp + int64(rand.Intn(86400000))),
			Note:      "Customer cancelled",
		})
	}

	// Tracking number
	shippingTracking := ""
	if status == "SHIPPING" || status == "COMPLETED" {
		shippingTracking = fmt.Sprintf("VN%d%s", rand.Intn(1000000), fmt.Sprintf("%d", timestamp)[10:])
	}

	// Timestamps
	createdAt := time.UnixMilli(timestamp)
	updatedAt := createdAt.Add(time.Duration(rand.Intn(3600000)))

	return Order{
		OrderID:              orderID,
		CustomerName:         customerName,
		CustomerPhone:        customerPhone,
		CustomerAddress:      customerAddress,
		CustomerEmail:        customerEmail,
		Items:                items,
		Subtotal:             subtotal,
		DiscountAmount:       discountAmount,
		VoucherCode:          voucherCode,
		VoucherDiscount:      voucherDiscount,
		PointsUsed:           pointsUsed,
		PointsDiscount:       pointsDiscount,
		ShippingFee:          shippingFee,
		ShippingMethod:       shippingMethod,
		TaxRate:              taxRate,
		TaxAmount:            taxAmount,
		Total:                total,
		Status:               status,
		PaymentMethod:        paymentMethod,
		PaymentStatus:        paymentStatus,
		PaymentTransactionID: "",
		Timeline:             timeline,
		ShippingTracking:     shippingTracking,
		CreatedAt:            createdAt,
		UpdatedAt:            updatedAt,
	}
}
