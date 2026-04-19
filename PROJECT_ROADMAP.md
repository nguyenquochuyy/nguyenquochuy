# Lộ Trình Phát Triển Dự Án UniShop

## 📋 Tổng quan
Tài liệu này theo dõi tất cả các cải tiến planned, tính năng mới và cập nhật cho nền tảng thương mại điện tử UniShop.

**Chú thích:**
- ✅ Hoàn thành (Frontend + Backend + Database)
- 🚧 Đang thực hiện
- ⏳ Chờ xử lý
- 🔴 Ưu tiên cao
- 🟡 Ưu tiên trung bình
- 🟢 Ưu tiên thấp

**⚠️ QUAN TRỌNG: Từ bây giờ, khi làm bất kỳ tính năng nào PHẢI hoàn thành:**
- Frontend (React + TypeScript)
- Backend (Golang + Gin) với API endpoints đầy đủ
- Database (MongoDB) với models, indexes
- Tất cả phải được test và hoạt động hoàn chỉnh

---

## 🆕 Tính Năng Mới Cần Thêm

### Trải Nghiệm Khách Hàng

- [x] **Đánh Giá/Review Sản Phẩm** ✅
  - Cho phép khách đánh giá và review sản phẩm
  - Hiển thị đánh giá trung bình trên thẻ sản phẩm
  - Admin kiểm duyệt review
  - Backend: Golang endpoints (GET/POST/PUT /api/reviews)
  - Database: MongoDB Review model with full schema
  - Frontend: Review management trong ProductManager
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [ ] **So Sánh Sản Phẩm** 🟡
  - So sánh nhiều sản phẩm cạnh nhau
  - Highlight khác biệt về thông số và giá
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component so sánh sản phẩm (CompareProductModal)
    - UI hiển thị bảng so sánh
    - Nút "Thêm vào so sánh" trên thẻ sản phẩm
    - Sidebar hiển thị sản phẩm đang so sánh
  - **Backend:**
    - Endpoint GET /api/products/compare?ids=xxx,yyy (lấy thông tin so sánh)
  - **Database:**
    - Product model đã có đủ thông tin (price, stock, specs)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [x] **Tìm Kiếm Nâng Cao Với Bộ Lọc** ✅
  - Lọc theo khoảng giá, danh mục, đánh giá
  - Tìm kiếm theo SKU
  - Gợi ý tìm kiếm/tự động hoàn thành
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [ ] **Sản Phẩm Đã Xem Gần Đây** 🟡
  - Hiển thị sản phẩm đã xem gần đây (data model đã có, cần UI)
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component RecentlyViewedProducts
    - UI hiển thị carousel sản phẩm đã xem
    - Lưu vào localStorage khi xem sản phẩm
  - **Backend:**
    - Endpoint POST /api/products/{id}/viewed (track view)
  - **Database:**
    - Collection viewed_products (userId, productId, viewedAt)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Sản Phẩm Đề Xuất** 🟡
  - Gợi ý sản phẩm dựa trên AI
  - Phần "Khách cũng mua"
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ProductRecommendations
    - UI hiển thị gợi ý sản phẩm
    - Section "Khách cũng mua" trong trang chi tiết
  - **Backend:**
    - Endpoint GET /api/products/recommendations/{productId}
    - Algorithm: products in same category, frequently bought together
  - **Database:**
    - Collection product_recommendations (productId, recommendedIds)
    - Analytics: order_items aggregation for "frequently bought together"
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **UI Chọn Kích Thước/Màu Sắc** 🟡
  - UI tốt hơn cho chọn biến thể
  - Swatch màu trực quan
  - Chọn kích thước với chỉ báo tồn kho
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component VariantSelector với swatch màu
    - UI hiển thị chỉ báo tồn kho cho từng biến thể
    - Highlight biến thể đã chọn
  - **Backend:**
    - Endpoint GET /api/products/{id}/variants/stock (check stock per variant)
  - **Database:**
    - Product.variants array đã có stock field
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Hỗ Trợ Chat Trực Tuyến** 🟢
  - Chat thời gian thực với hỗ trợ
  - Tích hợp widget chat
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ChatWidget (floating button)
    - Chat UI với message bubbles
    - WebSocket integration cho real-time
  - **Backend:**
    - WebSocket endpoint /ws/chat
    - REST API POST /api/chat/messages (send message)
    - Handler ChatMessage
  - **Database:**
    - Collection chat_messages (id, userId, message, sender, createdAt)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Phần Câu Hỏi Thường Gặp** 🟢
  - Trang FAQ với danh mục
  - Tìm kiếm trong FAQs
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Page FAQPage với accordion UI
    - Search component cho FAQs
    - Category filter
  - **Backend:**
    - Endpoint GET /api/faqs (list FAQs)
    - Endpoint POST /api/faqs (admin create)
    - Handler FaqHandler
  - **Database:**
    - Collection faqs (id, question, answer, category, isActive)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

- [x] **Trang Theo Dõi Đơn Hàng** ✅
  - Theo dõi đơn hàng cho khách hàng
  - Timeline trạng thái đơn hàng
  - Cập nhật vận chuyển
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

### Marketing & Bán Hàng

- [ ] **Flash Sale/Deals** 🟡
  - Giảm giá giới hạn thời gian
  - Đồng hồ đếm ngược
  - Phần deals đặc biệt
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component FlashSaleBanner với countdown timer
    - Section "Deals Đặc Biệt" trên trang chủ
    - Hiển thị giá gốc và giá sale
  - **Backend:**
    - Endpoint GET /api/flash-sales (active flash sales)
    - Handler FlashSaleHandler
  - **Database:**
    - Collection flash_sales (id, productIds, discountPercent, startTime, endTime)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Combo Sản Phẩm** 🟡
  - Tạo combo sản phẩm
  - Giá combo
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ComboCard hiển thị combo
    - Admin UI tạo combo (select products, set price)
    - Hiển thị tiết kiệm khi mua combo
  - **Backend:**
    - Endpoint POST /api/combos (create combo)
    - Endpoint GET /api/combos (list combos)
    - Handler ComboHandler
  - **Database:**
    - Collection combos (id, name, productIds, comboPrice, originalPrice)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Cross-sell/Upsell** 🟡
  - Gợi ý sản phẩm liên quan
  - "Thường mua cùng nhau"
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component RelatedProducts trong trang chi tiết
    - Section "Thường mua cùng nhau" trong cart
    - Upsell modal khi checkout
  - **Backend:**
    - Endpoint GET /api/products/{id}/related (cross-sell recommendations)
    - Algorithm: analytics từ order_items
  - **Database:**
    - Analytics aggregation từ orders collection
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Đăng Ký Nhận Tin** 🟡
  - Form đăng ký email
  - Tích hợp email marketing
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component NewsletterForm ở footer
    - Modal đăng ký email
    - Confirmation message
  - **Backend:**
    - Endpoint POST /api/newsletter (subscribe)
    - Handler NewsletterHandler
  - **Database:**
    - Collection newsletter_subscribers (id, email, subscribedAt, isActive)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Chia Sẻ Mạng Xã Hội** 🟢
  - Chia sẻ sản phẩm lên mạng xã hội
  - Nút mạng xã hội
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component SocialShareButtons (Facebook, Twitter, Zalo)
    - Nút chia sẻ trên trang sản phẩm
    - OpenGraph meta tags
  - **Backend:**
    - Không cần API mới (client-side share)
  - **Database:**
    - Collection social_shares (track share analytics)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Chương Trình Giới Thiệu** 🟢
  - Mời bạn bè nhận thưởng
  - Theo dõi giới thiệu
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ReferralProgram
    - UI hiển thị referral link
    - Track referral rewards
  - **Backend:**
    - Endpoint POST /api/referrals (track referral)
    - Endpoint GET /api/customers/{id}/referrals (list referrals)
    - Handler ReferralHandler
  - **Database:**
    - Collection referrals (id, referrerId, referredId, rewardAmount, status)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Đổi Điểm Thưởng** 🟡
  - Đổi điểm khi thanh toán
  - Danh mục điểm
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component LoyaltyPoints trong checkout
    - UI hiển thị điểm có thể dùng
    - Toggle "Sử dụng điểm"
  - **Backend:**
    - Endpoint PUT /api/customers/{id}/points (update points)
    - Loyalty logic trong placeOrder
  - **Database:**
    - Customer.loyaltyPoints field đã có
    - Collection point_transactions (id, customerId, points, type, reason)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

