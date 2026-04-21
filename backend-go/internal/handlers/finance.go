package handlers

import (
	"context"
	"fmt"
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

	if tx.TxID == "" {
		tx.TxID = fmt.Sprintf("tx-%d", time.Now().UnixNano())
	}

	if tx.Status == "" {
		tx.Status = "COMPLETED"
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

// GET /api/finance/reports/advanced
func (h *FinanceHandler) AdvancedReports(c *gin.Context) {
	startDateStr := c.Query("startDate")
	endDateStr := c.Query("endDate")
	compareStartDateStr := c.Query("compareStartDate")
	compareEndDateStr := c.Query("compareEndDate")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Helper function to build date filter
	buildDateFilter := func(start, end string) bson.M {
		filter := bson.M{}
		if start != "" {
			t, err := time.Parse(time.RFC3339, start)
			if err == nil {
				filter["$gte"] = t
			}
		}
		if end != "" {
			t, err := time.Parse(time.RFC3339, end)
			if err == nil {
				filter["$lte"] = t
			}
		}
		return filter
	}

	// Helper function to aggregate
	aggregatePeriod := func(dateFilter bson.M) (float64, float64, map[string]float64, map[string]float64) {
		match := bson.M{}
		if len(dateFilter) > 0 {
			match["date"] = dateFilter
		}

		cursor, err := h.transactions.Find(ctx, match)
		if err != nil {
			return 0, 0, nil, nil
		}
		defer cursor.Close(ctx)

		var txs []models.Transaction
		cursor.All(ctx, &txs)

		var income, expense float64
		incomeByCategory := make(map[string]float64)
		expenseByCategory := make(map[string]float64)

		for _, tx := range txs {
			if tx.Type == "INCOME" {
				income += tx.Amount
				incomeByCategory[tx.Category] += tx.Amount
			} else {
				expense += tx.Amount
				expenseByCategory[tx.Category] += tx.Amount
			}
		}

		return income, expense, incomeByCategory, expenseByCategory
	}

	currentIncome, currentExpense, currentIncomeCat, currentExpenseCat := aggregatePeriod(buildDateFilter(startDateStr, endDateStr))
	var compareIncome, compareExpense float64
	var compareIncomeCat, compareExpenseCat map[string]float64

	if compareStartDateStr != "" && compareEndDateStr != "" {
		compareIncome, compareExpense, compareIncomeCat, compareExpenseCat = aggregatePeriod(buildDateFilter(compareStartDateStr, compareEndDateStr))
	}

	utils.OK(c, gin.H{
		"current": gin.H{
			"income":            currentIncome,
			"expense":           currentExpense,
			"profit":            currentIncome - currentExpense,
			"incomeByCategory":  currentIncomeCat,
			"expenseByCategory": currentExpenseCat,
		},
		"comparison": gin.H{
			"income":            compareIncome,
			"expense":           compareExpense,
			"profit":            compareIncome - compareExpense,
			"incomeByCategory":  compareIncomeCat,
			"expenseByCategory": compareExpenseCat,
		},
	})
}

// GET /api/finance/accounts
func (h *FinanceHandler) ListAccounts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := h.financeAccounts.Find(ctx, bson.M{})
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	defer cursor.Close(ctx)

	var accounts []models.FinanceAccount
	if err = cursor.All(ctx, &accounts); err != nil {
		utils.InternalError(c, err)
		return
	}
	utils.OK(c, accounts)
}

// POST /api/finance/accounts
func (h *FinanceHandler) CreateAccount(c *gin.Context) {
	var account models.FinanceAccount
	if err := c.ShouldBindJSON(&account); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if account.AccountID == "" {
		account.AccountID = fmt.Sprintf("acc-%d", time.Now().UnixNano())
	}

	res, err := h.financeAccounts.InsertOne(ctx, account)
	if err != nil {
		utils.InternalError(c, err)
		return
	}
	account.ID = res.InsertedID.(primitive.ObjectID)
	events.Global.Broadcast("financeAccounts")
	utils.Created(c, account)
}

// PUT /api/finance/accounts/:id
func (h *FinanceHandler) UpdateAccount(c *gin.Context) {
	id := c.Param("id")

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to convert to ObjectID, if fails use id field
	objectID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"_id": objectID}
	} else {
		filter = bson.M{"id": id}
	}

	_, err = h.financeAccounts.UpdateOne(ctx, filter, bson.M{"$set": updates})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("financeAccounts")
	utils.OK(c, gin.H{"message": "Cập nhật tài khoản thành công"})
}

// DELETE /api/finance/accounts/:id
func (h *FinanceHandler) DeleteAccount(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to convert to ObjectID, if fails use id field
	objectID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"_id": objectID}
	} else {
		filter = bson.M{"id": id}
	}

	_, err = h.financeAccounts.DeleteOne(ctx, filter)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("financeAccounts")
	utils.OK(c, gin.H{"message": "Đã xóa tài khoản"})
}

// PUT /api/transactions/:id
func (h *FinanceHandler) UpdateTransaction(c *gin.Context) {
	id := c.Param("id")

	var updates map[string]any
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to convert to ObjectID, if fails use id field
	objectID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"_id": objectID}
	} else {
		filter = bson.M{"id": id}
	}

	_, err = h.transactions.UpdateOne(ctx, filter, bson.M{"$set": updates})
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("transactions")
	utils.OK(c, gin.H{"message": "Cập nhật giao dịch thành công"})
}

// DELETE /api/transactions/:id
func (h *FinanceHandler) DeleteTransaction(c *gin.Context) {
	id := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to convert to ObjectID, if fails use id field
	objectID, err := primitive.ObjectIDFromHex(id)
	var filter bson.M
	if err == nil {
		filter = bson.M{"_id": objectID}
	} else {
		filter = bson.M{"id": id}
	}

	_, err = h.transactions.DeleteOne(ctx, filter)
	if err != nil {
		utils.InternalError(c, err)
		return
	}

	events.Global.Broadcast("transactions")
	utils.OK(c, gin.H{"message": "Đã xóa giao dịch"})
}
