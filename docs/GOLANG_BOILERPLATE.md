# Golang Backend Boilerplate - Bắt Đầu Nhanh

## 📁 Cấu Trúc Dự Án

```
backend-go/
├── cmd/
│   └── server/
│       └── main.go              # Entry point
├── internal/
│   ├── config/
│   │   └── config.go           # Configuration
│   ├── models/
│   │   ├── product.go
│   │   ├── order.go
│   │   ├── customer.go
│   │   ├── employee.go
│   │   └── ... models khác
│   ├── controllers/
│   │   ├── product.go
│   │   ├── order.go
│   │   ├── auth.go
│   │   └── ... controllers khác
│   ├── services/
│   │   ├── product_service.go
│   │   ├── auth_service.go
│   │   └── ... services khác
│   ├── routes/
│   │   └── routes.go           # Tất cả routes
│   ├── middleware/
│   │   ├── auth.go
│   │   └── cors.go
│   ├── utils/
│   │   ├── validators.go
│   │   └── errors.go
│   └── database/
│       └── mongo.go            # MongoDB connection
├── go.mod
├── go.sum
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 QUICK START BOILERPLATE

### 1. main.go - Entry Point

```go
// cmd/server/main.go
package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "unishop-backend/internal/config"
    "unishop-backend/internal/database"
    "unishop-backend/internal/routes"
)

func main() {
    // Load config
    cfg := config.LoadConfig()
    
    // Connect to MongoDB
    mongoClient, err := database.ConnectMongo(cfg.MongoURI)
    if err != nil {
        log.Fatal("Failed to connect to MongoDB:", err)
    }
    defer mongoClient.Disconnect(ctx)
    
    // Setup Gin router
    router := gin.Default()
    
    // Setup routes
    routes.SetupRoutes(router)
    
    // Run server
    port := cfg.Port
    if port == "" {
        port = "5000"
    }
    
    log.Printf("🚀 Server running on http://0.0.0.0:%s", port)
    router.Run("0.0.0.0:" + port)
}
```

### 2. config.go - Configuration

```go
// internal/config/config.go
package config

import (
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    MongoURI  string
    Port      string
    JWTSecret string
    AppEnv    string
    EmailFrom string
    EmailPass string
}

func LoadConfig() *Config {
    godotenv.Load()
    
    return &Config{
        MongoURI:  os.Getenv("MONGO_URI"),
        Port:      os.Getenv("PORT"),
        JWTSecret: os.Getenv("JWT_SECRET"),
        AppEnv:    os.Getenv("NODE_ENV"),
        EmailFrom: os.Getenv("EMAIL_FROM"),
        EmailPass: os.Getenv("EMAIL_PASS"),
    }
}
```

### 3. mongo.go - Database Connection

```go
// internal/database/mongo.go
package database

import (
    "context"
    "log"
    "time"
    
    "go.mongodb.org/mongo-go-driver/mongo"
    "go.mongodb.org/mongo-go-driver/mongo/options"
)

func ConnectMongo(mongoURI string) (*mongo.Client, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
    if err != nil {
        return nil, err
    }
    
    // Ping để verify connection
    err = client.Ping(ctx, nil)
    if err != nil {
        return nil, err
    }
    
    log.Println("✅ Connected to MongoDB")
    return client, nil
}

func GetDB(client *mongo.Client) *mongo.Database {
    return client.Database("unishop")
}

func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
    return GetDB(client).Collection(collectionName)
}
```

### 4. routes.go - Routes Setup

```go
// internal/routes/routes.go
package routes

import (
    "github.com/gin-gonic/gin"
    "unishop-backend/internal/controllers"
    "unishop-backend/internal/middleware"
)

func SetupRoutes(router *gin.Engine) {
    // CORS Middleware
    router.Use(middleware.CORSMiddleware())
    
    // Health check
    router.GET("/api/health", controllers.Health)
    
    // Auth routes (public)
    auth := router.Group("/api/auth")
    {
        auth.POST("/login", controllers.Login)
        auth.POST("/register", controllers.Register)
        auth.POST("/refresh", controllers.RefreshToken)
    }
    
    // Admin routes (protected)
    admin := router.Group("/api/admin")
    admin.Use(middleware.JWTAuthMiddleware())
    {
        // Products
        admin.GET("/products", controllers.GetProducts)
        admin.POST("/products", controllers.CreateProduct)
        admin.PUT("/products/:id", controllers.UpdateProduct)
        admin.DELETE("/products/:id", controllers.DeleteProduct)
        
        // Orders
        admin.GET("/orders", controllers.GetOrders)
        admin.GET("/orders/:id", controllers.GetOrder)
        admin.PUT("/orders/:id", controllers.UpdateOrder)
        
        // Customers
        admin.GET("/customers", controllers.GetCustomers)
        admin.PUT("/customers/:id", controllers.UpdateCustomer)
        
        // Statistics
        admin.GET("/dashboard/stats", controllers.GetDashboardStats)
    }
    
    // Shop routes (public)
    shop := router.Group("/api")
    {
        shop.GET("/products", controllers.GetPublicProducts)
        shop.GET("/products/:id", controllers.GetProductDetail)
        shop.POST("/orders", controllers.CreateOrder)
        shop.GET("/orders/:id", controllers.GetOrderStatus)
    }
}
```

### 5. middleware.go - Middlewares

```go
// internal/middleware/middleware.go
package middleware

