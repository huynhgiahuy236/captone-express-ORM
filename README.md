# 📌 DỰ ÁN CAPSTONE: PINTEREST CLONE (EXPRESS & PRISMA ORM)

> **Khóa học**: Node.js Backend 56 - CyberSoft Academy  
> **Dự án**: Pinterest Image Sharing Platform  
> **Tác giả**: Huỳnh Gia Huy (dev.huynhgiahuy@gmail.com)

---

## 📌 1. Giới thiệu Dự án

Dự án **Pinterest Clone** là hệ thống chia sẻ, khám phá và tương tác hình ảnh đa phương tiện toàn diện, được xây dựng theo kiến trúc Micro-Monorepo với Backend chuẩn RESTful API 3 lớp (Router - Controller - Service - Prisma ORM) và Frontend Next.js 14 App Router với giao diện Masonry Pinterest hiện đại, tối ưu responsive trên mọi thiết bị (Desktop, Tablet, Mobile).

---

## 🛠 2. Công nghệ sử dụng (Tech Stack)

### **Backend**
- **Runtime & Framework**: Node.js (ES Module), Express.js
- **ORM & Database**: Prisma ORM v7, MySQL / MariaDB (Driver Adapter `@prisma/adapter-mariadb`)
- **Bảo mật & Xác thực**: JSON Web Token (JWT Access & Refresh Token), Bcrypt, Passport.js (Google OAuth 2.0), Helmet, Express Rate Limit, CORS.
- **Lưu trữ đám mây & Upload**: Cloudinary SDK, Multer (Memory Storage).
- **Tài liệu hóa API**: Swagger UI (`swagger-ui-express`, OpenAPI 3.0).

### **Frontend**
- **Framework**: Next.js 14 (App Router), React 18, TypeScript.
- **Styling**: TailwindCSS, CSS Masonry Grid, Responsive Design (Desktop, Tablet & Mobile Drawer).
- **Theme**: Hỗ trợ Chế độ Sáng / Tối (Dark / Light Mode) mượt mà.
- **Icons & Animation**: Lucide React Icons, Canvas Confetti.
- **HTTP Client**: Axios.

---

## 📁 3. Cấu trúc Thư mục Dự án

```text
Capstone_Express_ORM/
├── README.md                                    # Tài liệu hướng dẫn tổng quan dự án
├── Backend/                                     # Toàn bộ mã nguồn Backend API (Express + Prisma)
│   ├── .env.example                             # File mẫu biến môi trường Backend
│   ├── package.json                             # Dependencies & Scripts Backend
│   ├── server.js                                # Điểm khởi động Server & Cấu hình Middleware
│   ├── prisma/
│   │   └── schema.prisma                        # Prisma Schema mô hình hóa cơ sở dữ liệu
│   └── src/
│       ├── common/                              # Tiện ích chung (Cloudinary, JWT, Swagger, Middlewares...)
│       ├── controllers/                         # Tầng Điều khiển tiếp nhận và phản hồi HTTP Request
│       ├── routers/                             # Tầng Định tuyến API (Auth, Images, Users, Likes, Notifications...)
│       └── services/                            # Tầng Xử lý Logic nghiệp vụ cốt lõi & Truy vấn CSDL
├── Frontend/                                    # Mã nguồn Giao diện Người dùng (Next.js 14 App Router)
│   ├── .env.example                             # File mẫu biến môi trường Frontend
│   ├── package.json                             # Dependencies & Scripts Frontend
│   └── src/                                     # App Router, Components (PinCard, Navbar, Modals...)
├── postman/
│   └── Capstone_Pinterest.postman_collection.json # Bộ Test API Postman Collection hoàn chỉnh
└── sql/
    └── db_capstone_pinterest.sql                # File dump CSDL MySQL với 80+ hình ảnh & dữ liệu mẫu
```

---

## 🗄️ 4. Cấu trúc Cơ sở Dữ liệu (Database Schema)

Hệ thống gồm 7 bảng liên kết chặt chẽ với cơ chế Soft-delete (`isDeleted`, `deletedAt`, `deletedBy`) và Cascade On Delete:

