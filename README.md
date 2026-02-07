# VietShort - Nền tảng phát trực tuyến video hiện đại 🎬

VietShort là nền tảng phát trực tuyến video hiện đại, kết hợp hệ thống hoa hồng tiếp thị liên kết, quản lý VIP và thanh toán trong ứng dụng. Hỗ trợ đa nền tảng Web, Android, iOS với trải nghiệm nhất quán, tối ưu hiệu suất và khả năng mở rộng cho quy mô lớn.

---

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Nền tảng và tính năng](#nền-tảng-và-tính-năng)
  - [🌐 Nền tảng Web](#-nền-tảng-web)
  - [📱 Ứng dụng di động](#-ứng-dụng-di-động)
  - [🎛️ Admin CMS](#️-admin-cms)
  - [🤝 CTV Portal](#-ctv-portal)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Lộ trình triển khai](#lộ-trình-triển-khai)

---

## 🎯 Tổng quan

**VietShort** là nền tảng phát trực tuyến phim toàn diện với:
- **Mục tiêu**: 10.000 người dùng/ngày có khả năng mở rộng cao
- **Doanh thu đa dạng**: Mua hàng trong ứng dụng, đăng ký VIP, quảng cáo, hoa hồng cộng tác viên
- **Công nghệ hiện đại**: Phụ đề tự động AI, phát trực tuyến HLS, đa nền tảng
- **Trải nghiệm linh hoạt**: Hỗ trợ cả thành viên đã đăng ký và khách vãng lai
- **Hệ thống phức tạp**: Xử lý thanh toán, mở khóa video, quản lý cộng tác viên
- **Giữ chân khách thông minh**: Sử dụng AI với giá động & khuyến mại
- **Thanh toán Việt Nam**: Tích hợp toàn diện với VNPay, Momo cho thị trường địa phương
- **Quản trị nâng cao**: CMS toàn diện với mã trao đổi, quản lý CTV, phân tích chi tiết
- **Cổng đối tác**: Portal riêng cho CTV với báo cáo, rút tiền và tài liệu marketing

### 🚨 Yêu cầu triển khai sản xuất quan trọng (10.000 người dùng/ngày)**

⚠️ **Bảo mật & Tài chính:**
- **Bảo mật thanh toán**: Xác minh chữ ký cho webhook VNPay/Momo
- **Tính toàn vẹn giao dịch**: Giao dịch ACID cho tiền tệ ảo
- **Giới hạn tốc độ**: Bảo vệ API chống brute force
- **Xác thực đầu vào**: Bảo vệ tiềm SQL & XSS
- **Xác thực**: JWT + token refresh + quản lý phiên

⚠️ **Khả năng mở rộng & Hiệu suất:**
- **Cơ sở dữ liệu**: Sao chép MySQL Master-Slave + indexing thích hợp
- **Bộ nhớ đệm**: Cụm Redis cho phiên và bộ nhớ đệm API
- **Cân bằng tải**: Nginx với nhiều instance backend
- **CDN**: Cloudflare R2 với tỷ lệ cache hit 95%+
- **Xử lý video**: Worker mã hóa riêng với cơ chế thử lại

⚠️ **Giám sát & Độ tin cậy:**
- **Theo dõi lỗi**: Tích hợp Sentry với cảnh báo
- **Giám sát hiệu suất**: APM cho hiệu suất cơ sở dữ liệu & API
- **Chiến lược sao lưu**: Sao lưu cơ sở dữ liệu tự động + phục hồi sau thảm họa
- **Kiểm tra sức khỏe**: Giám sát endpoint & tự động mở rộng

---

## 🎯 Nền tảng và tính năng

### 🌐 **Nền tảng Web** (Dành cho khách hàng)

#### **🔐 Xác thực & Tài khoản**
- ✅ **Đăng nhập Email/Mật khẩu**: Xác thực an toàn với mã thông báo JWT
- ✅ **Tích hợp OAuth**: Google, Apple, Facebook, TikTok đăng nhập xã hội
- ✅ **Chế độ khách**: Truy cập ẩn danh để xem nội dung giới hạn & nạp vàng; tài khoản khách được định danh bằng device_id, cho phép lưu lịch sử xem và số vàng.
- ✅ **Quên mật khẩu**: Đặt lại mật khẩu dựa trên email với mã thông báo an toàn
- ✅ **Liên kết tài khoản**: Liên kết tài khoản khách với tài khoản xã hội/email
- ✅ **Chỉnh sửa profile**: Thay đổi ảnh đại diện, biệt danh, thông tin cá nhân trong settings
- ✅ **Chuyển đổi tài khoản**: Nâng cấp từ guest mode sang tài khoản chính thức
- ✅ **Nhập mã giới thiệu**: Form nhập mã CTV khi đăng ký hoặc trong profile settings
- ✅ **Tracking giới thiệu**: Tự động detect và lưu mã CTV từ URL tham số ?ref=xxx

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
- 🎮 **Điều khiển cảm ứng & Cử chỉ**:
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

#### **💰 Thanh toán & VIP** ⚠️ **[Bảo mật quan trọng]**
- 🪙 **Tiền tệ ảo**: Hệ thống đồng vàng với lịch sử giao dịch chi tiết
  - **Bắt buộc**: Giao dịch ACID cho tất cả các hành động vàng
  - **Bắt buộc**: Ghi nhật ký kiểm toán cho các điều chỉnh vàng quản trị
  - **Bắt buộc**: Các mẫu phát hiện gian lận cho chi tiêu bất thường
  - **Bắt buộc**: Bảo vệ điều kiện chạy cho chi tiêu đồng thời
- 🔓 **Mở khóa linh hoạt**: 
  - Từng tập bằng vàng hoặc xem quảng cáo reward
  - Mở khóa toàn bộ phim/series với giá ưu đãi
  - Combo unlock nhiều tập với discount
  - **BẢO MẬT**: Tính idempotency giao dịch để tránh tính phí kép
- 💎 **Gói VIP rõ ràng**:
  - **VIP FreeAds**:
    - 19k/tháng
    - 49k/3 tháng (tiết kiệm 14%)
    - 179k/1 năm (tiết kiệm 22%)
    - Xem phim không quảng cáo
  - **VIP Gold**:
    - 49k/tháng
    - 129k/3 tháng (tiết kiệm 12%)
    - 469k/1 năm (tiết kiệm 20%)
    - Không quảng cáo, mở khóa chất lượng 1080p, xem các phim độc quyền dành cho VIP, ưu tiên hỗ trợ
- 💳 **Phương thức thanh toán**: ⚠️ **[Bảo mật tài chính quan trọng]**
  - VNPay (thẻ nội địa, QR code) - **Phải có**: Xác minh chữ ký
  - Momo (ví điện tử, QR code) - **Phải có**: Bảo mật webhook
  - **Bắt buộc**: Xác minh gọi lại IPN với bảo mật thích hợp
  - **Bắt buộc**: Hệ thống đối sánh thanh toán
  - **Bắt buộc**: Cơ chế thử lại giao dịch thất bại
  - **Bắt buộc**: Phát hiện gian lận cho các giao dịch có nghi ngờ
- 🎁 **Khuyến mại thông minh**: 
  - Chiết khấu lần đầu (30% off gói đầu tiên)
  - Bán hàng theo mùa (Tết, Black Friday)
  - Popup động khi user xem giá nhưng chưa thanh toán
  - Gói combo tiết kiệm (3 tháng, 1 năm)
- 🏆 **Hiển thị lợi ích VIP**: So sánh rõ ràng các gói, calculator tiết kiệm tiền

#### **🎮 Phần thưởng & Giữ chân khách**
- ☀️ **Điểm danh hàng ngày**: Chu kỳ 7 ngày có thể cấu hình với phần thưởng
- 📋 **Nhiệm vụ hàng ngày**: Xem phim, thích, bình luận, chia sẻ (có thể cấu hình linh hoạt)
- 📺 **Xem quảng cáo**: Kiếm 2x vàng
- 🏅 **Thành tích**: Nhận huy hiệu khi hoàn thành các mốc như: theo dõi mạng xã hội, bình luận lần đầu, xem đủ số tập/phút, chia sẻ phim
- 🎯 **Giữ chân khách thông minh**:
  - 💡 **Popup giảm giá động**: Trigger tự động khi user xem bảng giá > 30s mà chưa thanh toán
  - ⏱️ **Đếm ngược áp lực**: Timer 2 phút với offer giới hạn, tạo urgency
  - 🔔 **Push notification thông minh**: 
    - Nhắc nhở xem phim dang dở sau 24h
    - Thông báo tập mới của phim đã xem
    - Khuyến mại cá nhân hóa dựa trên hành vi
    - Deep linking trực tiếp đến nội dung
  - 📊 **Retargeting behavior**: Phân tích pattern để tối ưu timing notification
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
  - 🎞️ **Quy trình mã hóa**: Đa độ phân giải (540p, 720P, 1080P), phân đoạn HLS, tạo hình nhỏ, cấu hình chất lượng
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
  - Đặt lịch hiển thị, cấu hình target khách hàng (theo loại thành viên)
- 📊 **Quản lý Xếp hạng & Danh mục**: 
  - Cấu hình trang chủ: phim Mới nhất, Phim hot, Được đánh giá cao, Xu hướng hôm nay
  - Quản lý danh mục phim hiển thị trên khám phá
- ⭐ **Cấu hình Khuyến nghị**: 
  - Bật/tắt gợi ý, điều chỉnh độ chính xác, cấu hình thuật toán
  - Xem thông tin thuật toán hiện tại, thống kê hiệu suất

#### **💬 Quản lý Tương tác xã hội**
- 🗨️ **Quản lý bình luận**: 
  - Bình luận được tự động phê duyệt nhưng có bộ lọc từ khóa cấm, spam, hoặc nội dung vi phạm.
  - Duyệt, phê duyệt, xóa bình luận, chặn người dùng spam
  - Cấu hình filters từ khóa cấm, tự động tiếp điểm
  - Xem thống kê bình luận theo phim
- ⭐ **Quản lý đánh giá**: 
  - Chỉ khách hàng VIP mới được đánh giá phim.
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
- 📂 **Quản lý phân loại & Ngôn ngữ**: 
  - 🌍 **Cấu hình đa ngôn ngữ**: Thiết lập mã ngôn ngữ hệ thống (vi, en, zh-CN)
  - 🏷️ **Quản lý danh mục**: CRUD categories (Tiên hiệp, Xuyên không, Trọng sinh, Lãng mạn, v.v.)
  - 🎬 **Metadata template**: Template mô tả phim theo từng thể loại
  - 🔗 **Đồng bộ danh mục**: Tự động đổi chỗ danh mục giữa web/di động
- 🗂️ **Quản lý Menu & Navigation**:
  - 📱 **Cấu hình menu**: Thiết lập cấu trúc menu cho web/mobile
  - 🔗 **Quy tắc định tuyến**: Quản lý URL routing, deep linking
  - 📍 **Menu động**: Hiển thị menu dựa trên role user (guest/user/vip)
  - 🎯 **A/B test menu**: Test các layout menu khác nhau
- 🔐 **Quản lý quyền hạn**:
  - ➕ **Quản trị viên**: Thêm, sửa, xóa quản trị viên hệ thống
  - 📋 **Nhật ký quản trị viên**: Hiển thị nhật ký thao tác của admin
  - 👥 **Nhóm vai trò**: Thêm, sửa, xóa nhóm vai trò & phân quyền
  - 🛡️ **Permission matrix**: Ma trận quyền chi tiết cho từng tính năng

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
  - ✏️ **Sửa số dư vàng**: Hỗ trợ sửa số dư vàng của người dùng
  - 👑 **Sửa thành miên**: Hỗ trợ bù cấp thành viên VIP
  - 👥 **Xem thành viên đội**: Hỗ trợ xem người dùng trực tiếp, gián tiếp
  - 📁 **Phân tổ thành viên**: Cấu hình phân nhóm:
    - Thành viên thường: Xem phim cơ bản, có quảng cáo, giới hạn chất lượng.
    - VIP FreeAds: Xem phim không quảng cáo.
    - VIP Gold: Không quảng cáo, mở khóa chất lượng 1080p, xem phim độc quyền, nhiều quyền lợi nhất.
- 📋 **Nhật ký chi tiết**:
  - 🪙 **Nhật ký tiền vàng**: Tìm kiếm theo ID, biệt danh để xem biến động tiền vàng
  - 🔓 **Nhật ký giải khóa**: Xem nhật ký giải khóa tập phim (tiền vàng vs quảng cáo)
  - ☀️ **Nhật ký điểm danh**: Xem nhật ký điểm danh hàng ngày của người dùng
  - 📺 **Nhật ký lịch sử**: Xem lịch sử xem phim chính xác đến giây
  - 🔄 **Nhật ký thay đổi**: Xem nhật ký thay đổi thông tin thành viên, thời hạn

#### **💼 Hệ thống tiếp thị liên kết (CTV)**
- 🔗 **Quản lý CTV Admin Panel**: 
  - ➕ **Tạo tài khoản**: Thêm đối tác liên kết mới với cấu hình tùy chỉnh
  - ✏️ **Quản lý hồ sơ**: Chỉnh sửa thông tin công ty, tên thật, tỷ lệ hoa hồng, trạng thái hoạt động
  - 🔗 **Tạo mã & link giới thiệu**: Mỗi CTV được cấp một mã giới thiệu riêng và một link giới thiệu cá nhân (ví dụ: https://vietshort.vn/?ref=ctv123).
    - Khách hàng có thể nhập mã giới thiệu này khi đăng ký tài khoản hoặc khi nạp tiền để ghi nhận nguồn giới thiệu.
    - Hoặc khách hàng chỉ cần truy cập vào link giới thiệu, hệ thống sẽ tự động ghi nhận mã CTV qua ref trên link và lưu cookie tracking.
    - Mọi hành động như đăng ký, nạp tiền, xem phim... đều được ghi nhận là do CTV đó giới thiệu, giúp tính hoa hồng và thống kê hiệu quả.
  - 💰 **Quản lý thanh toán CTV**: Duyệt yêu cầu rút hoa hồng, lịch sử thanh toán, cấu hình chu kỳ thanh toán
- 📊 **Dữ liệu CTV trong Admin**: 
  - 🔎 **Xem thông tin**: Mã CTV, công ty, tên thật, tài khoản, tỷ lệ hoa hồng (%), trạng thái
  - 📈 **Số liệu thực tế**: Số link, lượt click, đăng ký, người nạp, doanh thu, hoa hồng tích lũy
  - 💹 **Theo dõi hoa hồng**: Hoa hồng chờ duyệt, đã thanh toán, tạm khóa
- 📈 **Bảng điều khiển hiệu suất Admin**: 
  - 💹 **Số liệu thời gian thực**: Tỷ lệ click, chuyển đổi đăng ký, phân bổ doanh thu theo CTV
  - 📅 **Báo cáo theo thời gian**: Phân tích hiệu suất hàng ngày, hàng tuần, hàng tháng của từng CTV
  - 🏆 **Top performer**: Bảng xếp hạng và công nhận thành tích, thưởng bonus
  - 💰 **Máy tính hoa hồng**: Tỷ lệ phần trăm có thể cấu hình cho mỗi đối tác, các mức hoa hồng theo doanh số

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

### 🤝 **CTV Portal** (Cổng đối tác)

Portal riêng biệt dành cho đối tác CTV tiếp thị liên kết, tối ưu hóa hiệu suất và quản lý doanh thu hoa hồng.

#### **🔑 Hệ thống xác thực**
- 🔐 **Đăng nhập riêng biệt**: Tài khoản CTV độc lập (frontend riêng, API backend dùng chung)
- 🔄 **Phiên làm việc tự động gia hạn**: Không phải đăng nhập lại liên tục

#### **📊 Bảng điều khiển thống kê**
- 📈 **Số liệu cơ bản**: Lượt click, tỷ lệ chuyển đổi, doanh thu
- 📅 **Biểu đồ xu hướng**: Theo ngày, tuần, tháng

#### **🔗 Quản lý liên kết** 
- 🎨 **Tạo link tracking**: Mã giới thiệu riêng với UTM tracking

#### **💰 Hệ thống hoa hồng & rút tiền**
- 💎 **Tính hoa hồng**: % theo doanh số
- 📊 **Theo dõi chi tiết**: Từng giao dịch, người dùng mang lại doanh thu
- 💳 **Rút tiền**: Bank transfer (chu kỳ hàng tháng)
- 🔍 **Lịch sử minh bạch**: Tất cả giao dịch rút tiền với trạng thái rõ ràng

#### **🎨 Tài liệu marketing**
- 🖼️ **Thư viện banner**: Banner quảng cáo cơ bản với tracking code

---

## 🛠️ Công nghệ sử dụng

### **🌐 Nền tảng Web (Khách hàng)**
```
Khung làm việc: Next.js 15+ (React 18)
Giao diện: TailwindCSS
Trình phát video: HLS.js + Video.js
Quản lý trạng thái: Zustand + React Query v5
Xác thực: JWT từ backend
Tối ưu SEO: next-seo + dữ liệu có cấu trúc
Đa ngôn ngữ: next-intl (Việt, English, 中文)
Thành phần giao diện: Shadcn/ui
Hiệu ứng: Framer Motion
Mạng phân phối: Cloudflare (Tối ưu hóa hình ảnh + video)
Triển khai: Cloudflare Pages
```

### **🎛️ Bảng điều khiển quản trị CMS**
```
Khung làm việc: Next.js 15 (Cổng quản trị)
Thư viện giao diện: Ant Design
Biểu đồ: Recharts
Trình soạn thảo: Monaco Editor (chỉnh sửa phụ đề)
Tải lên tệp: Uppy.js (kéo & thả)
Thời gian thực: Socket.io (theo dõi tiến độ)
Triển khai: Cloudflare Pages riêng biệt
```

### **🔧 Hệ thống Backend & Dịch vụ API** ⚠️ **[Quan trọng sản xuất]**
```
Môi trường chạy: Node.js 20+ LTS
Khung làm việc: NestJS 10+
Cơ sở dữ liệu: MySQL 8.0+ Sao chép Master-Slave (Bắt buộc)
  - Master: Hoạt động ghi với bộ nhớ kết nối
  - Slave: Hoạt động đọc cho phân tích & báo cáo  
  - Quan trọng: Indexing thích hợp cho hiệu suất (users, videos, comments)
  - Quan trọng: Phân vùng bảng cho bảng lớn
Redis: Redis 7+ Cluster (Bắt buộc cho 10k người dùng)
  - Lưu trữ phiên với quản lý TTL
  - Bộ nhớ đệm phản hồi API với vô hiệu hóa thích hợp
  - Lưu trữ giới hạn tốc độ
  - Hàng đợi công việc BullMQ
ORM: Prisma (an toàn kiểu dữ liệu) với tối ưu hóa truy vấn
Hệ thống hàng đợi: BullMQ + Redis với cơ chế thử lại
Xác thực: JWT + Token làm mới + Phân quyền theo vai trò
  - Bảo mật: Giới hạn tốc độ cho endpoint đăng nhập
  - Bảo mật: Cơ chế khóa tài khoản
  - Bảo mật: Vô hiệu hóa phiên
Lưu trữ tệp: Cloudflare R2 + URL ký
  - Hiệu suất: Tối ưu hóa tiêu đề bộ nhớ đệm CDN
  - Dọn dẹp: Công việc dọn dẹp phân đoạn tự động
Hệ sinh thái API:
  - API Nhiệm vụ hàng ngày: GET/POST /tasks, theo dõi hoàn thành
  - Quản lý danh sách phát: CRUD /playlists, bộ sưu tập người dùng
  - Thông báo thông minh: Firebase + trình kích hoạt tùy chỉnh
  - Thử nghiệm A/B: Cờ tính năng + phân tích
Tích hợp thanh toán: 
  - Quốc tế: Xác thực IAP (iOS App Store / Google Play)
  - Việt Nam: VNPay + Momo với Xác minh chữ ký
  - Quan trọng: Hệ thống đối sánh giao dịch
  - Quan trọng: Cơ chế thử lại webhook
Dịch vụ email: Resend
Thông báo đẩy: Firebase Cloud Messaging
Xử lý video: FFmpeg Workers (tiến trình riêng)
  - Khả năng mở rộng: Dịch vụ mã hóa riêng
  - Độ tin cậy: Cơ chế thử lại cho mã hóa thất bại
CDN: Cloudflare R2 + Cloudflare CDN
Thời gian thực: Socket.io (trạng thái mã hóa, thông báo quản trị)
Hệ thống kiểm toán: Ghi nhật ký hoạt động hoàn chỉnh với bảo vệ giả mạo
Thành phần chỉ dẫn API: Swagger/OpenAPI
Triển khai: Docker + Ubuntu VPS + Cân bằng tải Nginx
  - Khả năng mở rộng: Nhiều instance backend
  - Giám sát: Kiểm tra sức khỏe + tự động mở rộng
  - Bảo mật: Bảo vệ WAF + DDoS

Giám sát & Cảnh báo (Bắt buộc):
  - Theo dõi lỗi: Sentry với tích hợp Slack
  - Hiệu suất: APM New Relic/DataDog
  - Cơ sở dữ liệu: Giám sát hiệu suất truy vấn
  - Số liệu kinh doanh: Bảng điều khiển tùy chỉnh
  - Thời gian hoạt động: Giám sát endpoint (mục tiêu: 99.9%)
```

## 🏗️ Kiến trúc hệ thống

```
                                   ┌──────────────────────────┐
                                   │      Cloudflare DNS      │
                                   │        domain.com        │
                                   └─────────────┬────────────┘
                                                 │
     ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
     │                                           │                                           │
┌────▼─────┐  ┌──────────┐            ┌─────────▼──────────┐            ┌──────────┐  ┌────▼─────┐
│www.domain│  │ctv.domain│            │  api.domain.com    │            │admin     │  │cdn.domain│
│   .com   │  │   .com   │            │   Backend API      │            │  .com    │  │   .com   │
│Web Client│  │CTV Portal│            │                    │            │Admin CMS │  │(Static)  │
│(Customer)│  │(Partners)│            │                    │            │          │  │   CDN    │
└────┬─────┘  └─────┬────┘            └─────────┬──────────┘            └─────┬────┘  └────┬─────┘
     │              │                           │                             │            │
┌────▼─────┐ ┌──────▼────┐          ┌──────────▼──────────┐          ┌───────▼────┐ ┌─────▼────┐
│Cloudflare│ │Cloudflare │          │      VPS Server     │          │Cloudflare  │ │Cloudflare│
│Pages     │ │Pages      │          │                     │          │Pages       │ │R2+CDN    │
│+ CDN     │ │+ CDN      │          │ ┌─────────────────┐ │          │+ CDN       │ │Global    │
│          │ │           │          │ │   NestJS API    │ │          │            │ │Delivery  │
│• Next.js │ │• Next.js  │          │ │ ─────────────── │ │          │• Next.js   │ │          │
│• Customer│ │• CTV      │          │ │• Auth (JWT)     │ │          │• Admin     │ │• HLS     │
│• HLS     │ │• Dashboard│          │ │• Business Logic │ │          │• Analytics │ │• Images  │
│• Payment │ │• Reports  │          │ │• Payments       │ │          │• Management│ │• Files   │
│• Social  │ │• Withdraw │          │ │• CTV/Affiliate  │ │          │• Moderation│ │          │
└──────────┘ └───────────┘          │ │• VIP/Gold       │ │          └────────────┘ └──────────┘
                                    │ └─────────────────┘ │
                                    │         │           │
                                    │ ┌───────▼─────────┐ │
                                    │ │   MySQL 8.0     │ │
                                    │ │(Main Database)  │ │
                                    │ │• Users/Videos   │ │
                                    │ │• Orders/VIP     │ │
                                    │ │• CTV/Affiliates │ │
                                    │ │• Audit Logs     │ │
                                    │ └───────┬─────────┘ │
                                    │         │           │
                                    │ ┌───────▼─────────┐ │
                                    │ │    Redis 7+     │ │
                                    │ │ ─────────────── │ │
                                    │ │• Cache/Session  │ │
                                    │ │• Rate Limiting  │ │
                                    │ │• BullMQ Queue   │ │
                                    │ │• Socket.io      │ │
                                    │ │• CTV Tracking   │ │
                                    │ └───────┬─────────┘ │
                                    │         │           │
                                    │ ┌───────▼─────────┐ │
                                    │ │ BullMQ Workers  │ │
                                    │ │ ─────────────── │ │
                                    │ │• Video Encoding │ │
                                    │ │• Subtitle AI    │ │
                                    │ │• Email/Push     │ │
                                    │ │• CTV Commission │ │
                                    │ │• Analytics      │ │
                                    │ └─────────────────┘ │
                                    └─────────────────────┘
```

---

## 🚀 **Lộ trình triển khai **

### 🚨 **Phân tích lỗ hổng quan trọng**

**Trạng thái hiện tại**: ⚠️ **15% sẵn sàng sản xuất**
**Các vấn đề chính**: Lỗ hổng bảo mật, nút thắt khả năng mở rộng, rủi ro tích hợp thanh toán

**PHẢI FIX TRƯỚC KHI PHÁT TRIỂN:**
- 🔐 Khoảng trống bảo mật xác thực & ủy quyền
- 💰 Thiếu xác minh chữ ký webhook thanh toán
- 🗄️ Thiết kế cơ sở dữ liệu thiếu indexing & sao chép thích hợp
- 📹 Kiến trúc phát trực tuyến video có điểm lỗi duy nhất
- 🔍 Không có giám sát, ghi nhật ký hoặc theo dõi lỗi
- ⚖️ Thiếu load balancing & dự phòng

### 🏗️ **UPDATED PRODUCTION ROADMAP**

##### **🔒 GIAI ĐOẠN 1: BẢO MẬT & NỀN TẢNG (Tuần 1-4) [QUAN TRỌNG]**

**Tuần 1-2: Cứng hóa bảo mật & Nền tảng cơ sở dữ liệu**
- 🚨 **Thiết kế Sơ đồ cơ sở dữ liệu**: Sơ đồ ER hoàn chỉnh với các mối quan hệ phù hợp
- 🚨 **Chiến lược chỉ mục**: Chỉ mục quan trọng cho các truy vấn user, video, comment
- 🚨 **Thiết lập Master-Slave**: Cấu hình sao chép MySQL
- 🚨 **Xác thực đầu vào**: Xác thực toàn diện cho tất cả các endpoint
- 🚨 **Bảo mật xác thực**: Giới hạn tốc độ + khóa tài khoản
- 🚨 **Bảo mật thanh toán**: Xác minh chữ ký VNPay/Momo
- 🚨 **Bảo vệ Tiêm SQL**: Thực thi truy vấn có tham số
- 🚨 **Thiết lập theo dõi lỗi**: Tích hợp Sentry với cảnh báo

**Tuần 3-4: API cốt lõi & Bảo mật**
- ✔ API xác thực (JWT, Refresh token, OAuth endpoints)
- ✔ Middleware xác thực (AuthGuard, JwtStrategy, Role-based access)
- ✔ API người dùng với security validation
- ✔ API Video với kiểm soát truy cập
- ✔ URL streaming (Tạo manifest HLS với signed URLs)
- ✔ Rate limiting + CORS + security headers
- ✔ API CTV tracking với fraud detection
- ✔ API Admin authentication với permission matrix
- ✔ Audit logging system với tamper protection

**Frontend Web**
- ✔ Thiết lập Next.js 15 app router
- ✔ TailwindCSS + Shadcn/ui cơ bản
- ✔ **Xác thực**: Đăng nhập Email/Mật khẩu, Đăng ký, Quên mật khẩu, Tích hợp OAuth
- ✔ **Chế độ khách**: Chế độ khách (theo dõi device_id, lưu lịch sử xem)
- ✔ Luồng xác thực (Lưu JWT, làm mới token)
- ✔ Zustand store (Auth state, User data)
- ✔ Trang chủ (Banner cuộn, Trending, Danh mục, Khuyến nghị)

**Admin CMS**
- ✔ Thiết lập Next.js 15 riêng biệt
- ✔ Ant Design + Layout cớ bản
- ✔ Bảo vệ xác thực (Login-required)
- ✔ Dashboard skeleton

---

##### **⚡ GIAI ĐOẠN 2: KHẢ NĂNG MỞ RỘNG & HIỆU SUẤT (Tuần 5-8) [ĐỨC TIÊN CẤP CAO]**

**Backend**
- ✔ API Bình luận (GET/POST/DELETE với kiểm duyệt)
- ✔ API Yêu thích (POST/DELETE, GET danh sách)
- ✔ API Đánh giá (POST đánh giá với chống spam)
- ✔ API Thanh toán (VNPay, Momo endpoints + xác thực IPN)
- ✔ API Tiền tệ ảo (GET số dư, POST trừ tiền với ghi nhật ký kiểm toán)
- ✔ API Đăng ký VIP (POST đăng ký, GET trạng thái, PUT nâng cấp/hạ độ)
- ✔ API Mở khóa tập (POST unlock, GET lịch sử, pricing validation)
- ✔ API Mã trao đổi (POST đổi, Xác thực, xác thực lô)
- ✔ API CTV commission tracking (GET commissions, POST withdraw-request)
- ✔ API Admin quản lý người dùng (GET người dùng, PUT số dư người dùng, PUT vip người dùng)
- ✔ Socket.io setup cho real-time updates (encoding status, notifications)

**Frontend Web** - **Tất cả tính năng:**
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

**Admin CMS**
- ✔ **Quản lý Video**: 
  - Tải lên (Kéo & thả, Uppy.js, Theo dõi tiến độ)
  - Metadata form (Tên, Mô tả, Diễn viên, Đạo diễn, Năm, Danh mục)
  - Phim nhiều tập (Segment mapping, Danh sách tập)
  - Hàng đợi mã hóa (Socket.io real-time status)
- ✔ **Quản lý Banner**: CRUD banner, Cấu hình cuộn, Xem trước
- ✔ **Quản lý Danh mục**: CRUD danh mục
- ✔ **Tìm kiếm Người dùng**: ID/Email/Biệt danh, Xem chi tiết (Số dư, VIP status)

---

##### **🎯 GIAI ĐOẠN 3: LOGIC KINH DOANH & TÍNH NĂNG (Tuần 9-12) [ĐỨC TIÊN CẤP TRUNG]**

**Backend**
- ✔ API Khuyến nghị (GET /videos/recommendations, thuật toán dựa trên lịch sử xem với A/B testing)
- ✔ API Tìm kiếm (Toàn văn bản, Bộ lọc: danh mục, năm, đánh giá với phân tích tìm kiếm)
- ✔ API Phân tích (Thống kê: Lượt xem, Người dùng, Doanh thu, hiệu suất CTV)
- ✔ API Admin Extended (Công cụ kiểm duyệt, Hoạt động hàng loạt, Xuất dữ liệu)
- ✔ API CTV Management cho Admin (Phê duyệt rút tiền, Tạo báo cáo, Đặt tỷ lệ hoa hồng)
- ✔ API CTV Portal riêng (Bảng điều khiển, Yêu cầu rút tiền, Số liệu hiệu suất)
- ✔ API Phụ đề (Tải lên, Xóa, Ánh xạ ngôn ngữ, Hàng đợi xử lý AI)
- ✔ API Điểm danh & Phần thưởng (GET/POST nhật ký phần thưởng, Lược đồ phần thưởng có thể cấu hình)
- ✔ API Security & Anti-fraud (Dấu vân tay thiết bị, Phát hiện hoạt động đáng ngờ)
- ✔ API Notification system (Thông báo đẩy, Các chiến dịch email, Lấy lại mục tiêu thông minh)

**Frontend Web** - **Tính năng cuối:**
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
  - Hiệu suất: Core Web Vitals

**Admin CMS** - **Dashboard đầy đủ:**
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

##### **🚀 GIAI ĐOẠN 4: TRIỂN KHAI SẢN XUẤT (Tuần 13-16) [SẴN SÀNG PHÁT HÀNH]**

**Tuần 13-14: Cơ sở hạ tầng & Kiểm tra tải**
- 🏗️ Cung cấp máy chủ sản xuất (load balancer + nhiều instance)
- 🔧 Thiết lập đường ống CI/CD với kiểm tra tự động
- 🔐 Chứng chỉ SSL + cứng hóa bảo mật
- 📧 Tích hợp dịch vụ Email/SMS
- 📊 Hoàn thành hệ thống giám sát + cảnh báo
- 💾 Sao lưu + kiểm tra phục hồi sau thảm họa
- ⚡ Kiểm tra tải với 10k người dùng đồng thời mô phỏng
- 🛡️ Kiểm tra xâm nhập bảo mật

**Tuần 15-16: Kiểm tra cuối cùng & Phát hành**
- 💰 Kiểm tra cổng thanh toán với tiền thực (số tiền nhỏ)
- 📱 Gửi ứng dụng di động đến cửa hàng (iOS/Android)
- 👥 Kiểm tra chấp nhận của người dùng với người dùng beta
- 📈 Tối ưu hóa hiệu suất dựa trên việc sử dụng thực tế
- 🔥 Phát hành mềm với cơ sở người dùng hạn chế
- 📊 Triển khai theo dõi số liệu kinh doanh

### 🎯 **DANH SÁCH KIỂM TRA SẴN SÀNG SẢN XUẤT**

#### **🔒 Danh sách kiểm tra Bảo mật (Bắt buộc)**
- [ ] Kiểm tra đầu vào trên tất cả các endpoint được triển khai
- [ ] Bảo vệ chống SQL injection được xác minh
- [ ] Bảo vệ XSS được triển khai
- [ ] Token CSRF cho các thao tác thay đổi trạng thái
- [ ] Giới hạn tốc độ trên các endpoint nhạy cảm
- [ ] Giới hạn tốc độ xác thực + khóa tài khoản
- [ ] JWT token hết hạn + logic làm mới
- [ ] Bảo mật mật khẩu (bcrypt, yêu cầu độ phức tạp)
- [ ] HTTPS được thực thi với header bảo mật phù hợp
- [ ] API Admin có ma trận ủy quyền phù hợp

#### **💰 Danh sách kiểm tra Bảo mật Thanh toán (QUAN TRỌNG)**
- [ ] Xác minh chữ ký webhook VNPay đang hoạt động
- [ ] Xác minh chữ ký webhook Momo đang hoạt động
- [ ] Tính idempotency giao dịch được triển khai
- [ ] Hệ thống đối sánh thanh toán đang hoạt động
- [ ] Cơ chế thử lại thanh toán thất bại
- [ ] Quy tắc cơ bản phát hiện gian lận
- [ ] Ghi nhật ký kiểm toán tiền tệ ảo
- [ ] Ngăn chặn chi tiêu kép
- [ ] Xử lý timeout gọi lại thanh toán

#### **📊 Danh sách kiểm tra Hiệu suất (10K Người dùng)**
- [ ] Truy vấn cơ sở dữ liệu được tối ưu hóa với các chỉ mục phù hợp
- [ ] Thời gian phản hồi API <500ms (phần trăm thứ 95)
- [ ] Redis caching được triển khai đúng cách
- [ ] Tỷ lệ cache hit CDN >90%
- [ ] Thời gian tải video <3 giây
- [ ] Hiệu suất ứng dụng di động được kiểm tra
- [ ] Kiểm tra rò rỉ bộ nhớ hoàn tất
- [ ] Load balancer được cấu hình và kiểm tra
- [ ] Quy tắc tự động mở rộng được triển khai

#### **🔧 Danh sách kiểm tra Cơ sở hạ tầng (KHẢ NĂNG MỞ RỘNG)**
- [ ] Sao chép cơ sở dữ liệu master-slave hoạt động
- [ ] Thiết lập và kiểm tra cụm Redis
- [ ] Load balancer được cấu hình (Nginx)
- [ ] Nhiều instance backend đang chạy
- [ ] CDN được cấu hình đúng cách
- [ ] Hệ thống sao lưu được tự động hóa
- [ ] Giám sát + cảnh báo hoạt động
- [ ] Theo dõi lỗi (Sentry) được tích hợp
- [ ] Kiểm tra sức khỏe được triển khai
- [ ] Kế hoạch phục hồi sau thảm họa đã được kiểm tra

#### **📱 Danh sách kiểm tra Logic kinh doanh**
- [ ] Vòng đời đăng ký VIP chính xác
- [ ] Tính toán hoa hồng được xác minh
- [ ] Hoạt động tiền tệ ảo là nguyên tử
- [ ] Đường ống mã hóa video ổn định
- [ ] Hệ thống khuyến nghị hoạt động
- [ ] Thông báo đẩy được nhắm mục đích chính xác
- [ ] Theo dõi phân tích chính xác
- [ ] Bảng điều khiển quản trị đầy đủ chức năng

**✅ Kết quả Production-Ready System:**

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
- ✅ Quản lý CTV & Hoa hồng
- ✅ Audit logs & Security monitoring

**CTV Portal (ctv.domain.com)** - Bảng điều khiển đối tác:
- ✅ Đăng nhập & Xác thực
- ✅ Phân tích hiệu suất
- ✅ Theo dõi hoa hồng
- ✅ Yêu cầu rút tiền
- ✅ Tài liệu marketing
- ✅ Báo cáo thời gian thực
