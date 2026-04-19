package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"unishop/backend/internal/config"
	"unishop/backend/internal/routes"
	"unishop/backend/pkg/db"
)

func ensureIndexes(database *mongo.Database) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexes := map[string][]mongo.IndexModel{
		"orders": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "status", Value: 1}}},
			{Keys: bson.D{{Key: "paymentStatus", Value: 1}}},
			{Keys: bson.D{{Key: "paymentMethod", Value: 1}}},
			{Keys: bson.D{{Key: "createdAt", Value: -1}}},
			{Keys: bson.D{{Key: "updatedAt", Value: -1}}},
			{Keys: bson.D{{Key: "customerEmail", Value: 1}}},
			{Keys: bson.D{{Key: "customerPhone", Value: 1}}},
			{Keys: bson.D{{Key: "customerName", Value: 1}}},
			{Keys: bson.D{{Key: "status", Value: 1}, {Key: "createdAt", Value: -1}}},
			{Keys: bson.D{{Key: "customerPhone", Value: 1}, {Key: "createdAt", Value: -1}}},
			{Keys: bson.D{{Key: "customerName", Value: 1}, {Key: "createdAt", Value: -1}}},
		},
		"products": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "category", Value: 1}}},
			{Keys: bson.D{{Key: "sku", Value: 1}}},
			{Keys: bson.D{{Key: "isVisible", Value: 1}}},
			{Keys: bson.D{{Key: "price", Value: 1}}},
			{Keys: bson.D{{Key: "stock", Value: 1}}},
			{Keys: bson.D{{Key: "createdAt", Value: -1}}},
			{Keys: bson.D{{Key: "isVisible", Value: 1}, {Key: "category", Value: 1}}},
			{Keys: bson.D{{Key: "isVisible", Value: 1}, {Key: "createdAt", Value: -1}}},
		},
		"productHistory": {
			{Keys: bson.D{{Key: "id", Value: 1}}},
			{Keys: bson.D{{Key: "productId", Value: 1}}},
			{Keys: bson.D{{Key: "changedAt", Value: -1}}},
		},
		"customers": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "email", Value: 1}}},
		},
		"employees": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "email", Value: 1}}},
		},
		"categories": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "parentId", Value: 1}}},
			{Keys: bson.D{{Key: "order", Value: 1}}},
			{Keys: bson.D{{Key: "isActive", Value: 1}}},
		},
		"vouchers": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "code", Value: 1}}},
		},
		"refunds": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "orderId", Value: 1}}},
			{Keys: bson.D{{Key: "status", Value: 1}}},
		},
		"email_campaigns": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "status", Value: 1}}},
			{Keys: bson.D{{Key: "createdAt", Value: -1}}},
		},
		"customer_notes": {
			{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
			{Keys: bson.D{{Key: "customerId", Value: 1}}},
			{Keys: bson.D{{Key: "createdAt", Value: -1}}},
		},
		"transactions": {
			{Keys: bson.D{{Key: "date", Value: -1}}},
		},
	}

	for col, idxs := range indexes {
		_, err := database.Collection(col).Indexes().CreateMany(ctx, idxs)
		if err != nil {
			log.Printf("Warning: failed to create indexes for %s: %v", col, err)
		}
	}
	log.Println("✅ MongoDB indexes ensured")
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file, using system env vars")
	}

	cfg := config.Load()

	mongoClient, err := db.Connect(cfg.MongoURI)
	if err != nil {
		log.Fatalf("MongoDB connection failed: %v", err)
	}
	defer mongoClient.Disconnect(context.Background())

	database := mongoClient.Database(cfg.DBName)

	// Create indexes for performance
	ensureIndexes(database)

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()
	router.Use(CORSMiddleware())
	routes.Setup(router, database, cfg)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("UniShop Go backend running on :%s (env=%s)", cfg.Port, cfg.Env)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}
