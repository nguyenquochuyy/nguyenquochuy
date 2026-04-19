---
description: Kiến trúc Store và Admin App
---

# Kiến trúc Store và Admin App

## Tổng quan
Hệ thống có 2 web app độc lập chia sẻ backend Go API:
- **Store App** (App.tsx) - Khách hàng mua sắm
- **Admin App** (AdminApp.tsx) - Quản trị viên quản lý hệ thống

## Cấu trúc

### 1. Store App (App.tsx)
- **File**: `App.tsx`
- **Routes**:
  - `/login` - Đăng nhập khách hàng
  - `/register` - Đăng ký khách hàng
  - `/forgot-password` - Quên mật khẩu
  - `/verify-email` - Xác thực email
  - `/store/*` - Storefront (trang mua sắm)
  - `/` - Redirect đến `/store`
- **Session**: Chỉ restore customer session (không restore admin)
- **Backend**: Kết nối đến backend Go API

### 2. Admin App (AdminApp.tsx)
- **File**: `AdminApp.tsx`
- **Routes** (basename="/admin"):
  - `/admin/login` - Đăng nhập admin
  - `/admin/*` - Admin Dashboard
- **Session**: Chỉ restore admin session (employee)
- **Backend**: Kết nối đến backend Go API (cùng backend với Store)
- **SSE**: Kết nối đến `/api/events` để nhận real-time updates

## Kết nối Real-time

### SSE Endpoint
- **Backend**: `/api/events` (Server-Sent Events)
- **Admin Dashboard**: Đã kết nối SSE để nhận real-time updates
  - Hiển thị indicator Live/Offline
  - Cập nhật last update time
  - Tự động refresh data khi có thay đổi

### Flow Real-time
```
Backend Go API → SSE (/api/events) → Admin App (AdminDashboard.tsx)
                                    → Store App (nếu cần)
```

## Quản lý Data

### Backend API (Go)
- **Database**: MongoDB
- **API Endpoints**:
  - `/api/state` - Full sync endpoint (tất cả data)
  - `/api/products` - CRUD sản phẩm
  - `/api/orders` - CRUD đơn hàng
  - `/api/customers` - CRUD khách hàng
  - `/api/inventory/adjust` - Điều chỉnh tồn kho
  - Và các endpoints khác...

### Data Flow
```
Store App → Backend API → MongoDB
Admin App → Backend API → MongoDB
Backend → SSE → Both apps (real-time)
```

## Deploy

### Cách 1: Deploy cùng nhau (Single Domain)
- Frontend (Store): Deploy tại `/`
- Frontend (Admin): Deploy tại `/admin`
- Backend: Deploy API server

### Cách 2: Deploy riêng biệt
- Frontend Store: `store.example.com`
- Frontend Admin: `admin.example.com`
- Backend API: `api.example.com`

## Chạy local

### Chạy Store App
```bash
npm run dev
# Truy cập: http://localhost:5173/store
```

### Chạy Admin App
Cần tạo entry point riêng hoặc sử dụng AdminApp.tsx
```bash
# Cần config build script riêng cho admin
```

### Chạy Backend
```bash
cd backend-go
go run cmd/server/main.go
# API server: http://localhost:8080
```

## Tách biệt hoàn toàn

- Admin KHÔNG thể đăng nhập vào Store
- Customer KHÔNG thể truy cập Admin Dashboard
- Session storage riêng biệt:
  - `storeAuthStorage` - cho customers
  - `adminAuthStorage` - cho admins
- JWT tokens riêng biệt
