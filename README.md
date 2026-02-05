# VietShort - Nền Tảng Xem Phim Trực Tuyến 🎬

Một ứng dụng xem phim trực tuyến hiện đại với hệ thống hoa hồng CTV, quản lý VIP và thanh toán IAP. Hỗ trợ đa nền tảng: Web, Android, iOS.

---

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Các Tính Năng Chính](#các-tính-năng-chính)
- [Tech Stack](#tech-stack)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Lộ Trình Triển Khai](#lộ-trình-triển-khai)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Cấu Hình Triển Khai](#cấu-hình-triển-khai)
- [Các Thách Thức Kỹ Thuật](#các-thách-thức-kỹ-thuật)

---

## 🎯 Tổng Quan

**VietShort** là nền tảng streaming phim với:
- **10.000+ users/day** (tiềm năng cao)
- Doanh thu từ: nạp tiền, đăng ký VIP, quảng cáo
- Độ phức tạp cao về backend (tiền, unlock, thanh toán)
- Hỗ trợ khách vãng lai (guest user)
- Quản lý hoa hồng CTV (affiliate)

---

## ✨ Các Tính Năng Chính

### 1️⃣ **Đăng Ký / Đăng Nhập**
- ✔ Đăng nhập email/mật khẩu
- ✔ OAuth: Google, Apple, Facebook, TikTok
- ✔ Khách vãng lai (guest mode)
- ✔ Quên mật khẩu / Đặt lại mật khẩu
- ✔ Xác thực 2 yếu tố (2FA) - *Nâng cao*

### 2️⃣ **Trang Chủ**
- **Banner động**: Cuộn ảnh, cấu hình điều hướng phim/link ngoài
- **Đề xuất chính**: Phim được cấu hình từ backend
- **BXH Thịnh hành**: Dựa trên độ hot (view, like, share)
- **Phim đã kết thúc**: Danh sách phim hoàn thành
- **Lọc theo thể loại**: Tiên hiệp, Xuyên không, Trọng sinh, v.v.

### 3️⃣ **Bảng Xếp Hạng**
- BXH phim mới (sắp xếp theo ngày lên sóng)
- BXH thịnh hành (sắp xếp theo độ hot)

### 4️⃣ **Danh Sách Phim**
- Gợi ý dựa trên lịch sử xem
- Lọc theo thể loại
- VIP độc quyền (chỉ VIP unlock)

### 5️⃣ **Xem Phim**
- **Điều khiển video**:
  - Vuốt lên/xuống: chuyển tập
  - Chuyển độ phân giải: Tiêu chuẩn, HD, Siêu nét
  - Thay đổi tốc độ: 0.5x, 1.0x, 1.5x, 2.0x
  - Nhấn giữ: Tốc độ 2x
  - Chế độ đắm chìm: Ẩn/hiện thanh điều khiển
- **Tương tác**:
  - Like / Unlike
  - Sưu tầm
  - Bình luận
  - Chia sẻ
  - Đánh giá (1-5 sao)
- **Mở khóa**:
  - Dùng tiền vàng
  - Xem quảng cáo
  - Mở khóa toàn bộ phim

### 6️⃣ **Phúc Lợi**
- **Điểm danh hàng ngày** (7 ngày 1 chu kỳ):
  - Nhận tiền vàng
  - Xem quảng cáo = nhận gấp đôi
- **Nhiệm vụ hàng ngày**: Xem phim, xem ads, like, v.v.
- **Nhiệm vụ một lần**: Follow FB/INS, bình luận lần đầu
- **Cấu hình linh hoạt từ backend**

### 7️⃣ **Trang "Của Tôi"**
- Thay đổi avatar
- Thay đổi biệt danh
- Xem thông tin VIP
- Quản lý đăng nhập (liên kết nhiều tài khoản)
- Nạp tiền vàng
- Lịch sử xem phim

### 8️⃣ **Giữ Chân Khách Hàng**
- Popup giảm giá khi xem bảng giá chưa thanh toán
- Đếm ngược 2 phút - tự động giảm giá
- Push notification từ ứng dụng

### 9️⃣ **Backend Admin**

#### Quản Lý Nội Dung
- Quản lý phim: thêm, sửa, xóa, batch upload
- Tự động transcode (480P, 720P, 1080P) → M3u8
- Batch upload phụ đề (SRT)
- Dịch phụ đề tự động (Google Translate)
- Quản lý danh sách phim
- Quản lý trailer
- Cấu hình phân loại (thể loại, ngôn ngữ)

#### Quản Lý Quyền Hạn
- Quản lý admin: thêm, sửa, xóa
- Nhật ký hoạt động admin
- Nhóm vai trò & phân quyền
- Menu rules

#### Quản Lý Thành Viên
- Xem: khu vực, biệt danh, giới tính, số dư, VIP status
- Sửa tiền vàng
- Cấp VIP
- Xem người dùng trực tiếp/gián tiếp
- Phân tổ thành viên

#### Quản Lý CTV (Affiliate)
- Thêm, sửa, xóa CTV
- Cấu hình tài khoản CTV
- Xem: mã CTV, tỷ lệ hoa hồng, click, đơn, doanh thu
- Quản lý rút tiền

#### Quản Lý Nhật Ký
- Nhật ký tiền vàng (tìm theo ID/biệt danh)
- Nhật ký unlock phim (tiền vàng / quảng cáo)
- Nhật ký điểm danh
- Lịch sử xem phim (chính xác đến giây)
- Nhật ký thay đổi thông tin

#### Quản Lý Mã Đổi
- Tạo batch mã tiền vàng / VIP
- Cấu hình thời gian, số lượng, độ dài
- Xuất Excel
- Tình hình sử dụng
- Truy vấn mã

#### Trung Tâm Tài Chính
- Thống kê: tổng nạp, users, đơn, biểu đồ
- Cấu hình nạp tiền (mẫu mua)
- Nhật ký nạp tiền toàn hệ thống
- Cấu hình giữ chân khách (flash sale, countdown)

#### Quản Lý Nhiệm Vụ
- Cấu hình linh hoạt nhiệm vụ hàng ngày
- Cấu hình nhiệm vụ một lần

---

## 🛠️ Tech Stack

### **Frontend Web**
```
Framework: Next.js 14+ (React)
Styling: TailwindCSS
Video Player: HLS.js
State Management: React Query (TanStack Query)
Authentication: next-auth
SEO: next-seo
i18n: next-i18n-router / i18next
CDN: Cloudflare (Image Optimization)
Deployment: Cloudflare Pages
```

### **Backend API**
```
Runtime: Node.js 18+
Framework: NestJS
Database: MySQL 8.0+
Cache: Redis 6.0+
Authentication: JWT + Session
ORM: TypeORM / Prisma
Queue: Bull / BullMQ (video transcode, notifications)
Storage: Cloudflare R2
Payment: IAP SDK (iOS/Android), Momo/VNPay (Web)
Deployment: VPS (Ubuntu 20.04+)
```

### **Infra & Security**
```
CDN: Cloudflare CDN
DDoS: Cloudflare DDoS Protection
WAF: Cloudflare Web Application Firewall
Bot Management: Cloudflare Bot Management
SSL: Cloudflare SSL (Full / Full Strict)
Rate Limiting: Cloudflare Rate Limiting + Backend
Anti Hotlink: Cloudflare + Signed URLs
Video Streaming: HLS (.m3u8 + .ts)
```

### **Mobile (Roadmap Giai Đoạn 2)**
```
Android: React Native
iOS: React Native
IAP: App Store / Google Play Billing
```

---

## 🏗️ Kiến Trúc Hệ Thống

```
                            ┌─────────────────┐
                            │  Cloudflare DNS │
                            │  (domain.com)   │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
         ┌──────────▼────────┐ ┌────▼──────────┐ ┌──▼─────────────┐
         │ www.domain.com    │ │api.domain.com │ │v.domain.com    │
         │ (Frontend)        │ │ (Backend API) │ │(Video CDN)     │
         └────────┬──────────┘ └────┬──────────┘ └──┬─────────────┘
                  │                 │               │
       ┌──────────▼──────────┐     │               │
       │ Cloudflare Pages    │     │               │
       │ + Cloudflare CDN    │     │               │
       │ + Image Opt         │     │               │
       │                     │     │               │
       │ Next.js SPA         │     │               │
       │ (HTML/CSS/JS)       │     │               │
       └─────────────────────┘     │               │
                                   │               │
                    ┌──────────────┴────┐          │
                    │                   │          │
         ┌──────────▼──────────┐ ┌──────▼──────┐  │
         │  VPS Backend        │ │ Cloudflare  │  │
         │                     │ │ R2 Storage  │──┘
         │ NestJS API          │ └─────────────┘
         │ MySQL               │
         │ Redis               │
         │                     │
         │ ✔ JWT/Session Auth  │
         │ ✔ Video Transcode   │
         │ ✔ Queue (Bull)      │
         │ ✔ Payment Handling  │
         │ ✔ Webhook IAP       │
         │                     │
         └─────────────────────┘
                    │
                    │ CORS allowed from:
                    │ - www.domain.com
                    │ - v.domain.com
                    └─ Cloudflare IP only
```

### **Lớp Bảo Mật (Cloudflare)**
```
┌─────────────────────────────────────────┐
│  User Request                           │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────────┐
        │  Cloudflare DDoS    │
        │  Protection         │
        └────────┬────────────┘
                 │
        ┌────────▼────────────┐
        │  Cloudflare WAF     │
        │  + Bot Management   │
        └────────┬────────────┘
                 │
        ┌────────▼────────────┐
        │  Cloudflare Rate    │
        │  Limiting           │
        └────────┬────────────┘
                 │
        ┌────────▼────────────┐
        │  Firewall Rules     │
        │  + Anti Hotlink     │
        └────────┬────────────┘
                 │
        ┌────────▼────────────┐
        │  Origin (Your VPS)  │
        └─────────────────────┘
```

---

## 🚀 Lộ Trình Triển Khai

### **Phase 1: Website (2-3 tháng)** ✅ HIỆN TẠI

#### Tháng 1: Khởi Động & Backend
```
Week 1-2:
  ✔ Setup infrastructure (VPS, Cloudflare)
  ✔ Setup databases (MySQL, Redis)
  ✔ Create NestJS backend project structure
  
Week 3-4:
  ✔ Auth module (Register, Login, JWT, OAuth)
  ✔ User profile management
  ✔ Database schema design
  ✔ Video management API (CRUD, batch upload)
```

#### Tháng 2: Core Features
```
Week 1-2:
  ✔ Video streaming API (HLS, token validation)
  ✔ Video transcode queue (FFmpeg → M3u8)
  ✔ Payment system (tiền vàng, transactions)
  ✔ Unlock mechanism (video, episode)
  
Week 3-4:
  ✔ Admin panel API routes
  ✔ Logging & audit system
  ✔ CTV affiliate system
  ✔ Task & reward system
```

#### Tháng 3: Frontend & Polish
```
Week 1-2:
  ✔ Frontend repo setup (Next.js + Tailwind)
  ✔ Homepage + Video player (HLS.js)
  ✔ Auth pages (Login, Register)
  ✔ User profile pages
  
Week 3-4:
  ✔ Admin dashboard
  ✔ Video management UI
  ✔ Testing & QA
  ✔ Deploy to Cloudflare Pages + VPS
```

### **Phase 2: Mobile Apps (2-3 tháng)**
```
Month 1:
  ✔ React Native project setup
  ✔ iOS IAP integration
  ✔ Android Play Billing integration
  
Month 2-3:
  ✔ Port Web features to mobile
  ✔ Performance optimization
  ✔ Testing & release
```

### **Phase 3: Advanced Features**
```
  ✔ Ads network integration (Google Ads)
  ✔ Notification system (push notifications)
  ✔ Analytics & tracking
  ✔ Machine learning recommendations
```

---

## 🔧 Hướng Dẫn Cài Đặt

### **1. Yêu Cầu Hệ Thống**
```bash
Node.js: v18.0.0 or higher
npm: v9.0.0 or higher
MySQL: v8.0.0 or higher
Redis: v6.0.0 or higher
FFmpeg: v5.0.0 or higher (video transcode)
```

### **2. Clone & Setup**
```bash
# Clone repo
git clone https://github.com/yourusername/vietshort.git
cd vietshort

# Cài đặt dependencies
npm install

# Copy env files
cp .env.example .env
cp .env.example .env.local
```

### **3. Database Setup**
```bash
# MySQL
mysql -u root -p
CREATE DATABASE vietshort;
CREATE USER 'vietshort'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON vietshort.* TO 'vietshort'@'localhost';

# Run migrations
npm run migration:run
```

### **4. Environment Variables**

**Backend (.env)**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=vietshort
DATABASE_PASSWORD=password
DATABASE_NAME=vietshort

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Payment
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=

VNPAY_MERCHANT_ID=
VNPAY_SECRET_KEY=

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET_NAME=

# Video
FFMPEG_PATH=/usr/bin/ffmpeg
MAX_VIDEO_SIZE=5000 # MB
ALLOWED_VIDEO_FORMATS=mp4,mkv,avi

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# App
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_VIDEO_CDN=http://localhost:3000/video

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_APPLE_CLIENT_ID=
NEXT_PUBLIC_FACEBOOK_APP_ID=
```

### **5. Chạy Development**

**Backend**
```bash
cd backend
npm run dev
# Server: http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm run dev
# App: http://localhost:3000
```

---

## 🌐 Cấu Hình Triển Khai

### **1️⃣ Domain & DNS (Cloudflare)**

```
Tên miền: yourdomain.com (hoặc .xyz, .site, .tv)

Subdomains:
┌────────────────────────────────────────┐
│ www.yourdomain.com → Frontend          │
│ api.yourdomain.com → Backend API       │
│ v.yourdomain.com   → Video CDN         │
│ admin.yourdomain.com → Admin Panel     │
└────────────────────────────────────────┘

DNS Records:
┌──────────────┬──────────────┬───────────────────┐
│ Name         │ Type         │ Value             │
├──────────────┼──────────────┼───────────────────┤
│ @            │ A / CNAME    │ Cloudflare Pages  │
│ www          │ CNAME        │ pages.cloudflare  │
│ api          │ A / CNAME    │ Your VPS IP       │
│ v            │ CNAME        │ r2.yourdomain.com │
│ admin        │ CNAME        │ pages.cloudflare  │
└──────────────┴──────────────┴───────────────────┘
```

### **2️⃣ Cloudflare Security Setup**

**SSL/TLS**
```
Mode: Full (Strict)
Min TLS Version: 1.2
Always Use HTTPS: ON
HSTS: Enable (max-age=31536000)
```

**WAF Rules**
```
✔ Enable Cloudflare Managed Rules
✔ OWASP Core Rule Set
✔ Cloudflare Bot Management
✔ Rate Limiting:
  - 100 requests per 10 seconds per IP
  - 1000 requests per minute per user (JWT)

✔ Firewall Rules:
  - Block VPN/Proxy (if needed)
  - GeoIP blocking (optional)
  - Custom rules for API endpoints
```

**Cache Rules**
```
Frontend (www.yourdomain.com):
  - Cache HTML: 1 hour
  - Cache JS/CSS: 30 days
  - Cache Images: 1 year
  
Video (v.yourdomain.com):
  - Cache M3u8: 10 minutes
  - Cache TS segments: 1 year
  - Signed URLs for security
```

**Anti Hotlink**
```
Referrer Policy: Strict
Allowed Referrers:
  - yourdomain.com
  - app.yourdomain.com
  - localhost (development)
```

### **3️⃣ VPS Backend Deployment**

**Server Setup (Ubuntu 20.04 LTS)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL 8
sudo apt-get install -y mysql-server

# Install Redis
sudo apt-get install -y redis-server

# Install FFmpeg
sudo apt-get install -y ffmpeg

# Install Nginx (reverse proxy)
sudo apt-get install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Docker (optional for containers)
sudo apt-get install -y docker.io
```

**Nginx Config** (`/etc/nginx/sites-available/default`)
```nginx
upstream backend {
    server localhost:3000;
    keepalive 64;
}

upstream video {
    server r2.yourdomain.com;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
limit_req_zone $http_x_forwarded_for zone=cf_limit:10m rate=100r/s;

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL from Let's Encrypt + Cloudflare
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS (for frontend only)
    add_header Access-Control-Allow-Origin "https://www.yourdomain.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

    # Rate limiting
    limit_req zone=api_limit burst=50 nodelay;
    limit_req zone=cf_limit burst=200 nodelay;

    # Only allow Cloudflare IPs
    set $cloudflare_ips "103.21.244.0/22 103.22.200.0/22 103.31.4.0/22";
    
    location / {
        # Verify Cloudflare
        if ($http_cf_connecting_ip = "") {
            return 403;
        }

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /video {
        proxy_pass https://video.yourdomain.com;
        proxy_ssl_verify off;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

**Deploy Backend**
```bash
# SSH to VPS
ssh root@your.vps.ip

# Clone repo
git clone https://github.com/yourusername/vietshort.git
cd vietshort/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with production values

# Run migrations
npm run migration:run

# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name "vietshort-api"
pm2 startup
pm2 save

# Check status
pm2 logs vietshort-api
pm2 monit
```

### **4️⃣ Frontend Deploy (Cloudflare Pages)**

**Using GitHub Actions**
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/vietshort-frontend.git
git push -u origin main

# 2. Connect to Cloudflare Pages
# Go to Cloudflare Dashboard
# Pages → Connect to Git
# Select repo → yourdomain.com
# Production branch: main

# Build settings:
# Framework preset: Next.js
# Build command: npm run build
# Build output directory: .next
# Root directory: /frontend

# 3. Add Environment Variables
# In Cloudflare Pages → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_VIDEO_CDN=https://v.yourdomain.com
```

**Deploy Command (CLI)**
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
npm run build
wrangler pages publish out --project-name=vietshort
```

### **5️⃣ Cloudflare R2 Setup** (Video Storage)

```bash
# Create bucket via Cloudflare Dashboard
Bucket Name: videos-yourdomain

# Create API token
Cloudflare Dashboard → Account Settings → API Tokens
Scope: R2 Read/Write

# Configure backend
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=videos-yourdomain
R2_PUBLIC_URL=https://videos-yourdomain.r2.yourdomain.com
```

**Upload to R2**
```javascript
// backend/src/services/storage.service.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

export async function uploadToR2(
  bucketName: string,
  key: string,
  body: Buffer
) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: "application/octet-stream",
  });

  return s3Client.send(command);
}
```

### **6️⃣ Database Backup & Monitoring**

**MySQL Backup (Daily)**
```bash
# Create backup script: /home/backup-mysql.sh
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="vietshort_$DATE.sql.gz"

