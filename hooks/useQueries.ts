import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpGet, httpPost, httpPut, httpDelete } from '../services/httpClient';
import { Product, Order, Customer, Category } from '../types';

// ── Query Keys ────────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  customers: ['customers'] as const,
  categories: ['categories'] as const,
  state: ['state'] as const,
};

// ── Products ─────────────────────────────────────────────────────────────────
export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: () => httpGet<{ success: boolean; data: Product[] }>('/products'),
    select: (res) => res.data ?? [],
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: () => httpGet<{ success: boolean; data: Product }>(`/products/${id}`),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      httpPost<{ success: boolean; data: Product }>('/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.products }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      httpPut<{ success: boolean }>(`/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.products });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.product(id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => httpDelete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.products }),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────
export function useOrders(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return useQuery({
    queryKey: [...QUERY_KEYS.orders, params],
    queryFn: () => httpGet<{ success: boolean; data: Order[] }>(`/orders${query}`),
    select: (res) => res.data ?? [],
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      httpPut(`/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.orders }),
  });
}

// ── Customers ────────────────────────────────────────────────────────────────
export function useCustomers() {
  return useQuery({
    queryKey: QUERY_KEYS.customers,
    queryFn: () => httpGet<{ success: boolean; data: Customer[] }>('/customers'),
    select: (res) => res.data ?? [],
  });
}

// ── Categories ───────────────────────────────────────────────────────────────
export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => httpGet<{ success: boolean; data: Category[] }>('/categories'),
    select: (res) => res.data ?? [],
  });
}
