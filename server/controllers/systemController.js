import { Product, Order, Category, Customer, Employee, InventoryLog, FinanceAccount, PaymentAccount, Transaction, Voucher, ActivityLog, SystemSetting } from '../models.js';

const DEFAULT_SETTINGS = {
  shopInfo: { name: 'UniShop', phone: '0901234567', address: '123 Le Loi, D1, HCMC', email: 'contact@unishop.com' },
  paymentMethods: { cod: true, banking: true, momo: false },
  shipping: { standardFee: 30000, freeShipThreshold: 500000 },
  inventory: { lowStockThreshold: 10, showOutOfStock: true },
  orders: { autoConfirm: false, invoicePrefix: 'INV-' },
  tax: { defaultRate: 10 },
  security: { enable2FA: false, passwordExpiry: 90 },
  notifications: { emailOnOrder: true, pushLowStock: false },
  staff: { allowDelete: false, maxDiscount: 20 }
};

export const getSystemState = async (req, res) => {
  try {
    const [
      products, orders, categories, customers, employees,
      inventoryLogs, financeAccounts, paymentAccounts,
      transactions, vouchers, activityLogs, globalSettings
    ] = await Promise.all([
      Product.find(), Order.find(), Category.find(), Customer.find(), Employee.find(),
      InventoryLog.find(), FinanceAccount.find(), PaymentAccount.find(),
      Transaction.find(), Voucher.find(), ActivityLog.find(), 
      SystemSetting.findOne({ key: 'globalSettings' })
    ]);

    res.json({
      products, orders, categories, customers, employees,
      inventoryLogs, financeAccounts, paymentAccounts,
      transactions, vouchers, activityLogs,
      settings: globalSettings ? globalSettings.value : DEFAULT_SETTINGS
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
};

export const updateSettings = async (req, res) => {
    const updates = req.body;
    let settingDoc = await SystemSetting.findOne({ key: 'globalSettings' });
    if (!settingDoc) {
        settingDoc = new SystemSetting({ key: 'globalSettings', value: DEFAULT_SETTINGS });
    }
    const currentSettings = settingDoc.value || DEFAULT_SETTINGS;
    const newSettings = { ...currentSettings, ...updates };
    
    settingDoc.value = newSettings;
    settingDoc.markModified('value');
    await settingDoc.save();
    
    res.json({ success: true, settings: newSettings });
};