### Quản Lý Đơn Hàng

- [ ] **Hành Động Hàng Loạt** 🔴
  - Xóa đơn hàng hàng loạt
  - Cập nhật trạng thái hàng loạt
  - Xuất hàng loạt
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Checkbox selection trong OrderManager table
    - Bulk action toolbar (delete, update status, export)
    - Confirmation modal cho bulk actions
  - **Backend:**
    - Endpoint POST /api/orders/bulk-delete
    - Endpoint POST /api/orders/bulk-update-status
    - Handler OrderHandler.BulkActions
  - **Database:**
    - Orders collection (bulk delete/update operations)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Xuất Đơn Hàng (CSV/PDF)** 🔴
  - Xuất đơn hàng ra CSV
  - Tạo hóa đơn PDF
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ExportOrdersModal
    - Export button trong OrderManager
    - PDF generation với jspdf/react-pdf
  - **Backend:**
    - Endpoint GET /api/orders/export/csv
    - Endpoint GET /api/orders/{id}/invoice/pdf
    - Handler OrderHandler.Export
  - **Database:**
    - Orders collection (query for export)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Hệ Thống Trả Hàng/Hoàn Tiền** 🟡
  - Form yêu cầu trả hàng
  - Xử lý hoàn tiền
  - Theo dõi trả hàng
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ReturnRequestForm (customer view)
    - Admin UI quản lý returns trong OrderManager
    - Track return status timeline
  - **Backend:**
    - Endpoint POST /api/returns (create return request)
    - Endpoint PUT /api/returns/{id}/status (update status)
    - Handler ReturnHandler
  - **Database:**
    - Collection returns (id, orderId, reason, status, refundAmount)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Hủy Đơn Hàng** 🔴
  - Cho phép khách hủy đơn hàng
  - Quy tắc hủy
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component CancelOrderModal (customer view)
    - Nút "Hủy đơn" trong OrderTracking
    - Validation rules (can only cancel PENDING orders)
  - **Backend:**
    - Endpoint POST /api/orders/{id}/cancel
    - Handler OrderHandler.Cancel (validate status, update to CANCELLED)
  - **Database:**
    - Orders collection (status field update)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Tạo Nhãn Vận Đơn** 🟡
  - Tạo nhãn vận đơn
  - In nhãn
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ShippingLabelModal
    - Print button trong OrderDetailModal
    - Generate label với barcode/QR
  - **Backend:**
    - Endpoint GET /api/orders/{id}/shipping-label
    - Integration với shipping API (GHTK, GHN)
  - **Database:**
    - Orders.shippingTracking field
    - Collection shipping_labels (id, orderId, carrier, trackingNumber)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Thông Báo Email** 🔴
  - Email thay đổi trạng thái đơn hàng
  - Email giỏ hàng bỏ quên
  - Xác nhận vận chuyển
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Email templates (HTML)
    - Settings UI cho email configuration
  - **Backend:**
    - Email service (SMTP integration)
    - Queue system cho sending emails
    - Trigger emails on order status change
  - **Database:**
    - Collection email_queue (id, to, subject, body, status, sentAt)
    - Collection email_logs (track sent emails)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

### Quản Lý Kho

- [ ] **Cảnh Báo Tồn Kho Thấp** 🔴
  - Cảnh báo email khi tồn kho thấp
  - Cảnh báo SMS
  - Thông báo dashboard
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Dashboard widget hiển thị sản phẩm tồn kho thấp
    - Notification bell với alerts
    - Settings UI cho stock threshold
  - **Backend:**
    - Cron job check stock levels hourly
    - Email/SMS service cho alerts
    - Endpoint GET /api/inventory/low-stock-alerts
  - **Database:**
    - Collection stock_alerts (id, productId, threshold, currentStock, alertedAt)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Điểm Đặt Hàng Tự Động** 🟡
  - Đặt ngưỡng đặt hàng lại
  - Tự động tạo đơn đặt hàng
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - UI set reorder threshold trong ProductForm
    - Dashboard hiển thị cần đặt hàng lại
    - Modal confirm auto-generated purchase orders
  - **Backend:**
    - Cron job check stock vs threshold
    - Endpoint POST /api/purchase-orders (auto create)
    - Handler PurchaseOrderHandler
  - **Database:**
    - Collection purchase_orders (id, supplierId, items, status, createdAt)
    - Product.reorderThreshold field
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Quản Lý Nhà Cung Cấp** 🟡
  - Thêm/sửa nhà cung cấp
  - Danh mục nhà cung cấp
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component SupplierManager trong InventoryManager
    - CRUD UI cho suppliers
    - Link suppliers với products
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/suppliers
    - Handler SupplierHandler
  - **Database:**
    - Collection suppliers (id, name, contact, email, phone, address)
    - Product.supplierId field
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Lịch Sử Di Chuyển Kho** 🟡
  - Theo dõi tất cả di chuyển kho
  - Audit trail
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component StockMovementHistory trong InventoryManager
    - Table hiển thị lịch sử di chuyển
    - Filter theo ngày, loại, sản phẩm
  - **Backend:**
    - Endpoint GET /api/inventory/movements
    - Handler InventoryHandler.MovementHistory
  - **Database:**
    - Collection inventory_movements đã có (track all stock changes)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Mã Vạch/QR Code** 🟢
  - Tạo QR code cho sản phẩm
  - Quét mã vạch
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component QRCodeGenerator trong ProductForm
    - Display QR code trên product detail
    - Barcode scanner UI (mobile)
  - **Backend:**
    - Endpoint GET /api/products/{id}/qr-code
    - QR code generation library
  - **Database:**
    - Product.barcode field
    - Product.qrCode field
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

### Phân Tích & Báo Cáo

- [ ] **Báo Cáo Bán Hàng** 🔴
  - Bán hàng ngày/tuần/tháng
  - Doanh thu theo danh mục
  - Sản phẩm bán chạy
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component SalesReport với charts (Chart.js/Recharts)
    - Date range picker
    - Export CSV/Excel
  - **Backend:**
    - Endpoint GET /api/reports/sales (with date range filter)
    - Aggregation pipeline cho sales analytics
    - Handler ReportHandler
  - **Database:**
    - Orders collection aggregation (group by date, category)
    - Collection daily_sales_stats (pre-calculated stats)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Hiệu Suất Sản Phẩm** 🟡
  - Phân tích sản phẩm
  - Tỷ lệ chuyển đổi
  - Tỷ lệ xem-mua
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ProductPerformanceReport
    - Table với metrics (views, add-to-cart, purchases, conversion rate)
    - Filter theo danh mục, thời gian
  - **Backend:**
    - Endpoint GET /api/reports/products/performance
    - Aggregation pipeline cho product metrics
  - **Database:**
    - Collection product_analytics (productId, views, addToCart, purchases)
    - Analytics từ viewed_products, orders
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Phân Tích Khách Hàng** 🟡
  - Phân tích hành vi khách hàng
  - Giá trị vòng đời khách hàng
  - Mẫu mua hàng
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component CustomerAnalyticsReport
    - RFM analysis visualization
    - Customer segments dashboard
  - **Backend:**
    - Endpoint GET /api/reports/customers/analytics
    - RFM calculation logic
  - **Database:**
    - Customers collection aggregation
    - Collection customer_segments (id, customerId, segment, score)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Dự Báo Doanh Thu** 🟢
  - Dự báo doanh thu tương lai
  - Phân tích xu hướng
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component RevenueForecast với trend line
    - Chart hiển thị historical vs forecasted
  - **Backend:**
    - Endpoint GET /api/reports/forecast/revenue
    - Time series forecasting algorithm (simple moving average)
  - **Database:**
    - Collection daily_sales_stats (historical data)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Xuất Báo Cáo** 🟡
  - Xuất ra CSV/Excel
  - Tạo báo cáo tùy chỉnh
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Export button trên tất cả report components
    - Custom report builder UI
  - **Backend:**
    - Endpoint GET /api/reports/export (CSV/Excel)
    - Report template system
  - **Database:**
    - Collection report_templates (id, name, query, columns)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

