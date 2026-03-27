
import { useState, useEffect } from 'react';
import { loadState, saveState } from '../services/mockBackend';
import { api } from '../services/apiClient';
import { BackendContextType, BackendState, Product, Order, OrderStatus, Category, Customer, InventoryLog, Transaction, Voucher, Employee, PaymentAccount, StoreSettings } from '../types';
import { formatCurrency } from '../types';

export const useBackend = () => {
  const [data, setData] = useState<BackendState>(loadState());
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | Customer | null>(null);

  // --- FETCH DATA ---
  const refreshData = async () => {
      try {
          const remoteState = await api.getState();
          setData(remoteState);
          setIsOffline(false);
          saveState(remoteState); 
          
          // Refresh current user data if logged in
          if (currentUser) {
              const updatedEmployee = remoteState.employees.find(e => e.id === currentUser.id);
              if (updatedEmployee) setCurrentUser(updatedEmployee);
              else {
                  const updatedCustomer = remoteState.customers.find(c => c.id === currentUser.id);
                  if (updatedCustomer) setCurrentUser(updatedCustomer);
              }
          }
      } catch (e) {
          console.warn("Backend unreachable, switching to Offline Mode.");
          setIsOffline(true);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateBackend = (newState: BackendState) => {
    setData(newState);
    saveState(newState);
  };

  // --- BACKEND LOGIC ---
  const backend: BackendContextType = {
    state: data,
    login: (email, password) => {
        // Only return true/false here, navigation is handled by the UI component
        const employee = data.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
        if (employee && employee.password === password) {
            setCurrentUser(employee);
            return true;
        }
        const customer = data.customers.find(c => c.email?.toLowerCase() === email.toLowerCase());
        if (customer && customer.password === password) {
            setCurrentUser(customer);
            return true;
        }
        return false;
    },
    setCurrentUser: (user) => {
        setCurrentUser(user);
    },
    logout: () => {
        setCurrentUser(null);
    },
    register: async (customerData) => {
        if (!isOffline) {
            try { await api.addCustomer(customerData); refreshData(); return; } catch (e) { setIsOffline(true); }
        }
        const newCustomer: Customer = { ...customerData, id: `cust_${Date.now()}`, joinedAt: new Date().toISOString(), status: 'ACTIVE', loyaltyPoints: 0, wishlist: [] };
        updateBackend({ ...data, customers: [...data.customers, newCustomer] });
    },
    getCurrentUser: () => currentUser,
    addProduct: async (product) => {
      if (!isOffline) { try { await api.addProduct(product); refreshData(); return; } catch (e) { setIsOffline(true); } }
      updateBackend({ ...data, products: [...data.products, { ...product, id: `p${Date.now()}` }] });
    },
    updateProduct: async (id, updates) => {
      if (!isOffline) { try { await api.updateProduct(id, updates); refreshData(); return; } catch (e) { setIsOffline(true); } }
      updateBackend({ ...data, products: data.products.map(p => p.id === id ? { ...p, ...updates } : p) });
    },
    deleteProduct: async (id) => {
        if (!isOffline) { try { await api.deleteProduct(id); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, products: data.products.filter(p => p.id !== id) });
    },
    toggleWishlist: async (customerId, productId) => {
        if (!isOffline) { try { const u = await api.toggleWishlist(customerId, productId); setCurrentUser(u); refreshData(); return; } catch (e) { setIsOffline(true); } }
        const customer = data.customers.find(c => c.id === customerId);
        if (customer) {
            let newWishlist = customer.wishlist.includes(productId) ? customer.wishlist.filter(id => id !== productId) : [...customer.wishlist, productId];
            const updatedCustomer = { ...customer, wishlist: newWishlist };
            updateBackend({ ...data, customers: data.customers.map(c => c.id === customerId ? updatedCustomer : c) });
            setCurrentUser(updatedCustomer);
        }
    },
    placeOrder: (customerInfo, items, paymentMethod, shippingInfo, voucherCode, usePoints) => {
        const subtotal = items.reduce((sum, item) => {
             let price = item.price;
             if(item.selectedVariantId) {
                 const v = item.variants.find(v => v.id === item.selectedVariantId);
                 if(v) price = v.price;
             }
             if (item.discount > 0) {
                 if (item.discountType === 'FIXED') price = Math.max(0, price - item.discount);
                 else price = Math.max(0, price * (1 - item.discount / 100));
             }
             return sum + (price * item.quantity);
        }, 0);

        let voucherDiscount = 0;
        let finalVoucherCode = undefined;
        let updatedVouchers = [...data.vouchers];
        if (voucherCode) {
            const validation = backend.validateVoucher(voucherCode, subtotal);
            if (validation.valid) {
                voucherDiscount = validation.discount;
                finalVoucherCode = voucherCode;
                updatedVouchers = updatedVouchers.map(v => v.code === voucherCode ? { ...v, usedCount: v.usedCount + 1 } : v);
            }
        }

        let pointsDiscount = 0;
        let pointsUsed = 0;
        let customer = data.customers.find(c => c.email === customerInfo.email || c.phone === customerInfo.phone);
        if (usePoints && customer && customer.loyaltyPoints > 0) {
            const maxPointsValue = customer.loyaltyPoints * 1000;
            const amountToPay = subtotal - voucherDiscount;
            if (maxPointsValue >= amountToPay) {
                pointsDiscount = amountToPay;
                pointsUsed = Math.ceil(amountToPay / 1000);
            } else {
                pointsDiscount = maxPointsValue;
                pointsUsed = customer.loyaltyPoints;
            }
        }

        const taxableTotal = subtotal - voucherDiscount - pointsDiscount;
        const taxAmount = Math.max(0, taxableTotal) * (data.settings.tax.defaultRate / 100);
        const total = Math.max(0, taxableTotal + taxAmount + shippingInfo.fee);
        
        const newOrder: Order = {
            id: `${Date.now()}`,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerAddress: customerInfo.address,
            customerEmail: customerInfo.email,
            items, subtotal, discountAmount: voucherDiscount, voucherCode: finalVoucherCode,
            voucherDiscount, pointsUsed, pointsDiscount,
            shippingFee: shippingInfo.fee, shippingMethod: shippingInfo.method,
            taxRate: data.settings.tax.defaultRate, taxAmount, total, status: OrderStatus.PENDING,
            paymentMethod: paymentMethod, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };

        if (!isOffline) {
            api.placeOrder(newOrder).then(() => refreshData()).catch(() => setIsOffline(true));
        }
        updateBackend({ ...data, orders: [...data.orders, newOrder], vouchers: updatedVouchers });
        return newOrder;
    },
    updateOrderStatus: async (id, status, userId) => {
        if (!isOffline) { try { await api.updateOrderStatus(id, status, userId); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, orders: data.orders.map(o => o.id === id ? { ...o, status, processedBy: userId } : o) });
    },
    addCategory: async (category) => {
        if (!isOffline) { try { await api.addCategory(category); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, categories: [...data.categories, { ...category, id: `c${Date.now()}` }] });
    },
    updateCategory: async (id, updates) => {
        if (!isOffline) { try { await api.updateCategory(id, updates); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, categories: data.categories.map(c => c.id === id ? { ...c, ...updates } : c) });
    },
    deleteCategory: async (id) => {
        if (!isOffline) { try { await api.deleteCategory(id); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, categories: data.categories.filter(c => c.id !== id) });
    },
    addCustomer: async (customerData) => {
        if (!isOffline) { try { await api.addCustomer(customerData); refreshData(); return; } catch (e) { setIsOffline(true); } }
        const newCustomer: Customer = { ...customerData, id: `cust_${Date.now()}`, joinedAt: new Date().toISOString(), status: 'ACTIVE', loyaltyPoints: 0, wishlist: [] };
        updateBackend({ ...data, customers: [...data.customers, newCustomer] });
    },
    updateCustomer: async (id, updates) => {
        if (!isOffline) { try { await api.updateCustomer(id, updates); refreshData(); return; } catch (e) { setIsOffline(true); } }
        // Offline logic
        const updatedCustomers = data.customers.map(c => c.id === id ? { ...c, ...updates } : c);
        updateBackend({ ...data, customers: updatedCustomers });
        // Sync currentUser if self-update
        if (currentUser?.id === id) setCurrentUser(updatedCustomers.find(c => c.id === id) || currentUser);
    },
    updateCustomerStatus: async (id, status) => {
        if (!isOffline) { try { await api.updateCustomer(id, { status }); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, customers: data.customers.map(c => c.id === id ? { ...c, status } : c) });
    },
    adjustStock: async (productId, variantId, quantity, type, reason, userId) => {
        if (!isOffline) { try { await api.adjustStock({ productId, variantId, quantity, type, reason, userId }); refreshData(); return; } catch (e) { setIsOffline(true); } }
    },
    addTransaction: async (transaction, userId) => {
        if (!isOffline) { try { await api.addTransaction({ ...transaction, createdBy: userId }); refreshData(); return; } catch (e) { setIsOffline(true); } }
        const newTx: Transaction = { ...transaction, id: `tx_${Date.now()}`, date: new Date().toISOString(), createdBy: userId };
        updateBackend({ ...data, transactions: [newTx, ...data.transactions] });
    },
    addPaymentAccount: (account) => {
        const newAccount = { ...account, id: Date.now() };
        updateBackend({ ...data, paymentAccounts: [...data.paymentAccounts, newAccount] });
    },
    deletePaymentAccount: (id) => {
        updateBackend({ ...data, paymentAccounts: data.paymentAccounts.filter(a => a.id !== id) });
    },
    addVoucher: async (voucher, userId) => {
        if (!isOffline) { try { await api.addVoucher({ ...voucher, createdBy: userId }); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, vouchers: [...data.vouchers, { ...voucher, id: `v${Date.now()}`, usedCount: 0, createdBy: userId }] });
    },
    updateVoucher: async (id, updates, userId) => {
        if (!isOffline) { try { await api.updateVoucher(id, updates); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, vouchers: data.vouchers.map(v => v.id === id ? { ...v, ...updates } : v) });
    },
    deleteVoucher: async (id) => {
        if (!isOffline) { try { await api.deleteVoucher(id); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, vouchers: data.vouchers.filter(v => v.id !== id) });
    },
    validateVoucher: (code, orderTotal) => {
        const voucher = data.vouchers.find(v => v.code === code && v.status === 'ACTIVE');
        if (!voucher) return { valid: false, discount: 0, message: 'Invalid or inactive code' };
        const now = new Date(); const start = new Date(voucher.startDate); const end = new Date(voucher.endDate);
        if (now < start || now > end) return { valid: false, discount: 0, message: 'Voucher expired' };
        if (voucher.usedCount >= voucher.usageLimit) return { valid: false, discount: 0, message: 'Usage limit reached' };
        if (orderTotal < voucher.minOrderValue) return { valid: false, discount: 0, message: `Minimum order ${formatCurrency(voucher.minOrderValue)} required` };
        let discount = voucher.type === 'PERCENT' ? orderTotal * (voucher.value / 100) : voucher.value;
        if (voucher.type === 'PERCENT' && voucher.maxDiscount) discount = Math.min(discount, voucher.maxDiscount);
        return { valid: true, discount: Math.min(discount, orderTotal), message: 'Voucher applied' };
    },
    addEmployee: async (employee) => {
        if (!isOffline) { try { await api.addEmployee(employee); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, employees: [...data.employees, { ...employee, id: `emp_${Date.now()}`, joinedAt: new Date().toISOString() }] });
    },
    updateEmployee: async (id, updates) => {
        if (!isOffline) { try { await api.updateEmployee(id, updates); refreshData(); return; } catch (e) { setIsOffline(true); } }
        // Offline logic
        const updatedEmployees = data.employees.map(e => e.id === id ? { ...e, ...updates } : e);
        updateBackend({ ...data, employees: updatedEmployees });
        // Sync currentUser if self-update
        if (currentUser?.id === id) setCurrentUser(updatedEmployees.find(e => e.id === id) || currentUser);
    },
    setLevel2Password: async (employeeId, newPassword) => {
        if (!isOffline) { try { await api.updateEmployee(employeeId, { level2Password: newPassword, level2PasswordAttempts: 0 }); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, employees: data.employees.map(e => e.id === employeeId ? { ...e, level2Password: newPassword, level2PasswordAttempts: 0 } : e) });
    },
    disableLevel2Password: async (employeeId) => {
        if (!isOffline) { try { await api.updateEmployee(employeeId, { level2Password: '', level2PasswordAttempts: 0 }); refreshData(); return; } catch (e) { setIsOffline(true); } }
        updateBackend({ ...data, employees: data.employees.map(e => e.id === employeeId ? { ...e, level2Password: '', level2PasswordAttempts: 0 } : e) });
    },
    verifyLevel2Password: (employeeId, password) => {
        // Tắt chức năng xác thực MK cấp 2
        return { success: true, attemptsLeft: 5 };
    },
    resetLevel2PasswordAttempts: (employeeId) => {
        if (!isOffline) api.updateEmployee(employeeId, { level2PasswordAttempts: 0 });
        updateBackend({ ...data, employees: data.employees.map(e => e.id === employeeId ? { ...e, level2PasswordAttempts: 0 } : e) });
    },
    updateSettings: async (settings: Partial<StoreSettings>) => {
        if (!isOffline) { 
            try { 
                await api.updateSettings(settings); 
                refreshData(); 
                return; 
            } catch (e) { setIsOffline(true); } 
        }
        updateBackend({ ...data, settings: { ...data.settings, ...settings } });
    },
    refresh: refreshData
  };

  return { backend, isLoading, isOffline, currentUser, setCurrentUser };
};
