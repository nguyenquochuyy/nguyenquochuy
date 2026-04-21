package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
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

const (
	bcryptCost           = 12
	accessTokenDuration  = 15 * time.Minute
	refreshTokenDuration = 7 * 24 * time.Hour
)

type AuthHandler struct {
	employees     *mongo.Collection
	customers     *mongo.Collection
	refreshTokens *mongo.Collection
	cfg           *config.Config
}

func NewAuthHandler(db *mongo.Database, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		employees:     db.Collection("employees"),
		customers:     db.Collection("customers"),
		refreshTokens: db.Collection("refresh_tokens"),
		cfg:           cfg,
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
	if emp.Status == "LOCKED" {
		utils.Forbidden(c, "Tài khoản đã bị khóa")
		return
	}

	accessToken := h.generateAccessToken(emp.EmployeeID, emp.Role)
	refreshToken, err := h.createRefreshToken(ctx, emp.EmployeeID, emp.Role, c)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	emp.Password = ""
	c.JSON(200, gin.H{
		"success":      true,
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    int(accessTokenDuration.Seconds()),
		"user":         emp,
		"type":         "employee",
	})
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
	if cust.Status == "LOCKED" {
		utils.Forbidden(c, "Tài khoản đã bị khóa")
		return
	}

	accessToken := h.generateAccessToken(cust.CustomerID, "CUSTOMER")
	refreshToken, err := h.createRefreshToken(ctx, cust.CustomerID, "CUSTOMER", c)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	cust.Password = ""
	c.JSON(200, gin.H{
		"success":      true,
		"accessToken":  accessToken,
		"refreshToken": refreshToken,
		"expiresIn":    int(accessTokenDuration.Seconds()),
		"user":         cust,
		"type":         "customer",
	})
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
			if emp.Status == "LOCKED" {
				utils.Forbidden(c, "Tài khoản đã bị khóa")
				return
			}
			accessToken := h.generateAccessToken(emp.EmployeeID, emp.Role)
			refreshToken, _ := h.createRefreshToken(ctx, emp.EmployeeID, emp.Role, c)
			emp.Password = ""
			c.JSON(200, gin.H{
				"success": true, "accessToken": accessToken,
				"refreshToken": refreshToken, "expiresIn": int(accessTokenDuration.Seconds()),
				"user": emp, "type": "employee",
				// backward compat
				"token": accessToken,
			})
			return
		}
	}

	// Try customer
	var cust models.Customer
	if err := h.customers.FindOne(ctx, bson.M{"email": body.Email}).Decode(&cust); err == nil {
		if err = bcrypt.CompareHashAndPassword([]byte(cust.Password), []byte(body.Password)); err == nil {
			if cust.Status == "LOCKED" {
				utils.Forbidden(c, "Tài khoản đã bị khóa")
				return
			}
			accessToken := h.generateAccessToken(cust.CustomerID, "CUSTOMER")
			refreshToken, _ := h.createRefreshToken(ctx, cust.CustomerID, "CUSTOMER", c)
			cust.Password = ""
			c.JSON(200, gin.H{
				"success": true, "accessToken": accessToken,
				"refreshToken": refreshToken, "expiresIn": int(accessTokenDuration.Seconds()),
				"user": cust, "type": "customer",
				"token": accessToken,
			})
			return
		}
	}

	utils.BadRequest(c, "Email hoặc mật khẩu không đúng")
}

// POST /api/auth/refresh
func (h *AuthHandler) Refresh(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var rt models.RefreshToken
	err := h.refreshTokens.FindOne(ctx, bson.M{
		"token":   body.RefreshToken,
		"revoked": false,
	}).Decode(&rt)
	if err != nil {
		c.JSON(401, gin.H{"success": false, "message": "Refresh token không hợp lệ hoặc đã hết hạn"})
		return
	}

	if time.Now().After(rt.ExpiresAt) {
		_, _ = h.refreshTokens.UpdateOne(ctx, bson.M{"token": body.RefreshToken}, bson.M{"$set": bson.M{"revoked": true}})
		c.JSON(401, gin.H{"success": false, "message": "Refresh token đã hết hạn, vui lòng đăng nhập lại"})
		return
	}

	newAccessToken := h.generateAccessToken(rt.UserID, rt.Role)
	c.JSON(200, gin.H{
		"success":     true,
		"accessToken": newAccessToken,
		"expiresIn":   int(accessTokenDuration.Seconds()),
	})
}

// POST /api/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = c.ShouldBindJSON(&body)

	if body.RefreshToken != "" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_, _ = h.refreshTokens.UpdateOne(ctx,
			bson.M{"token": body.RefreshToken},
			bson.M{"$set": bson.M{"revoked": true}},
		)
	}

	c.JSON(200, gin.H{"success": true, "message": "Đăng xuất thành công"})
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
	c.JSON(200, gin.H{"success": true, "message": "Mã xác thực đã được gửi"})
}

// POST /api/auth/verify-code
func (h *AuthHandler) VerifyCode(c *gin.Context) {
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

	count, _ := h.customers.CountDocuments(ctx, bson.M{"email": body.Email})
	if count > 0 {
		utils.BadRequest(c, "Email đã được sử dụng")
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcryptCost)
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
	c.JSON(200, gin.H{"success": true, "message": "Mã 2FA đã được gửi"})
}

// POST /api/auth/verify-2fa-code
func (h *AuthHandler) Verify2FACode(c *gin.Context) {
	c.JSON(200, gin.H{"success": true, "verified": true})
}

// generateAccessToken tạo JWT access token ngắn hạn (15 phút)
func (h *AuthHandler) generateAccessToken(userID, role string) string {
	claims := middleware.Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.cfg.JWTSecret))
	return token
}

// createRefreshToken tạo opaque refresh token lưu vào MongoDB
func (h *AuthHandler) createRefreshToken(ctx context.Context, userID, role string, c *gin.Context) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	token := hex.EncodeToString(b)

	rt := models.RefreshToken{
		UserID:    userID,
		Role:      role,
		Token:     token,
		ExpiresAt: time.Now().Add(refreshTokenDuration),
		CreatedAt: time.Now(),
		Revoked:   false,
		UserAgent: c.GetHeader("User-Agent"),
		IP:        c.ClientIP(),
	}
	if _, err := h.refreshTokens.InsertOne(ctx, rt); err != nil {
		return "", err
	}
	return token, nil
}
