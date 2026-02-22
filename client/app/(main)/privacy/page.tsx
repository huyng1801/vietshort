import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật – VietShort',
  description:
    'Chính sách bảo mật của VietShort mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng dịch vụ xem phim trực tuyến.',
};

const sections = [
  {
    id: 'thu-thap',
    title: '1. Thông tin chúng tôi thu thập',
    content: [
      {
        subtitle: '1.1. Thông tin bạn cung cấp trực tiếp',
        items: [
          'Họ tên, địa chỉ email, ngày sinh khi đăng ký tài khoản.',
          'Thông tin thanh toán (số thẻ ngân hàng, ví điện tử) được mã hóa theo chuẩn PCI-DSS — chúng tôi không lưu trữ số thẻ đầy đủ.',
          'Ảnh đại diện và thông tin hồ sơ công khai bạn chọn cung cấp.',
          'Nội dung liên lạc khi bạn gửi yêu cầu hỗ trợ đến đội ngũ chăm sóc khách hàng.',
        ],
      },
      {
        subtitle: '1.2. Thông tin thu thập tự động',
        items: [
          'Địa chỉ IP, loại thiết bị, hệ điều hành, trình duyệt web và phiên bản.',
          'Lịch sử xem phim: tên phim, thời lượng xem, thời điểm xem, độ phân giải được chọn.',
          'Dữ liệu tương tác: tìm kiếm, đánh giá, bình luận, phim yêu thích.',
          'Cookie phiên đăng nhập và cookie phân tích để cải thiện trải nghiệm.',
          'Dữ liệu nhật ký máy chủ: URL truy cập, mã phản hồi HTTP, lỗi kỹ thuật.',
        ],
      },
      {
        subtitle: '1.3. Thông tin từ bên thứ ba',
        items: [
          'Khi bạn đăng nhập qua mạng xã hội (Google, Facebook, Apple, TikTok), chúng tôi nhận tên hiển thị, địa chỉ email và ảnh đại diện công khai từ nhà cung cấp đó.',
          'Chúng tôi không yêu cầu và không lưu trữ mật khẩu của tài khoản mạng xã hội.',
        ],
      },
    ],
  },
  {
    id: 'su-dung',
    title: '2. Mục đích sử dụng thông tin',
    content: [
      {
        subtitle: '',
        items: [
          'Tạo, xác minh và quản lý tài khoản người dùng.',
          'Cung cấp dịch vụ phát trực tuyến, xử lý thanh toán và kích hoạt gói VIP / mua phim.',
          'Cá nhân hóa gợi ý nội dung dựa trên lịch sử xem và sở thích.',
          'Gửi thông báo giao dịch (xác nhận thanh toán, hết hạn VIP, biên lai mua phim).',
          'Gửi bản tin khuyến mãi nếu bạn đã đồng ý nhận (bạn có thể hủy đăng ký bất cứ lúc nào).',
          'Phân tích xu hướng sử dụng để cải thiện chất lượng dịch vụ và bổ sung nội dung phù hợp.',
          'Ngăn chặn gian lận, vi phạm bản quyền và các hành vi lạm dụng nền tảng.',
          'Tuân thủ nghĩa vụ pháp lý theo quy định của pháp luật Việt Nam.',
        ],
      },
    ],
  },
  {
    id: 'chia-se',
    title: '3. Chia sẻ thông tin với bên thứ ba',
    content: [
      {
        subtitle: '',
        items: [
          'VietShort không bán, cho thuê hay trao đổi thông tin cá nhân của bạn vì mục đích thương mại.',
          'Chúng tôi có thể chia sẻ dữ liệu với đối tác xử lý thanh toán (VNPay, MoMo, ZaloPay, ngân hàng liên kết) để hoàn tất giao dịch — họ bị ràng buộc bởi thỏa thuận bảo mật nghiêm ngặt.',
          'Dữ liệu phân tích ẩn danh (không xác định cá nhân) có thể được chia sẻ với đối tác nội dung để đánh giá hiệu quả phân phối.',
          'Chúng tôi có thể tiết lộ thông tin khi được yêu cầu bởi cơ quan nhà nước có thẩm quyền theo đúng trình tự pháp lý.',
          'Trong trường hợp sáp nhập, mua lại hoặc tái cơ cấu doanh nghiệp, thông tin người dùng sẽ được chuyển giao với thông báo trước.',
        ],
      },
    ],
  },
  {
    id: 'bao-ve',
    title: '4. Bảo mật dữ liệu',
    content: [
      {
        subtitle: '',
        items: [
          'Mã hóa TLS/SSL cho toàn bộ kết nối giữa ứng dụng và máy chủ.',
          'Mật khẩu được băm (hash) bằng bcrypt — nhân viên VietShort không thể đọc mật khẩu của bạn.',
          'Kiểm tra bảo mật định kỳ và vá lỗ hổng theo tiêu chuẩn OWASP.',
          'Kiểm soát truy cập nội bộ theo nguyên tắc đặc quyền tối thiểu (least privilege).',
          'Sao lưu dữ liệu được mã hóa hàng ngày tại trung tâm dữ liệu dự phòng.',
          'Mặc dù chúng tôi áp dụng các biện pháp bảo vệ tốt nhất, không có hệ thống nào an toàn 100%. Vui lòng bảo vệ mật khẩu và không chia sẻ tài khoản.',
        ],
      },
    ],
  },
  {
    id: 'quyen',
    title: '5. Quyền của bạn',
    content: [
      {
        subtitle: '',
        items: [
          'Truy cập: Bạn có quyền yêu cầu bản sao dữ liệu cá nhân chúng tôi đang lưu trữ về bạn.',
          'Chỉnh sửa: Cập nhật thông tin không chính xác hoặc không đầy đủ trong phần Cài đặt tài khoản.',
          'Xóa: Yêu cầu xóa tài khoản và dữ liệu cá nhân, trừ dữ liệu pháp lý bắt buộc lưu giữ.',
          'Phản đối xử lý: Rút lại đồng ý nhận email tiếp thị bất cứ lúc nào qua liên kết hủy đăng ký.',
          'Tính di động: Nhận bản xuất lịch sử giao dịch và dữ liệu tài khoản theo yêu cầu.',
          'Để thực hiện các quyền này, liên hệ privacy@vietshort.vn với tiêu đề "Yêu cầu quyền dữ liệu".',
        ],
      },
    ],
  },
  {
    id: 'cookie',
    title: '6. Cookie và công nghệ theo dõi',
    content: [
      {
        subtitle: '',
        items: [
          'Cookie thiết yếu: Duy trì phiên đăng nhập và xác thực bảo mật — không thể tắt.',
          'Cookie phân tích: Google Analytics và hệ thống nội bộ để đo lường lưu lượng truy cập — có thể từ chối.',
          'Cookie chức năng: Ghi nhớ sở thích như chất lượng video, ngôn ngữ phụ đề — có thể xóa trong cài đặt trình duyệt.',
          'Bạn có thể quản lý cookie thông qua cài đặt trình duyệt của mình. Tắt cookie thiết yếu có thể ảnh hưởng đến chức năng đăng nhập.',
        ],
      },
    ],
  },
  {
    id: 'thoi-gian',
    title: '7. Thời gian lưu trữ dữ liệu',
    content: [
      {
        subtitle: '',
        items: [
          'Dữ liệu tài khoản đang hoạt động: Lưu giữ trong suốt thời gian tài khoản tồn tại.',
          'Sau khi xóa tài khoản: Dữ liệu cá nhân bị xóa trong vòng 30 ngày, ngoại trừ dữ liệu giao dịch phải giữ 5 năm theo quy định thuế/kế toán.',
          'Nhật ký bảo mật: Giữ tối đa 12 tháng để điều tra sự cố.',
          'Dữ liệu phân tích ẩn danh: Có thể lưu giữ vô thời hạn do không còn liên kết cá nhân.',
        ],
      },
    ],
  },
  {
    id: 'tre-em',
    title: '8. Quyền riêng tư của trẻ em',
    content: [
      {
        subtitle: '',
        items: [
          'Dịch vụ VietShort dành cho người từ 13 tuổi trở lên.',
          'Chúng tôi không cố ý thu thập thông tin cá nhân của trẻ em dưới 13 tuổi.',
          'Nếu phát hiện tài khoản của trẻ em dưới 13 tuổi, chúng tôi sẽ xóa tài khoản và dữ liệu liên quan ngay lập tức.',
          'Phụ huynh hoặc người giám hộ có thể yêu cầu xóa tài khoản của trẻ em qua email support@vietshort.vn.',
        ],
      },
    ],
  },
  {
    id: 'cap-nhat',
    title: '9. Thay đổi chính sách',
    content: [
      {
        subtitle: '',
        items: [
          'Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian để phản ánh thay đổi trong dịch vụ hoặc quy định pháp luật.',
          'Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email đăng ký hoặc thông báo nổi bật trên nền tảng ít nhất 7 ngày trước khi có hiệu lực.',
          'Việc tiếp tục sử dụng dịch vụ sau ngày hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách cập nhật.',
          'Ngày cập nhật gần nhất được hiển thị ở cuối trang này.',
        ],
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <Breadcrumb items={[{ label: 'Chính sách bảo mật' }]} />
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                Chính sách bảo mật
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Có hiệu lực từ ngày <strong className="text-gray-200">01/01/2025</strong> &nbsp;·&nbsp;
                Cập nhật lần cuối: <strong className="text-gray-200">21/02/2026</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-gray-900/50 border border-gray-800/50 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Mục lục</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all py-1 leading-snug"
                  >
                    {s.title}
                  </a>
                ))}
                <a
                  href="#lien-he"
                  className="block text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all py-1"
                >
                  10. Liên hệ
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-10 sm:space-y-12">
            {/* Intro */}
            <div className="p-5 sm:p-6 bg-red-500/5 border border-red-500/20 rounded-xl sm:rounded-2xl">
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                VietShort (<strong className="text-white">Công ty TNHH VietShort Media</strong>), với trụ sở tại Việt Nam,
                cam kết bảo vệ quyền riêng tư của người dùng. Chính sách này mô tả rõ ràng loại thông tin chúng tôi
                thu thập, lý do thu thập và cách chúng tôi sử dụng, chia sẻ và bảo vệ thông tin đó khi bạn
                sử dụng nền tảng xem phim trực tuyến VietShort.
              </p>
            </div>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5 pb-3 border-b border-gray-800/60">
                  {section.title}
                </h2>
                <div className="space-y-5">
                  {section.content.map((block, bi) => (
                    <div key={bi}>
                      {block.subtitle && (
                        <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2.5">
                          {block.subtitle}
                        </h3>
                      )}
                      <ul className="space-y-2.5">
                        {block.items.map((item, ii) => (
                          <li key={ii} className="flex gap-3 text-sm sm:text-base text-gray-400 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500/70 flex-shrink-0 mt-2" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Contact Section */}
            <section id="lien-he" className="scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5 pb-3 border-b border-gray-800/60">
                10. Liên hệ về quyền riêng tư
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-5 leading-relaxed">
                Nếu bạn có câu hỏi, khiếu nại hoặc muốn thực hiện quyền dữ liệu cá nhân,
                vui lòng liên hệ với Bộ phận bảo mật của chúng tôi:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Mail, label: 'Email', value: 'privacy@vietshort.vn' },
                  { icon: Phone, label: 'Hotline', value: '1900 1234' },
                  { icon: MapPin, label: 'Địa chỉ', value: 'Hà Nội, Việt Nam' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-4 bg-gray-900/50 border border-gray-800/50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-red-600/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="text-sm text-gray-200 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Related link */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800/50">
              <Link
                href="/terms"
                className="flex-1 flex items-center justify-between px-5 py-4 bg-gray-900/50 border border-gray-800/50 hover:border-gray-600/50 rounded-xl transition-colors group"
              >
                <span className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                  Xem Điều khoản sử dụng
                </span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </Link>
              <Link
                href="/dmca"
                className="flex-1 flex items-center justify-between px-5 py-4 bg-gray-900/50 border border-gray-800/50 hover:border-gray-600/50 rounded-xl transition-colors group"
              >
                <span className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                  Chính sách DMCA
                </span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