### Cải Tiện Admin

- [ ] **Nhập/Xuất Sản Phẩm CSV** 🔴
  - Nhập sản phẩm hàng loạt
  - Xuất sản phẩm hàng loạt
  - Validate CSV
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ImportCSVModal với file upload
    - Component ExportCSVModal
    - CSV validation UI (show errors)
  - **Backend:**
    - Endpoint POST /api/products/import/csv
    - Endpoint GET /api/products/export/csv
    - Handler ProductHandler.Import/Export
  - **Database:**
    - Products collection (bulk insert/update)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Bộ Lọc Nâng Cao** 🟡
  - Bộ lọc đa trường
  - Lưu preset bộ lọc
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - AdvancedFilter component trong các Manager pages
    - UI tạo/save/load filter presets
    - LocalStorage cho filter presets
  - **Backend:**
    - Enhanced query parameters cho list endpoints
  - **Database:**
    - Query optimization với indexes
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Nhật Ký Hoạt Động** 🟡
  - Theo dõi hành động admin
  - Audit trail
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ActivityLogViewer trong SettingsManager
    - Table hiển thị logs với filter
  - **Backend:**
    - Middleware log tất cả admin actions
    - Endpoint GET /api/activity-logs
    - Handler ActivityLogHandler
  - **Database:**
    - Collection activity_logs đã có (track admin actions)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Phân Quy Theo Vai Trò** 🔴
  - Quyền chi tiết theo vai trò
  - UI quản lý quyền
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component RolePermissionMatrix trong SettingsManager
    - UI checkbox grid cho permissions
    - Middleware check permissions per route
  - **Backend:**
    - RBAC middleware
    - Endpoint POST/PUT/DELETE /api/roles
    - Handler RoleHandler
  - **Database:**
    - Collection roles (id, name, permissions[])
    - Collection permissions (id, resource, action, description)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Audit Trail** 🟡
  - Theo dõi tất cả thay đổi dữ liệu
  - Lịch sử thay đổi
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component AuditTrailViewer
    - UI hiển thị diff của các phiên bản
  - **Backend:**
    - Middleware track data changes
    - Endpoint GET /api/audit-trail/{resource}/{id}
  - **Database:**
    - Collection audit_trail (id, resource, resourceId, changes, userId, createdAt)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Upload Ảnh Hàng Loạt** 🟡
  - Upload nhiều ảnh cùng lúc
  - Thư viện ảnh
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component BulkImageUploader
    - Drag & drop multiple files
    - Image gallery library selection
  - **Backend:**
    - Endpoint POST /api/images/upload-bulk
    - Image processing (resize, compress)
  - **Database:**
    - Collection images (id, url, alt, productId, order)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

---

## 🔄 Cập Nhật & Cải Tiện

### Bảo Mật

- [ ] **Xác Thực 2 Lớp (2FA)** 🔴
  - Admin 2FA với app xác thực
  - Tùy chọn SMS 2FA
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component TwoFactorSetupModal
    - QR code cho TOTP apps
    - SMS verification UI
  - **Backend:**
    - TOTP library (time-based one-time password)
    - SMS service integration
    - Middleware verify 2FA token
  - **Database:**
    - Employees.twoFactorSecret field
    - Employees.twoFactorEnabled field
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Hết Phiên Tự Động** 🔴
  - Tự động đăng xuất sau khi không hoạt động
  - Timeout có thể cấu hình
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Session timeout warning modal
    - Auto-logout countdown
    - Activity tracker (mouse, keyboard)
  - **Backend:**
    - JWT token expiration
    - Refresh token mechanism
    - Session middleware check last activity
  - **Database:**
    - Collection sessions (id, userId, lastActivity, expiresAt)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Giám Sát Hoạt Động** 🟡
  - Theo dõi phiên người dùng
  - Cảnh báo hoạt động đáng ngờ
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component SessionMonitor trong SettingsManager
    - UI hiển thị active sessions
    - Force logout button
  - **Backend:**
    - Endpoint GET /api/sessions (list active)
    - Endpoint DELETE /api/sessions/{id} (revoke)
    - Handler SessionHandler
  - **Database:**
    - Collection sessions (id, userId, ip, device, browser, lastActivity)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Kiểm Tra Độ Mạnh Mật Khẩu** 🟡
  - Kiểm tra độ mạnh mật khẩu thời gian thực
  - Yêu cầu mật khẩu
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Password strength meter component
    - Real-time validation feedback
    - Password policy UI display
  - **Backend:**
    - Password validation middleware
    - Complexity rules enforcement
  - **Database:**
    - Collection password_policies (id, minLength, requireUppercase, requireNumbers)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Giới Hạn Tỷ Lệ** 🔴
  - Giới hạn tỷ lệ API
  - Bảo vệ DDoS
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Rate limit exceeded UI (429 error page)
    - Retry countdown timer
  - **Backend:**
    - Rate limiting middleware (sliding window)
    - IP-based rate limiting
    - Redis/memcached cho rate limit storage
  - **Database:**
    - Collection rate_limits (id, ip, endpoint, count, windowStart)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

### Tích Hợp Thanh Toán

- [ ] **Nhiều Cổng Thanh Toán** 🔴
  - Tích hợp Stripe
  - Tích hợp PayPal
  - Tích hợp API MoMo
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Payment method selector trong checkout
    - Stripe Elements integration
    - PayPal button integration
  - **Backend:**
    - Stripe SDK integration
    - PayPal SDK integration
    - MoMo API integration
    - PaymentHandler cho mỗi gateway
  - **Database:**
    - Collection payments (id, orderId, gateway, transactionId, status, amount)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Lịch Sử Thanh Toán** 🟡
  - Lịch sử thanh toán khách hàng
  - Nhật ký giao dịch
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component PaymentHistory trong CustomerManager
    - Table hiển thị transactions
    - Payment status badges
  - **Backend:**
    - Endpoint GET /api/payments/history
    - Endpoint GET /api/customers/{id}/payments
  - **Database:**
    - Collection payments (query by customer)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Xử Lý Hoàn Tiền** 🟡
  - Xử lý hoàn tiền
  - Hoàn tiền một phần
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component RefundModal trong OrderManager
    - UI select refund amount (full/partial)
    - Refund reason form
  - **Backend:**
    - Endpoint POST /api/payments/{id}/refund
    - Integration với payment gateway refund API
  - **Database:**
    - Collection refunds đã có (track refund status)
    - Collection payments (refundId field)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Tạo Hóa Đơn** 🟡
  - Tạo hóa đơn PDF
  - Email hóa đơn
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component InvoiceModal
    - PDF generation với jspdf
    - Download/print invoice
  - **Backend:**
    - Endpoint GET /api/orders/{id}/invoice
    - Email service send invoice
  - **Database:**
    - Collection invoices (id, orderId, pdfUrl, sentAt)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Webhook Trạng Thái Thanh Toán** 🔴
  - Xử lý webhook
  - Đồng bộ trạng thái thanh toán
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Không cần (webhook là backend)
  - **Backend:**
    - Endpoint POST /api/webhooks/payment/{gateway}
    - Signature verification
    - Async processing queue
  - **Database:**
    - Collection webhook_logs (id, gateway, payload, processedAt, status)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

