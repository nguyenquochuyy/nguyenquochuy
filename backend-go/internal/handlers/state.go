package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"unishop/backend/internal/models"
	"unishop/backend/pkg/utils"
)

type StateHandler struct {
	db *mongo.Database
}

func NewStateHandler(db *mongo.Database) *StateHandler {
	return &StateHandler{db: db}
}

// GET /api/state — returns entire backend state for frontend sync
func (h *StateHandler) Get(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	fetch := func(col string, dest any) error {
		cursor, err := h.db.Collection(col).Find(ctx, bson.M{})
		if err != nil {
			return err
		}
		defer cursor.Close(ctx)
		return cursor.All(ctx, dest)
	}

	products := []models.Product{}
	orders := []models.Order{}
	categories := []models.Category{}
	customers := []models.Customer{}
	employees := []models.Employee{}
	vouchers := []models.Voucher{}
	inventoryLogs := []models.InventoryLog{}
	transactions := []models.Transaction{}
	financeAccounts := []models.FinanceAccount{}
	reviews := []models.Review{}
	refunds := []models.Refund{}
	productHistory := []models.ProductHistory{}
	suppliers := []models.Supplier{}
	purchaseOrders := []models.PurchaseOrder{}
	warehouses := []models.Warehouse{}
	stockTakes := []models.StockTake{}
	var settings models.StoreSettings

	_ = fetch("products", &products)
	_ = fetch("orders", &orders)
	_ = fetch("categories", &categories)
	_ = fetch("customers", &customers)
	_ = fetch("employees", &employees)
	_ = fetch("vouchers", &vouchers)
	_ = fetch("inventoryLogs", &inventoryLogs)
	_ = fetch("transactions", &transactions)
	_ = fetch("financeAccounts", &financeAccounts)
	_ = fetch("reviews", &reviews)
	_ = fetch("refunds", &refunds)
	_ = fetch("productHistory", &productHistory)
	_ = fetch("suppliers", &suppliers)
	_ = fetch("purchase_orders", &purchaseOrders)
	_ = fetch("warehouses", &warehouses)
	_ = fetch("stock_takes", &stockTakes)
	_ = h.db.Collection("settings").FindOne(ctx, bson.M{}).Decode(&settings)

	utils.OK(c, gin.H{
		"products":        products,
		"orders":          orders,
		"categories":      categories,
		"customers":       customers,
		"employees":       employees,
		"vouchers":        vouchers,
		"inventoryLogs":   inventoryLogs,
		"transactions":    transactions,
		"financeAccounts": financeAccounts,
		"reviews":         reviews,
		"refunds":         refunds,
		"productHistory":  productHistory,
		"suppliers":       suppliers,
		"purchaseOrders":  purchaseOrders,
		"warehouses":      warehouses,
		"stockTakes":      stockTakes,
		"settings":        settings,
	})
}
