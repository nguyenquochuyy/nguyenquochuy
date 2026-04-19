package handlers

import (
	"context"
	"time"

	"unishop/backend/internal/config"
	"unishop/backend/internal/middleware"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	employees *mongo.Collection
	customers *mongo.Collection
	cfg       *config.Config
}

func NewAuthHandler(db *mongo.Database, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		employees: db.Collection("employees"),
		customers: db.Collection("customers"),
		cfg:       cfg,
	}
}

// POST /api/auth/admin/login — employees only
func (h *AuthHandler) AdminLogin(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var emp models.Employee
	if err := h.employees.FindOne(ctx, bson.M{"email": body.Email}).Decode(&emp); err != nil {
		utils.BadRequest(c, "Email hoặc mật khẩu không đúng")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(emp.Password), []byte(body.Password)); err != nil {
		utils.BadRequest(c, "Email hoặc mật khẩu không đúng")
		return
	}

	emp.Password = ""
	token := h.generateToken(emp.EmployeeID, emp.Role, 8*time.Hour)
	c.JSON(200, gin.H{"success": true, "token": token, "user": emp, "type": "employee"})
}

// POST /api/auth/store/login — customers only
func (h *AuthHandler) StoreLogin(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cust models.Customer
	if err := h.customers.FindOne(ctx, bson.M{"email": body.Email}).Decode(&cust); err != nil {
		utils.BadRequest(c, "Email hoặc mật khẩu không đúng")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(cust.Password), []byte(body.Password)); err != nil {
		utils.BadRequest(c, "Email hoặc mật khẩu không đúng")
		return
	}

	cust.Password = ""
	token := h.generateToken(cust.CustomerID, "CUSTOMER", 24*time.Hour)
	c.JSON(200, gin.H{"success": true, "token": token, "user": cust, "type": "customer"})
}

// POST /api/auth/login (legacy — kept for backward compat)
func (h *AuthHandler) Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try employee first
	var emp models.Employee
	if err := h.employees.FindOne(ctx, bson.M{"email": body.Email}).Decode(&emp); err == nil {
		if err = bcrypt.CompareHashAndPassword([]byte(emp.Password), []byte(body.Password)); err == nil {
			token := h.generateToken(emp.EmployeeID, emp.Role, 8*time.Hour)
			c.JSON(200, gin.H{"success": true, "token": token, "user": emp, "type": "employee"})
			return
		}
	}

	// Try customer
	var cust models.Customer
	if err := h.customers.FindOne(ctx, bson.M{"email": body.Email}).Decode(&cust); err == nil {
		if err = bcrypt.CompareHashAndPassword([]byte(cust.Password), []byte(body.Password)); err == nil {
			token := h.generateToken(cust.CustomerID, "CUSTOMER", 24*time.Hour)
			c.JSON(200, gin.H{"success": true, "token": token, "user": cust, "type": "customer"})
			return
		}
	}

	utils.BadRequest(c, "Email hoặc mật khẩu không đúng")
}

// POST /api/auth/check-email
func (h *AuthHandler) CheckEmail(c *gin.Context) {
	var body struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	count, _ := h.customers.CountDocuments(ctx, bson.M{"email": body.Email})
	c.JSON(200, gin.H{"success": true, "exists": count > 0})
}

// POST /api/auth/send-code
func (h *AuthHandler) SendCode(c *gin.Context) {
	// TODO: implement email verification code sending
	// Use EmailService to send OTP to email
	c.JSON(200, gin.H{"success": true, "message": "Mã xác thực đã được gửi"})
}

// POST /api/auth/verify-code
func (h *AuthHandler) VerifyCode(c *gin.Context) {
	// TODO: verify OTP code from Redis or in-memory store
	c.JSON(200, gin.H{"success": true, "verified": true})
}

// POST /api/auth/create-customer
func (h *AuthHandler) CreateCustomer(c *gin.Context) {
	var body models.Customer
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	body.Password = string(hashed)
	body.Status = "ACTIVE"
	body.JoinedAt = time.Now()
	body.LoyaltyPoints = 0
	body.Wishlist = []string{}

	if _, err = h.customers.InsertOne(ctx, body); err != nil {
		utils.InternalError(c, err)
		return
	}

	utils.Created(c, gin.H{"message": "Tài khoản đã được tạo thành công"})
}

// POST /api/auth/send-2fa-code
func (h *AuthHandler) Send2FACode(c *gin.Context) {
	// TODO: implement 2FA code sending
	c.JSON(200, gin.H{"success": true, "message": "Mã 2FA đã được gửi"})
}

// POST /api/auth/verify-2fa-code
func (h *AuthHandler) Verify2FACode(c *gin.Context) {
	// TODO: verify 2FA code
	c.JSON(200, gin.H{"success": true, "verified": true})
}

func (h *AuthHandler) generateToken(userID, role string, expiry time.Duration) string {
	claims := middleware.Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.cfg.JWTSecret))
	return token
}
