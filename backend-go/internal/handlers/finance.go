package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"unishop/backend/internal/events"
	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type FinanceHandler struct {
	transactions    *mongo.Collection
	financeAccounts *mongo.Collection
}

func NewFinanceHandler(db *mongo.Database) *FinanceHandler {
	return &FinanceHandler{
		transactions:    db.Collection("transactions"),
		financeAccounts: db.Collection("financeAccounts"),
	}
}

// POST /api/transactions
func (h *FinanceHandler) AddTransaction(c *gin.Context) {
	var tx models.Transaction
	if err := c.ShouldBindJSON(&tx); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if tx.Date.IsZero() {
		tx.Date = time.Now()
	}

	res, err := h.transactions.InsertOne(ctx, tx)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	tx.ID = res.InsertedID.(primitive.ObjectID)
	events.Global.Broadcast("transactions")
	utils.Created(c, tx)
}

// GET /api/transactions
func (h *FinanceHandler) ListTransactions(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.transactions.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var txs []models.Transaction
	if err = cursor.All(ctx, &txs); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, txs)
}
