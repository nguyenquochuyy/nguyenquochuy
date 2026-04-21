package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

func hash(pw string) string {
	b, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(b)
}

func main() {
	_ = godotenv.Load("../../.env")

	uri := os.Getenv("MONGO_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "unishop"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("Connect error:", err)
	}
	defer func() { _ = client.Disconnect(ctx) }()

	if err = client.Ping(ctx, nil); err != nil {
		log.Fatal("Ping error:", err)
	}

	db := client.Database(dbName)

	// --- Clear old data ---
	_ = db.Collection("employees").Drop(ctx)
	_ = db.Collection("customers").Drop(ctx)
	fmt.Println("✅ Cleared old employees & customers")

	// --- Seed Employees ---
	employees := []interface{}{
		bson.M{
			"id":                     "emp_owner_001",
			"name":                   "Admin Owner",
			"email":                  "owner@unishop.com",
			"password":               hash("Owner@2026"),
			"phone":                  "0900000001",
			"role":                   "OWNER",
			"status":                 "ACTIVE",
			"joinedAt":               time.Now(),
			"lastActive":             time.Now(),
			"level2PasswordAttempts": 0,
		},
		bson.M{
			"id":                     "emp_acc_001",
			"name":                   "Kế toán",
			"email":                  "accountant@unishop.com",
			"password":               hash("Acc@2026"),
			"phone":                  "0900000002",
			"role":                   "ACCOUNTANT",
			"status":                 "ACTIVE",
			"joinedAt":               time.Now(),
			"lastActive":             time.Now(),
			"level2PasswordAttempts": 0,
		},
		bson.M{
			"id":                     "emp_staff_001",
			"name":                   "Nhân viên",
			"email":                  "staff@unishop.com",
			"password":               hash("Staff@2026"),
			"phone":                  "0900000003",
			"role":                   "STAFF",
			"status":                 "ACTIVE",
			"joinedAt":               time.Now(),
			"lastActive":             time.Now(),
			"level2PasswordAttempts": 0,
		},
	}
	_, err = db.Collection("employees").InsertMany(ctx, employees)
	if err != nil {
		log.Fatal("Seed employees error:", err)
	}
	fmt.Println("✅ Seeded 3 employees")

	// --- Seed Customers ---
	customers := []interface{}{
		bson.M{
			"id":            "cust_001",
			"name":          "Nguyễn Văn An",
			"phone":         "0901111111",
			"email":         "an@gmail.com",
			"password":      hash("Customer@123"),
			"address":       "12 Lê Lợi, Q1, TP.HCM",
			"status":        "ACTIVE",
			"joinedAt":      time.Now(),
			"loyaltyPoints": 0,
			"wishlist":      []string{},
		},
		bson.M{
			"id":            "cust_002",
			"name":          "Trần Thị Bình",
			"phone":         "0902222222",
			"email":         "binh@gmail.com",
			"password":      hash("Customer@123"),
			"address":       "45 Nguyễn Huệ, Q1, TP.HCM",
			"status":        "ACTIVE",
			"joinedAt":      time.Now(),
			"loyaltyPoints": 150,
			"wishlist":      []string{},
		},
	}
	_, err = db.Collection("customers").InsertMany(ctx, customers)
	if err != nil {
		log.Fatal("Seed customers error:", err)
	}
	fmt.Println("✅ Seeded 2 customers")

	fmt.Println("\n🎉 Seed complete!")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Println("Admin Portal (admin.html):")
	fmt.Println("  owner@unishop.com     / Owner@2026")
	fmt.Println("  accountant@unishop.com / Acc@2026")
	fmt.Println("  staff@unishop.com      / Staff@2026")
	fmt.Println("Store:")
	fmt.Println("  an@gmail.com    / Customer@123")
	fmt.Println("  binh@gmail.com  / Customer@123")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}
