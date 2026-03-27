
// Use this client to communicate with the Node.js backend
import { BackendState, Product, Order, Category, Customer, Employee, Transaction, Voucher, PaymentAccount, StoreSettings } from '../types';

// Gọi thẳng vào backend (đã có setup CORS)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const headers = { 'Content-Type': 'application/json' };

export const api = {
  // --- STATE SYNC ---
  getState: async (): Promise<BackendState> => {
    try {
      const res = await fetch(`${API_URL}/state`);
      if(!res.ok) throw new Error(`HTTP Error! status: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("🔴 Error details when fetching backend:", error);
      throw error;
    }
  },

  // --- AUTH ---
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers,
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

  // --- PRODUCTS ---
  addProduct: async (product: any) => {
    await fetch(`${API_URL}/products`, { method: 'POST', headers, body: JSON.stringify(product) });
  },
  updateProduct: async (id: string, updates: any) => {
    await fetch(`${API_URL}/products/${id}`, { method: 'PUT', headers, body: JSON.stringify(updates) });
  },
  deleteProduct: async (id: string) => {
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  },

  // --- ORDERS ---
  placeOrder: async (orderData: any) => {
    const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers, body: JSON.stringify(orderData) });
    return res.json();
  },
  updateOrderStatus: async (id: string, status: string, userId?: string) => {
    await fetch(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status, userId }) });
  },

  // --- CATEGORIES ---
  addCategory: async (category: any) => {
    await fetch(`${API_URL}/categories`, { method: 'POST', headers, body: JSON.stringify(category) });
  },
  updateCategory: async (id: string, updates: any) => {
    await fetch(`${API_URL}/categories/${id}`, { method: 'PUT', headers, body: JSON.stringify(updates) });
  },
  deleteCategory: async (id: string) => {
    await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
  },

  // --- CUSTOMERS ---
  addCustomer: async (customer: any) => {
    await fetch(`${API_URL}/customers`, { method: 'POST', headers, body: JSON.stringify(customer) });
  },
  updateCustomer: async (id: string, updates: any) => {
    await fetch(`${API_URL}/customers/${id}`, { method: 'PUT', headers, body: JSON.stringify(updates) });
  },
  toggleWishlist: async (customerId: string, productId: string) => {
    const res = await fetch(`${API_URL}/customers/${customerId}/wishlist`, { method: 'PUT', headers, body: JSON.stringify({ productId }) });
    return res.json();
  },

  // --- INVENTORY & FINANCE ---
  adjustStock: async (payload: any) => {
    await fetch(`${API_URL}/inventory/adjust`, { method: 'POST', headers, body: JSON.stringify(payload) });
  },
  addTransaction: async (transaction: any) => {
    await fetch(`${API_URL}/transactions`, { method: 'POST', headers, body: JSON.stringify(transaction) });
  },

  // --- VOUCHERS ---
  addVoucher: async (voucher: any) => {
    await fetch(`${API_URL}/vouchers`, { method: 'POST', headers, body: JSON.stringify(voucher) });
  },
  updateVoucher: async (id: string, updates: any) => {
    await fetch(`${API_URL}/vouchers/${id}`, { method: 'PUT', headers, body: JSON.stringify(updates) });
  },
  deleteVoucher: async (id: string) => {
    await fetch(`${API_URL}/vouchers/${id}`, { method: 'DELETE' });
  },

  // --- EMPLOYEES & SETTINGS ---
  addEmployee: async (emp: any) => {
    await fetch(`${API_URL}/employees`, { method: 'POST', headers, body: JSON.stringify(emp) });
  },
  updateEmployee: async (id: string, updates: any) => {
    await fetch(`${API_URL}/employees/${id}`, { method: 'PUT', headers, body: JSON.stringify(updates) });
  },
  updateSettings: async (settings: Partial<StoreSettings>) => {
    await fetch(`${API_URL}/settings`, { method: 'POST', headers, body: JSON.stringify(settings) });
  }
};
