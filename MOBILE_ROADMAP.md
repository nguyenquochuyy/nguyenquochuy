# Lộ Trình Phát Triển Mobile Admin App (Android)

## 📋 Tổng quan
Tài liệu này theo dõi lộ trình phát triển ứng dụng mobile Admin App cho UniShop trên nền tảng Android (React Native).

**Chú thích:**
- ✅ Hoàn thành
- 🚧 Đang thực hiện
- ⏳ Chờ xử lý
- 🔴 Ưu tiên cao
- 🟡 Ưu tiên trung bình
- 🟢 Ưu tiên thấp

**Công nghệ:**
- **Framework:** React Native (TypeScript)
- **Navigation:** React Navigation
- **UI Library:** React Native Paper / Tamagui
- **State:** Zustand / Redux Toolkit
- **API:** Axios (share config với web)
- **Icons:** React Native Vector Icons / Phosphor Icons

---

## 📱 Giai Đoạn 1: Cơ Bản (MVP)

### Setup & Cấu Trúc

- [ ] **Khởi Tạo Project** 🔴
  - Init React Native project với Expo hoặc CLI
  - Cấu hình TypeScript
  - Cấu hình ESLint, Prettier
  - **Yêu cầu:**
    - `npx react-native@latest init AdminApp` hoặc `npx create-expo-app admin-app`
    - Cấu hình tsconfig.json
    - Setup folder structure
  - **Folder structure:**
    ```
    src/
    ├── components/      # Reusable components
    ├── screens/         # Screen components
    ├── navigation/      # Navigation config
    ├── services/         # API, auth, storage
    ├── hooks/           # Custom hooks
    ├── utils/           # Helpers, formatters
    ├── store/           # State management
    ├── types/           # TypeScript types (share với web)
    └── constants/       # Constants, config
    ```
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [x] **Navigation Setup** ✅
  - Cài đặt React Navigation
  - Cấu hình Stack Navigator
  - Cấu hình Tab Navigator
  - **Yêu cầu:**
    - `npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs`
    - Setup navigation structure:
      - Auth Stack (Login, Forgot Password)
      - Main Tab Navigator (Dashboard, Orders, Products, Customers, More)
      - Stack cho từng tab (detail screens)
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [ ] **API Client Setup** 🔴
  - Cấu hình Axios
  - Share API config với web
  - Interceptor cho auth token
  - **Yêu cầu:**
    - Copy `src/services/api.ts` từ web project
    - Cấu hình base URL (`http://localhost:8080` hoặc production URL)
    - Token storage (AsyncStorage / SecureStore)
    - Request/response interceptors
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Authentication Flow** 🔴
  - Login screen
  - Token storage
  - Auto-login
  - Logout
  - **Yêu cầu:**
    - LoginScreen với email/password form
    - POST /api/auth/admin/login
    - Lưu token vào AsyncStorage
    - Check token on app launch → auto navigate
    - Logout button → clear token + navigate to login
  - **Backend:** Đã có sẵn (web API)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

---

## 📊 Giai Đoạn 2: Dashboard & KPI

### Dashboard Screen

