# Kế Hoạch Chuyển Backend sang Golang với MongoDB

## 📋 Tóm Tắt
Chuyển backend từ Node.js/Express.js sang Golang, giữ nguyên MongoDB. Dự kiến thời gian: **4-6 tuần**

---

## 🏗️ GIAI ĐOẠN 1: LÀM QUEN & CHUẨN BỊ (Tuần 1)

### 1.1 Setup Golang Environment
```bash
# Cài đặt Go (phiên bản >= 1.21)
# Download từ https://golang.org/dl/

# Cấu trúc thư mục mới
├── backend-go/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   ├── pkg/
│   │   ├── db/
│   │   └── utils/
│   ├── go.mod
│   ├── go.sum
│   ├── .env
│   └── docker-compose.yml
```

### 1.2 Cài đặt Dependencies
```bash
go get github.com/gin-gonic/gin              # Web framework (giống Express)
go get go.mongodb.org/mongo-go-driver        # MongoDB driver
go get github.com/joho/godotenv              # Env variables
go get github.com/dgrijalva/jwt-go           # JWT authentication
go get golang.org/x/crypto                   # Bcrypt hashing
go get github.com/google/uuid                # UUID generation
go get github.com/rs/cors                    # CORS middleware
```

### 1.3 Học Golang Cơ Bản
- Cú pháp Go (structs, interfaces, goroutines)
- Go modules và dependency management
- Error handling patterns
- Concurrency model

---

## 📦 GIAI ĐOẠN 2: SETUP CƠNG CỤ & INFRASTRUCTURE (Tuần 1-2)

### 2.1 Tạo go.mod
```go
module unishop-backend

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    go.mongodb.org/mongo-go-driver v1.14.0
    github.com/joho/godotenv v1.5.1
    github.com/dgrijalva/jwt-go v3.2.0
    golang.org/x/crypto v0.21.0
    github.com/google/uuid v1.6.0
)
```

### 2.2 Cấu hình Database Connection
```go
// pkg/db/mongo.go
package db

import (
    "context"
    "go.mongodb.org/mongo-go-driver/mongo"
    "go.mongodb.org/mongo-go-driver/mongo/options"
)

func ConnectMongo(mongoURI string) (*mongo.Client, error) {
    client, err := mongo.Connect(
        context.Background(),
        options.Client().ApplyURI(mongoURI),
    )
    if err != nil {
        return nil, err
    }
    
    // Ping để kiểm tra kết nối
    err = client.Ping(context.Background(), nil)
    return client, err
}
```

### 2.3 Config & Environment
```go
// internal/config/config.go
package config

import (
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    MongoURI string
    Port     string
    JWTSecret string
    Env      string
}

func LoadConfig() *Config {
    godotenv.Load()
    
    return &Config{
        MongoURI: os.Getenv("MONGO_URI"),
        Port:     os.Getenv("PORT"),
        JWTSecret: os.Getenv("JWT_SECRET"),
        Env:      os.Getenv("NODE_ENV"),
    }
}
```

---

## 🗄️ GIAI ĐOẠN 3: MIGRATE MODELS (Tuần 2)

### 3.1 Mapping Express→Go Models

| Express/Mongoose | Go | MongoDB |
|---|---|---|
| Schema | struct + BSON tags | Collection |
| Document | struct instance | BSON document |
| Validation | Mongoose validators | Manual or struct tags |

### 3.2 Models Structure

```go
// internal/models/product.go
package models

import "go.mongodb.org/mongo-go-driver/bson/primitive"

type Product struct {
    ID            primitive.ObjectID `bson:"_id,omitempty"`
    ProductID     string             `bson:"id"`
    Name          string             `bson:"name"`
    Category      string             `bson:"category"`
    Price         float64            `bson:"price"`
    CostPrice     float64            `bson:"costPrice"`
    Discount      float64            `bson:"discount"`
    DiscountType  string             `bson:"discountType"`
    Stock         int32              `bson:"stock"`
    SKU           string             `bson:"sku"`
    Description   string             `bson:"description"`
    Images        []string           `bson:"images"`
    IsVisible     bool               `bson:"isVisible"`
    Variants      []ProductVariant   `bson:"variants"`
    CreatedAt     primitive.DateTime `bson:"createdAt"`
    UpdatedAt     primitive.DateTime `bson:"updatedAt"`
}

type ProductVariant struct {
    ID    string  `bson:"id"`
    Name  string  `bson:"name"`
    SKU   string  `bson:"sku"`
    Price float64 `bson:"price"`
    Stock int32   `bson:"stock"`
}
```

