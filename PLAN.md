# UniShop — Backend Go Development Plan

## Cấu trúc dự án hiện tại

```
doan/
├── frontend (React + Vite — tất cả files ở root)
│   ├── App.tsx / AdminApp.tsx / index.tsx / admin.tsx
│   ├── components/ hooks/ services/ types.ts
│   ├── index.html / admin.html
│   └── package.json / vite.config.ts / tsconfig.json ...
│
├── backend-go/                         ← Go backend
│   ├── cmd/server/main.go              ← Entry point
│   ├── internal/
│   │   ├── config/config.go            ← Env config
│   │   ├── middleware/auth.go          ← JWT middleware
│   │   ├── models/                     ← MongoDB structs
│   │   │   ├── product.go
│   │   │   ├── order.go
│   │   │   ├── customer.go
│   │   │   ├── employee.go
│   │   │   ├── category.go
│   │   │   ├── voucher.go
│   │   │   ├── inventory.go
│   │   │   ├── finance.go
│   │   │   └── settings.go
│   │   ├── handlers/                   ← HTTP handlers
│   │   │   ├── auth.go
│   │   │   ├── state.go
│   │   │   ├── product.go
│   │   │   ├── order.go
│   │   │   ├── customer.go
│   │   │   ├── employee.go
│   │   │   ├── category.go
│   │   │   ├── inventory.go
│   │   │   ├── finance.go
│   │   │   ├── voucher.go
│   │   │   └── settings.go
│   │   └── routes/routes.go            ← Route definitions
│   ├── pkg/
│   │   ├── db/mongo.go                 ← MongoDB connection
│   │   └── utils/response.go          ← JSON helpers
│   ├── go.mod / go.sum
│   ├── .env.example
│   └── Makefile
│
└── docs/                               ← Documentation
```

---

## Dependencies đã cài (go.mod)

| Package | Phiên bản | Mục đích |
|---|---|---|
| `github.com/gin-gonic/gin` | v1.9.1 | Web framework |
| `go.mongodb.org/mongo-driver` | v1.14.0 | MongoDB driver |
| `github.com/golang-jwt/jwt/v5` | v5.2.1 | JWT auth |
| `github.com/joho/godotenv` | v1.5.1 | Load .env |
| `golang.org/x/crypto` | v0.21.0 | bcrypt hashing |

---

## API Endpoints đã đăng ký (routes/routes.go)

### Public
| Method | Path | Handler |
|---|---|---|
| GET | `/api/healthz` | health check |
| GET | `/api/state` | full state sync |
| GET | `/api/products` | list products |
| GET | `/api/categories` | list categories |
| POST | `/api/auth/login` | login |
| POST | `/api/auth/check-email` | check email exists |
| POST | `/api/auth/send-code` | send OTP email |
| POST | `/api/auth/verify-code` | verify OTP |
| POST | `/api/auth/create-customer` | register |
| POST | `/api/auth/send-2fa-code` | send 2FA |
| POST | `/api/auth/verify-2fa-code` | verify 2FA |

### Protected (Bearer JWT)
| Method | Path | Handler |
|---|---|---|
| POST/PUT/DELETE | `/api/products/:id` | CRUD products |
| POST/PUT/DELETE | `/api/categories/:id` | CRUD categories |
| GET/POST | `/api/orders` | list/place orders |
| PUT | `/api/orders/:id/status` | update status |
| GET/POST/PUT | `/api/customers/:id` | CRUD customers |
| PUT | `/api/customers/:id/wishlist` | toggle wishlist |
| GET/POST/PUT | `/api/employees/:id` | CRUD employees |
| POST | `/api/inventory/adjust` | adjust stock |
| GET | `/api/inventory/logs` | inventory logs |
| GET/POST | `/api/transactions` | finance |
| GET/POST/PUT/DELETE | `/api/vouchers/:id` | CRUD vouchers |
| GET/POST | `/api/settings` | settings |

---

## Roadmap — Việc cần làm tiếp theo

### BƯỚC 1 — Setup môi trường (Làm ngay)
- [ ] Copy `backend-go/.env.example` → `backend-go/.env`
- [ ] Điền `MONGO_URI`, `JWT_SECRET` vào `.env`
- [ ] Xóa file `backend-go/main.go` cũ (đã thay bởi `cmd/server/main.go`)
- [ ] Chạy thử: `cd backend-go && go run ./cmd/server`
- [ ] Test: `curl http://localhost:8080/api/healthz`

### BƯỚC 2 — Kết nối MongoDB & Seed Data (Tuần 1)
- [ ] Tạo MongoDB Atlas cluster (hoặc local Docker)
- [ ] Import dữ liệu mẫu vào collections
- [ ] Test endpoint `GET /api/state` trả đúng data
- [ ] Test endpoint `POST /api/auth/login`

### BƯỚC 3 — Implement Email Service (Tuần 1-2)
- [ ] `internal/services/email_service.go` — gửi email qua Gmail SMTP
- [ ] Implement OTP store (in-memory map với TTL 5 phút)
- [ ] Hoàn thiện `auth.SendCode` và `auth.VerifyCode`
- [ ] Test flow đăng ký với xác thực email

### BƯỚC 4 — Business Logic (Tuần 2-3)
- [ ] `order.go` — tính toán đúng total, discount, points khi đặt hàng
- [ ] `order.go` — trừ stock sản phẩm khi order được xác nhận
- [ ] `customer.go` — cộng loyalty points sau khi order completed
- [ ] `voucher.go` — validate voucher (hạn dùng, tồn tại, min order)
- [ ] `inventory.go` — log đúng stockBefore/After cho variants
- [ ] `finance.go` — auto-create transaction khi order completed

### BƯỚC 5 — Security & Validation (Tuần 3)
- [ ] Thêm `RequireRole("OWNER", "ACCOUNTANT")` cho các route admin nhạy cảm
- [ ] Input validation đầy đủ (binding tags trên structs)
- [ ] Rate limiting cho `/api/auth/login`
- [ ] Sanitize dữ liệu trước khi lưu MongoDB

### BƯỚC 6 — Testing (Tuần 3-4)
- [ ] Test thủ công toàn bộ endpoints với Postman/Thunder Client
- [ ] Tạo `internal/handlers/*_test.go` cho auth, product, order
- [ ] Test edge cases: order hết hàng, voucher hết hạn, sai mật khẩu

### BƯỚC 7 — Frontend Integration (Tuần 4)
- [ ] Update `services/apiClient.ts`: đổi `API_URL` sang `http://localhost:8080/api`
- [ ] Thêm `Authorization: Bearer <token>` header vào protected requests
- [ ] Test toàn bộ flow end-to-end từ UI

### BƯỚC 8 — Deploy (Tuần 5)
- [ ] Tạo `backend-go/Dockerfile`
- [ ] Deploy lên Railway / Render / VPS
- [ ] Update `VITE_API_URL` trên Vercel để trỏ vào Go backend

---

## Lệnh hay dùng

```bash
# Chạy backend
cd backend-go && go run ./cmd/server

# Build binary
cd backend-go && go build -o bin/unishop-server ./cmd/server

# Chạy frontend
npm run dev

# Chạy cả hai (2 terminal)
npm run backend
npm run dev
```

---

**Cập nhật lần cuối**: 2026-04-18
