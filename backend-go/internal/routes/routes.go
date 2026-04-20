package routes

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"

	"unishop/backend/internal/config"
	"unishop/backend/internal/handlers"
)

func Setup(r *gin.Engine, db *mongo.Database, cfg *config.Config) {
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

	api := r.Group("/api")

	// Health
	api.GET("/healthz", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })

	// Real-time SSE stream
	api.GET("/events", handlers.StreamEvents)

	// State (full sync endpoint used by frontend)
	api.GET("/state", stateH.Get)

	// Auth (public)
	auth := api.Group("/auth")
	{
		auth.POST("/admin/login", authH.AdminLogin)
		auth.POST("/store/login", authH.StoreLogin)
		auth.POST("/login", authH.Login)
		auth.POST("/check-email", authH.CheckEmail)
		auth.POST("/send-code", authH.SendCode)
		auth.POST("/verify-code", authH.VerifyCode)
		auth.POST("/create-customer", authH.CreateCustomer)
		auth.POST("/send-2fa-code", authH.Send2FACode)
		auth.POST("/verify-2fa-code", authH.Verify2FACode)
	}

	// Public product & category reads
	api.GET("/products", productH.List)
	api.GET("/products/barcode/:code", productH.GetByBarcode)
	api.GET("/products/:id", productH.GetByID)
	api.GET("/categories", categoryH.List)
	api.GET("/categories/:id", categoryH.GetByID)
	api.GET("/categories/:id/products", categoryH.GetProducts)

	// Protected routes — require valid JWT (DISABLED FOR DEVELOPMENT)
	protected := api.Group("")
	// protected.Use(middleware.Auth(cfg.JWTSecret)) // TODO: Enable for production
	{
		// Products (admin write)
		protected.POST("/products", productH.Create)
		protected.PUT("/products/:id", productH.Update)
		protected.DELETE("/products/:id", productH.Delete)
		protected.PUT("/products/:id/toggle-visibility", productH.ToggleVisibility)
		protected.POST("/products/:id/clone", productH.Clone)
		protected.POST("/products/bulk-delete", productH.BulkDelete)
		protected.PUT("/products/bulk-visibility", productH.BulkVisibility)
		protected.PUT("/products/bulk-category", productH.BulkCategory)
		protected.GET("/products/:id/history", productH.GetHistory)
		protected.GET("/products/history", productH.GetAllHistory)

		// Categories
		protected.POST("/categories", categoryH.Create)
		protected.PUT("/categories/:id", categoryH.Update)
		protected.DELETE("/categories/:id", categoryH.Delete)
		protected.PUT("/categories/:id/toggle-active", categoryH.ToggleActive)
		protected.POST("/categories/bulk-delete", categoryH.BulkDelete)
		protected.POST("/categories/bulk-reorder", categoryH.BulkReorder)

		// Orders
		protected.GET("/orders", orderH.List)
		protected.GET("/orders/:id", orderH.GetByID)
		protected.POST("/orders", orderH.Place)
		protected.PUT("/orders/:id/status", orderH.UpdateStatus)
		protected.PUT("/orders/:id/payment-status", orderH.UpdatePaymentStatus)
		protected.PUT("/orders/:id/tracking", orderH.UpdateTracking)
		protected.PUT("/orders/:id/notes", orderH.UpdateNotes)
		protected.DELETE("/orders/:id", orderH.Delete)
		protected.POST("/orders/bulk-delete", orderH.BulkDelete)
		protected.PUT("/orders/bulk-status", orderH.BulkStatus)
		protected.GET("/orders/:id/labels/shipping", orderH.GetShippingLabel)
		protected.GET("/orders/:id/labels/packing", orderH.GetPackingLabel)
		protected.GET("/orders/:id/labels/invoice", orderH.GetInvoice)

		// Customers
		protected.GET("/customers", customerH.List)
		protected.POST("/customers", customerH.Create)
		protected.PUT("/customers/:id", customerH.Update)
		protected.PUT("/customers/:id/wishlist", customerH.ToggleWishlist)
		protected.POST("/customers/bulk-lock", customerH.BulkLock)
		protected.POST("/customers/bulk-unlock", customerH.BulkUnlock)
		protected.POST("/customers/bulk-tag", customerH.BulkTag)
		protected.POST("/customers/bulk-email", customerH.BulkEmail)
		protected.POST("/customers/:id/notes", customerH.AddNote)
		protected.GET("/customers/:id/notes", customerH.GetNotes)

		// Employees
		protected.GET("/employees", employeeH.List)
		protected.POST("/employees", employeeH.Create)
		protected.PUT("/employees/:id", employeeH.Update)

		// Inventory
		protected.POST("/inventory/adjust", inventoryH.Adjust)
		protected.POST("/inventory/transfer", inventoryH.Transfer)
		protected.POST("/inventory/stock-take", inventoryH.RecordStockTake)
		protected.GET("/inventory/discrepancies", inventoryH.Discrepancies)
		protected.GET("/inventory/logs", inventoryH.Logs)
		protected.GET("/inventory/forecast", forecastH.GetForecast)
		protected.POST("/inventory/daily-sales", forecastH.RecordDailySales)

		// Finance
		protected.GET("/transactions", financeH.ListTransactions)
		protected.POST("/transactions", financeH.AddTransaction)
		protected.GET("/finance/reports/advanced", financeH.AdvancedReports)

		// Vouchers
		protected.GET("/vouchers", voucherH.List)
		protected.POST("/vouchers", voucherH.Create)
		protected.PUT("/vouchers/:id", voucherH.Update)
		protected.DELETE("/vouchers/:id", voucherH.Delete)

		// Settings
		protected.GET("/settings", settingsH.Get)
		protected.POST("/settings", settingsH.Update)

		// Refunds
		protected.GET("/refunds", refundH.List)
		protected.POST("/refunds", refundH.Create)
		protected.PUT("/refunds/:id/status", refundH.UpdateStatus)
		protected.DELETE("/refunds/:id", refundH.Delete)

		// Reviews
		protected.GET("/reviews", reviewH.List)
		protected.POST("/reviews", reviewH.Create)
		protected.PUT("/reviews/:id/reply", reviewH.Reply)
		protected.PUT("/reviews/:id/toggle-hidden", reviewH.ToggleHidden)

		// Invoices
		protected.GET("/invoices", invoiceH.GetAll)
		protected.POST("/invoices", invoiceH.Create)
		protected.PUT("/invoices/:id/status", invoiceH.UpdateStatus)

		// Email Campaigns
		protected.GET("/email-campaigns", emailCampaignH.List)
		protected.POST("/email-campaigns/create", emailCampaignH.Create)
		protected.POST("/email-campaigns/:id/send", emailCampaignH.Send)
		protected.DELETE("/email-campaigns/:id", emailCampaignH.Delete)

		// Suppliers
		protected.GET("/suppliers", supplierH.List)
		protected.POST("/suppliers", supplierH.Create)
		protected.PUT("/suppliers/:id", supplierH.Update)
		protected.DELETE("/suppliers/:id", supplierH.Delete)

		// Purchase Orders
		protected.GET("/purchase-orders", purchaseOrderH.List)
		protected.POST("/purchase-orders", purchaseOrderH.Create)
		protected.PUT("/purchase-orders/:id/status", purchaseOrderH.UpdateStatus)

		// Warehouses
		protected.GET("/warehouses", warehouseH.List)
		protected.POST("/warehouses", warehouseH.Create)
		protected.PUT("/warehouses/:id", warehouseH.Update)
		protected.DELETE("/warehouses/:id", warehouseH.Delete)
	}
}