### 3.3 Tất Cả Models Cần Migrate
- [ ] Product
- [ ] Order
- [ ] Category
- [ ] Customer
- [ ] Employee
- [ ] InventoryLog
- [ ] Voucher
- [ ] Setting (nếu có)
- [ ] Notification (nếu có)

---

## 🔐 GIAO ĐOẠN 4: IMPLEMENT AUTHENTICATION & MIDDLEWARE (Tuần 2-3)

### 4.1 JWT Authentication Middleware
```go
// internal/middleware/auth.go
package middleware

import (
    "github.com/dgrijalva/jwt-go"
    "github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        // Validate token
        // Set user info to context
        c.Next()
    }
}
```

### 4.2 CORS Middleware
```go
// internal/middleware/cors.go
c.Use(func(c *gin.Context) {
    c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    
    if c.Request.Method == "OPTIONS" {
        c.AbortWithStatus(204)
        return
    }
    c.Next()
})
```

### 4.3 Authentication Flow
- [ ] Login endpoint
- [ ] Register endpoint
- [ ] Refresh token
- [ ] Logout
- [ ] Two-factor auth support
- [ ] Password hashing (bcrypt)

---

## 🛣️ GIAI ĐOẠN 5: MIGRATE ROUTES & CONTROLLERS (Tuần 3-4)

### 5.1 Route Structure

```go
// internal/routes/routes.go
package routes

import (
    "github.com/gin-gonic/gin"
    "unishop-backend/internal/controllers"
)

func SetupRoutes(router *gin.Engine) {
    // Health check
    router.GET("/api/health", controllers.Health)
    
    // Auth routes
    auth := router.Group("/api/auth")
    {
        auth.POST("/login", controllers.Login)
        auth.POST("/register", controllers.Register)
        auth.POST("/refresh", controllers.RefreshToken)
    }
    
    // Admin routes (protected)
    admin := router.Group("/api/admin")
    admin.Use(middleware.AuthMiddleware())
    {
        admin.GET("/products", controllers.GetProducts)
        admin.POST("/products", controllers.CreateProduct)
        admin.PUT("/products/:id", controllers.UpdateProduct)
        admin.DELETE("/products/:id", controllers.DeleteProduct)
        // ... other admin routes
    }
    
    // Shop routes (public)
    shop := router.Group("/api")
    {
        shop.GET("/products", controllers.GetPublicProducts)
        shop.GET("/products/:id", controllers.GetProductDetail)
        // ... other shop routes
    }
}
```

### 5.2 Controllers Mapping

| Express Route | Golang Controller | Priority |
|---|---|---|
| POST /api/auth/login | authController.Login | ✅ High |
| POST /api/auth/register | authController.Register | ✅ High |
| GET /api/products | productController.GetProducts | ✅ High |
| POST /api/admin/products | productController.CreateProduct | ✅ High |
| PUT /api/admin/orders/:id | orderController.UpdateOrder | ✅ High |
| DELETE /api/admin/products/:id | productController.DeleteProduct | ✅ Medium |
| GET /api/admin/stats | dashboardController.GetStats | ✅ Medium |

### 5.3 Controller Example
```go
// internal/controllers/product.go
package controllers

import (
    "github.com/gin-gonic/gin"
    "unishop-backend/internal/models"
    "unishop-backend/internal/services"
)

func GetProducts(c *gin.Context) {
    products, err := services.GetAllProducts()
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, products)
}

func CreateProduct(c *gin.Context) {
    var product models.Product
    if err := c.BindJSON(&product); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    createdProduct, err := services.CreateProduct(&product)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(201, createdProduct)
}
```

