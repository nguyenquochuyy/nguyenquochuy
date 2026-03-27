
import { Product, Order, OrderStatus, BackendState, Category, Customer, InventoryLog, FinanceAccount, Transaction, Voucher, Employee, ActivityLog, PaymentAccount, StoreSettings } from '../types';

// Changed version to force reset for loyalty features
const STORAGE_KEY = 'unishop_db_v17_settings_unified';

// Dọn dẹp mạnh: Xóa rác local storage CŨ ngay lần chạy này
if (!sessionStorage.getItem('db_wiped_v2')) {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem('db_wiped_v2', 'true');
    console.log('🧹 Đã dọn dẹp TOÀN BỘ dữ liệu Mock thành TRỐNG TRƠN theo yêu cầu mới.');
}

const INITIAL_CATEGORIES: Category[] = [];

const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_CUSTOMERS: Customer[] = [];

const INITIAL_ACCOUNTS: FinanceAccount[] = [
  { id: 'acc1', name: 'Tiền mặt (Cash)', type: 'CASH', balance: 0 }
];

const INITIAL_PAYMENT_ACCOUNTS: PaymentAccount[] = [];

const INITIAL_VOUCHERS: Voucher[] = [];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp_admin_custom',
    name: 'Super Admin',
    email: 'admin@gmail.com',
    password: '123456',
    phone: '0900000000',
    role: 'OWNER',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    level2Password: '123456',
    level2PasswordAttempts: 0
  }
];

const INITIAL_LOGS: InventoryLog[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const DEFAULT_SETTINGS: StoreSettings = {
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

export const loadState = (): BackendState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Seed initial data
  const initialState: BackendState = {
    products: INITIAL_PRODUCTS,
    orders: [],
    categories: INITIAL_CATEGORIES,
    customers: INITIAL_CUSTOMERS,
    inventoryLogs: INITIAL_LOGS,
    financeAccounts: INITIAL_ACCOUNTS,
    paymentAccounts: INITIAL_PAYMENT_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    vouchers: INITIAL_VOUCHERS,
    employees: INITIAL_EMPLOYEES,
    activityLogs: [],
    settings: DEFAULT_SETTINGS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
};

export const saveState = (state: BackendState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('⚠️ Cảnh báo: Bộ nhớ trình duyệt (localStorage) đã đầy. Hãy xóa bớt dữ liệu ảnh Base64 hoặc chuyển hoàn toàn sang dùng MongoDB.');
    } else {
      console.error('Lỗi khi lưu dữ liệu:', error);
    }
  }
};
