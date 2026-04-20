package handlers

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/sync/errgroup"

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
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	var (
		products        []models.Product
		orders          []models.Order
		categories      []models.Category
		customers       []models.Customer
		employees       []models.Employee
		vouchers        []models.Voucher
		inventoryLogs   []models.InventoryLog
		transactions    []models.Transaction
		financeAccounts []models.FinanceAccount
		reviews         []models.Review
		refunds         []models.Refund
		productHistory  []models.ProductHistory
		suppliers       []models.Supplier
		purchaseOrders  []models.PurchaseOrder
		warehouses      []models.Warehouse
		stockTakes      []models.StockTake
		invoices        []models.Invoice
		settings        models.StoreSettings
	)

	// Initialize empty arrays so they don't return as null in JSON if empty
	products = []models.Product{}
	orders = []models.Order{}
	categories = []models.Category{}
	customers = []models.Customer{}
	employees = []models.Employee{}
	vouchers = []models.Voucher{}
	inventoryLogs = []models.InventoryLog{}
	transactions = []models.Transaction{}
	financeAccounts = []models.FinanceAccount{}
	reviews = []models.Review{}
	refunds = []models.Refund{}
	productHistory = []models.ProductHistory{}
	suppliers = []models.Supplier{}
	purchaseOrders = []models.PurchaseOrder{}
	warehouses = []models.Warehouse{}
	stockTakes = []models.StockTake{}
	invoices = []models.Invoice{}

	// Use errgroup for concurrent fetching
	g, gCtx := errgroup.WithContext(ctx)

	fetch := func(col string, dest any) func() error {
		return func() error {
			cursor, err := h.db.Collection(col).Find(gCtx, bson.M{})
			if err != nil {
				return err
			}
			defer cursor.Close(gCtx)
			return cursor.All(gCtx, dest)
		}
	}

	g.Go(fetch("products", &products))
	g.Go(fetch("orders", &orders))
	g.Go(fetch("categories", &categories))
	g.Go(fetch("customers", &customers))
	g.Go(fetch("employees", &employees))
	g.Go(fetch("vouchers", &vouchers))
	g.Go(fetch("inventoryLogs", &inventoryLogs))
	g.Go(fetch("transactions", &transactions))
	g.Go(fetch("financeAccounts", &financeAccounts))
	g.Go(fetch("reviews", &reviews))
	g.Go(fetch("refunds", &refunds))
	g.Go(fetch("productHistory", &productHistory))
	g.Go(fetch("suppliers", &suppliers))
	g.Go(fetch("purchase_orders", &purchaseOrders))
	g.Go(fetch("warehouses", &warehouses))
	g.Go(fetch("stock_takes", &stockTakes))
	g.Go(fetch("invoices", &invoices))
	
	g.Go(func() error {
		err := h.db.Collection("settings").FindOne(gCtx, bson.M{}).Decode(&settings)
		if err == mongo.ErrNoDocuments {
			return nil // ignore if not found
		}
		return err
	})

	// Wait for all concurrent queries to finish
	if err := g.Wait(); err != nil {
		utils.InternalError(c, err)
		return
	}

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
		"invoices":        invoices,
		"settings":        settings,
	})
}
