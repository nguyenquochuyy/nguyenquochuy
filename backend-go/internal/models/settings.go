package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type ShopInfo struct {
	Name    string `bson:"name" json:"name"`
	Phone   string `bson:"phone" json:"phone"`
	Address string `bson:"address" json:"address"`
	Email   string `bson:"email" json:"email"`
}

type PaymentMethods struct {
	COD     bool `bson:"cod" json:"cod"`
	Banking bool `bson:"banking" json:"banking"`
	Momo    bool `bson:"momo" json:"momo"`
}

type ShippingSettings struct {
	StandardFee       float64 `bson:"standardFee" json:"standardFee"`
	FreeShipThreshold float64 `bson:"freeShipThreshold" json:"freeShipThreshold"`
}

type InventorySettings struct {
	LowStockThreshold int  `bson:"lowStockThreshold" json:"lowStockThreshold"`
	ShowOutOfStock    bool `bson:"showOutOfStock" json:"showOutOfStock"`
}

type OrderSettings struct {
	AutoConfirm   bool   `bson:"autoConfirm" json:"autoConfirm"`
	InvoicePrefix string `bson:"invoicePrefix" json:"invoicePrefix"`
}

type TaxSettings struct {
	DefaultRate float64 `bson:"defaultRate" json:"defaultRate"`
}

type SecuritySettings struct {
	Enable2FA      bool `bson:"enable2FA" json:"enable2FA"`
	PasswordExpiry int  `bson:"passwordExpiry" json:"passwordExpiry"`
}

type NotificationSettings struct {
	EmailOnOrder bool `bson:"emailOnOrder" json:"emailOnOrder"`
	PushLowStock bool `bson:"pushLowStock" json:"pushLowStock"`
}

type StaffSettings struct {
	AllowDelete bool    `bson:"allowDelete" json:"allowDelete"`
	MaxDiscount float64 `bson:"maxDiscount" json:"maxDiscount"`
}

type StoreSettings struct {
	ID             primitive.ObjectID   `bson:"_id,omitempty" json:"_id,omitempty"`
	ShopInfo       ShopInfo             `bson:"shopInfo" json:"shopInfo"`
	PaymentMethods PaymentMethods       `bson:"paymentMethods" json:"paymentMethods"`
	Shipping       ShippingSettings     `bson:"shipping" json:"shipping"`
	Inventory      InventorySettings    `bson:"inventory" json:"inventory"`
	Orders         OrderSettings        `bson:"orders" json:"orders"`
	Tax            TaxSettings          `bson:"tax" json:"tax"`
	Security       SecuritySettings     `bson:"security" json:"security"`
	Notifications  NotificationSettings `bson:"notifications" json:"notifications"`
	Staff          StaffSettings        `bson:"staff" json:"staff"`
}