1. `nguoi_dung`: Thông tin tài khoản, mật khẩu băm, avatar, mô tả, Google ID, quyền riêng tư (`quyen_rieng_tu`).
2. `hinh_anh`: Quản lý hình ảnh (tiêu đề, URL Cloudinary, mô tả, thể loại, người tạo).
3. `binh_luan`: Bình luận theo từng hình ảnh kèm phân cấp thời gian.
4. `luu_anh`: Danh sách các hình ảnh người dùng đã lưu vào bộ sưu tập cá nhân.
5. `tym_anh`: Lịch sử và số lượt thả tim ảnh của người dùng.
6. `tym_binh_luan`: Lịch sử thích bình luận.
7. `theo_doi`: Mối quan hệ theo dõi giữa người dùng và tác giả (`nguoi_theo_doi_id`, `nguoi_duoc_theo_doi_id`).
8. `thong_bao`: Lưu trữ thông báo tương tác (`LIKE`, `COMMENT`, `FOLLOW`) giữa các thành viên.

---

## 🚀 5. Hướng dẫn Cài đặt & Chạy ứng dụng

### Bước 1: Khởi tạo Cơ sở dữ liệu MySQL
1. Khởi động MySQL Server (XAMPP / Laragon / Docker / MySQL Workbench).
2. Tạo database mới: `db_capstone_pinterest`.
3. Import file `sql/db_capstone_pinterest.sql` vào database vừa tạo.

### Bước 2: Cài đặt & Chạy Backend API
```bash
# Di chuyển vào thư mục Backend
cd Backend

# Cài đặt các thư viện phụ thuộc
npm install

# Tạo file .env từ file mẫu
cp .env.example .env

# Đồng bộ Prisma Client với CSDL
npx prisma generate

# Khởi chạy Backend Server (Chế độ Dev)
npm run dev
```
> 🚀 **Backend API URL**: `http://localhost:3069`  
> 📖 **Swagger Documentation**: `http://localhost:3069/api-docs`

### Bước 3: Cài đặt & Chạy Frontend
```bash
# Mở một Terminal mới và di chuyển vào thư mục Frontend
cd Frontend

# Cài đặt các thư viện phụ thuộc
npm install

# Tạo file .env.local
cp .env.example .env.local

# Khởi chạy Frontend Dev Server
npm run dev
```
> 🌐 **Frontend URL**: `http://localhost:3000`

---

## 📑 6. Danh sách API Endpoints chuẩn hóa

### 🔐 1. Nhóm Xác thực (Auth)
- `POST /api/auth/signup` - Đăng ký tài khoản mới (`fullName`, `email`, `password`, `age`).
- `POST /api/auth/signin` - Đăng nhập hệ thống (nhận Access Token & Refresh Token).
- `GET /api/auth/info` - Lấy thông tin tài khoản đang đăng nhập (`Bearer Token`).
- `POST /api/auth/refresh-token` - Cấp mới Access Token khi hết hạn.
- `GET /api/auth/google` - Đăng nhập nhanh bằng tài khoản Google OAuth 2.0.

### 🖼️ 2. Nhóm Hình ảnh (Images)
- `GET /api/images` - Lấy danh sách hình ảnh (có phân trang `page`, `pageSize`, lọc theo `category`).
- `GET /api/images/search?name=...` - Tìm kiếm hình ảnh theo tên/mô tả bằng thuật toán thông minh.
- `GET /api/images/:id` - Lấy thông tin chi tiết hình ảnh và thông tin tác giả.
- `POST /api/images` - Tải lên hình ảnh mới (`multipart/form-data` hoặc URL qua Cloudinary).
- `DELETE /api/images/:id` - Xóa hình ảnh thuộc quyền sở hữu của người dùng (Soft-delete).
- `POST /api/images/batch-delete` - Xóa hàng loạt hình ảnh do người dùng chọn.

### 💬 3. Nhóm Bình luận (Comments)
- `GET /api/comments/image/:imageId` - Lấy danh sách bình luận của một hình ảnh.
- `POST /api/comments` - Gửi bình luận cho hình ảnh (`imageId`, `content`).

### 📌 4. Nhóm Lưu ảnh (Saved Images)
- `GET /api/saved-images/check/:imageId` - Kiểm tra trạng thái người dùng đã lưu ảnh này chưa.
- `POST /api/saved-images/toggle/:imageId` - Lưu hoặc Bỏ lưu hình ảnh vào bộ sưu tập cá nhân.
- `POST /api/saved-images/batch-unsave` - Bỏ lưu hàng loạt ảnh khỏi bộ sưu tập.

