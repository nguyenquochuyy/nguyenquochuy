package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"

	"unishop/backend/internal/config"
	"unishop/backend/internal/logger"
	"unishop/backend/internal/middleware"
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
			logger.Log.Warn("Failed to create indexes", zap.String("collection", col), zap.Error(err))
		}
	}
	logger.Log.Info("✅ MongoDB indexes ensured")
}

func main() {
	if err := godotenv.Load(); err != nil {
		// Just a fallback logic, we don't log fatal because in prod it might not exist
	}

	cfg := config.Load()
	logger.Init(cfg.Env)
	defer logger.Sync()

	logger.Log.Info("Starting application", zap.String("env", cfg.Env))

	mongoClient, err := db.Connect(cfg.MongoURI)
	if err != nil {
		logger.Log.Fatal("MongoDB connection failed", zap.Error(err))
	}
	defer func() {
		if err = mongoClient.Disconnect(context.Background()); err != nil {
			logger.Log.Error("Error disconnecting from MongoDB", zap.Error(err))
		}
	}()

	database := mongoClient.Database(cfg.DBName)

	// Create indexes for performance
	ensureIndexes(database)

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Use Gin without default loggers
	router := gin.New()
	
	// Add Zap Logger & Recovery
	router.Use(middleware.ZapLogger(), gin.Recovery())
	
	// Apply rate limiting
	router.Use(middleware.RateLimit())

	// Apply robust CORS setup
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-CSRF-Token", "Accept-Encoding", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.Setup(router, database, cfg)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	go func() {
		logger.Log.Info("UniShop Go backend running", zap.String("port", cfg.Port), zap.String("env", cfg.Env))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Log.Fatal("Server error", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logger.Log.Info("Shutting down gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	if err := srv.Shutdown(ctx); err != nil {
		logger.Log.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Log.Info("Server exiting")
}
