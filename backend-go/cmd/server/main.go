package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"strings"
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
	"unishop/backend/pkg/cache"
	"unishop/backend/pkg/db"
)

// freePort tries to kill whatever process is occupying the given port.
func freePort(port string) {
	ln, err := net.Listen("tcp", ":"+port)
	if err == nil {
		ln.Close()
		return // port is free
	}

	logger.Log.Warn("Port is occupied, attempting to free it", zap.String("port", port))

	if runtime.GOOS == "windows" {
		// Find PID using netstat
		out, e := exec.Command("cmd", "/C", "netstat -ano | findstr :"+port).Output()
		if e != nil {
			return
		}
		for _, line := range strings.Split(string(out), "\n") {
			fields := strings.Fields(strings.TrimSpace(line))
			if len(fields) >= 5 && strings.Contains(fields[1], ":"+port) && fields[3] == "LISTENING" {
				pid := fields[4]
				if pid != "0" {
					logger.Log.Info("Killing process on port", zap.String("port", port), zap.String("pid", pid))
					exec.Command("taskkill", "/F", "/PID", pid).Run()
					time.Sleep(500 * time.Millisecond)
				}
			}
		}
	} else {
		// Linux/Mac: use fuser or lsof
		exec.Command("fuser", "-k", port+"/tcp").Run()
		time.Sleep(500 * time.Millisecond)
	}

	// Verify
	ln2, err2 := net.Listen("tcp", ":"+port)
	if err2 != nil {
		logger.Log.Error(fmt.Sprintf("Could not free port %s — please close the process manually", port))
	} else {
		ln2.Close()
		logger.Log.Info("Port freed successfully", zap.String("port", port))
	}
}

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

	// Init in-memory cache (swap to Redis by implementing cache.Cache interface)
	appCache := cache.NewMemoryCache()
	logger.Log.Info("✅ In-memory cache initialized")

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Use Gin without default loggers
	router := gin.New()

	// Add Request ID, Security Headers, Zap Logger & Recovery
	router.Use(
		middleware.RequestID(),
		middleware.SecurityHeaders(),
		middleware.ZapLogger(),
		middleware.ErrorHandler(),
		gin.Recovery(),
	)

	// Apply rate limiting & gzip
	router.Use(middleware.RateLimit(), middleware.Gzip())

	// Apply robust CORS setup
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-CSRF-Token", "Accept-Encoding", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.Setup(router, database, cfg, appCache)

	// Swagger docs (development only)
	if cfg.Env == "development" {
		router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// Auto-free port if occupied
	freePort(cfg.Port)

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