import (
    "github.com/gin-gonic/gin"
    "github.com/dgrijalva/jwt-go"
    "os"
    "strings"
)

// CORS Middleware
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    }
}

// JWT Auth Middleware
func JWTAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(401, gin.H{"error": "Missing authorization header"})
            c.Abort()
            return
        }
        
        // Format: Bearer <token>
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return []byte(os.Getenv("JWT_SECRET")), nil
        })
        
        if err != nil || !token.Valid {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        // Lấy claims
        if claims, ok := token.Claims.(jwt.MapClaims); ok {
            c.Set("userID", claims["sub"])
            c.Set("email", claims["email"])
        }
        
        c.Next()
    }
}
```

### 6. Product Model

```go
// internal/models/product.go
package models

import (
    "time"
    "go.mongodb.org/mongo-go-driver/bson/primitive"
)

type Product struct {
    ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
    ProductID     string             `bson:"id" json:"id"`
    Name          string             `bson:"name" json:"name" binding:"required"`
    Category      string             `bson:"category" json:"category"`
    Price         float64            `bson:"price" json:"price" binding:"required,gt=0"`
    CostPrice     float64            `bson:"costPrice" json:"costPrice"`
    Discount      float64            `bson:"discount" json:"discount"`
    DiscountType  string             `bson:"discountType" json:"discountType"`
    Stock         int32              `bson:"stock" json:"stock"`
    SKU           string             `bson:"sku" json:"sku"`
    Description   string             `bson:"description" json:"description"`
    Images        []string           `bson:"images" json:"images"`
    IsVisible     bool               `bson:"isVisible" json:"isVisible"`
    HasVariants   bool               `bson:"hasVariants" json:"hasVariants"`
    Variants      []ProductVariant   `bson:"variants" json:"variants"`
    CreatedAt     time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt     time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type ProductVariant struct {
    ID    string  `bson:"id" json:"id"`
    Name  string  `bson:"name" json:"name"`
    SKU   string  `bson:"sku" json:"sku"`
    Price float64 `bson:"price" json:"price"`
    Stock int32   `bson:"stock" json:"stock"`
}
```

### 7. Product Controller

```go
// internal/controllers/product.go
package controllers

import (
    "context"
    "net/http"
    "time"
    
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "go.mongodb.org/mongo-go-driver/bson"
    "go.mongodb.org/mongo-go-driver/mongo"
    
    "unishop-backend/internal/models"
)

var productCollection *mongo.Collection

func SetProductCollection(collection *mongo.Collection) {
    productCollection = collection
}

// GET /api/products - Get all products (public)
func GetPublicProducts(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    filter := bson.M{"isVisible": true}
    
    cursor, err := productCollection.Find(ctx, filter)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to fetch products"})
        return
    }
    defer cursor.Close(ctx)
    
    var products []models.Product
    if err = cursor.All(ctx, &products); err != nil {
        c.JSON(500, gin.H{"error": "Failed to parse products"})
        return
    }
    
    c.JSON(200, products)
}

// GET /api/admin/products - Get all products (admin)
func GetProducts(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    cursor, err := productCollection.Find(ctx, bson.M{})
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to fetch products"})
        return
    }
    defer cursor.Close(ctx)
    
    var products []models.Product
    if err = cursor.All(ctx, &products); err != nil {
        c.JSON(500, gin.H{"error": "Failed to parse products"})
        return
    }
    
    c.JSON(200, products)
}

// POST /api/admin/products - Create product
func CreateProduct(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    var product models.Product
    if err := c.BindJSON(&product); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request body"})
        return
    }
    
    // Generate ID nếu không có
    if product.ProductID == "" {
        product.ProductID = uuid.New().String()
    }
    
    product.CreatedAt = time.Now()
    product.UpdatedAt = time.Now()
    
    result, err := productCollection.InsertOne(ctx, product)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to create product"})
        return
    }
    
    product.ID = result.InsertedID.(primitive.ObjectID)
    c.JSON(201, product)
}

// PUT /api/admin/products/:id - Update product
func UpdateProduct(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    productID := c.Param("id")
    
    var product models.Product
    if err := c.BindJSON(&product); err != nil {
        c.JSON(400, gin.H{"error": "Invalid request body"})
        return
    }
    
    product.UpdatedAt = time.Now()
    
    filter := bson.M{"id": productID}
    update := bson.M{
        "$set": product,
    }
    
    _, err := productCollection.UpdateOne(ctx, filter, update)
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to update product"})
        return
    }
    
    c.JSON(200, gin.H{"message": "Product updated", "product": product})
}