### Tối Ưu Mobile

- [ ] **Hỗ Trợ PWA** 🟡
  - Service worker
  - Hỗ trợ offline
  - Cài đặt như app
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Service worker registration
    - manifest.json cho PWA
    - Offline fallback pages
  - **Backend:**
    - Không cần (PWA là frontend)
  - **Database:**
    - LocalStorage/IndexedDB cho offline cache
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Checkout Tối Ưu Mobile** 🔴
  - Flow checkout mobile tốt hơn
  - Form thân thiện với cảm ứng
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Mobile-first checkout layout
    - Touch-friendly form inputs
    - Bottom sheet cho payment method selection
  - **Backend:**
    - Không cần (mobile optimization là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **UI Thân Thiện Với Cảm Ứng** 🟡
  - Mục tiêu chạm lớn hơn
  - Cử chỉ vuốt
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Touch-friendly button sizes (min 44px)
    - Swipe gestures cho navigation
    - Haptic feedback integration
  - **Backend:**
    - Không cần (touch UI là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Chế Độ Offline** 🟢
  - Xem sản phẩm offline
  - Đồng bộ khi online
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Service worker cache strategy
    - IndexedDB cho offline data storage
    - Sync queue cho pending actions
  - **Backend:**
    - Endpoint POST /api/sync (receive offline changes)
    - Conflict resolution logic
  - **Database:**
    - IndexedDB (client-side)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

### Hiệu Suất

- [ ] **Tối Ưu Hình Ảnh** 🔴
  - Lazy loading hình ảnh
  - Định dạng WebP
  - Nén hình ảnh
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Image lazy loading (Intersection Observer)
    - WebP format support
    - Image optimization component
  - **Backend:**
    - Image upload processing (resize, compress)
    - CDN integration
  - **Database:**
    - Không cần (images stored in CDN)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Lazy Loading** 🔴
  - Code splitting
  - Lazy loading theo route
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - React.lazy() cho route-based code splitting
    - Suspense boundaries
    - Component lazy loading
  - **Backend:**
    - Không cần (code splitting là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Tích Hợp CDN** 🟡
  - CloudFront/Cloudflare
  - CDN tài sản
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - CDN URL configuration
    - Static assets served from CDN
  - **Backend:**
    - Image upload to CDN
    - CDN integration for API responses cache
  - **Database:**
    - Không cần (CDN là infrastructure)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Chiến Lược Cache** 🔴
  - Cache Redis
  - Cache trình duyệt
  - Cache API
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Browser cache headers
    - Service worker cache API responses
  - **Backend:**
    - Redis integration cho cache
    - Cache middleware cho API responses
  - **Database:**
    - Redis (in-memory cache)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

### Cải Tiện UX

- [ ] **Loading Skeletons** 🟡
  - Màn hình skeleton
  - Trạng thái loading tốt hơn
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - SkeletonScreen component
    - Shimmer effect animation
    - Replace loading spinners with skeletons
  - **Backend:**
    - Không cần (skeleton là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Error Boundaries** 🔴
  - Xử lý lỗi nhẹ nhàng
  - Trang lỗi
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - ErrorBoundary component wrapper
    - Error fallback UI
    - Error reporting UI
  - **Backend:**
    - Error logging middleware
    - Sentry integration
  - **Database:**
    - Collection error_logs (id, error, stackTrace, userId, createdAt)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Toast Notifications** 🟡
  - Toast thành công/lỗi
  - Hàng đợi thông báo
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Toast component với queue system
    - Success/error/info variants
    - Auto-dismiss with timer
  - **Backend:**
    - Không cần (toast là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Validate Form** 🟡
  - Validate thời gian thực
  - Thông báo lỗi tốt hơn
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - React Hook Form integration
    - Zod validation schema
    - Real-time error messages
  - **Backend:**
    - Request validation middleware
    - Structured error responses
  - **Database:**
    - Không cần
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Khả Năng Truy Cập (a11y)** 🟢
  - Nhãn ARIA
  - Điều hướng bàn phím
  - Hỗ trợ screen reader
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - ARIA labels cho interactive elements
    - Keyboard navigation support
    - Screen reader compatibility
  - **Backend:**
    - Không cần (a11y là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## 🔧 Cải Tiện Kỹ Thuật

### Backend

- [ ] **Tài Liệu API** 🟡
  - Tài liệu Swagger/OpenAPI
  - Tham khảo API
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Swagger UI integration
    - API documentation page
  - **Backend:**
    - Swagger annotations trong handlers
    - OpenAPI spec generation
  - **Database:**
    - Không cần
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Migration Database** 🔴
  - Hệ thống migration
  - Kiểm soát phiên bản
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Không cần (migration là backend)
  - **Backend:**
    - Migration system (migrate/migrate)
    - Version control cho database schema
  - **Database:**
    - Collection migrations (id, version, appliedAt)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Unit Tests** 🔴
  - Unit tests backend
  - Độ phủ test
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Không cần (unit tests là backend)
  - **Backend:**
    - Go testing framework
    - Mock MongoDB cho tests
    - CI integration cho tests
  - **Database:**
    - Test database (MongoDB in-memory)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Integration Tests** 🟡
  - Tests tích hợp API
  - Tests E2E
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Playwright/Cypress cho E2E tests
  - **Backend:**
    - Integration tests với real API
    - Test containers cho dependencies
  - **Database:**
    - Test database fixture setup
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Ghi Log Lỗi** 🔴
  - Logging có cấu trúc
  - Theo dõi lỗi (Sentry)
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Sentry SDK integration
    - Error tracking UI
  - **Backend:**
    - Structured logging (logrus/zap)
    - Sentry integration
  - **Database:**
    - Không cần (logs gửi đến Sentry)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

### Frontend

- [ ] **Quản Lý State** 🟡
  - Redux/Zustand
  - Global state
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Zustand store setup
    - Global state management (cart, user, settings)
    - Persistence middleware
  - **Backend:**
    - Không cần (state management là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Thư Viện Form** 🟡
  - React Hook Form
  - Validate form
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - React Hook Form integration
    - Zod validation schemas
    - Form components library
  - **Backend:**
    - Không cần (form library là frontend)
  - **Database:**
    - Không cần
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Testing** 🔴
  - Cài đặt Jest
  - React Testing Library
  - Tests component
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Jest + React Testing Library setup
    - Component unit tests
    - Integration tests cho hooks
  - **Backend:**
    - Không cần (frontend tests)
  - **Database:**
    - Không cần
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Pipeline CI/CD** 🔴
  - GitHub Actions
  - Testing tự động
  - Tự động triển khai
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - GitHub Actions workflow cho frontend
    - Build & deploy to Vercel/Netlify
  - **Backend:**
    - GitHub Actions workflow cho backend
    - Build & deploy to server
  - **Database:**
    - Migration scripts trong CI/CD
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Hỗ Trợ Docker** 🟡
  - Dockerfile
  - Docker Compose
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Dockerfile cho frontend (nginx)
  - **Backend:**
    - Dockerfile cho backend
  - **Database:**
    - Docker Compose với MongoDB
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

### DevOps

- [ ] **Giám Sát** 🔴
  - Giám sát ứng dụng
  - Giám sát hiệu suất
  - Theo dõi uptime
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Performance monitoring (Web Vitals)
  - **Backend:**
    - Prometheus metrics
    - Grafana dashboard
  - **Database:**
    - MongoDB metrics exporter
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Analytics** 🟡
  - Google Analytics
  - Theo dõi hành vi người dùng
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Google Analytics integration
    - Event tracking cho user actions
  - **Backend:**
    - Không cần (analytics là frontend)
  - **Database:**
    - Không cần (data gửi đến GA)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Tối Ưu SEO** 🟡
  - Meta tags
  - Sitemap
  - Schema markup
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Meta tags component
    - OpenGraph tags
    - Structured data (JSON-LD)
  - **Backend:**
    - Endpoint GET /sitemap.xml
    - Endpoint GET /robots.txt
  - **Database:**
    - Không cần (sitemap generated from data)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Tạo Sitemap** 🟢
  - Sitemap động
  - Tự động cập nhật
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Không cần (sitemap là backend)
  - **Backend:**
    - Cron job generate sitemap daily
    - Endpoint GET /sitemap.xml
  - **Database:**
    - Query products, categories cho sitemap
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

---

## 📄 Kế Hoạch Nâng Cấp Chi Tiết Theo Trang Admin

### 1. AdminDashboard (Trang Dashboard)

**Trạng thái hiện tại:**
- Hiển thị thống kê tổng quan
- Lọc theo khoảng thời gian (7D, 30D, 90D)
- Sidebar với các menu điều hướng
- Top bar với thông tin user

**Kế hoạch nâng cấp:**
- [x] **Widget Tùy Chỉnh** ✅
  - Cho phép user show/hide widget
  - Tùy chỉnh widget hiển thị
  - Lưu cấu hình dashboard vào localStorage
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Real-time Updates** ✅
  - WebSocket cho cập nhật real-time
  - Live count đơn hàng mới
  - Live count khách hàng mới
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Export Dashboard** ✅
  - Xuất dashboard ra CSV (đã có)
  - Xuất dashboard ra PDF (dùng browser print)
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Advanced Filters** ✅
  - Filter theo nhiều điều kiện
  - Filter theo category và status
  - Reset filters
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Drill-down Reports** ✅
  - Click vào stat để xem chi tiết
  - Modal hiển thị dữ liệu chi tiết
  - Filter theo loại metric
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

### 2. ProductManager (Quản Lý Sản Phẩm) ✅ HOÀN CHỈNH

**Trạng thái hiện tại:**
- CRUD sản phẩm cơ bản ✅
- Upload ảnh ✅
- Biến thể sản phẩm ✅
- Tìm kiếm và lọc (backend + frontend) ✅
- Định dạng tiền tự động ✅
- SSE Real-time sync ✅
- Product History (MongoDB collection) ✅
- MongoDB indexes (id, category, sku, isVisible, price, stock, createdAt) ✅

**Kế hoạch nâng cấp:**
- [x] **Bulk Import/Export CSV** ✅
  - Import sản phẩm từ CSV
  - Export sản phẩm ra CSV
  - Template CSV chuẩn
  - Validate data trước khi import
  - Trạng thái: ✅ Hoàn thành

- [x] **Bulk Actions** ✅
  - Xóa nhiều sản phẩm: POST /api/products/bulk-delete
  - Cập nhật visibility hàng loạt: PUT /api/products/bulk-visibility
  - Cập nhật danh mục hàng loạt: PUT /api/products/bulk-category
  - Frontend gọi real API thay vì local state
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Product Cloning** ✅
  - Clone sản phẩm: POST /api/products/:id/clone
  - Clone với biến thể (new IDs, stock=0, hidden)
  - Backend xử lý hoàn toàn
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Advanced Search** ✅
  - GET /api/products?search=...&category=...&visible=...&lowStock=...&minPrice=...&maxPrice=...
  - Tìm kiếm theo name, SKU, description (regex)
  - Sort: sortBy, sortOrder
  - Pagination: limit, skip
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend)

- [x] **Image Gallery Enhanced** ✅
  - Drag & drop ảnh
  - Reorder ảnh
  - Trạng thái: ✅ Hoàn thành (Drag & Drop + Reorder)

- [x] **Product History** ✅
  - MongoDB productHistory collection
  - GET /api/products/:id/history + GET /api/products/history
  - Auto-track: price, stock, visibility, info changes
  - Sync từ backend state
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Product Reviews Management** ✅
  - Xem review sản phẩm
  - Phản hồi review
  - Ẩn/hiện review
  - Backend: Golang Review handler + endpoints
  - Database: MongoDB Review collection
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Full Backend Integration** ✅
  - SSE Broadcast cho tất cả CRUD operations
  - GET /api/products (search, filter, sort, pagination)
  - GET /api/products/:id
  - POST /api/products (auto-generate ID, timestamps)
  - PUT /api/products/:id (auto updatedAt, history tracking)
  - DELETE /api/products/:id (history recording)
  - PUT /api/products/:id/toggle-visibility
  - POST /api/products/:id/clone
  - POST /api/products/bulk-delete
  - PUT /api/products/bulk-visibility
  - PUT /api/products/bulk-category
  - GET /api/products/:id/history
  - GET /api/products/history
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

### 3. CategoryManager (Quản Lý Danh Mục) ✅ HOÀN CHỈNH

**Trạng thái hiện tại:**
- CRUD danh mục cơ bản ✅
- Drag & drop sắp xếp ✅
- Sub-danh mục ✅
- Icon cho danh mục ✅
- SSE Real-time sync ✅
- Search & Filter ✅
- Active/Inactive toggle ✅
- Description field ✅
- MongoDB indexes (id, parentId, order, isActive) ✅

**Kế hoạch nâng cấp:**
- [x] **Category Tree View** ✅
  - Hiển thị tree view
  - Collapse/expand
  - Drag & drop trong tree
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Category Images** ✅
  - Upload ảnh cho danh mục
  - Banner danh mục
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Category SEO** ✅
  - Meta title, description
  - URL slug
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Bulk Actions** ✅
  - Xóa nhiều danh mục (xóa cả danh mục con)
  - Reorder hàng loạt
  - **Frontend:** Checkbox selection, bulk action toolbar
  - **Backend:** POST /api/categories/bulk-delete, POST /api/categories/bulk-reorder
  - **Database:** Categories collection (bulk operations)
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Full Backend Integration** ✅
  - SSE Broadcast cho tất cả CRUD operations (real-time sync)
  - GET /api/categories (search, filter by active, parentId, sorted by order)
  - GET /api/categories/:id (get by ID)
  - POST /api/categories (auto-generate ID, timestamps)
  - PUT /api/categories/:id (auto updatedAt)
  - DELETE /api/categories/:id (cascade delete children)
  - PUT /api/categories/:id/toggle-active
  - GET /api/categories/:id/products (product count)
  - MongoDB indexes: id (unique), parentId, order, isActive
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Search & Filter** ✅
  - Tìm kiếm theo tên danh mục
  - Lọc theo trạng thái (Tất cả / Đang hoạt động / Đã ẩn)
  - Trạng thái: ✅ Hoàn thành

- [x] **Active/Inactive Status** ✅
  - Toggle active/inactive cho từng danh mục
  - Hiển thị trạng thái trong tree (badge "Ẩn", line-through)
  - Form toggle khi tạo/sửa
  - Trạng thái: ✅ Hoàn thành

- [x] **Category Description** ✅
  - Mô tả cho mỗi danh mục
  - Hiển thị trong tree và detail modal
  - Trạng thái: ✅ Hoàn thành

### 4. OrderManager (Quản Lý Đơn Hàng) ✅ HOÀN CHỈNH

**Trạng thái hiện tại:**
- CRUD đơn hàng cơ bản ✅
- Lọc theo trạng thái ✅
- Xem chi tiết đơn hàng ✅
- In đơn hàng ✅
- Update trạng thái ✅
- SSE Real-time sync ✅
- MongoDB indexes (id, status, paymentStatus, paymentMethod, createdAt, updatedAt, customerEmail, customerPhone, customerName) ✅

**Kế hoạch nâng cấp:**
- [x] **Bulk Actions** ✅
  - Cập nhật trạng thái hàng loạt: PUT /api/orders/bulk-status
  - Xóa đơn hàng hàng loạt: POST /api/orders/bulk-delete
  - Export đơn hàng hàng loạt
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Advanced Filtering** ✅
  - GET /api/orders?search=...&status=...&paymentStatus=...&paymentMethod=...&startDate=...&endDate=...&minTotal=...&maxTotal=...
  - Filter theo nhiều điều kiện
  - Filter theo date range
  - Filter theo khách hàng
  - Filter theo sản phẩm
  - Sort: sortBy, sortOrder
  - Pagination: limit, skip
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend)

- [x] **Order Export** ✅
  - Export ra CSV
  - Export ra PDF
  - Custom export template
  - Trạng thái: ✅ Hoàn thành

- [x] **Order Timeline** ✅
  - Timeline trạng thái đơn hàng
  - Auto-track khi status thay đổi
  - Track payment
  - Trạng thái: ✅ Hoàn thành

- [x] **Payment Tracking** ✅
  - Track payment status: PUT /api/orders/:id/payment-status
  - Track payment transaction ID
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Shipping Tracking** ✅
  - Update shipping tracking: PUT /api/orders/:id/tracking
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Refund/Return** ✅
  - Tạo yêu cầu hoàn tiền
  - Xử lý hoàn tiền
  - Track refund
  - Backend: Golang endpoints (GET/POST/PUT/DELETE /api/refunds)
  - Database: MongoDB Refund model with full schema
  - Frontend: Refund tab trong OrderManager
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Order Notes** ✅
  - Thêm note cho đơn hàng
  - Internal notes
  - Customer notes
  - Backend: Golang endpoint PUT /api/orders/:id/notes
  - Database: MongoDB Order model with internalNotes/customerNotes fields
  - Frontend: Inline edit trong OrderDetailModal
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Full Backend Integration** ✅
  - SSE Broadcast cho tất cả CRUD operations
  - GET /api/orders (search, filter, sort, pagination)
  - GET /api/orders/:id
  - POST /api/orders (auto-timeline, timestamps)
  - PUT /api/orders/:id/status (auto-timeline update)
  - PUT /api/orders/:id/payment-status
  - PUT /api/orders/:id/tracking
  - PUT /api/orders/:id/notes
  - DELETE /api/orders/:id
  - POST /api/orders/bulk-delete
  - PUT /api/orders/bulk-status
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Print Labels** ✅
  - In shipping label
  - In packing slip
  - In invoice
  - **Frontend:**
    - Component PrintLabelsModal (shipping/packing/invoice tabs)
    - Print button trong OrderDetailModal
    - PDF generation (window.print + styled print content)
  - **Backend:**
    - GET /api/orders/:id/labels/shipping
    - GET /api/orders/:id/labels/packing
    - GET /api/orders/:id/labels/invoice
  - **Database:**
    - Orders collection (query for label data)
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

### 5. CustomerManager (Quản Lý Khách Hàng)

**Trạng thái hiện tại:**
- CRUD khách hàng cơ bản
- Xem lịch sử đơn hàng
- Xem điểm tích lũy
- Lock/Unlock tài khoản
- Filter theo trạng thái

**Kế hoạch nâng cấp:**
- [x] **Customer Segmentation** ✅
  - Phân loại khách hàng
  - Tag khách hàng
  - Customer groups
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Customer Analytics** ✅
  - Phân tích hành vi mua hàng
  - RFM analysis
  - Lifetime value
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Email Marketing** ✅
  - Gửi email marketing
  - Email templates
  - Campaign tracking
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component EmailCampaignManager trong CustomerManager
    - Email template editor UI
    - Campaign stats dashboard
  - **Backend:**
    - Endpoint POST /api/email-campaigns (send campaign)
    - Email service integration (SendGrid/Mailgun)
    - Handler EmailCampaignHandler
  - **Database:**
    - Collection email_campaigns (id, name, subject, template, sentAt, stats)
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Customer Export** ✅
  - Export khách hàng ra CSV
  - Export khách hàng ra Excel
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Customer Notes** ✅
  - Thêm note cho khách hàng
  - Track interactions
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component CustomerNotesModal trong CustomerManager
    - Note history timeline
    - Add note form
  - **Backend:**
    - Endpoint POST /api/customers/{id}/notes
    - Endpoint GET /api/customers/{id}/notes
  - **Database:**
    - Collection customer_notes (id, customerId, note, userId, createdAt)
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Bulk Actions** ✅
  - Lock/Unlock hàng loạt
  - Tag hàng loạt
  - Send email hàng loạt
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Checkbox selection trong CustomerManager table
    - Bulk action toolbar (lock/unlock, tag, email)
  - **Backend:**
    - Endpoint POST /api/customers/bulk-lock
    - Endpoint POST /api/customers/bulk-tag
    - Endpoint POST /api/customers/bulk-email
  - **Database:**
    - Customers collection (bulk operations)
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

### 6. InventoryManager (Quản Lý Kho)

**Trạng thái hiện tại:**
- Xem tồn kho
- Điều chỉnh tồn kho
- Lịch sử thay đổi
- Filter theo sản phẩm
- Export CSV

**Kế hoạch nâng cấp:**
- [x] **Low Stock Alerts** ✅
  - Cảnh báo tồn kho thấp
  - Email alerts
  - SMS alerts
  - Dashboard notifications
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Stock Forecasting** ✅
  - Dự báo tồn kho
  - Dự báo nhu cầu
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component StockForecasting trong InventoryManager ✅
    - Chart hiển thị predicted vs actual stock (SVG area chart) ✅
    - Alert UI cho low stock predictions ✅
    - Tab "Dự Báo Tồn Kho" với badge số lượng cảnh báo ✅
  - **Backend:**
    - Endpoint GET /api/inventory/forecast (query: days, productId) ✅
    - Endpoint POST /api/inventory/daily-sales ✅
    - Forecasting algorithm (Moving Average 30 ngày) ✅
    - Tự động tính: avgDailySales, daysUntilEmpty, reorderPoint ✅
  - **Database:**
    - Collection daily_sales_stats (historical data) ✅
    - Collection stock_forecasts (id, productId, predictedStock, date) ✅
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành (Frontend + Backend + Database)

- [x] **Supplier Management** ✅
  - Thêm nhà cung cấp
  - Quản lý đơn đặt hàng
  - Track shipments
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component SupplierManager tab trong InventoryManager ✅
    - CRUD UI cho suppliers ✅
    - Purchase order management UI ✅
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/suppliers ✅
    - Endpoint POST /api/purchase-orders ✅
    - Handler SupplierHandler, PurchaseOrderHandler ✅
  - **Database:**
    - Collection suppliers (id, name, contact, email, phone, address) ✅
    - Collection purchase_orders (id, supplierId, items, status, createdAt) ✅
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Warehouse Management** ✅
  - Quản lý nhiều kho
  - Transfer giữa kho
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component WarehouseManager tab trong InventoryManager ✅
    - UI cho multiple warehouses ✅
    - Stock transfer modal ✅
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/warehouses ✅
    - Endpoint POST /api/inventory/transfer ✅
    - Handler WarehouseHandler ✅
  - **Database:**
    - Collection warehouses (id, name, address) ✅
    - Product.inventory array [{warehouseId, quantity}] ✅
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Stock Take** ✅
  - Kiểm kê kho
  - Discrepancy reports
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component StockTakeModal ✅
    - UI nhập số lượng thực tế ✅
    - Discrepancy report UI ✅
  - **Backend:**
    - Endpoint POST /api/inventory/stock-take ✅
    - Endpoint GET /api/inventory/discrepancies ✅
  - **Database:**
    - Collection stock_takes (id, productId, expected, actual, difference, date) ✅
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Barcode Scanner** ✅
  - Quét mã vạch
  - Mobile scanning
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component BarcodeScanner trong InventoryManager ✅
    - Camera integration cho mobile scanning (html5-qrcode) ✅
    - Barcode library integration ✅
  - **Backend:**
    - Endpoint GET /api/products/barcode/{code} ✅
  - **Database:**
    - Product.barcode field ✅
  - Ưu tiên: Thấp
  - Trạng thái: ✅ Hoàn thành

### 7. FinanceManager (Quản Lý Tài Chính)

**Trạng thái hiện tại:**
- Xem doanh thu
- Xem chi phí
- Xem lợi nhuận
- Thêm giao dịch
- Chart phân tích
- Export CSV

**Kế hoạch nâng cấp:**
- [ ] **Advanced Reports** 🔴
  - Báo cáo chi tiết hơn
  - Custom date range
  - Compare periods
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component AdvancedFinanceReport trong FinanceManager
    - Date range picker
    - Period comparison UI
    - Chart visualization
  - **Backend:**
    - Endpoint GET /api/finance/reports/advanced (with filters)
    - Aggregation pipeline cho financial analytics
  - **Database:**
    - Transactions collection aggregation
    - Collection financial_reports (pre-calculated)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Invoice Management** 🔴
  - Tạo hóa đơn
  - Gửi hóa đơn
  - Track payment
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component InvoiceManager tab trong FinanceManager
    - Invoice creation form
    - Invoice list with payment status
  - **Backend:**
    - Endpoint POST /api/invoices
    - Endpoint PUT /api/invoices/{id}/status
    - Handler InvoiceHandler
  - **Database:**
    - Collection invoices (id, orderId, customerId, amount, status, dueDate)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Expense Categories** 🟡
  - Quản lý danh mục chi phí
  - Budget tracking
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ExpenseCategoryManager trong FinanceManager
    - CRUD UI cho expense categories
    - Budget vs actual chart
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/expense-categories
    - Endpoint GET /api/expense-categories/budget-report
  - **Database:**
    - Collection expense_categories (id, name, budget, parentId)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Tax Management** 🟡
  - Quản lý thuế
  - Tax reports
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component TaxManager tab trong FinanceManager
    - Tax configuration UI
    - Tax report generation
  - **Backend:**
    - Endpoint POST/PUT /api/tax-settings
    - Endpoint GET /api/tax/reports
  - **Database:**
    - Collection tax_settings (id, rate, type, effectiveDate)
    - Collection tax_reports (id, period, totalTax, details)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Multi-currency** 🟢
  - Hỗ trợ nhiều loại tiền
  - Exchange rate
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Currency selector trong settings
    - Display prices in selected currency
    - Exchange rate UI
  - **Backend:**
    - Endpoint GET /api/currencies/rates
    - Endpoint PUT /api/currencies/rates (update)
    - Currency conversion logic
  - **Database:**
    - Collection currencies (id, code, symbol, rate, lastUpdated)
  - Ưu tiên: Thấp
  - Trạng thái: ⏳ Chờ xử lý

### 8. VoucherManager (Quản Lý Voucher)

**Trạng thái hiện tại:**
- CRUD voucher
- Filter theo trạng thái
- Xem usage stats
- Copy code
- Export CSV

**Kế hoạch nâng cấp:**
- [ ] **Voucher Analytics** 🔴
  - Track usage
  - Conversion rate
  - ROI tracking
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component VoucherAnalytics tab trong VoucherManager
    - Charts cho usage, conversion, ROI
    - Date range filter
  - **Backend:**
    - Endpoint GET /api/vouchers/analytics
    - Aggregation pipeline cho voucher metrics
  - **Database:**
    - Vouchers collection aggregation
    - Collection voucher_analytics (pre-calculated stats)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Advanced Rules** 🟡
  - Conditional rules
  - Stacking rules
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component AdvancedRulesBuilder trong VoucherForm
    - UI cho conditional logic builder
    - Stacking rules configuration
  - **Backend:**
    - Enhanced voucher validation logic
    - Rule engine cho complex conditions
  - **Database:**
    - Voucher.rules field (JSON structure)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Voucher Templates** 🟡
  - Template voucher
  - Quick create
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component VoucherTemplateManager trong VoucherManager
    - Template selection UI
    - Quick create from template
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/voucher-templates
    - Endpoint POST /api/vouchers/from-template
  - **Database:**
    - Collection voucher_templates (id, name, rules, discountType)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Bulk Actions** 🟡
  - Activate/Deactivate hàng loạt
  - Delete hàng loạt
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Checkbox selection trong VoucherManager table
    - Bulk action toolbar (activate, deactivate, delete)
  - **Backend:**
    - Endpoint POST /api/vouchers/bulk-activate
    - Endpoint POST /api/vouchers/bulk-deactivate
    - Endpoint POST /api/vouchers/bulk-delete
  - **Database:**
    - Vouchers collection (bulk operations)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

### 9. SettingsManager (Cài Đặt)

**Trạng thái hiện tại:**
- Cài đặt cửa hàng
- Cài đặt thanh toán
- Cài đặt vận chuyển
- Cài đặt email
- Cài đặt hệ thống

**Kế hoạch nâng cấp:**
- [ ] **Backup & Restore** 🔴
  - Backup data
  - Restore data
  - Schedule backup
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component BackupRestore trong SettingsManager
    - Backup list UI
    - Restore confirmation modal
  - **Backend:**
    - Endpoint POST /api/backup (create backup)
    - Endpoint POST /api/restore (restore from backup)
    - Cron job cho scheduled backups
  - **Database:**
    - MongoDB mongodump/mongorestore
    - Collection backups (id, filename, createdAt, size)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Role Management** 🔴
  - Quản lý vai trò chi tiết
  - Permission matrix
  - Custom roles
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component RoleManager trong SettingsManager
    - Permission matrix UI (checkbox grid)
    - Role creation/edit form
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/roles
    - RBAC middleware implementation
  - **Database:**
    - Collection roles (id, name, permissions[])
    - Collection permissions (id, resource, action, description)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Audit Logs** 🔴
  - Log tất cả hành động
  - Search logs
  - Export logs
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component AuditLogViewer trong SettingsManager
    - Log table với filter/search
    - Export CSV button
  - **Backend:**
    - Middleware log tất cả admin actions
    - Endpoint GET /api/audit-logs
  - **Database:**
    - Collection audit_logs đã có (track admin actions)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **API Keys** 🟡
  - Quản lý API keys
  - Generate/Revoke
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component APIKeyManager trong SettingsManager
    - Key list UI (masked keys)
    - Generate/Revoke buttons
  - **Backend:**
    - Endpoint POST /api/api-keys (generate)
    - Endpoint DELETE /api/api-keys/{id} (revoke)
    - JWT token generation
  - **Database:**
    - Collection api_keys (id, name, keyHash, permissions, createdAt, revokedAt)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Webhooks** 🟡
  - Configure webhooks
  - Test webhooks
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component WebhookManager trong SettingsManager
    - Webhook configuration UI (URL, events)
    - Test webhook button
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/webhooks
    - Endpoint POST /api/webhooks/{id}/test
    - Webhook delivery queue
  - **Database:**
    - Collection webhooks (id, url, events[], secret, isActive)
    - Collection webhook_deliveries (id, webhookId, payload, status, sentAt)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

### 10. StaffManager (Quản Lý Nhân Viên)

**Trạng thái hiện tại:**
- CRUD nhân viên
- Gán vai trò
- Reset password
- Filter theo vai trò
- Export CSV

**Kế hoạch nâng cấp:**
- [ ] **Shift Management** 🔴
  - Quản lý ca làm việc
  - Schedule
  - Time tracking
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component ShiftManager tab trong StaffManager
    - Schedule calendar UI
    - Time tracking UI
  - **Backend:**
    - Endpoint POST/PUT/DELETE /api/shifts
    - Endpoint GET /api/shifts/schedule
    - Handler ShiftHandler
  - **Database:**
    - Collection shifts (id, employeeId, startTime, endTime, status)
    - Collection time_entries (id, employeeId, checkIn, checkOut, shiftId)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Performance Tracking** 🔴
  - Track performance
  - KPI tracking
  - Reports
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component PerformanceTracker tab trong StaffManager
    - KPI dashboard với charts
    - Performance report UI
  - **Backend:**
    - Endpoint GET /api/staff/{id}/performance
    - Endpoint GET /api/staff/kpi-report
    - Aggregation pipeline cho performance metrics
  - **Database:**
    - Collection performance_metrics (id, employeeId, kpi, value, date)
    - Collection kpi_definitions (id, name, target, formula)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Permissions Matrix** 🔴
  - Matrix permissions chi tiết
  - Granular control
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component PermissionsMatrix trong StaffManager
    - UI assign permissions cho từng employee
    - Override role permissions
  - **Backend:**
    - Endpoint PUT /api/employees/{id}/permissions
    - RBAC middleware support employee-level permissions
  - **Database:**
    - Employees.permissions[] field (override role permissions)
  - Ưu tiên: Cao
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Staff Activity Logs** 🟡
  - Log hoạt động nhân viên
  - Track actions
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Component StaffActivityLog tab trong StaffManager
    - Activity log table với filter
    - Employee activity summary
  - **Backend:**
    - Endpoint GET /api/staff/{id}/activity-logs
    - Middleware log staff actions with employeeId
  - **Database:**
    - Collection audit_logs đã có (filter by employeeId)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

- [ ] **Bulk Actions** 🟡
  - Activate/Deactivate hàng loạt
  - Update role hàng loạt
  - **Yêu cầu khi làm:** Frontend + Backend (Golang) + Database (MongoDB)
  - **Frontend:**
    - Checkbox selection trong StaffManager table
    - Bulk action toolbar (activate, deactivate, update role)
  - **Backend:**
    - Endpoint POST /api/employees/bulk-activate
    - Endpoint POST /api/employees/bulk-deactivate
    - Endpoint POST /api/employees/bulk-update-role
  - **Database:**
    - Employees collection (bulk operations)
  - Ưu tiên: Trung bình
  - Trạng thái: ⏳ Chờ xử lý

---

## ✅ Các Item Đã Hoàn Thành

### Sửa Responsiveness
- [x] **Responsiveness ProductManager** ✅
  - Sửa toolbar max-w-md
  - Sửa pagination flex-col trên mobile
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Responsiveness InventoryManager** ✅
  - Thêm overflow-x-auto vào tables
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Responsiveness CustomerManager** ✅
  - Sửa toolbar max-w-md
  - Sửa layout grid stats cards
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Responsiveness OrderManager** ✅
  - Thêm overflow-x-auto vào table
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Responsiveness ProductDetails** ✅
  - Sửa grid-cols-2 thành grid-cols-1 sm:grid-cols-2
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Responsiveness CheckoutPage** ✅
  - Sửa grid-cols-3 thành grid-cols-1 sm:grid-cols-3
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

### Sửa Chiều Cao Modal
- [x] **Chiều cao modal ProductForm** ✅
  - Đổi h-[90vh] thành max-h-[90vh]
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Chiều cao SettingsManager** ✅
  - Đổi h-[calc(100vh-140px)] thành max-h-[calc(100vh-140px)]
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

### Định Dạng Tiền Tệ
- [x] **Định dạng tiền Việt Nam** ✅
  - Thêm dấu chấm cho hàng nghìn
  - Bỏ số 0 thừa ở cuối
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

- [x] **Format tự động input tiền** ✅
  - Thêm utility formatNumberInput
  - Thêm utility parseFormattedNumber
  - Update ProductForm price/costPrice/variant inputs
  - Ưu tiên: Cao
  - Trạng thái: ✅ Hoàn thành

### Dọn Dẹp Code
- [x] **Xóa dòng trống** ✅
  - Dọn dẹp format code
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Sửa lỗi TypeScript** ✅
  - Xóa key dịch trùng
  - Thêm key dịch còn thiếu
  - Ưu tiên: Trung bình
  - Trạng thái: ✅ Hoàn thành

- [x] **Xóa dòng trống ở đầu file** ✅
  - AdminApp.tsx
  - App.tsx
  - Ưu tiên: Thấp
  - Trạng thái: ✅ Hoàn thành

---

## 📊 Tóm Tắt Ưu Tiên

### 🔴 Ưu Tiên Cao (Làm Trước)
1. Đánh Giá/Review Sản Phẩm
2. Tìm Kiếm Nâng Cao Với Bộ Lọc
3. Hành Động Hàng Loạt Trong Admin
4. Xuất Đơn Hàng CSV/PDF
5. Thông Báo Email
6. 2FA Cho Admin
7. Nhiều Cổng Thanh Toán
8. Checkout Tối Ưu Mobile
9. Tối Ưu Hình Ảnh
10. Lazy Loading
11. Error Boundaries
12. Chiến Lược Cache
13. Giới Hạn Tỷ Lệ
14. Hủy Đơn Hàng
15. Trang Theo Dõi Đơn Hàng
16. Cảnh Báo Tồn Kho Thấp
17. Nhập/Xuất Sản Phẩm CSV
18. Phân Quy Theo Vai Trò
19. Unit Tests (Backend)
20. Testing (Frontend)
21. Pipeline CI/CD
22. Ghi Log Lỗi
23. Giám Sát
24. Webhook Trạng Thái Thanh Toán

### 🟡 Ưu Tiên Trung Bình (Làm Tiếp)
1. So Sánh Sản Phẩm
2. Sản Phẩm Đã Xem Gần Đây
3. Sản Phẩm Đề Xuất
4. UI Chọn Kích Thước/Màu Sắc
5. Flash Sale/Deals
6. Combo Sản Phẩm
7. Cross-sell/Upsell
8. Đăng Ký Nhận Tin
9. Đổi Điểm Thưởng
10. Hệ Thống Trả Hàng/Hoàn Tiền
11. Tạo Nhãn Vận Đơn
12. Điểm Đặt Hàng Tự Động
13. Quản Lý Nhà Cung Cấp
14. Lịch Sử Di Chuyển Kho
15. Báo Cáo Bán Hàng
16. Hiệu Suất Sản Phẩm
17. Phân Tích Khách Hàng
18. Xuất Báo Cáo
19. Bộ Lọc Nâng Cao
20. Nhật Ký Hoạt Động
21. Audit Trail
22. Upload Ảnh Hàng Loạt
23. Hết Phiên Tự Động
24. Giám Sát Hoạt Động
25. Kiểm Tra Độ Mạnh Mật Khẩu
26. Lịch Sử Thanh Toán
27. Xử Lý Hoàn Tiền
28. Tạo Hóa Đơn
29. Hỗ Trợ PWA
30. UI Thân Thiện Với Cảm Ứng
31. Tích Hợp CDN
32. Loading Skeletons
33. Toast Notifications
34. Validate Form
35. Tài Liệu API
36. Integration Tests
37. Quản Lý State
38. Thư Viện Form
39. Hỗ Trợ Docker
40. Analytics
41. Tối Ưu SEO

### 🟢 Ưu Tiên Thấp (Làm Sau)
1. Hỗ Trợ Chat Trực Tuyến
2. Phần Câu Hỏi Thường Gặp
3. Chia Sẻ Mạng Xã Hội
4. Chương Trình Giới Thiệu
5. Mã Vạch/QR Code
6. Dự Báo Doanh Thu
7. Chế Độ Offline
8. Khả Năng Truy Cập (a11y)
9. Tạo Sitemap

---

## 📝 Ghi Chú
- Cập nhật file này khi tính năng hoàn thành
- Đánh dấu item với [x] khi hoàn thành
- Cập nhật trạng thái thành ✅ Hoàn thành
- Thêm item mới khi cần
- Thay đổi ưu tiên dựa trên nhu cầu kinh doanh

**Cập nhật lần cuối:** 2026-04-19