### 👤 5. Nhóm Người dùng & Hồ sơ (Users & Profile)
- `GET /api/users/profile` - Lấy thông tin cá nhân và số liệu thống kê của người dùng.
- `PUT /api/users/profile` - Cập nhật thông tin cá nhân và thay đổi ảnh đại diện (Avatar Cloudinary).
- `PUT /api/users/privacy` - Cài đặt quyền riêng tư hiển thị các Tab (`PUBLIC` / `FOLLOWERS` / `PRIVATE`).
- `GET /api/users/:userId` - Lấy thông tin công khai của người dùng / tác giả khác.
- `GET /api/users/saved-images` - Lấy danh sách các hình ảnh người dùng đã lưu.
- `GET /api/users/created-images` - Lấy danh sách các hình ảnh do người dùng tạo.
- `GET /api/users/liked-images` - Lấy danh sách các hình ảnh người dùng đã thả tim.
- `GET /api/users/liked-comments` - Lấy danh sách các bình luận người dùng đã thích.

### ❤️ 6. Nhóm Thả tim & Theo dõi (Likes & Follow)
- `POST /api/likes/image/toggle/:imageId` - Thả tim / Bỏ tim cho một hình ảnh.
- `POST /api/likes/comment/toggle/:commentId` - Thích / Bỏ thích một bình luận.
- `POST /api/follow/:authorId` - Theo dõi / Hủy theo dõi một tác giả.
- `GET /api/follow/status/:authorId` - Kiểm tra trạng thái theo dõi tác giả.

### 🔔 7. Nhóm Thông báo (Notifications)
- `GET /api/notifications` - Lấy danh sách các thông báo nhận được.
- `GET /api/notifications/unread-count` - Lấy số lượng thông báo chưa đọc.
- `PUT /api/notifications/read-all` - Đánh dấu tất cả thông báo là đã đọc.
- `PUT /api/notifications/:id/read` - Đánh dấu một thông báo cụ thể là đã đọc.

---

## ✨ 7. Các Tính năng Nổi bật trên Frontend

- **Giao diện Masonry Layout**: Bố cục ghim Pinterest xếp gạch mượt mà, tự động cân đối kích thước hình ảnh.
- **Tải ảnh nhanh (Download Image)**: Tải trực tiếp ảnh gốc chất lượng cao về máy từ trang Feed và trang Chi tiết Pin.
- **Tối ưu hóa Mobile & Responsive**:
  - Thanh Navigation Mobile thu gọn tinh gọn với Logo và Menu Hamburger (Drawer).
  - Ẩn các nút hover trên màn hình cảm ứng để tránh chạm nhầm, hỗ trợ thao tác chạm mượt mà.
  - Phân bố tab hồ sơ người dùng 4 cột đều đặn trên mobile.
  - Điều chỉnh tùy chọn Quyền riêng tư dạng Dropdown Select thân thiện với ngón tay.
- **Cài đặt Quyền riêng tư nâng cao**: Cho phép người dùng tùy biến hiển thị các mục (Đã lưu, Đã tạo, Đã thích) theo dạng *Mọi người*, *Chỉ người theo dõi*, hoặc *Chỉ mình tôi*.
- **Xóa / Bỏ lưu hàng loạt (Batch Actions)**: Hỗ trợ chế độ chọn nhiều ghim để quản lý bộ sưu tập nhanh chóng.
- **Dark / Light Theme**: Tích hợp chuyển đổi giao diện Sáng / Tối tiện lợi lưu trạng thái trong LocalStorage.
- **Tìm kiếm Debounce thông minh & Bộ lọc danh mục**: Tìm kiếm theo thời gian thực mà không gây nghẽn Server.

---

## 👥 8. Tài khoản Thử nghiệm (Demo Accounts)

| Email | Mật khẩu | Họ tên | Vai trò |
| :--- | :--- | :--- | :--- |
| `sangnguyen@gmail.com` | `123456` | Sang Nguyễn Pro | User chính / Creator |
| `phongtulam@gmail.com` | `123456` | Phong Tử Lâm | Creator |
| `nguyennhu@gmail.com` | `123456` | Nguyễn Như | Creator |
| `dev.huynhgiahuy@gmail.com` | `123456` | Huỳnh Gia Huy | Admin / Creator |

---

## 🧪 9. Kiểm thử với Postman Collection Runner

1. Mở phần mềm **Postman**.
2. Chọn **Import** và chọn file: `postman/Capstone_Pinterest.postman_collection.json`.
3. Bấm chuột phải vào Collection `Capstone Pinterest API (Express & Prisma)` -> Chọn **Run collection**.
4. Toàn bộ 100% Request sẽ chạy tự động và vượt qua với mã trạng thái `200 OK` / `201 Created`.