mysqldump -u vietshort -p$DB_PASSWORD vietshort | gzip > $BACKUP_DIR/$FILENAME

# Keep only 7 days backup
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Add to crontab (run daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/backup-mysql.sh
```

**Monitoring**
```bash
# Install Cloudflare Analytics
# Cloudflare Dashboard → Analytics
# Monitor: Traffic, Cache Hit Ratio, Errors

# PM2 Monitoring
pm2 web
# Access: http://localhost:9615

# VPS Monitoring (optional)
sudo apt-get install htop iotop nethogs
```

---

## ⚠️ Các Thách Thức Kỹ Thuật

### **1. Atomic Tiền & Unlock** 🔒
```
Vấn đề: Tránh double-charge khi có network lag
Giải pháp:
  ✔ Database transaction (MySQL)
  ✔ Idempotency key (duplicate detection)
  ✔ Webhook validation
  ✔ Retry logic with exponential backoff

Ví dụ:
  1. Client request unlock video (100 gold)
  2. Backend check balance
  3. Deduct in transaction (atomic)
  4. Return signed token
  5. Client cache token locally
  6. If fail, retry with same idempotency key
```

### **2. Thanh Toán IAP** 💳
```
iOS:
  ✔ App Store Server API v2
  ✔ Transaction receipt validation
  ✔ Webhook: app.transaction event
  ✔ Refund handling

Android:
  ✔ Google Play Billing Library v7+
  ✔ Purchase token validation
  ✔ Real-time Developer Notifications
  ✔ Subscription state tracking

Backend:
  ✔ Validate receipt with Apple/Google
  ✔ Update user balance
  ✔ Handle refunds
  ✔ Log all transactions
  ✔ Reconciliation process (daily)
```

### **3. Ads Callback** 📺
```
Flow:
  1. Frontend request ad to AdNetwork (Google Ads, Facebook)
  2. User watches ad
  3. AdNetwork callback to backend
  4. Backend verify callback (signature)
  5. Grant reward to user
  6. Return success to AdNetwork

Implementation:
  ✔ Webhook signature verification
  ✔ Idempotency key for duplicates
  ✔ Timeout handling
  ✔ Fraud detection (impossible rewards)
```

### **4. Logging & Reconciliation** 📊
```
Cần track:
  ✔ Mỗi transaction tiền vàng (user, amount, reason)
  ✔ Mỗi lần unlock (user, video, method)
  ✔ Mỗi lần xem quảng cáo (user, ad_id, reward)
  ✔ Mỗi thanh toán IAP (user, product, receipt)
  ✔ Mỗi withdrawal CTV (ctv, amount, bank)

Reconciliation (Daily):
  ✔ Check IAP receipts with Apple/Google
  ✔ Check Stripe transactions
  ✔ Verify ad rewards
  ✔ Audit gold balance
  ✔ Generate reports
```

### **5. Video Streaming** 🎥
```
HLS (HTTP Live Streaming):
  ✔ Segment multiple bitrates (480p, 720p, 1080p)
  ✔ Generate M3u8 playlist
  ✔ Serve via CDN
  ✔ Signed URLs (expire after 1 hour)
  ✔ Referrer check (prevent hotlink)

Transcode Pipeline:
  1. Upload video
  2. Queue transcode job
  3. FFmpeg process (480p, 720p, 1080p)
  4. Upload segments to R2
  5. Generate M3u8
  6. Update DB
  7. Cleanup local files

Performance:
  ✔ Parallel transcode (using Bull queue)
  ✔ Progressive upload (don't wait for all)
  ✔ Cloudflare R2 caching
```

---

## 📦 Project Structure

```
vietshort/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   └── oauth/
│   │   ├── users/
│   │   ├── videos/
│   │   │   ├── video.controller.ts
│   │   │   ├── video.service.ts
│   │   │   ├── transcode.service.ts
│   │   │   └── hls.service.ts
│   │   ├── payment/
│   │   │   ├── gold.service.ts
│   │   │   ├── vip.service.ts
│   │   │   ├── iap.service.ts
│   │   │   └── unlock.service.ts
│   │   ├── admin/
│   │   ├── ctv/
│   │   ├── tasks/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── pipes/
│   │   │   └── filters/
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   └── migrations/
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx (homepage)
│   │   │   ├── watch/[id].tsx (video player)
│   │   │   ├── auth/login.tsx
│   │   │   ├── admin/ (admin dashboard)
│   │   │   └── api/ (API routes)
│   │   ├── components/
│   │   │   ├── VideoPlayer.tsx (HLS.js)
│   │   │   ├── Navigation.tsx
│   │   │   ├── Banner.tsx
│   │   │   ├── VideoCard.tsx
│   │   │   └── shared/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   └── useVideo.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── hls.ts
│   │   ├── styles/
│   │   └── env.d.ts
│   ├── public/
│   ├── .env.local.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
├── scripts/
│   ├── setup-db.sql
│   ├── deploy-vps.sh
│   ├── backup-mysql.sh
│   └── transcode-video.sh
│
├── docs/
│   ├── API.md (API documentation)
│   ├── DEPLOYMENT.md (this file)
│   ├── ARCHITECTURE.md
│   └── TESTING.md
│
└── README.md (this file)
```

---

## 🧪 Testing & QA

### **Unit Tests**
```bash
# Backend
npm run test:unit

# Frontend
npm run test
```

### **Integration Tests**
```bash
npm run test:integration
```

### **E2E Tests**
```bash
npm run test:e2e
```

### **Load Testing**
```bash
# Using k6 or Apache JMeter
k6 run load-test.js
```

---

## 📈 Monitoring & Logging

### **Backend Logs**
```bash
# PM2 logs
pm2 logs vietshort-api

# Cloudflare Analytics
# Dashboard → Analytics & Logs
```

### **Error Tracking** (Optional)
```bash
npm install @sentry/node
# Configure in backend/src/main.ts
```

### **Database Monitoring**
```bash
mysql -u vietshort -p
SHOW PROCESSLIST;
SHOW STATUS;
```

---

## 🔒 Security Checklist

- [ ] Enable HTTPS everywhere (Cloudflare SSL)
- [ ] Rate limiting configured (API & Cloudflare)
- [ ] WAF rules enabled
- [ ] DDoS protection active
- [ ] JWT secrets securely stored
- [ ] OAuth credentials encrypted
- [ ] Database backups automated
- [ ] VPS firewall configured
- [ ] Only Cloudflare IPs allowed to backend
- [ ] Video links signed & expire
- [ ] Payment receipts validated
- [ ] Admin logs enabled
- [ ] Sensitive data never logged
- [ ] CORS properly configured
- [ ] XSS protections enabled
- [ ] CSRF tokens used
- [ ] SQL injection prevention (ORM)

---

## 📞 Support & Contact

- **GitHub**: https://github.com/yourusername/vietshort
- **Issues**: https://github.com/yourusername/vietshort/issues
- **Documentation**: `/docs` folder
- **Email**: support@yourdomain.com

---

## 📄 License

MIT License - See LICENSE file

---

## 🙏 Contributors

Cảm ơn tất cả những người đóng góp cho dự án này!

---

## 🎓 Một Số Tài Liệu Hữu Ích

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [HLS.js Player](https://github.com/video-dev/hls.js)
- [FFmpeg Video Encoding](https://ffmpeg.org)
- [MySQL Best Practices](https://dev.mysql.com)
- [OAuth 2.0 Flow](https://oauth.net)

---

**Cập nhật lần cuối**: 05/02/2026

**Phiên bản**: 1.0.0
