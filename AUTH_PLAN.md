# UniShop — Auth & Account Separation Plan

## Tài khoản mới (thay thế toàn bộ cũ)

### 👑 Admin Portal (`/admin.html`)

| Role | Email | Mật khẩu | Quyền |
|------|-------|----------|-------|
| OWNER | `owner@unishop.com` | `Owner@2026` | Toàn quyền |
| ACCOUNTANT | `accountant@unishop.com` | `Acc@2026` | Tài chính, Voucher |
| STAFF | `staff@unishop.com` | `Staff@2026` | Đơn hàng, Kho |

### 🛒 Store (`/`)

| Tên | Email | Mật khẩu | Ghi chú |
|-----|-------|----------|---------|
| Nguyễn Văn An | `an@gmail.com` | `Customer@123` | Khách thường |
| Trần Thị Bình | `binh@gmail.com` | `Customer@123` | Khách thường |

---

## Authentication Flow

### Admin Flow
```
/admin.html
  └─> AdminLogin (email + password)
        └─> POST /api/auth/admin/login
              ├─ Tìm trong employees collection
              ├─ Verify password (bcrypt)
              ├─ Trả về JWT { sub: id, role: "EMPLOYEE", name }
              └─> Lưu vào localStorage["unishop_admin_token"]
                    └─> Redirect → AdminDashboard
```

### Store Customer Flow
```
/login
  └─> StoreLogin (email + password)
        └─> POST /api/auth/store/login
              ├─ Tìm trong customers collection
              ├─ Verify password (bcrypt)
              ├─ Trả về JWT { sub: id, role: "CUSTOMER", name }
              └─> Lưu vào localStorage["unishop_store_token"]
                    └─> Redirect → /store

/register
  └─> RegisterPage (name, email, phone, password)
        └─> POST /api/auth/register
              ├─ Tạo customer mới (password hash bcrypt)
              ├─ (Optional) Gửi OTP verify email
              └─> Redirect → /login
```

### Token Separation
```
Admin: localStorage["unishop_admin_token"] — chỉ AdminApp đọc
Store: localStorage["unishop_store_token"] — chỉ App (store) đọc
→ Admin KHÔNG thể đăng nhập store
→ Customer KHÔNG thể truy cập admin
```

---

## Implementation Plan

### Phase 1 — Backend: Tách auth handlers ✅ *Hoàn tất*
- [x] `POST /api/auth/admin/login` — tìm `employees`, trả Employee JWT
- [x] `POST /api/auth/store/login` — tìm `customers`, trả Customer JWT
- [x] `POST /api/auth/register` — tạo customer mới, hash password
- [x] Middleware `RequireEmployee` — reject nếu JWT role ≠ EMPLOYEE
- [x] Middleware `RequireCustomer` — reject nếu JWT role ≠ CUSTOMER

### Phase 2 — Backend: Seed data mới ✅ *Hoàn tất*
- [x] Script seed employees (3 tài khoản trên, password đã hash bcrypt)
- [x] Script seed customers (2 tài khoản trên)
- [x] Xóa employee cũ `admin@gmail.com`

### Phase 3 — Frontend Admin ✅ *Hoàn tất*
- [x] Logic login Admin (lưu vào `unishop_admin_token`)
- [x] Hook `useBackend` — tự động chọn token dựa theo URL (`admin.html` vs index)
- [x] Bảo mật: Ngăn Admin vào Store và ngược lại (Redirect logic)
- [x] `AdminLogin.tsx` → gọi `/api/auth/admin/login`
- [x] Lưu token vào `localStorage["unishop_admin_token"]`
- [x] Logout: xóa `unishop_admin_token`

### Phase 4 — Frontend Store ✅ *Hoàn tất*
- [x] `StoreLogin.tsx` → gọi `/api/auth/store/login`
- [x] Lưu token vào `localStorage["unishop_store_token"]`
- [x] Logic login Store (lưu vào `unishop_store_token`)
- [x] Logout: xóa `unishop_store_token`

### Phase 5 — mockBackend cleanup ✅ *Hoàn tất*
- [x] Xóa employee cũ `admin@gmail.com / 123456`
- [x] Thêm 3 employee mới (offline fallback)
- [x] Thêm 2 customer mới (offline fallback)
- [x] Bump STORAGE_KEY version để clear localStorage cũ

### Phase 6 — Bảo mật ✅ *Hoàn tất*
- [x] Backend: hash password bằng bcrypt trước khi seed
- [x] Frontend: không lưu password raw trong localStorage
- [x] JWT expiry: admin 8h, store 24h
- [ ] Refresh token (optional, later)

---

## Trạng thái hiện tại
- ✅ Store và Admin đã tách URL riêng
- ✅ Portal page đã xóa khỏi store
- ✅ isEmployee logic đã xóa khỏi store components
- ✅ Backend auth endpoints đã tách biệt (Admin / Store)
- ✅ Token storage đã tách biệt (localStorage keys riêng)
- ✅ Seed data đã dọn dẹp sạch sẽ (Xóa admin@gmail.com)

