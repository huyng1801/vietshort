# VietShort - Nền tảng phát trực tuyến video hiện đại 🎬

Ứng dụng phát trực tuyến video hiện đại với hệ thống hoa hồng tiếp thị liên kết, quản lý VIP và thanh toán trong ứng dụng. Hỗ trợ đa nền tảng: Web, Android, iOS.

---

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Nền tảng và tính năng](#nền-tảng-và-tính-năng)
  - [🌐 Nền tảng Web](#-nền-tảng-web)
  - [📱 Ứng dụng di động](#-ứng-dụng-di-động)
  - [🎛️ Admin CMS](#️-admin-cms)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Lộ trình triển khai](#lộ-trình-triển-khai)
- [Cấu trúc dự án](#cấu-trúc-dự-án)

---

## 🎯 Tổng quan

**VietShort** là nền tảng phát trực tuyến phim toàn diện với:
- **Mục tiêu**: 10.000 người dùng/ngày có khả năng mở rộng cao
- **Doanh thu đa dạng**: Mua hàng trong ứng dụng, đăng ký VIP, quảng cáo, hoa hồng tiếp thị liên kết
- **Công nghệ hiện đại**: Phụ đề tự động AI, phát trực tuyến HLS, đa nền tảng
- **Trải nghiệm linh hoạt**: Hỗ trợ cả thành viên đã đăng ký và khách vãng lai
- **Hệ thống phức tạp**: Xử lý thanh toán, mở khóa video, quản lý tiếp thị liên kết
- **Giữ chân khách thông minh**: Sử dụng AI với giá động & khuyến mại
- **Thanh toán Việt Nam**: Tích hợp toàn diện với VNPay, Momo cho thị trường địa phương
- **Admin nâng cao**: CMS toàn diện với mã trao đổi, quản lý CTV, phân tích chi tiết

---

## 🎯 Nền tảng và tính năng

### 🌐 **Nền tảng Web** (Dành cho khách hàng)

#### **🔐 Xác thực & Tài khoản**
- ✅ **Đăng nhập Email/Mật khẩu**: Xác thực an toàn với mã thông báo JWT
- ✅ **Tích hợp OAuth**: Google, Apple, Facebook, TikTok đăng nhập xã hội
- ✅ **Chế độ khách**: Truy cập ẩn danh để xem nội dung giới hạn & nạp vàng; tài khoản khách được định danh bằng device_id, cho phép lưu lịch sử xem và số vàng.
- ✅ **Quên mật khẩu**: Đặt lại mật khẩu dựa trên email với mã thông báo an toàn
- ✅ **Liên kết tài khoản**: Liên kết tài khoản khách với tài khoản xã hội/email

#### **🏠 Trang chủ & Khám phá**
- 🎭 **Banner nổi bật**: Banner cuộn, có thể cấu hình nhảy đến phim hoặc link ngoài.
- 🔥 **Xu hướng**: Xếp hạng thực tế theo lượt xem/thích/chia sẻ
- ⭐ **Khuyến nghị thông minh**: Được cá nhân hóa dựa trên lịch sử xem và thuật toán
- 📚 **Danh mục**: Tiên hiệp, Xuyên không, Trọng sinh, Lãng mạn, v.v.
- 🔍 **Tìm kiếm thông minh**: Tự động hoàn thành và bộ lọc nâng cao
- 🏆 **Xếp hạng**: Mới nhất, Phim hot, Được đánh giá cao nhất

#### **🎬 Xem & Trình phát**
- 📱 **Thiết kế Responsive**: Giao diện thích ứng hoàn hảo từ điện thoại đến máy tính để bàn
- 📺 **Trình phát HLS hiện đại**: Phát trực tuyến thích ứng (540p→1080P), chất lượng tự động, buffer thông minh
- 🎮 **Điều khiển cảm ứng & Gesture**:
  - 👆 **Vuốt**: Thay đổi tập phim (phải/trái), âm lượng (trên/dưới bên phải)
  - 🎯 **Nhấn đôi**: Tua nhanh/lùi 10 giây
  - 📌 **Nhấn giữ**: Xem trước tốc độ 2x
  - 🔄 **Nhấn 1 lần**: Ẩn/hiện điều khiển tự động sau 3 giây
- ⚙️ **Điều khiển phát**:
  - 🎧 **Tốc độ phát**: 0,5x → 2,0x (danh sách gợi ý nhanh)
  - 📺 **Toàn màn hình**: Chế độ dọc & ngang tự động phát hiện
  - 📊 **Chọn tập**: Menu dropdown nhanh gọn
  - 🔊 **Âm lượng**: Điều khiển slider & nút gốc (PiP mode)
  
- 💬 **Phụ đề thông minh**:
  - 🌍 **Đa ngôn ngữ**: Phụ đề tự động + dịch thủ công
  - 🎨 **Tùy chỉnh dễ dàng**: Kích thước (Nhỏ/Trung/Lớn), nền mờ
  - 📝 **Đồng bộ AI**: Tự động căn giờ phụ đề chính xác
- 👍 **Tương tác xã hội**:
  - ❤️ **Thích**: Hoạt ảnh trái tim, hiệu ứng sao chép Instagram
  - 🔖 **Đánh dấu**: Lưu vào yêu thích, bộ sưu tập
  - ⭐ **Đánh giá**: 1-5 sao
  - 💬 **Bình luận**: Chuỗi trả lời
  - 🚀 **Chia sẻ nhanh**: Facebook, Zalo, TikTok, và sao chép link.

#### **💰 Thanh toán & VIP**
- 🪙 **Tiền tệ ảo**: Hệ thống đồng vàng
- 🔓 **Mở khóa**: Từng tập/chuỗi bằng vàng hoặc quảng cáo
- 💎 **Gói VIP**:
  - **VIP FreeAds**: Xem phim không quảng cáo
  - **VIP Gold**: Không quảng cáo, mở khóa chất lượng 1080p, xem các phim độc quyền dành cho VIP
- 💳 **Phương thức thanh toán**: VNPay, Momo
- 🎁 **Khuyến mại**: Chiết khấu lần đầu, bán hàng theo mùa

#### **🎮 Phần thưởng & Giữ chân khách**
- ☀️ **Điểm danh hàng ngày**: Chu kỳ 7 ngày có thể cấu hình với phần thưởng
- 📋 **Nhiệm vụ hàng ngày**: Xem phim, thích, bình luận, chia sẻ (có thể cấu hình linh hoạt)
- 📺 **Xem quảng cáo**: Kiếm 2x vàng
- 🏅 **Thành tích**: Nhận huy hiệu khi hoàn thành các mốc như: theo dõi mạng xã hội, bình luận lần đầu, xem đủ số tập/phút, chia sẻ phim
- 🎯 **Giữ chân khách thông minh**:
  - 💡 Popup chiết khấu khi xem giá mà chưa thanh toán
  - ⏱️ Đếm ngược 2 phút
  - 🔔 Thông báo thông minh để tái tương tác
  - 🎁 Các ưu đãi dựa trên hành vi xem

---

### 📱 **Ứng dụng di động** (Flutter iOS/Android)

#### **📲 Tính năng di động gốc**
 - 🔔 **Thông báo đẩy**: Tập mới, khuyến mãi, nhắc nhở
 - 📱 **Giao diện gốc**: iOS Cupertino + Thiết kế Material Android

#### **🎮 Các điều khiển nâng cao**
- ✨ **Điều khiển cử chỉ**: 
  - Vuốt lên/xuống: Tập tiếp theo/trước
  - Nhấn đôi: Cuộn nhanh/lùi 10s
  - Pinch: Thu phóng video
  - Nhấn giữ: Xem trước tốc độ 2x

#### **💳 Thanh toán di động**
 - 📱 **Mua hàng trong ứng dụng**: 
   - iOS: Tích hợp StoreKit 2
   - Android: Google Play Billing 6+

---

### 🎛️ **Admin CMS** (Bảng điều khiển quản lý)

#### **🎬 Quản lý phim & nội dung**

- **Tải và xử lý phim**:
  - 📤 **Tải phim lên**: Hỗ trợ đa định dạng (MP4, MOV), tải hàng loạt với kéo & thả, theo dõi tiến độ
  - 📋 **Nhập metadata phim**: Cho phép nhập thủ công thông tin phim (tên, mô tả, diễn viên, đạo diễn, năm phát hành, v.v.) hoặc trích xuất tự động từ file
  - 📚 **Quản lý phim nhiều tập**: 
    - Tải phim có 70-80 tập dưới dạng file nhỏ (segment), tự động gom nhóm theo chuỗi
    - Tạo danh sách tập tự động hoặc chỉnh sửa thủ công (tên tập, thứ tự, mô tả)
  - 🎞️ **Quy trình mã hóa**: Đa độ phân giải (480P, 540p, 720P, 1080P), phân đoạn HLS, tạo hình nhỏ, cấu hình chất lượng
  - 📝 **Tải phụ đề**: Hỗ trợ tải file phụ đề (srt) hàng loạt, ánh xạ phụ đề với tập phim

- **Quản lý và tổ chức phim**:
  - 🏷️ **Tổ chức nội dung**: Quản lý chuỗi & tập, danh mục, thẻ, thể loại, lập lịch phát hành, tối ưu hóa SEO
  - 📋 **Danh sách phim**: Xem thông tin chi tiết (thích, sưu tầm, khách, lượt xem, đánh giá, bình luận, giá giải khóa, số đơn nạp, trạng thái)
  - 📚 **Quản lý danh sách phim**: Tạo danh sách phim tùy chỉnh, sắp xếp phim, chọn phim vào danh sách
  - 🎥 **Quản lý trailer**: Cấu hình trailer, liên kết các phim sắp ra mắt
  - 🔒 **Phim độc quyền VIP**: Cấu hình phim chỉ dành cho VIP Gold, quản lý quyền truy cập

- **Cấu hình và xem trước**:
  - 💰 **Thiết lập giá**: Đặt giá hàng loạt, cấu hình theo phân đoạn
  - 👁️ **Xem trước**: Xem trước hiệu ứng phim trên web, kiểm tra cuối cùng

- **Quản lý Hình ảnh & Poster**:
  - 🖼️ **Quản lý Poster & Hình ảnh phim**: Tải poster chính, ảnh mô tả (16:9, 4:3), ảnh banner quảng cáo, cấu hình hình ảnh mặc định nếu không có

#### **🏠 Quản lý Trang chủ & Khám phá**
- 🎭 **Quản lý Banner**: 
  - Thêm, sửa, xóa banner nổi bật, cấu hình cuộn tự động, thiết lập nhảy đến phim hoặc link ngoài
  - Đặt lịch hiển thị, cấu hình target khách hàng (theo loại thành viên, geo, v.v.)
- 📊 **Quản lý Xếp hạng & Danh mục**: 
  - Cấu hình trang chủ: phim Mới nhất, Phim hot, Được đánh giá cao, Xu hướng hôm nay
  - Quản lý danh mục phim hiển thị trên khám phá
- ⭐ **Cấu hình Khuyến nghị**: 
  - Bật/tắt gợi ý, điều chỉnh độ chính xác, cấu hình thuật toán
  - Xem thông tin thuật toán hiện tại, thống kê hiệu suất

#### **💬 Quản lý Tương tác xã hội**
- 🗨️ **Quản lý bình luận**: 
  - Duyệt, phê duyệt, xóa bình luận, chặn người dùng spam
  - Cấu hình filters từ khóa cấm, tự động tiếp điểm
  - Xem thống kê bình luận theo phim
- ⭐ **Quản lý đánh giá**: 
  - Xem chi tiết đánh giá, xóa đánh giá spam, phân tích rating distribution
- 💝 **Quản lý yêu thích & Sưu tầm**: 
  - Xem thống kê phim được thích nhất, sưu tầm nhiều nhất
  - Tìm hiểu hành vi người dùng

#### ** Quản lý Quảng cáo & Khuyến mại**
- 📰 **Quản lý AdMob**: 
  - Cấu hình vị trí hiển thị quảng cáo (banner, interstitial, reward video)
  - Thiết lập tần suất hiển thị, giới hạn theo loại nội dung
  - Xem doanh thu quảng cáo theo ngày/tuần/tháng
- 🎁 **Quản lý Khuyến mại**: 
  - Tạo khuyến mãi: chiết khấu lần đầu, bán theo mùa, gói kết hợp
  - Cấu hình thời gian hiệu lực, nhóm khách (mới, cũ, VIP, v.v.)
  - Đo lường hiệu quả khuyến mãi

#### **☀️ Quản lý Điểm danh & Phục thưởng hàng ngày**
- 📅 **Cấu hình Chu kỳ điểm danh**: 
  - Thiết lập chu kỳ (7 ngày, 30 ngày, v.v.), phần thưởng theo ngày
  - Cấu hình reset, thưởng bonus hoàn thành chuỗi
  - Xem statistuc tỷ lệ người tham gia điểm danh
- 🎁 **Quản lý Phần thưởng**: 
  - Cấu hình phần thưởng cho từng ngày: vàng, mã VIP, v.v.
  - Điều chỉnh giá trị phần thưởng linh hoạt theo chiến lược

#### **🎛️ Quản lý hệ thống**
- 📂 **Quản lý phân loại**: 
  - Cấu hình mã ngôn ngữ hệ thống
  - Quản lý danh mục phim (Tiên hiệp, Xuyên không, Trọng sinh, Lãng mạn, v.v.)
- 🔐 **Quản lý quyền hạn**:
  - ➕ **Quản trị viên**: Thêm, sửa, xóa quản trị viên hệ thống
  - 📋 **Nhật ký quản trị viên**: Hiển thị nhật ký thao tác của admin
  - 👥 **Nhóm vai trò**: Thêm, sửa, xóa nhóm vai trò & phân quyền
  - 🗂️ **Quy tắc menu**: Hiển thị tên định tuyến menu hệ thống

#### **🤖 Hệ thống phụ đề tự động**
- 🎵 **Xử lý âm thanh**: 
  - Trích xuất âm thanh FFmpeg
  - Hỗ trợ âm đa kênh
- 🗣️ **Nhận dạng giọng nói**:
  - **Whisper** (tự triển khai): Riêng tư, xử lý ngoại tuyến
- 🌐 **Dịch AI**:
  - Google Translate API với nhận thức ngữ cảnh
  - Xử lý hàng loạt hiệu quả

#### **👥 Quản lý người dùng**
- 📁 **Phân tích người dùng**: 
  - 🔍 **Tìm kiếm nâng cao**: ID, biệt danh, email, khu vực đăng ký
  - ⚙️ **Chi tiết người dùng**: Số dư, trạng thái VIP, khu vực, trạng thái khóa
  - 📅 **Dữ liệu đăng ký**: Nguồn đăng ký, thông tin thiết bị, nhân khẩu học
  - 🏆 **Số liệu tương tác**: Thời gian xem, mức độ hoạt động, tỷ lệ giữ chân
- 💰 **Quản lý số dư**: 
  - 📈 **Lịch sử giao dịch**: Theo dõi chi tiết chuyển động vàng theo người dùng
  - 📊 **Nhật ký sử dụng**: Lịch sử mở khóa tập phim (vàng vs quảng cáo)
- 🎖️ **Quản lý thành viên**:
  - ✏️ **Sửa tiền vàng**: Hỗ trợ sửa số dư tiền vàng của người dùng
  - 👑 **Sửa thành miên**: Hỗ trợ bù cấp thành viên VIP
  - 👥 **Xem thành viên đội**: Hỗ trợ xem người dùng trực tiếp, gián tiếp
  - 📁 **Phân tổ thành viên**: Cấu hình phân nhóm:
    - Thành viên thường: Xem phim cơ bản, có quảng cáo, giới hạn chất lượng.
    - VIP FreeAds: Xem phim không quảng cáo, chất lượng cao hơn.
    - VIP Gold: Không quảng cáo, mở khóa chất lượng 1080p, xem phim độc quyền, nhiều quyền lợi nhất.
- 📋 **Nhật ký chi tiết**:
  - 🪙 **Nhật ký tiền vàng**: Tìm kiếm theo ID, biệt danh để xem biến động tiền vàng
  - 🔓 **Nhật ký giải khóa**: Xem nhật ký giải khóa tập phim (tiền vàng vs quảng cáo)
  - ☀️ **Nhật ký điểm danh**: Xem nhật ký điểm danh hàng ngày của người dùng
  - 📺 **Nhật ký lịch sử**: Xem lịch sử xem phim chính xác đến giây
  - 🔄 **Nhật ký thay đổi**: Xem nhật ký thay đổi thông tin thành viên, thời hạn

#### **💼 Hệ thống tiếp thị liên kết (CTV)**
- 🔗 **Quản lý CTV**: 
  - ➕ **Tạo tài khoản**: Thêm đối tác liên kết mới với cấu hình tùy chỉnh
  - ✏️ **Quản lý hồ sơ**: Chỉnh sửa thông tin công ty, tên thật, tỷ lệ hoa hồng
  - 🔗 **Tạo mã & link giới thiệu**: Mỗi CTV được cấp một mã giới thiệu riêng và một link giới thiệu cá nhân (ví dụ: https://vietshort.vn/?ref=ctv123).
    - Khách hàng có thể nhập mã giới thiệu này khi đăng ký tài khoản hoặc khi nạp tiền để ghi nhận nguồn giới thiệu.
    - Hoặc khách hàng chỉ cần truy cập vào link giới thiệu, hệ thống sẽ tự động ghi nhận mã CTV qua ref trên link.
    - Mọi hành động như đăng ký, nạp tiền, xem phim... đều được ghi nhận là do CTV đó giới thiệu, giúp tính hoa hồng và thống kê hiệu quả.
- 📊 **Dữ liệu CTV**: 
  - 🔎 **Xem thông tin**: Mã CTV, công ty, tên thật, tài khoản, tỷ lệ hoa hồng (%)
  - 📈 **Số liệu thực tế**: Số link, lượt click, đăng ký, người nạp, doanh thu
  - 💹 **Theo dõi hoa hồng**: Hoa hồng, chờ rút, trạng thái
- 📈 **Bảng điều khiển hiệu suất**: 
  - 💹 **Số liệu thời gian thực**: Tỷ lệ click, chuyển đổi đăng ký, phân bổ doanh thu
  - 📅 **Báo cáo theo thời gian**: Phân tích hiệu suất hàng ngày, hàng tuần, hàng tháng
  - 🏆 **Top performer**: Bảng xếp hạng và công nhận thành tích
  - 💰 **Máy tính hoa hồng**: Tỷ lệ phần trăm có thể cấu hình cho mỗi đối tác

#### **🎟️ Quản lý mã trao đổi**

- 📦 **Tạo & quản lý lô mã**:
  - ➕ **Tạo lô mã hàng loạt**: Quản trị viên có thể tạo nhiều mã đổi cùng lúc cho từng lô, chọn loại phần thưởng (tiền vàng, VIP...), số lượng, giá trị, thời gian hiệu lực, độ dài mã, giới hạn số lần sử dụng/mã.
  - 📊 **Danh sách lô mã**: Theo dõi chi tiết từng lô: tên lô, loại phần thưởng, số lượng mã, số mã đã phát, đã dùng, chưa dùng, tỷ lệ sử dụng, trạng thái (đang hoạt động, hết hạn...), thời gian bắt đầu/kết thúc.
  - 💾 **Xuất mã đổi**: Có thể xuất toàn bộ mã trong lô ra file Excel để phát cho người dùng hoặc đối tác.

- 🧑‍💻 **Phát hành & sử dụng mã**:
  - Người dùng nhập mã đổi vào app/web để nhận phần thưởng tương ứng (vàng, VIP...).
  - Hệ thống kiểm tra điều kiện: mã còn hiệu lực, chưa dùng vượt giới hạn, đúng loại, đúng trạng thái...
  - Khi hợp lệ, hệ thống cộng thưởng và đánh dấu mã đã dùng, ghi nhận thông tin người dùng, thời gian, thiết bị.

- 🕵️ **Giám sát & kiểm soát sử dụng**:
  - 🔍 **Tình hình sử dụng**: Quản trị viên xem được lịch sử sử dụng từng mã: ai dùng, thời gian, số lần dùng, trạng thái, loại thiết bị, IP, v.v.
  - 🔎 **Tra cứu mã đổi**: Tìm kiếm nhanh theo mã, tên lô, biệt danh người dùng, ID, loại phần thưởng, giá trị, địa chỉ IP, loại thiết bị, thời gian đổi.
  - 🚨 **Chống gian lận**: Phát hiện các trường hợp nhập mã trùng lặp, vượt giới hạn, nghi ngờ lạm dụng để khóa mã hoặc cảnh báo.



#### **💰 Trung tâm tài chính**
- 📊 **Trung tâm marketing**: 
  - 📈 **Thống kê**: Tổng nạp, tổng người dùng, tổng đơn, tỷ lệ nạp tiền vàng/thành viên, biểu đồ xu hướng đơn
  - ⚙️ **Cấu hình thành viên**: Cấu hình linh hoạt mẫu nạp thành viên/tiền vàng
  - 📋 **Nhật ký nạp tiền**: Tất cả hồ sơ nạp tiền hệ thống (bao gồm nạp qua hệ thống)

---

## 🛠️ Công nghệ sử dụng

### **🌐 Frontend Web (Khách hàng)**
```
Framework: Next.js 15+ (React 18)
Styling: TailwindCSS
Video Player: HLS.js + Video.js
State Management: Zustand + React Query v5
Authentication: JWT backend là duy nhất
SEO: next-seo + structured data
i18n: next-intl (Việt, English, 中文)
UI Components: Shadcn/ui
Animations: Framer Motion
CDN: Cloudflare (Tối ưu hóa hình ảnh + video)
Deployment: Cloudflare Pages
```

### **🎛️ Admin CMS Dashboard**
```
Framework: Next.js 15 (Portal quản trị)
UI Library: Ant Design
Charts: Recharts
Editor: Monaco Editor (chỉnh sửa phụ đề)
File Upload: Uppy.js (kéo & thả)
Real-time: Socket.io (theo dõi tiến độ)
Deployment: Cloudflare Pages riêng biệt
```

### **🔧 Backend API & Services**
```
Runtime: Node.js 20+ LTS
Framework: NestJS 10+
Database: MySQL 8.0+ (chính) + Redis 7+ (cache)
ORM: Prisma (type-safe)
Queue System: BullMQ + Redis
Authentication: JWT + Refresh Tokens
File Storage: Cloudflare R2 + signed URLs
Payment Integration: 
  - Quốc tế: IAP Validation (iOS App Store / Google Play)
  - Việt Nam: VNPay + Momo
Email Services: Resend
Push Notifications: Firebase Cloud Messaging
Video Processing: FFmpeg
CDN: Cloudflare R2 + Cloudflare CDN
Deployment: Docker + Ubuntu VPS + Nginx
```

### **🤖 AI & Auto-Subtitle Stack**
```
Audio Extraction: FFmpeg 6+
Speech-to-Text: 
  - Whisper (OpenAI) - Tự triển khai
Translation: 
  - Google Translate API
Subtitle Processing: 
  - FFmpeg (đồng bộ thời gian)
  - Thuật toán tùy chỉnh (nhóm câu)
  - Xuất SRT/VTT/ASS
```

### **📱 Mobile Apps (Đa nền tảng)**
```
Framework: Flutter 3.24+ (Dart)
State: Riverpod
Video Player: Better Player
Local Storage: Hive
HTTP: Dio
Auth: OAuth → JWT backend
Push: Firebase Cloud Messaging
Payments:
  - StoreKit 2
  - Google Play Billing 6
Deploy:
  - App Store Connect
  - Google Play Console
```

---

## 🏗️ Kiến trúc hệ thống

```
                                   ┌──────────────────────────┐
                                   │      Cloudflare DNS      │
                                   │        domain.com        │
                                   └─────────────┬────────────┘
                                                 │
        ┌────────────────────────────────────────┼────────────────────────────────────────┐
        │                                        │                                        │
┌───────▼────────┐                       ┌───────▼────────┐                       ┌───────▼────────┐
│ www.domain.com │                       │ api.domain.com │                       │admin.domain.com│
│  Web Client    │                       │  Backend API   │                       │   Admin CMS    │
│ (User-facing)  │                       │  (NestJS)      │                       │ (Management)   │
└───────┬────────┘                       └───────┬────────┘                       └───────┬────────┘
        │                                        │                                        │
┌───────▼────────┐               ┌────────────────▼────────────────┐               ┌───────▼────────┐
│ Cloudflare     │               │            VPS Server           │               │ Cloudflare     │
│ Pages + CDN    │               │                                 │               │ Pages + CDN    │
│                │               │  ┌────────────────────────────┐ │               │                │
│ • Next.js 15   │               │  │        NestJS API          │ │               │ • Next.js 15   │
│ • HLS Player   │               │  │ ────────────────────────── │ │               │ • Ant Design   │
│ • SEO / i18n   │               │  │ • Auth (JWT + Refresh)     │ │               │ • CMS Tools    │
│ • Responsive   │               │  │ • Business Logic           │ │               │ • Analytics    │
└────────────────┘               │  │ • Payment Validation       │ │               └────────────────┘
                                 │  │ • Affiliate / VIP / Gold   │ │
                                 │  └──────────────┬─────────────┘ │
                                 │                 │               │
                                 │  ┌──────────────▼────────────┐  │
                                 │  │        MySQL 8.0          │  │
                                 │  │  (Main Relational DB)     │  │
                                 │  │ • Users / Movies          │  │
                                 │  │ • Orders / VIP / CTV      │  │
                                 │  └──────────────┬────────────┘  │
                                 │                 │               │
                                 │  ┌──────────────▼───────────┐   │
                                 │  │          Redis 7+        │   │
                                 │  │ ──────────────────────── │   │
                                 │  │ • Cache                  │   │
                                 │  │ • Session / Rate limit   │   │
                                 │  │ • BullMQ Queue           │   │
                                 │  │ • Socket.io Adapter      │   │
                                 │  └──────────────┬───────────┘   │
                                 │                 │               │
                                 │  ┌──────────────▼───────────┐   │
                                 │  │      BullMQ Workers      │   │
                                 │  │ ──────────────────────── │   │
                                 │  │ • Video Encode (FFmpeg)  │   │
                                 │  │ • Subtitle Processing    │   │
                                 │  │ • Email / Notification   │   │
                                 │  └──────────────┬───────────┘   │
                                 │                 │               │
                                 │  ┌──────────────▼───────────┐   │
                                 │  │     FFmpeg Engine        │   │
                                 │  │ • HLS Segmentation       │   │
                                 │  │ • Multi Resolution       │   │
                                 │  │ • Thumbnail Generation   │   │
                                 │  └──────────────┬───────────┘   │
                                 └─────────────────┼───────────────┘
                                                   │
                               ┌───────────────────▼───────────────────┐
                               │        Cloudflare R2 (Object Storage) │
                               │ ───────────────────────────────────── │
                               │ • HLS Segments (.ts / .m3u8)          │
                               │ • Posters / Thumbnails                │
                               │ • Subtitle Files (SRT / VTT)          │
                               └───────────────────┬───────────────────┘
                                                   │
                               ┌───────────────────▼───────────────────┐
                               │        Cloudflare CDN (Global Edge)   │
                               │ • Video Delivery                      │
                               │ • Image Optimization                  │
                               │ • DDoS / WAF                          │
                               └───────────────────────────────────────┘
```

---

## 🚀 Lộ trình triển khai

##### **🌐 Tuần 1: Thiết lập Next.js + Xác thực + Video API**

**Backend (2 người)**
- ✔ Hoàn thiện API xác thực (JWT, Refresh token, OAuth endpoints)
- ✔ Middleware xác thực (AuthGuard, JwtStrategy)
- ✔ API người dùng (GET /users/profile, PUT /users/profile)
- ✔ API Video (GET /videos/list, GET /videos/:id)
- ✔ URL streaming (Tạo manifest HLS)
- ✔ Rate limiting + CORS setup

**Frontend Web (2 người)**
- ✔ Thiết lập Next.js 15 app router
- ✔ TailwindCSS + Shadcn/ui cơ bản
- ✔ **Xác thực**: Đăng nhập Email/Mật khẩu, Đăng ký, Quên mật khẩu, OAuth integration
- ✔ **Chế độ khách**: Guest mode (device_id tracking, lưu lịch sử xem)
- ✔ Luồng xác thực (Lưu JWT, làm mới token)
- ✔ Zustand store (Auth state, User data)
- ✔ Trang chủ (Banner cuộn, Trending, Danh mục, Khuyến nghị)

**Admin CMS (1 người)**
- ✔ Thiết lập Next.js 15 riêng biệt
- ✔ Ant Design + Layout cớ bản
- ✔ Bảo vệ xác thực (Login-required)
- ✔ Dashboard skeleton

---

##### **🎬 Tuần 2: Web (Player + Tương tác + Thanh toán) + Admin Video**

**Backend (2 người)**
- ✔ API Bình luận (GET/POST/DELETE)
- ✔ API Yêu thích (POST/DELETE, GET danh sách)
- ✔ API Đánh giá (POST ratings)
- ✔ API Thanh toán (VNPay, Momo endpoints)
- ✔ API Tiền tệ ảo (GET số dư, POST trừ tiền)
- ✔ API Đăng ký VIP (POST subscribe, GET status)
- ✔ API Mở khóa tập (POST unlock, GET lịch sử)
- ✔ API Mã trao đổi (POST redeem, Xác thực)

**Frontend Web (2 người)** - **Tất cả tính năng:**
- ✔ **Trình phát HLS**: Tích hợp HLS.js + Video.js, điều khiển phát (play, pause, seek, quality)
- ✔ **Điều khiển cảm ứng & Gesture**: Vuốt tập, Nhấn đôi tua nhanh, Nhấn giữ xem trước 2x, Pinch zoom
- ✔ **Phụ đề đa ngôn ngữ**: Chọn ngôn ngữ, Tùy chỉnh kích thước & nền mờ, Đồng bộ AI
- ✔ **Tương tác xã hội**: Thích (❤️), Đánh dấu (🔖), Đánh giá ⭐, Bình luận (💬), Chia sẻ (Facebook/Zalo/TikTok)
- ✔ **Trang chủ đầy đủ**: Banner cuộn + nhảy link, Xu hướng, Danh mục, Khuyến nghị, Tìm kiếm
- ✔ **Trang chi tiết phim**: Thông tin phim, Danh sách tập, HLS player, Bình luận
- ✔ **Thanh toán & VIP**: Giao diện đăng ký VIP, Luồng thanh toán (VNPay/Momo), Xác thực IPN
- ✔ **Ví người dùng**: Hiển thị số dư vàng, Lịch sử nạp tiền, Modal mở khóa tập
- ✔ **Tài khoản người dùng**: Hồ sơ, Lịch sử xem, Cài đặt, Đăng xuất
- ✔ **Thiết kế Responsive**: Mobile (iOS/Android), Tablet, Desktop
- ✔ **i18n**: Giao diện Việt/English/中文

**Admin CMS (1 người)**
- ✔ **Quản lý Video**: 
  - Tải lên (Kéo & thả, Uppy.js, Theo dõi tiến độ)
  - Metadata form (Tên, Mô tả, Diễn viên, Đạo diễn, Năm, Danh mục)
  - Phim nhiều tập (Segment mapping, Danh sách tập)
  - Hàng đợi mã hóa (Socket.io real-time status)
- ✔ **Quản lý Banner**: CRUD banner, Cấu hình cuộn, Xem trước
- ✔ **Quản lý Danh mục**: CRUD danh mục
- ✔ **Tìm kiếm Người dùng**: ID/Email/Biệt danh, Xem chi tiết (Số dư, VIP status)

---

##### **🎛️ Tuần 3: Web (Search + Recommendations + Polish) + Admin (Analytics + Full Management)**

**Backend (2 người)**
- ✔ API Khuyến nghị (GET /videos/recommendations, thuật toán dựa trên lịch sử xem)
- ✔ API Tìm kiếm (Full-text, Bộ lọc: danh mục, năm, đánh giá)
- ✔ API Phân tích (Thống kê: Lượt xem, Người dùng, Doanh thu)
- ✔ API Admin (Quản lý người dùng, Quản lý trạng thái video)
- ✔ API Phụ đề (Tải, Xóa, Ánh xạ ngôn ngữ)
- ✔ API Điểm danh & Phần thưởng (GET/POST reward logs)

**Frontend Web (2 người)** - **Tính năng cuối:**
- ✔ **Trang tìm kiếm**: Full-text search, Bộ lọc (danh mục, năm, đánh giá), Sắp xếp (trending, new, rating)
- ✔ **Khuyến nghị cá nhân hóa**: Dựa trên lịch sử xem, Hiển thị trên home & sidebar
- ✔ **Phần thưởng & Giữ chân khách**: 
  - Điểm danh hàng ngày (7 ngày chu kỳ, Reset hàng tuần)
  - Nhiệm vụ hàng ngày (Xem, Thích, Bình luận, Chia sẻ)
  - Xem quảng cáo kiếm 2x vàng
  - Thành tích/Huy hiệu
  - Popup khuyến mãi thông minh (Countdown, Offer)
- ✔ **Cuộn vô hạn & Phân trang**: Lazy load, Infinite scroll
- ✔ **Xử lý lỗi & Loading states**: Skeleton, Error boundaries, Retry logic
- ✔ **Polish & Optimizations**: 
  - Code splitting & lazy load components
  - Image optimization (Cloudflare)
  - SEO (next-seo, structured data)
  - Performance: Core Web Vitals

**Admin CMS (1 người)** - **Dashboard đầy đủ:**
- ✔ **Quản lý Video Đầy đủ**: 
  - Sửa video (RE-upload, Update metadata)
  - Cấu hình giá (Từng tập hoặc chuỗi)
  - Quản lý poster/hình ảnh
  - Xóa video & Cleanup
  - Xem trước video trên web
- ✔ **Quản lý Phụ đề**: 
  - Tải file SRT hàng loạt
  - Ánh xạ ngôn ngữ (Việt, Trung, Anh)
  - Monaco Editor (chỉnh sửa)
  - Đồng bộ phụ đề
  - Xóa phụ đề
- ✔ **Quản lý Người dùng**: 
  - Danh sách với bộ lọc (ID, Email, Biệt danh, VIP status)
  - Sửa số dư vàng
  - Gán/Gỡ VIP status
  - Xem lịch sử (Giao dịch, Xem, Giải khóa)
- ✔ **Bảng điều khiển Phân tích**:
  - Thẻ thống kê (Tổng lượt xem, Người dùng, Doanh thu, Đơn)
  - Biểu đồ (Hàng ngày/Tuần/Tháng)
  - Xếp hạng phim hàng đầu
  - Xếp hạng người dùng hàng đầu (VIP, Engagement)
- ✔ **Cấu hình hệ thống**:
  - Cài đặt ngôn ngữ
  - Quản lý danh mục
  - Giá VIP gói
  - Nhật ký hoạt động admin
- ✔ **Thời gian thực**: Socket.io cập nhật trạng thái mã hóa video
- ✔ **Reports & Export**: Xuất dữ liệu (CSV/Excel)

---

**✅ Kết quả Cuối tháng - MVP Hoàn chỉnh:**

**Web (www.domain.com)** - Nền tảng streaming hoàn toàn chức năng:
- ✅ Xác thực đầy đủ (Email, OAuth, Guest mode)
- ✅ Trang chủ (Banner, Trending, Danh mục, Khuyến nghị)
- ✅ Tìm kiếm & Bộ lọc
- ✅ Trình phát HLS với toàn bộ tính năng (Gesture, Subtitle, Quality control)
- ✅ Tương tác xã hội (Thích, Đánh dấu, Đánh giá, Bình luận, Chia sẻ)
- ✅ Thanh toán (VNPay, Momo) + VIP subscription
- ✅ Ví người dùng & Mở khóa tập
- ✅ Điểm danh hàng ngày & Nhiệm vụ
- ✅ Thành tích & Phần thưởng
- ✅ Responsive (Mobile, Tablet, Desktop)

**Backend (api.domain.com)** - API hoàn toàn:
- ✅ Xác thực (JWT, OAuth bridge, Refresh token)
- ✅ Video & Streaming (Manifest HLS)
- ✅ Tương tác (Bình luận, Yêu thích, Đánh giá)
- ✅ Thanh toán (VNPay/Momo + IPN)
- ✅ VIP & Mở khóa
- ✅ Mã trao đổi
- ✅ Khuyến nghị & Tìm kiếm
- ✅ Phân tích & Admin

**Admin CMS (admin.domain.com)** - Dashboard quản lý:
- ✅ Quản lý Video (Upload, Metadata, Phim nhiều tập, Hàng đợi mã hóa)
- ✅ Quản lý Phụ đề (Upload, Chỉnh sửa, Ánh xạ)
- ✅ Quản lý Banner
- ✅ Quản lý Danh mục
- ✅ Tìm kiếm & Lọc Người dùng
- ✅ Quản lý Số dư & VIP
- ✅ Bảng điều khiển Phân tích (Thẻ, Biểu đồ, Xếp hạng)
- ✅ Cấu hình hệ thống
- ✅ Thời gian thực (Socket.io)

---

## 📦 Cấu trúc dự án

```
vietshort/
│
├── backend/                           # NestJS Backend API (Node.js 20+ LTS)
│   ├── src/
│   │   ├── main.ts                   # Entry point
│   │   ├── app.module.ts             # Root module
│   │   │
│   │   ├── auth/                      # 🔐 Xác thực & ủy quyền
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts        # JWT strategy
│   │   │   ├── oauth.strategy.ts      # OAuth bridge
│   │   │   ├── auth.module.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── users/                     # 👥 Quản lý người dùng
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-profile.dto.ts
│   │   │   │   └── user.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── videos/                    # 🎬 Video & Streaming
│   │   │   ├── videos.controller.ts
│   │   │   ├── videos.service.ts
│   │   │   ├── videos.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-video.dto.ts
│   │   │   │   ├── update-video.dto.ts
│   │   │   │   └── query-video.dto.ts
│   │   │   ├── entities/
│   │   │   │   ├── video.entity.ts
│   │   │   │   └── episode.entity.ts
│   │   │   └── services/
│   │   │       ├── hls-streaming.service.ts  # HLS manifest generation
│   │   │       └── video-queue.service.ts    # Encoding queue
│   │   │
│   │   ├── subtitles/                 # 🤖 Phụ đề tự động
│   │   │   ├── subtitles.controller.ts
│   │   │   ├── subtitles.service.ts
│   │   │   ├── subtitles.module.ts
│   │   │   ├── dto/
│   │   │   │   └── upload-subtitle.dto.ts
│   │   │   └── workers/
│   │   │       ├── whisper.worker.ts
│   │   │       ├── translate.worker.ts
│   │   │       └── sync.worker.ts
│   │   │
│   │   ├── comments/                  # 💬 Bình luận
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.service.ts
│   │   │   ├── comments.module.ts
│   │   │   └── dto/
│   │   │       ├── create-comment.dto.ts
│   │   │       └── reply.dto.ts
│   │   │
│   │   ├── likes/                     # ❤️ Thích & Yêu thích
│   │   │   ├── likes.controller.ts
│   │   │   ├── likes.service.ts
│   │   │   └── likes.module.ts
│   │   │
│   │   ├── ratings/                   # ⭐ Đánh giá
│   │   │   ├── ratings.controller.ts
│   │   │   ├── ratings.service.ts
│   │   │   └── ratings.module.ts
│   │   │
│   │   ├── payment/                   # 💰 Thanh toán
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.module.ts
│   │   │   ├── providers/
│   │   │   │   ├── vnpay.provider.ts
│   │   │   │   ├── momo.provider.ts
│   │   │   │   └── iap.provider.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-payment.dto.ts
│   │   │   │   └── payment-callback.dto.ts
│   │   │   └── entities/
│   │   │       └── transaction.entity.ts
│   │   │
│   │   ├── wallet/                    # 🪙 Ví & Tiền tệ ảo
│   │   │   ├── wallet.controller.ts
│   │   │   ├── wallet.service.ts
│   │   │   ├── wallet.module.ts
│   │   │   └── entities/
│   │   │       └── wallet.entity.ts
│   │   │
│   │   ├── vip/                       # 💎 VIP & Subscription
│   │   │   ├── vip.controller.ts
│   │   │   ├── vip.service.ts
│   │   │   ├── vip.module.ts
│   │   │   └── entities/
│   │   │       └── vip-subscription.entity.ts
│   │   │
│   │   ├── unlock/                    # 🔓 Mở khóa tập
│   │   │   ├── unlock.controller.ts
│   │   │   ├── unlock.service.ts
│   │   │   └── unlock.module.ts
│   │   │
│   │   ├── exchange-codes/            # 🎟️ Mã trao đổi
│   │   │   ├── exchange-codes.controller.ts
│   │   │   ├── exchange-codes.service.ts
│   │   │   ├── exchange-codes.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-code-batch.dto.ts
│   │   │   │   └── redeem-code.dto.ts
│   │   │   └── entities/
│   │   │       ├── exchange-code.entity.ts
│   │   │       └── code-batch.entity.ts
│   │   │
│   │   ├── recommendations/           # ⭐ Khuyến nghị
│   │   │   ├── recommendations.controller.ts
│   │   │   ├── recommendations.service.ts
│   │   │   ├── recommendations.module.ts
│   │   │   └── algorithms/
│   │   │       ├── collaborative-filter.ts
│   │   │       └── history-based.ts
│   │   │
│   │   ├── search/                    # 🔍 Tìm kiếm
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   └── search.module.ts
│   │   │
│   │   ├── gamification/              # 🎮 Điểm danh & Phần thưởng
│   │   │   ├── daily-check-in.controller.ts
│   │   │   ├── daily-check-in.service.ts
│   │   │   ├── daily-tasks.controller.ts
│   │   │   ├── daily-tasks.service.ts
│   │   │   ├── achievements.controller.ts
│   │   │   ├── achievements.service.ts
│   │   │   ├── gamification.module.ts
│   │   │   └── entities/
│   │   │       ├── daily-check-in.entity.ts
│   │   │       ├── daily-task.entity.ts
│   │   │       └── achievement.entity.ts
│   │   │
│   │   ├── affiliate/                 # 💼 Hệ thống CTV
│   │   │   ├── affiliate.controller.ts
│   │   │   ├── affiliate.service.ts
│   │   │   ├── affiliate.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-affiliate.dto.ts
│   │   │   │   └── affiliate-stats.dto.ts
│   │   │   └── entities/
│   │   │       ├── affiliate.entity.ts
│   │   │       └── affiliate-referral.entity.ts
│   │   │
│   │   ├── analytics/                 # 📊 Phân tích & Thống kê
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.module.ts
│   │   │   └── reports/
│   │   │       ├── views.report.ts
│   │   │       ├── revenue.report.ts
│   │   │       └── user.report.ts
│   │   │
│   │   ├── notifications/             # 🔔 Thông báo
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.module.ts
│   │   │   ├── providers/
│   │   │   │   ├── firebase.provider.ts
│   │   │   │   └── email.provider.ts
│   │   │   └── dto/
│   │   │       └── send-notification.dto.ts
│   │   │
│   │   ├── admin/                     # 🎛️ API quản trị
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.module.ts
│   │   │   └── dto/
│   │   │       ├── user-management.dto.ts
│   │   │       ├── content-management.dto.ts
│   │   │       └── admin-logs.dto.ts
│   │   │
│   │   ├── common/                    # 🛠️ Tiện ích chung
│   │   │   ├── guards/
│   │   │   │   ├── jwt.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── middleware/
│   │   │   │   ├── logger.middleware.ts
│   │   │   │   └── rate-limit.middleware.ts
│   │   │   ├── exceptions/
│   │   │   │   └── custom-exceptions.ts
│   │   │   ├── decorators/
│   │   │   │   ├── user.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   └── utils/
│   │   │       ├── validators.ts
│   │   │       └── helpers.ts
│   │   │
│   │   ├── config/                    # ⚙️ Config
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   ├── payment.config.ts
│   │   │   └── cloudflare.config.ts
│   │   │
│   │   └── prisma/                    # 📦 Prisma ORM
│   │       ├── schema.prisma
│   │       └── migrations/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── docker/
│       └── Dockerfile
│
│
├── frontend-web/                      # 🌐 Next.js 15 Customer Web
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Trang chủ
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── oauth-callback/
│   │   │   │       └── page.tsx
│   │   │   ├── (main)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── videos/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   # Chi tiết phim
│   │   │   │   │   └── watch/
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── page.tsx # Video player
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── category/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── account/
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── history/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── bookmarks/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── vip/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── wallet/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── rewards/
│   │   │   │       ├── daily-check-in/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── tasks/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── achievements/
│   │   │   │           └── page.tsx
│   │   │   └── api/
│   │   │       └── auth/
│   │   │           └── [...nextauth]/
│   │   │               └── route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── OAuthButtons.tsx
│   │   │   ├── video/
│   │   │   │   ├── VideoPlayer.tsx    # HLS + Video.js
│   │   │   │   ├── SubtitleControl.tsx
│   │   │   │   ├── QualitySelector.tsx
│   │   │   │   ├── GestureHandler.tsx
│   │   │   │   ├── VideoCard.tsx
│   │   │   │   └── VideoGrid.tsx
│   │   │   ├── movies/
│   │   │   │   ├── MovieDetails.tsx
│   │   │   │   ├── EpisodeSelector.tsx
│   │   │   │   ├── MovieBanner.tsx
│   │   │   │   └── MovieTrendingCarousel.tsx
│   │   │   ├── social/
│   │   │   │   ├── LikeButton.tsx
│   │   │   │   ├── BookmarkButton.tsx
│   │   │   │   ├── RatingComponent.tsx
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── ShareButtons.tsx
│   │   │   │   └── CommentInput.tsx
│   │   │   ├── payment/
│   │   │   │   ├── PaymentModal.tsx
│   │   │   │   ├── VIPCard.tsx
│   │   │   │   ├── UnlockModal.tsx
│   │   │   │   └── WalletDisplay.tsx
│   │   │   ├── rewards/
│   │   │   │   ├── DailyCheckInCard.tsx
│   │   │   │   ├── DailyTasksList.tsx
│   │   │   │   ├── AchievementBadge.tsx
│   │   │   │   └── RewardPopup.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   ├── home/
│   │   │   │   ├── BannerSection.tsx
│   │   │   │   ├── TrendingSection.tsx
│   │   │   │   ├── CategoriesSection.tsx
│   │   │   │   ├── RecommendationsSection.tsx
│   │   │   │   └── PromotionalBanner.tsx
│   │   │   └── common/
│   │   │       ├── Loading.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── Pagination.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useVideo.ts
│   │   │   ├── usePayment.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useGestures.ts
│   │   │   ├── useInfiniteScroll.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts              # API client
│   │   │   ├── auth.ts             # Auth utilities
│   │   │   ├── validators.ts       # Form validators
│   │   │   ├── constants.ts        # Constants
│   │   │   └── utils.ts            # Helpers
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts        # Zustand auth
│   │   │   ├── userStore.ts        # User data
│   │   │   ├── videoStore.ts       # Video state
│   │   │   ├── cartStore.ts        # Payment cart
│   │   │   └── uiStore.ts          # UI state
│   │   │
│   │   ├── types/
│   │   │   ├── api.ts
│   │   │   ├── user.ts
│   │   │   ├── video.ts
│   │   │   ├── payment.ts
│   │   │   └── common.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   └── animations.css
│   │   │
│   │   └── i18n/
│   │       ├── locales/
│   │       │   ├── vi.json
│   │       │   ├── en.json
│   │       │   └── zh.json
│   │       └── i18n.config.ts
│   │
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   └── videos/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
│
│
├── admin-cms/                         # 🎛️ Next.js 15 Admin Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Dashboard home
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx           # Main dashboard
│   │   │   │   ├── videos/
│   │   │   │   │   ├── page.tsx       # Video list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   # Edit video
│   │   │   │   │   └── upload/
│   │   │   │   │       └── page.tsx   # Upload
│   │   │   │   ├── subtitles/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── banners/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── categories/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── views/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── revenue/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── users/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── languages/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── vip-pricing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── admin-users/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── encoding-queue/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   └── api/
│   │   │       └── auth/
│   │   │           └── [...nextauth]/
│   │   │               └── route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AdminHeader.tsx
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   └── AdminLayout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── ChartWidget.tsx
│   │   │   │   ├── RecentActivity.tsx
│   │   │   │   └── TopVideos.tsx
│   │   │   ├── videos/
│   │   │   │   ├── VideoUploadForm.tsx
│   │   │   │   ├── VideoEditForm.tsx
│   │   │   │   ├── VideoTable.tsx
│   │   │   │   ├── EncodingQueueTable.tsx
│   │   │   │   └── VideoPreview.tsx
│   │   │   ├── subtitles/
│   │   │   │   ├── SubtitleUpload.tsx
│   │   │   │   ├── SubtitleEditor.tsx     # Monaco Editor
│   │   │   │   └── SubtitleMapping.tsx
│   │   │   ├── banners/
│   │   │   │   ├── BannerForm.tsx
│   │   │   │   ├── BannerTable.tsx
│   │   │   │   └── BannerPreview.tsx
│   │   │   ├── users/
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── UserDetails.tsx
│   │   │   │   ├── UserFilters.tsx
│   │   │   │   └── WalletManager.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── ViewsChart.tsx        # Recharts
│   │   │   │   ├── RevenueChart.tsx
│   │   │   │   ├── UserGrowthChart.tsx
│   │   │   │   └── TopVideosChart.tsx
│   │   │   └── common/
│   │   │       ├── DataTable.tsx
│   │   │       ├── FormBuilder.tsx
│   │   │       ├── FilterBar.tsx
│   │   │       └── ExportButton.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAdminAuth.ts
│   │   │   ├── useAdminAPI.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useFilters.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── admin-api.ts
│   │   │   ├── admin-auth.ts
│   │   │   └── admin-utils.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── adminAuthStore.ts
│   │   │   ├── adminVideoStore.ts
│   │   │   └── adminUIStore.ts
│   │   │
│   │   ├── types/
│   │   │   ├── admin.ts
│   │   │   └── dashboard.ts
│   │   │
│   │   └── styles/
│   │       ├── globals.css
│   │       └── admin.css
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── docs/                              # 📚 Tài liệu
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── ARCHITECTURE.md               # Architecture overview
│   ├── AUTO_SUBTITLE.md              # Subtitle system
│   ├── DATABASE.md                   # Database schema
│   ├── SETUP.md                      # Local setup guide
│   ├── ENV_VARIABLES.md              # Environment variables
│   └── API_EXAMPLES.md               # cURL/Postman examples
│
├── docker/
│   ├── docker-compose.yml            # Local development
│   ├── docker-compose.prod.yml       # Production
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── admin.Dockerfile
│
├── scripts/
│   ├── setup.sh                      # Project setup
│   ├── migrate.sh                    # Database migration
│   ├── seed.sh                       # Seed data
│   ├── build.sh                      # Build all projects
│   ├── deploy.sh                     # Deploy to production
│   └── health-check.sh               # Health check
│
├── infra/                            # Infrastructure as Code
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── vhost/
│   │   │   ├── www.conf
│   │   │   ├── api.conf
│   │   │   └── admin.conf
│   │   └── ssl/
│   │       └── certificates/
│   └── k8s/ (optional)
│       ├── deployment.yml
│       ├── service.yml
│       └── ingress.yml
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                   # CI/CD pipeline
│   │   ├── test.yml
│   │   └── deploy.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore
├── .env.example
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```