- [ ] **Dashboard Layout** 🔴
  - KPI cards grid
  - Stats overview
  - Quick actions
  - **Yêu cầu:**
    - Component DashboardScreen
    - 4 KPI cards (Doanh thu, Đơn hàng, Khách hàng, Sản phẩm)
    - Date range picker
    - Pull-to-refresh
  - **Frontend:**
    - GET /api/state (fetch dashboard stats)
    - Reuse DashboardStats logic từ web
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Charts & Graphs** 🟡
  - Doanh thu theo thời gian
  - Sản phẩm bán chạy
  - **Yêu cầu:**
    - Tích hợp react-native-chart-kit hoặc victory-native
    - Line chart cho doanh thu
    - Bar chart cho top products
  - **Backend:** GET /api/finance/reports/advanced (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Recent Activity Feed** 🟡
  - Hiển thị hoạt động gần đây
  - Orders mới, products mới
  - **Yêu cầu:**
    - Component ActivityFeed
    - List các hoạt động từ /api/state
    - Infinite scroll
  - **Backend:** GET /api/state (activity field)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

---

## 📦 Giai Đoạn 3: Quản Lý Đơn Hàng

### Orders Tab

- [ ] **Orders List Screen** 🔴
  - List đơn hàng
  - Filter theo trạng thái
  - Search
  - **Yêu cầu:**
    - Component OrdersScreen
    - FlatList với OrderCard
    - Status filter tabs (All, Pending, Processing, Shipped, Delivered)
    - Search bar
    - Pull-to-refresh
    - Infinite scroll / pagination
  - **Backend:** GET /api/orders (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Order Detail Screen** 🔴
  - Chi tiết đơn hàng
  - Cập nhật trạng thái
  - Xem khách hàng
  - **Yêu cầu:**
    - Component OrderDetailScreen
    - Order info header (ID, status, date, total)
    - Customer info section
    - Items list với images
    - Actions: Update status, Add note, Call customer
    - Status update modal
  - **Backend:** GET /api/orders/:id, PUT /api/orders/:id/status (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Create Order Screen** 🟡
  - Tạo đơn hàng mới
  - Chọn khách hàng
  - Thêm sản phẩm
  - **Yêu cầu:**
    - Component CreateOrderScreen
    - Customer selector (search)
    - Product selector với variant
    - Quantity input
    - Calculate total
    - Submit order
  - **Backend:** POST /api/orders (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Bulk Actions** 🟡
  - Chọn nhiều đơn hàng
  - Cập nhật trạng thái hàng loạt
  - **Yêu cầu:**
    - Multi-select mode trong OrdersScreen
    - Bulk action bottom sheet
    - Confirm modal
  - **Backend:** POST /api/orders/bulk-status (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

---

## 🛍️ Giai Đoạn 4: Quản Lý Sản Phẩm

### Products Tab

- [ ] **Products List Screen** 🔴
  - List sản phẩm
  - Filter theo danh mục
  - Search
  - **Yêu cầu:**
    - Component ProductsScreen
    - FlatList với ProductCard
    - Category filter dropdown
    - Search bar
    - Pull-to-refresh
    - Infinite scroll
  - **Backend:** GET /api/products (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Product Detail Screen** 🔴
  - Chi tiết sản phẩm
  - Sửa thông tin
  - Xem tồn kho
  - **Yêu cầu:**
    - Component ProductDetailScreen
    - Product info (name, price, stock, category)
    - Images carousel
    - Variants list
    - Actions: Edit, Delete, Toggle visibility
    - Edit modal / screen
  - **Backend:** GET /api/products/:id, PUT /api/products/:id (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Create/Edit Product Screen** 🟡
  - Tạo/sửa sản phẩm
  - Upload ảnh
  - **Yêu cầu:**
    - Component ProductFormScreen
    - Form fields (name, price, stock, category, description)
    - Image picker (react-native-image-picker)
    - Variant management
    - Submit form
  - **Backend:** POST /api/products, PUT /api/products/:id (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Barcode Scanner** 🟡
  - Quét mã vạch
  - Tìm sản phẩm nhanh
  - **Yêu cầu:**
    - Tích hợp react-native-camera
    - Barcode scanner modal
    - Auto search product by barcode
  - **Backend:** GET /api/products/barcode/:code (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

---

## 👥 Giai Đoạn 5: Quản Lý Khách Hàng

### Customers Tab

- [ ] **Customers List Screen** 🔴
  - List khách hàng
  - Search
  - Filter theo trạng thái
  - **Yêu cầu:**
    - Component CustomersScreen
    - FlatList với CustomerCard
    - Search bar (name, phone, email)
    - Status filter (Active, Locked)
    - Pull-to-refresh
    - Infinite scroll
  - **Backend:** GET /api/customers (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Customer Detail Screen** 🔴
  - Chi tiết khách hàng
  - Lịch sử đơn hàng
  - Ghi chú
  - **Yêu cầu:**
    - Component CustomerDetailScreen
    - Customer info header
    - Stats (total orders, total spent, loyalty points)
    - Orders history list
    - Notes section (add/view notes)
    - Actions: Edit, Lock/Unlock, Call, Email
  - **Backend:** GET /api/customers/:id, POST /api/customers/:id/notes (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Create Customer Screen** 🟡
  - Tạo khách hàng mới
  - **Yêu cầu:**
    - Component CreateCustomerScreen
    - Form fields (name, phone, email, address)
    - Submit form
  - **Backend:** POST /api/customers (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Email Campaign** 🟢
  - Gửi email marketing
  - **Yêu cầu:**
    - Component EmailCampaignScreen
    - Select customers
    - Compose email
    - Send campaign
  - **Backend:** POST /api/email-campaigns/create, POST /api/email-campaigns/:id/send (đã có)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## 💰 Giai Đoạn 6: Quản Lý Tài Chính

### Finance Tab

- [ ] **Transactions Screen** 🔴
  - List giao dịch
  - Filter theo loại
  - **Yêu cầu:**
    - Component TransactionsScreen
    - FlatList với TransactionCard
    - Type filter (Income, Expense, Transfer)
    - Date range picker
    - Pull-to-refresh
  - **Backend:** GET /api/transactions (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Accounts Screen** 🟡
  - List tài khoản
  - Tạo/sửa tài khoản
  - **Yêu cầu:**
    - Component AccountsScreen
    - List accounts với balance
    - Add account modal
    - Edit account modal
  - **Backend:** GET /api/finance/accounts, POST /api/finance/accounts (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Add Transaction Screen** 🟡
  - Thêm giao dịch mới
  - **Yêu cầu:**
    - Component AddTransactionScreen
    - Form fields (type, amount, category, note, account)
    - Submit form
  - **Backend:** POST /api/transactions (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Financial Reports** 🟢
  - Báo cáo tài chính
  - **Yêu cầu:**
    - Component FinanceReportsScreen
    - Income vs Expense chart
    - Category breakdown
    - Export CSV
  - **Backend:** GET /api/finance/reports/advanced (đã có)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## 📦 Giai Đoạn 7: Quản Lý Kho

### Inventory Tab

- [ ] **Stock Overview Screen** 🔴
  - Tổng quan tồn kho
  - Cảnh báo tồn kho thấp
  - **Yêu cầu:**
    - Component InventoryScreen
    - Total stock value
    - Low stock products list
    - Quick actions (Import, Export)
  - **Backend:** GET /api/inventory/logs, GET /api/inventory/discrepancies (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Stock Adjustment Screen** 🟡
  - Điều chỉnh tồn kho
  - **Yêu cầu:**
    - Component StockAdjustmentScreen
    - Select product
    - Select type (Import/Export)
    - Enter quantity
    - Add note
    - Submit
  - **Backend:** POST /api/inventory/adjust (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Stock Transfer Screen** 🟡
  - Chuyển kho
  - **Yêu cầu:**
    - Component StockTransferScreen
    - Select source warehouse
    - Select destination warehouse
    - Select product
    - Enter quantity
    - Submit
  - **Backend:** POST /api/inventory/transfer (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Stock Forecast** 🟢
  - Dự báo tồn kho
  - **Yêu cầu:**
    - Component StockForecastScreen
    - Product selector
    - Forecast chart
    - Reorder recommendations
  - **Backend:** GET /api/inventory/forecast (đã có)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## ⚙️ Giai Đoạn 8: Cài Đặt & Tài Khoản

### Settings Tab

- [ ] **Profile Screen** 🔴
  - Thông tin profile
  - Đổi mật khẩu
  - **Yêu cầu:**
    - Component ProfileScreen
    - Display user info
    - Edit profile modal
    - Change password form
  - **Backend:** POST /api/settings (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **App Settings Screen** 🟡
  - Cài đặt app
  - Theme (light/dark)
  - Language
  - Notifications
  - **Yêu cầu:**
    - Component AppSettingsScreen
    - Theme toggle
    - Language selector
    - Notification preferences
  - **Backend:** Local storage / GET/POST /api/settings
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Staff Management Screen** 🟡
  - Quản lý nhân viên
  - **Yêu cầu:**
    - Component StaffManagementScreen
    - List staff members
    - Add staff modal
    - Edit staff modal
    - Reset password
  - **Backend:** GET /api/employees, POST /api/employees, PUT /api/employees/:id (đã có)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **About Screen** 🟢
  - Thông tin app
  - Version
  - Links
  - **Yêu cầu:**
    - Component AboutScreen
    - App version
    - License info
    - Support links
  - **Backend:** Không cần
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## 🔔 Giai Đoạn 9: Notifications

### Push Notifications

- [ ] **Setup Push Notifications** 🟡
  - Firebase Cloud Messaging
  - Local notifications
  - **Yêu cầu:**
    - Cài đặt @react-native-firebase/app, @react-native-firebase/messaging
    - Cấu hình Firebase project
    - Request permission
    - Register device token
  - **Backend:**
    - Collection device_tokens (userId, token, platform)
    - Endpoint POST /api/notifications/register-token
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Order Status Notifications** 🔴
  - Thông báo khi đơn hàng mới
  - Thông báo khi trạng thái thay đổi
  - **Yêu cầu:**
    - Backend trigger notification khi order created/updated
    - Mobile receive và display notification
  - **Backend:**
    - FCM send logic trong OrderHandler
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Low Stock Alerts** 🔴
  - Thông báo tồn kho thấp
  - **Yêu cầu:**
    - Backend check stock levels
    - Send notification khi stock < threshold
  - **Backend:**
    - Cron job check stock
    - FCM send logic
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Notification Center** 🟡
  - List thông báo
  - Mark as read
  - **Yêu cầu:**
    - Component NotificationsScreen
    - List notifications
    - Mark as read action
    - Delete action
  - **Backend:**
    - Collection notifications (id, userId, title, body, type, readAt)
    - Endpoint GET /api/notifications
    - Endpoint PUT /api/notifications/:id/read
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

---

## 🔐 Giai Đoạn 10: Bảo Mật & Offline

### Security

- [ ] **Biometric Auth** 🟡
  - Fingerprint/Face ID
  - **Yêu cầu:**
    - Tích hợp react-native-biometrics
    - Option trong Settings
    - Biometric prompt on login
  - **Backend:** Không cần (local auth)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **App Lock** 🟡
  - Khóa app khi background
  - PIN code
  - **Yêu cầu:**
    - Detect app state change (AppState)
    - Show PIN screen when returning to app
    - PIN setup in Settings
  - **Backend:** Không cần (local auth)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Session Timeout** 🔴
  - Auto logout sau thời gian không hoạt động
  - **Yêu cầu:**
    - Track user activity
    - Show timeout warning modal
    - Auto logout after inactivity
  - **Backend:** JWT token expiration (đã có)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

### Offline Support

- [ ] **Offline Cache** 🟢
  - Cache dữ liệu thường dùng
  - **Yêu cầu:**
    - AsyncStorage cache cho dashboard stats
    - Cache orders/products khi online
    - Show cached data khi offline
    - Sync khi online
  - **Backend:** Không cần (client-side cache)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Offline Actions Queue** 🟢
  - Queue actions khi offline
  - Sync khi online
  - **Yêu cầu:**
    - Queue POST/PUT requests khi offline
    - Sync queue khi connection restored
    - Show sync status indicator
  - **Backend:** Không cần (client-side queue)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## 🚀 Giai Đoạn 11: Build & Release

### Build

- [ ] **Android Build Setup** 🔴
  - Cấu hình build Android
  - Keystore signing
  - **Yêu cầu:**
    - Cấu hình android/app/build.gradle
    - Generate keystore
    - Cấu hình signing configs
    - Build APK/AAB
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **App Icons & Splash** 🟡
  - App icon
  - Splash screen
  - **Yêu cầu:**
    - Design app icon
    - Generate icon sizes
    - Design splash screen
    - Cấu hình android/app/src/main/res
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **App Permissions** 🟡
  - Cấu hình permissions
  - **Yêu cầu:**
    - android/app/src/main/AndroidManifest.xml
    - Internet, Camera (barcode), Storage (file upload)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

### Release

- [ ] **Google Play Setup** 🔴
  - Tạo Google Play Console account
  - Upload app
  - **Yêu cầu:**
    - Tạo app trong Google Play Console
    - Upload AAB file
    - Fill store listing info
    - Submit for review
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Version Management** 🟡
  - Semantic versioning
  - Changelog
  - **Yêu cầu:**
    - Cấu hình version trong package.json
    - Generate changelog cho mỗi release
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Crash Reporting** 🟡
  - Sentry / Firebase Crashlytics
  - **Yêu cầu:**
    - Tích hợp Sentry hoặc Firebase Crashlytics
    - Track crashes in production
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Analytics** 🟢
  - User analytics
  - Usage tracking
  - **Yêu cầu:**
    - Tích hợp Firebase Analytics
    - Track screen views
    - Track key actions
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## 📅 Timeline Ước Tính

| Giai Đoạn | Thời Gian Ước Tính | Ưu Tiên |
|---|---|---|
| Giai Đoạn 1: Cơ Bản | 1-2 tuần | 🔴 Cao |
| Giai Đoạn 2: Dashboard | 1 tuần | 🔴 Cao |
| Giai Đoạn 3: Đơn Hàng | 2-3 tuần | 🔴 Cao |
| Giai Đoạn 4: Sản Phẩm | 2-3 tuần | 🔴 Cao |
| Giai Đoạn 5: Khách Hàng | 1-2 tuần | 🟡 Trung bình |
| Giai Đoạn 6: Tài Chính | 1-2 tuần | 🟡 Trung bình |
| Giai Đoạn 7: Kho | 1-2 tuần | 🟡 Trung bình |
| Giai Đoạn 8: Cài Đặt | 1 tuần | 🟡 Trung bình |
| Giai Đoạn 9: Notifications | 1-2 tuần | 🔴 Cao |
| Giai Đoạn 10: Bảo Mật | 1 tuần | 🟡 Trung bình |
| Giai Đoạn 11: Build & Release | 1-2 tuần | 🔴 Cao |

**Tổng thời gian ước tính:** 15-22 tuần (4-5 tháng)

---

## 📝 Ghi Chú

- **Code Sharing:** Tối đa share code với web project: types, API services, utils, formatters
- **UI Library:** Sử dụng React Native Paper hoặc Tamagui để tiết kiệm thời gian xây UI
- **Testing:** Viết unit tests cho critical components, E2E tests cho key flows
- **Performance:** Optimize FlatList, use memoization, lazy loading screens
- **Accessibility:** Support screen readers, proper touch target sizes (min 44px)