---

## 💾 GIAI ĐOẠN 6: IMPLEMENT SERVICES & BUSINESS LOGIC (Tuần 4)

### 6.1 Service Layer
```go
// internal/services/product_service.go
package services

import (
    "context"
    "go.mongodb.org/mongo-go-driver/bson"
    "go.mongodb.org/mongo-go-driver/mongo"
    "unishop-backend/internal/models"
)

type ProductService struct {
    collection *mongo.Collection
}

func (ps *ProductService) GetAllProducts(ctx context.Context) ([]models.Product, error) {
    var products []models.Product
    
    cursor, err := ps.collection.Find(ctx, bson.M{})
    if err != nil {
        return nil, err
    }
    defer cursor.Close(ctx)
    
    if err = cursor.All(ctx, &products); err != nil {
        return nil, err
    }
    
    return products, nil
}

func (ps *ProductService) CreateProduct(ctx context.Context, product *models.Product) (*models.Product, error) {
    result, err := ps.collection.InsertOne(ctx, product)
    if err != nil {
        return nil, err
    }
    product.ID = result.InsertedID.(primitive.ObjectID)
    return product, nil
}
```

### 6.2 Services Cần Tạo
- [ ] ProductService
- [ ] OrderService
- [ ] CustomerService
- [ ] EmployeeService
- [ ] AuthService
- [ ] InventoryService
- [ ] VoucherService
- [ ] EmailService (sử dụng email library)
- [ ] StatisticsService

---

## 🧪 GIAI ĐOẠN 7: TESTING & VALIDATION (Tuần 4-5)

### 7.1 Unit Tests
```go
// internal/services/product_service_test.go
package services

import (
    "testing"
)

func TestGetAllProducts(t *testing.T) {
    // Mock MongoDB connection
    // Test logic
}

func TestCreateProduct(t *testing.T) {
    // Test logic
}
```

### 7.2 API Testing (Postman/Thunder Client)
- [ ] Test tất cả auth endpoints
- [ ] Test tất cả product endpoints
- [ ] Test tất cả order endpoints
- [ ] Test tất cả admin endpoints
- [ ] Load testing (nếu cần)

### 7.3 Data Validation
```go
// internal/utils/validators.go
package utils

import "regexp"

func ValidateEmail(email string) bool {
    pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
    matched, _ := regexp.MatchString(pattern, email)
    return matched
}

func ValidatePhone(phone string) bool {
    pattern := `^(\+84|0)[0-9]{9,}$`
    matched, _ := regexp.MatchString(pattern, phone)
    return matched
}
```

---

## 🚀 GIAI ĐOẠN 8: DEPLOYMENT & MIGRATION (Tuần 5-6)

### 8.1 Docker Setup
```dockerfile
# Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY . .
RUN go build -o server cmd/server/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/server .
COPY .env .

EXPOSE 5000
CMD ["./server"]
```

### 8.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://admin:password@mongodb:27017
      NODE_ENV: development
      PORT: 5000
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

### 8.3 Migration Strategy
**Option 1: Parallel Running (KHUYẾN KHÍCH)**
```
Tuần 1-4: Xây dựng Go backend song song với Node.js backend
Tuần 5: Testing, verification
Tuần 6: Cut-over từ Node.js → Go (traffic từ từ)
```

**Step-by-step:**
1. Deploy Go backend trên server khác
2. Update frontend API endpoint từ từ (5% traffic, sau đó 25%, 50%, 100%)
3. Monitor logs & errors
4. Backup MongoDB trước mỗi giai đoạn
5. Rollback plan sẵn sàng

### 8.4 Vercel/Cloud Deployment
```bash
# Nếu dùng Vercel, cần serverless function
# Hoặc sử dụng alternative như Render, Railway, etc.

# Hoặc deploy trên VPS riêng:
# - DigitalOcean, Linode, AWS EC2, GoogleCloud
# - Docker + docker-compose
```