// DELETE /api/admin/products/:id - Delete product
func DeleteProduct(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    productID := c.Param("id")
    
    filter := bson.M{"id": productID}
    result, err := productCollection.DeleteOne(ctx, filter)
    
    if err != nil {
        c.JSON(500, gin.H{"error": "Failed to delete product"})
        return
    }
    
    if result.DeletedCount == 0 {
        c.JSON(404, gin.H{"error": "Product not found"})
        return
    }
    
    c.JSON(200, gin.H{"message": "Product deleted"})
}

// GET /api/products/:id - Get product detail
func GetProductDetail(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    productID := c.Param("id")
    
    var product models.Product
    filter := bson.M{"id": productID}
    
    err := productCollection.FindOne(ctx, filter).Decode(&product)
    if err != nil {
        c.JSON(404, gin.H{"error": "Product not found"})
        return
    }
    
    c.JSON(200, product)
}

// Health check
func Health(c *gin.Context) {
    c.JSON(200, gin.H{
        "status":    "OK",
        "message":   "UniShop API is running",
        "timestamp": time.Now().Format(time.RFC3339),
    })
}

// Placeholder controllers cho endpoints khác
func GetOrders(c *gin.Context) {
    c.JSON(200, gin.H{"message": "GetOrders - implement soon"})
}

func GetOrder(c *gin.Context) {
    c.JSON(200, gin.H{"message": "GetOrder - implement soon"})
}

func UpdateOrder(c *gin.Context) {
    c.JSON(200, gin.H{"message": "UpdateOrder - implement soon"})
}

func GetCustomers(c *gin.Context) {
    c.JSON(200, gin.H{"message": "GetCustomers - implement soon"})
}

func UpdateCustomer(c *gin.Context) {
    c.JSON(200, gin.H{"message": "UpdateCustomer - implement soon"})
}

func GetDashboardStats(c *gin.Context) {
    c.JSON(200, gin.H{"message": "GetDashboardStats - implement soon"})
}

func CreateOrder(c *gin.Context) {
    c.JSON(200, gin.H{"message": "CreateOrder - implement soon"})
}

func GetOrderStatus(c *gin.Context) {
    c.JSON(200, gin.H{"message": "GetOrderStatus - implement soon"})
}

func Login(c *gin.Context) {
    c.JSON(200, gin.H{"message": "Login - implement soon"})
}

func Register(c *gin.Context) {
    c.JSON(200, gin.H{"message": "Register - implement soon"})
}

func RefreshToken(c *gin.Context) {
    c.JSON(200, gin.H{"message": "RefreshToken - implement soon"})
}
```

### 8. .env.example

```env
# MongoDB
MONGO_URI=mongodb://admin:password@localhost:27017/unishop?authSource=admin

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email
EMAIL_FROM=noreply@unishop.com
EMAIL_PASS=your-app-password

# Google Gemini (optional)
GEMINI_API_KEY=your-gemini-key
```

### 9. Dockerfile

```dockerfile
# Multi-stage build
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN GOOS=linux GOARCH=amd64 go build -o server cmd/server/main.go

# Production image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/server .
COPY .env .

EXPOSE 5000
CMD ["./server"]
```

### 10. docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: unishop-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: unishop
    volumes:
      - mongodb_data:/data/db
    networks:
      - unishop-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: unishop-backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://admin:password@mongodb:27017/unishop?authSource=admin
      NODE_ENV: development
      PORT: 5000
      JWT_SECRET: dev-jwt-secret-key
    depends_on:
      - mongodb
    networks:
      - unishop-network
    volumes:
      - .:/root/

volumes:
  mongodb_data:
    driver: local

networks:
  unishop-network:
    driver: bridge
```

---

## 🔧 SETUP CHI TỈ

### 1. Tạo Module
```bash
mkdir backend-go
cd backend-go
go mod init unishop-backend
```

### 2. Cài Dependencies
```bash
go get github.com/gin-gonic/gin
go get go.mongodb.org/mongo-go-driver
go get github.com/joho/godotenv
go get github.com/dgrijalva/jwt-go
go get golang.org/x/crypto
go get github.com/google/uuid
```

### 3. Tạo Thư Mục
```bash
mkdir -p cmd/server internal/{config,models,controllers,services,routes,middleware,utils,database}
```

### 4. Copy Code từ Boilerplate Trên

### 5. Setup MongoDB Locally
```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7
```

### 6. Chạy Server
```bash
go run cmd/server/main.go
```

### 7. Test API
```bash
curl http://localhost:5000/api/health
```

---

## 📝 TODO ITEMS

- [ ] Create all models (Copy từ Express schema)
- [ ] Create all controllers (Migrate từ Express routes)
- [ ] Create all services (Business logic layer)
- [ ] Implement authentication JWT
- [ ] Implement email service
- [ ] Add input validation
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Docker setup & test
- [ ] Deploy to staging
- [ ] Load testing
- [ ] Gradual migration từ Node.js

---

## 🎯 SUCCESS CRITERIA

✅ Tất cả endpoints hoạt động  
✅ Performance tốt hơn Node.js  
✅ MongoDB data giữ nguyên  
✅ Không downtime migration  
✅ Frontend kết nối được vào Go backend  

