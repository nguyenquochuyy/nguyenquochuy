package routes

import (
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"

	"unishop/backend/internal/config"
	"unishop/backend/internal/handlers"
	"unishop/backend/internal/middleware"
	"unishop/backend/pkg/cache"
)

func Setup(r *gin.Engine, db *mongo.Database, cfg *config.Config, c cache.Cache) {
	// Init handlers
	authH := handlers.NewAuthHandler(db, cfg)
	stateH := handlers.NewStateHandler(db)
	productH := handlers.NewProductHandler(db)
	orderH := handlers.NewOrderHandler(db)
	categoryH := handlers.NewCategoryHandler(db)
	customerH := handlers.NewCustomerHandler(db)
	employeeH := handlers.NewEmployeeHandler(db)
	inventoryH := handlers.NewInventoryHandler(db)
	financeH := handlers.NewFinanceHandler(db)
	voucherH := handlers.NewVoucherHandler(db)
	settingsH := handlers.NewSettingsHandler(db)
	refundH := handlers.NewRefundHandler(db)
	reviewH := handlers.NewReviewHandler(db)
	emailCampaignH := handlers.NewEmailCampaignHandler(db)
	forecastH := handlers.NewForecastHandler(db)
	supplierH := handlers.NewSupplierHandler(db)
	purchaseOrderH := handlers.NewPurchaseOrderHandler(db)
	warehouseH := handlers.NewWarehouseHandler(db)
	invoiceH := handlers.NewInvoiceHandler(db)

	// API v1
	api := r.Group("/api/v1")

	// Health & Readiness
	startTime := time.Now()
	api.GET("/healthz", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"ok":      true,
			"uptime":  time.Since(startTime).String(),
			"version": "1.0.0",
		})
	})
	api.GET("/ready", func(c *gin.Context) {
		c.JSON(200, gin.H{"ready": true})
	})

	// Real-time SSE stream
	api.GET("/events", handlers.StreamEvents)

	// State (full sync endpoint used by frontend)
	api.GET("/state", stateH.Get)

	// Auth (public)
	auth := api.Group("/auth")
	{
		auth.POST("/admin/login", middleware.LoginRateLimit(), authH.AdminLogin)
		auth.POST("/store/login", middleware.LoginRateLimit(), authH.StoreLogin)
		auth.POST("/login", middleware.LoginRateLimit(), authH.Login)
		auth.POST("/refresh", authH.Refresh)
		auth.POST("/logout", authH.Logout)
		auth.POST("/check-email", authH.CheckEmail)
		auth.POST("/send-code", authH.SendCode)
		auth.POST("/verify-code", authH.VerifyCode)
		auth.POST("/create-customer", authH.CreateCustomer)
		auth.POST("/send-2fa-code", authH.Send2FACode)
		auth.POST("/verify-2fa-code", authH.Verify2FACode)
	}

	// Public product & category reads (cached 2 phút)
	cached2m := middleware.CacheResponse(c, 2*time.Minute)
	api.GET("/products", cached2m, productH.List)
	api.GET("/products/barcode/:code", productH.GetByBarcode)
	api.GET("/products/:id", cached2m, productH.GetByID)
	api.GET("/categories", cached2m, categoryH.List)
	api.GET("/categories/:id", cached2m, categoryH.GetByID)
	api.GET("/categories/:id/products", cached2m, categoryH.GetProducts)

	// --- PROTECTED ROUTES ---

	// Base JWT Auth Middleware
	protected := api.Group("")
	protected.Use(
		middleware.Auth(cfg.JWTSecret),
		middleware.UserRateLimit(),
		middleware.AuditSensitiveOperations(),
	)

	// 1. Admin Routes (Employees Only)
	admin := protected.Group("")
	admin.Use(middleware.RequireEmployee())
	{
		// Products
		admin.POST("/products", productH.Create)
		admin.PUT("/products/:id", productH.Update)
		admin.DELETE("/products/:id", productH.Delete)
		admin.PUT("/products/:id/toggle-visibility", productH.ToggleVisibility)
		admin.POST("/products/:id/clone", productH.Clone)
		admin.POST("/products/bulk-delete", productH.BulkDelete)
		admin.PUT("/products/bulk-visibility", productH.BulkVisibility)
		admin.PUT("/products/bulk-category", productH.BulkCategory)
		admin.GET("/products/:id/history", productH.GetHistory)
		admin.GET("/products/history", productH.GetAllHistory)

		// Categories
		admin.POST("/categories", categoryH.Create)
		admin.PUT("/categories/:id", categoryH.Update)
		admin.DELETE("/categories/:id", categoryH.Delete)
		admin.PUT("/categories/:id/toggle-active", categoryH.ToggleActive)
		admin.POST("/categories/bulk-delete", categoryH.BulkDelete)
		admin.POST("/categories/bulk-reorder", categoryH.BulkReorder)

		// Orders Management
		admin.GET("/orders", orderH.List)
		admin.GET("/orders/:id", orderH.GetByID)
		admin.PUT("/orders/:id/status", orderH.UpdateStatus)
		admin.PUT("/orders/:id/payment-status", orderH.UpdatePaymentStatus)
		admin.PUT("/orders/:id/tracking", orderH.UpdateTracking)
		admin.PUT("/orders/:id/notes", orderH.UpdateNotes)
		admin.DELETE("/orders/:id", orderH.Delete)
		admin.POST("/orders/bulk-delete", orderH.BulkDelete)
		admin.PUT("/orders/bulk-status", orderH.BulkStatus)
		admin.GET("/orders/:id/labels/shipping", orderH.GetShippingLabel)
		admin.GET("/orders/:id/labels/packing", orderH.GetPackingLabel)
		admin.GET("/orders/:id/labels/invoice", orderH.GetInvoice)

		// Customers Management
		admin.GET("/customers", customerH.List)
		admin.POST("/customers", customerH.Create)
		admin.PUT("/customers/:id", customerH.Update)
		admin.POST("/customers/bulk-lock", customerH.BulkLock)
		admin.POST("/customers/bulk-unlock", customerH.BulkUnlock)
		admin.POST("/customers/bulk-tag", customerH.BulkTag)
		admin.POST("/customers/bulk-email", customerH.BulkEmail)
		admin.POST("/customers/:id/notes", customerH.AddNote)
		admin.GET("/customers/:id/notes", customerH.GetNotes)

		// Employees — chỉ OWNER
		ownerOnly := admin.Group("").Use(middleware.RequireOwner())
		ownerOnly.GET("/employees", employeeH.List)
		ownerOnly.POST("/employees", employeeH.Create)
		ownerOnly.PUT("/employees/:id", employeeH.Update)

		// Inventory
		admin.POST("/inventory/adjust", inventoryH.Adjust)
		admin.POST("/inventory/transfer", inventoryH.Transfer)
		admin.POST("/inventory/stock-take", inventoryH.RecordStockTake)
		admin.GET("/inventory/discrepancies", inventoryH.Discrepancies)
		admin.GET("/inventory/logs", inventoryH.Logs)
		admin.GET("/inventory/forecast", forecastH.GetForecast)
		admin.POST("/inventory/daily-sales", forecastH.RecordDailySales)

		// Finance — chỉ OWNER và ACCOUNTANT
		finance := admin.Group("").Use(middleware.RequireFinance())
		finance.GET("/transactions", financeH.ListTransactions)
		finance.POST("/transactions", financeH.AddTransaction)
		finance.PUT("/transactions/:id", financeH.UpdateTransaction)
		finance.DELETE("/transactions/:id", financeH.DeleteTransaction)
		finance.GET("/finance/accounts", financeH.ListAccounts)
		finance.POST("/finance/accounts", financeH.CreateAccount)
		finance.PUT("/finance/accounts/:id", financeH.UpdateAccount)
		finance.DELETE("/finance/accounts/:id", financeH.DeleteAccount)
		finance.GET("/finance/reports/advanced", financeH.AdvancedReports)

		// Vouchers
		admin.GET("/vouchers", voucherH.List)
		admin.POST("/vouchers", voucherH.Create)
		admin.PUT("/vouchers/:id", voucherH.Update)
		admin.DELETE("/vouchers/:id", voucherH.Delete)

		// Settings
		admin.GET("/settings", settingsH.Get)
		admin.POST("/settings", settingsH.Update)

		// Refunds
		admin.GET("/refunds", refundH.List)
		admin.PUT("/refunds/:id/status", refundH.UpdateStatus)
		admin.DELETE("/refunds/:id", refundH.Delete)

		// Reviews (Management)
		admin.PUT("/reviews/:id/reply", reviewH.Reply)
		admin.PUT("/reviews/:id/toggle-hidden", reviewH.ToggleHidden)

		// Invoices
		admin.GET("/invoices", invoiceH.GetAll)
		admin.POST("/invoices", invoiceH.Create)
		admin.PUT("/invoices/:id/status", invoiceH.UpdateStatus)

		// Email Campaigns
		admin.GET("/email-campaigns", emailCampaignH.List)
		admin.POST("/email-campaigns/create", emailCampaignH.Create)
		admin.POST("/email-campaigns/:id/send", emailCampaignH.Send)
		admin.DELETE("/email-campaigns/:id", emailCampaignH.Delete)

		// Suppliers
		admin.GET("/suppliers", supplierH.List)
		admin.POST("/suppliers", supplierH.Create)
		admin.PUT("/suppliers/:id", supplierH.Update)
		admin.DELETE("/suppliers/:id", supplierH.Delete)

		// Purchase Orders
		admin.GET("/purchase-orders", purchaseOrderH.List)
		admin.POST("/purchase-orders", purchaseOrderH.Create)
		admin.PUT("/purchase-orders/:id/status", purchaseOrderH.UpdateStatus)

		// Warehouses
		admin.GET("/warehouses", warehouseH.List)
		admin.POST("/warehouses", warehouseH.Create)
		admin.PUT("/warehouses/:id", warehouseH.Update)
		admin.DELETE("/warehouses/:id", warehouseH.Delete)
	}

	// 2. Customer Routes (Customers Only)
	store := protected.Group("")
	store.Use(middleware.RequireCustomer())
	{
		store.POST("/orders", orderH.Place)
		store.PUT("/customers/:id/wishlist", customerH.ToggleWishlist)
		store.POST("/refunds", refundH.Create)
		store.POST("/reviews", reviewH.Create)
		store.GET("/reviews", reviewH.List) // Review list could be public, but maybe we want it here
	}

}