---

## ✅ CHECKLIST MIGRATION

### Chuẩn Bị
- [ ] Cài đặt Go
- [ ] Tạo thư mục project
- [ ] Init go.mod
- [ ] Cài dependencies

### Models & Database
- [ ] Product model
- [ ] Order model
- [ ] Category model
- [ ] Customer model
- [ ] Employee model
- [ ] InventoryLog model
- [ ] Voucher model
- [ ] Indexes trong MongoDB

### Authentication
- [ ] JWT implementation
- [ ] Bcrypt password hashing
- [ ] Login endpoint
- [ ] Register endpoint
- [ ] Refresh token
- [ ] Auth middleware

### API Endpoints
- [ ] Health check endpoint
- [ ] Admin endpoints (CRUD products, orders, etc.)
- [ ] Shop endpoints (get products, cart, checkout)
- [ ] Auth endpoints (login, register, logout)
- [ ] Profile endpoints
- [ ] Dashboard/Statistics
- [ ] Voucher management
- [ ] Inventory management

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] API endpoint testing
- [ ] Load testing (nếu cần)
- [ ] Data validation

### Deployment
- [ ] Docker configuration
- [ ] Environment variables setup
- [ ] Database backup
- [ ] Monitoring setup
- [ ] Error logging
- [ ] Rollback plan

### Cleanup (sau khi stable)
- [ ] Xóa Node.js backend
- [ ] Update documentation
- [ ] Archive old code

---

## 🎯 KPI & METRICS

### Performance Targets
```
Response Time:
- Before (Node.js): ~100-150ms
- After (Go): ~30-50ms (expected improvement ~60%)

Throughput:
- Concurrent requests handling: 2x better
- Memory usage: ~30% menos than Node.js

Startup time:
- Go: ~500ms (vs Node.js ~3-5 seconds)
```

---

## 📚 RESOURCES HỮU ÍCH

### Documentation
- https://go.dev/doc/
- https://pkg.go.dev/go.mongodb.org/mongo-go-driver
- https://gin-gonic.com/
- https://golang-jwt.github.io/jwt/

### Learning
- Go by Example: gobyexample.com
- Golang Tutorial: golang.org/doc/effective_go

### Tools
- Postman: API testing
- Thunder Client: VS Code extension
- pprof: Go profiling

---

## ⚠️ RISKS & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Learning curve Go | Mid | Mid | Allocate time for learning, pair programming |
| Breaking changes in API | Low | High | Comprehensive testing, versioning |
| Data loss | Low | Critical | Automated backups, staging environment |
| Performance issues | Low | Mid | Load testing, monitoring |
| Dependency compatibility | Low | Mid | Pin versions, regular updates |

---

## 📅 TIMELINE ĐỀ XUẤT

```
TUẦN 1 (4 ngày):
├── Setup environment & dependencies
├── Learn Go basics
├── Tạo project structure
└── Database connection

TUẦN 2-3 (8 ngày):
├── Migrate tất cả models
├── Implement authentication
├── Setup controllers & routes
└── Basic CRUD operations

TUẦN 3-4 (8 ngày):
├── Implement services layer
├── Integrate complex business logic
├── Email service, payments, etc.
└── API integration

TUẦN 4-5 (8 ngày):
├── Comprehensive testing
├── Bug fixing
├── Performance optimization
└── Documentation

TUẦN 5-6 (8 ngày):
├── Docker setup
├── Deploy to staging
├── Load testing
├── Gradual migration (5% → 100%)
└── Monitoring & optimization
```

---

## 🔄 NEXT STEPS

1. **Tuần 1**: Clone project, setup Go environment
2. **Tuần 2**: Create first working version của models
3. **Tuần 3**: Implement auth & basic CRUD
4. **Tuần 4**: Complete all features
5. **Tuần 5**: Testing & deployment
6. **Tuần 6**: Gradual traffic migration

---

**Status**: 📝 Draft  
**Last Updated**: 2026-04-18  
**Owner**: Your Team
