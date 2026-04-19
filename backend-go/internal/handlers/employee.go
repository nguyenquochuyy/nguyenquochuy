package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"

	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type EmployeeHandler struct {
	col *mongo.Collection
}

func NewEmployeeHandler(db *mongo.Database) *EmployeeHandler {
	return &EmployeeHandler{col: db.Collection("employees")}
}

// GET /api/employees
func (h *EmployeeHandler) List(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.col.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var employees []models.Employee
	if err = cursor.All(ctx, &employees); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, employees)
}

// POST /api/employees
func (h *EmployeeHandler) Create(c *gin.Context) {
	var emp models.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if emp.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(emp.Password), bcrypt.DefaultCost)
		if err != nil {
			utils.InternalError(c, err)
			return
		}
		emp.Password = string(hashed)
	}
	emp.JoinedAt = time.Now()
	if emp.Status == "" {
		emp.Status = "ACTIVE"
	}

	res, err := h.col.InsertOne(ctx, emp)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	emp.ID = res.InsertedID.(primitive.ObjectID)
	events.Global.Broadcast("employees")
	utils.Created(c, emp)
}

// PUT /api/employees/:id
func (h *EmployeeHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}
	delete(updates, "password")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := h.col.UpdateOne(ctx, bson.M{"id": id}, bson.M{"$set": updates})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	events.Global.Broadcast("employees")
	utils.OK(c, gin.H{"message": "Cập nhật nhân viên thành công"})
}
