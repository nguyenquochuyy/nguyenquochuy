
import { BackendState, Product, Order, Category, Customer, Employee, Transaction, Voucher, PaymentAccount, StoreSettings } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ── Token management ─────────────────────────────────────────────────────────
const ADMIN_TOKEN_KEY = 'unishop_admin_token';
const STORE_TOKEN_KEY = 'unishop_store_token';

export const tokenManager = {
  getAdmin: () => localStorage.getItem(ADMIN_TOKEN_KEY) ?? '',
  getStore: () => localStorage.getItem(STORE_TOKEN_KEY) ?? '',
  setAdmin: (t: string) => localStorage.setItem(ADMIN_TOKEN_KEY, t),
  setStore: (t: string) => localStorage.setItem(STORE_TOKEN_KEY, t),
  clearAdmin: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
  clearStore: () => localStorage.removeItem(STORE_TOKEN_KEY),
};

const headers = { 'Content-Type': 'application/json' };
export const adminHeaders = () => ({ ...headers, Authorization: `Bearer ${tokenManager.getAdmin()}` });
export const storeHeaders = () => ({ ...headers, Authorization: `Bearer ${tokenManager.getStore()}` });

export const api = {
  // --- STATE SYNC ---
  getState: async (): Promise<BackendState> => {
    try {
      const res = await fetch(`${API_URL}/state`);
      if(!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);
      const json = await res.json();
      return json.data ?? json;
    } catch (error) {
      console.error("🔴 Error details when fetching backend:", error);
      throw error;
    }
  },

  // --- AUTH ---
  adminLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST', headers,
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success && json.token) tokenManager.setAdmin(json.token);
    return json;
  },

  storeLogin: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/store/login`, {
      method: 'POST', headers,
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success && json.token) tokenManager.setStore(json.token);
    return json;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers,
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return false;
    return res.json();
  },

  sendVerificationCode: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/send-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
    });
    return res.json();
  },

  verifyCode: async (email: string, code: string) => {
    const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, code }),
    });
    return res.json();
  },

  checkEmail: async (email: string) => {
    const res = await fetch(`${API_URL}/auth/check-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
    });
    return res.json();
  },

  createCustomer: async (customerData: any) => {
    const res = await fetch(`${API_URL}/auth/create-customer`, {
        method: 'POST',
        headers,
        body: JSON.stringify(customerData),
    });
    return res.json();
  },

  createOrder: async (orderData: any) => {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create order');
    }
    return res.json();
  },

  // 2FA endpoints
  send2FACode: async (email: string, method: 'email' | 'sms') => {
    const res = await fetch(`${API_URL}/auth/send-2fa-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, method }),
    });
    return res.json();
  },

  verify2FACode: async (email: string, code: string) => {
    const res = await fetch(`${API_URL}/auth/verify-2fa-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, code }),
    });
    return res.json();
  },

  // --- PRODUCTS (admin token) ---
  addProduct: async (product: any) => {
    await fetch(`${API_URL}/products`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(product) });
  },
  updateProduct: async (id: string, updates: any) => {
    await fetch(`${API_URL}/products/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(updates) });
  },
  deleteProduct: async (id: string) => {
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: adminHeaders() });
  },
  toggleProductVisibility: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}/toggle-visibility`, { method: 'PUT', headers: adminHeaders() });
    return res.json();
  },
  cloneProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}/clone`, { method: 'POST', headers: adminHeaders() });
    return res.json();
  },
  bulkDeleteProducts: async (ids: string[]) => {
    await fetch(`${API_URL}/products/bulk-delete`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ ids }) });
  },
  bulkVisibilityProducts: async (ids: string[], isVisible: boolean) => {
    await fetch(`${API_URL}/products/bulk-visibility`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ ids, isVisible }) });
  },
  bulkCategoryProducts: async (ids: string[], category: string) => {
    await fetch(`${API_URL}/products/bulk-category`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ ids, category }) });
  },
  getProductHistory: async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}/history`, { headers: adminHeaders() });
    return res.json();
  },
  getAllProductHistory: async () => {
    const res = await fetch(`${API_URL}/products/history`, { headers: adminHeaders() });
    return res.json();
  },

  // --- ORDERS ---
  placeOrder: async (orderData: any) => {
    const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: storeHeaders(), body: JSON.stringify(orderData) });
    return res.json();
  },
  getOrder: async (id: string) => {
    const res = await fetch(`${API_URL}/orders/${id}`, { headers: adminHeaders() });
    return res.json();
  },
  updateOrderStatus: async (id: string, status: string, userId?: string) => {
    await fetch(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ status, userId }) });
  },
  updateOrderPaymentStatus: async (id: string, paymentStatus: string, paymentTransactionId?: string) => {
    const res = await fetch(`${API_URL}/orders/${id}/payment-status`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ paymentStatus, paymentTransactionId }) });
    return res.json();
  },
  updateOrderTracking: async (id: string, shippingTracking: string) => {
    const res = await fetch(`${API_URL}/orders/${id}/tracking`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ shippingTracking }) });
    return res.json();
  },
  updateOrderNotes: async (id: string, internalNotes?: string, customerNotes?: string) => {
    await fetch(`${API_URL}/orders/${id}/notes`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ internalNotes, customerNotes }) });
  },
  deleteOrder: async (id: string) => {
    await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE', headers: adminHeaders() });
  },
  bulkDeleteOrders: async (ids: string[]) => {
    await fetch(`${API_URL}/orders/bulk-delete`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ ids }) });
  },
  bulkUpdateOrderStatus: async (ids: string[], status: string, userId?: string) => {
    await fetch(`${API_URL}/orders/bulk-status`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ ids, status, userId }) });
  },
  getShippingLabel: async (id: string) => {
    const res = await fetch(`${API_URL}/orders/${id}/labels/shipping`, { headers: adminHeaders() });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  },
  getPackingLabel: async (id: string) => {
    const res = await fetch(`${API_URL}/orders/${id}/labels/packing`, { headers: adminHeaders() });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  },
  getInvoice: async (id: string) => {
    const res = await fetch(`${API_URL}/orders/${id}/labels/invoice`, { headers: adminHeaders() });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  },

  // --- CATEGORIES (admin token) ---
  addCategory: async (category: any) => {
    await fetch(`${API_URL}/categories`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(category) });
  },
  updateCategory: async (id: string, updates: any) => {
    await fetch(`${API_URL}/categories/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(updates) });
  },
  deleteCategory: async (id: string) => {
    await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: adminHeaders() });
  },
  toggleCategoryActive: async (id: string) => {
    const res = await fetch(`${API_URL}/categories/${id}/toggle-active`, { method: 'PUT', headers: adminHeaders() });
    return res.json();
  },
  getCategoryProducts: async (id: string) => {
    const res = await fetch(`${API_URL}/categories/${id}/products`, { headers: adminHeaders() });
    return res.json();
  },
  bulkDeleteCategories: async (ids: string[]) => {
    await fetch(`${API_URL}/categories/bulk-delete`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ ids }) });
  },
  bulkReorderCategories: async (updates: { id: string; order: number }[]) => {
    await fetch(`${API_URL}/categories/bulk-reorder`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ updates }) });
  },

  // --- CUSTOMERS ---
  addCustomer: async (customer: any) => {
    await fetch(`${API_URL}/customers`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(customer) });
  },
  updateCustomer: async (id: string, updates: any) => {
    await fetch(`${API_URL}/customers/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(updates) });
  },
  toggleWishlist: async (customerId: string, productId: string) => {
    const res = await fetch(`${API_URL}/customers/${customerId}/wishlist`, { method: 'PUT', headers: storeHeaders(), body: JSON.stringify({ productId }) });
    return res.json();
  },
  bulkLockCustomers: async (ids: string[]) => {
    await fetch(`${API_URL}/customers/bulk-lock`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ ids }) });
  },
  bulkUnlockCustomers: async (ids: string[]) => {
    await fetch(`${API_URL}/customers/bulk-unlock`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ ids }) });
  },
  bulkTagCustomers: async (ids: string[], tags: string[]) => {
    await fetch(`${API_URL}/customers/bulk-tag`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ ids, tags }) });
  },
  bulkEmailCustomers: async (ids: string[], subject: string, message: string) => {
    await fetch(`${API_URL}/customers/bulk-email`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ ids, subject, message }) });
  },

  // --- INVENTORY & FINANCE (admin token) ---
  adjustStock: async (payload: any) => {
    await fetch(`${API_URL}/inventory/adjust`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(payload) });
  },
  addTransaction: async (transaction: any) => {
    await fetch(`${API_URL}/transactions`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(transaction) });
  },

  // --- VOUCHERS (admin token) ---
  addVoucher: async (voucher: any) => {
    await fetch(`${API_URL}/vouchers`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(voucher) });
  },
  updateVoucher: async (id: string, updates: any) => {
    await fetch(`${API_URL}/vouchers/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(updates) });
  },
  deleteVoucher: async (id: string) => {
    await fetch(`${API_URL}/vouchers/${id}`, { method: 'DELETE', headers: adminHeaders() });
  },

  // --- EMPLOYEES & SETTINGS (admin token) ---
  addEmployee: async (emp: any) => {
    await fetch(`${API_URL}/employees`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(emp) });
  },
  updateEmployee: async (id: string, updates: any) => {
    await fetch(`${API_URL}/employees/${id}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(updates) });
  },
  updateSettings: async (settings: Partial<StoreSettings>) => {
    await fetch(`${API_URL}/settings`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(settings) });
  },

  // --- REFUNDS (admin token) ---
  createRefund: async (refund: any) => {
    const res = await fetch(`${API_URL}/refunds`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(refund) });
    return res.json();
  },
  updateRefundStatus: async (id: string, status: string, processedBy?: string) => {
    await fetch(`${API_URL}/refunds/${id}/status`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ status, processedBy }) });
  },
  deleteRefund: async (id: string) => {
    await fetch(`${API_URL}/refunds/${id}`, { method: 'DELETE', headers: adminHeaders() });
  },

  // --- REVIEWS ---
  addReview: async (review: any) => {
    const res = await fetch(`${API_URL}/reviews`, { method: 'POST', headers: storeHeaders(), body: JSON.stringify(review) });
    return res.json();
  },
  replyToReview: async (id: string, reply: string) => {
    await fetch(`${API_URL}/reviews/${id}/reply`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ reply }) });
  },
  toggleReviewHidden: async (id: string) => {
    await fetch(`${API_URL}/reviews/${id}/toggle-hidden`, { method: 'PUT', headers: adminHeaders() });
  },
  
  // --- INVOICES (admin token) ---
  addInvoice: async (invoice: any) => {
    const res = await fetch(`${API_URL}/invoices`, { method: 'POST', headers: adminHeaders(), body: JSON.stringify(invoice) });
    return res.json();
  },
  updateInvoiceStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/invoices/${id}/status`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ status }) });
    return res.json();
  },
};
