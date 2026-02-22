import type { Metadata } from 'next';
import Link from 'next/link';
import { ScrollText, Mail, Phone, ChevronRight, AlertTriangle } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng – VietShort',
  description:
    'Điều khoản sử dụng dịch vụ xem phim trực tuyến VietShort. Quy định về tài khoản, nội dung bản quyền, thanh toán, gói VIP và trách nhiệm người dùng.',
};

const sections = [
  {
    id: 'chap-nhan',
    title: '1. Chấp nhận điều khoản',
    items: [
      'Bằng cách tạo tài khoản, đăng nhập hoặc sử dụng bất kỳ tính năng nào của VietShort, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi toàn bộ Điều khoản sử dụng này.',
      'Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.',
      'Điều khoản này áp dụng cho tất cả người dùng: khách vãng lai, tài khoản miễn phí, gói VIP và tài khoản doanh nghiệp.',
      'Người dùng dưới 13 tuổi không được phép sử dụng dịch vụ. Người dùng từ 13–18 tuổi cần có sự đồng ý của phụ huynh hoặc người giám hộ hợp pháp.',
    ],
  },
  {
    id: 'tai-khoan',
    title: '2. Tài khoản người dùng',
    items: [
      'Mỗi người dùng chỉ được tạo một (01) tài khoản cá nhân. Tạo nhiều tài khoản để lách quy tắc hoặc lạm dụng ưu đãi bị nghiêm cấm.',
      'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập. VietShort không chịu trách nhiệm về tổn thất phát sinh do bạn chia sẻ tài khoản hoặc mật khẩu cho người khác.',
      'Tài khoản VietShort là phi thương mại và phi chuyển nhượng — bạn không được bán, tặng hoặc chuyển quyền sở hữu tài khoản.',
      'Bạn phải cung cấp thông tin chính xác và cập nhật. Thông tin giả mạo có thể dẫn đến đình chỉ tài khoản.',
      'VietShort có quyền đình chỉ hoặc chấm dứt tài khoản vi phạm điều khoản mà không cần thông báo trước trong các trường hợp vi phạm nghiêm trọng.',
    ],
  },
  {
    id: 'ban-quyen',
    title: '3. Bản quyền nội dung',
    items: [
      'VietShort là nền tảng phân phối nội dung số hợp pháp. Toàn bộ phim, series, tài liệu và nội dung phát trực tuyến trên VietShort đều được cấp phép hoặc mua bản quyền chính thức từ các chủ sở hữu quyền trên thế giới.',
      'Nội dung trên VietShort được bảo vệ bởi Luật Sở hữu trí tuệ Việt Nam (Luật số 50/2005/QH11, sửa đổi 2009, 2019, 2022) và các điều ước quốc tế mà Việt Nam là thành viên.',
      'Mọi hành vi sao chép, lưu trữ, tái phân phối, phát sóng lại, chiếu công cộng, hoặc khai thác thương mại bất kỳ nội dung nào từ VietShort mà không có văn bản chấp thuận đều cấu thành vi phạm bản quyền nghiêm trọng.',
      'Sử dụng công cụ trình duyệt, phần mềm hoặc thiết bị để tải xuống (download), chụp màn hình video (screen-recording) nội dung đang phát trực tuyến là hành vi vi phạm và bị nghiêm cấm.',
      'VietShort áp dụng hệ thống DRM (Digital Rights Management) và watermark vô hình. Vi phạm bản quyền sẽ bị phát hiện và xử lý theo pháp luật.',
    ],
  },
  {
    id: 'mua-phim',
    title: '4. Mua phim và nội dung trả phí',
    items: [
      'Một số nội dung trên VietShort yêu cầu mua phim (purchase) để xem vĩnh viễn hoặc thuê (rental) trong thời hạn nhất định.',
      'Khi mua phim: bạn nhận được giấy phép cá nhân, phi độc quyền, không thể chuyển nhượng để xem nội dung đó trên tài khoản VietShort của bạn.',
      'Khi thuê phim: nội dung có thể xem trong vòng 48 giờ kể từ lần đầu phát. Sau thời hạn, quyền truy cập bị thu hồi tự động.',
      'Mua phim không bao gồm quyền tải về, sao chép, chiếu công cộng hay phân phối lại dưới bất kỳ hình thức nào.',
      'Trong trường hợp nội dung bị gỡ khỏi nền tảng do sự cố (thu hồi bản quyền từ chủ sở hữu), VietShort sẽ thông báo trước 30 ngày và hoàn tiền tương ứng hoặc cung cấp nội dung thay thế.',
      'Giá bán phim hiển thị đã bao gồm VAT.',
    ],
  },
  {
    id: 'vip',
    title: '5. Gói VIP và thanh toán',
    items: [
      'VietShort cung cấp các gói đăng ký VIP (VIP FreeAds, VIP Gold) với quyền lợi nêu rõ trên trang đăng ký. Quyền lợi từng gói có thể thay đổi theo thời gian.',
      'Thanh toán được xử lý an toàn qua các cổng VNPay, MoMo, ZaloPay, VNPT Pay, thẻ tín dụng/ghi nợ quốc tế (Visa/Mastercard). VietShort không lưu trữ thông tin thẻ đầy đủ.',
      'Gói VIP không tự động gia hạn trừ khi bạn bật tính năng gia hạn tự động trong cài đặt tài khoản.',
      'Sau khi thanh toán thành công, VietShort sẽ gửi biên lai điện tử đến email đăng ký của bạn.',
      'Trong vòng 24 giờ sau khi kích hoạt gói mới, nếu chưa sử dụng bất kỳ quyền lợi VIP nào, bạn có thể yêu cầu hoàn tiền 100%. Sau thời hạn này, phí không được hoàn trả trừ khi dịch vụ bị gián đoạn nghiêm trọng do lỗi của VietShort.',
      'VietShort bảo lưu quyền điều chỉnh giá gói. Giá mới áp dụng từ chu kỳ gia hạn tiếp theo, không ảnh hưởng đến chu kỳ đang chạy.',
    ],
  },
  {
    id: 'su-dung-hop-phap',
    title: '6. Quy tắc sử dụng hợp pháp',
    items: [
      'Chỉ sử dụng dịch vụ cho mục đích cá nhân, phi thương mại và hợp pháp.',
      'Không sử dụng VPN, proxy hoặc bất kỳ phương tiện nào để giả mạo vị trí địa lý nhằm truy cập nội dung bị hạn chế khu vực.',
      'Không sử dụng bot, crawler, script tự động để truy cập, cào dữ liệu hoặc tạo tài khoản hàng loạt.',
      'Không can thiệp vào hệ thống bảo mật, mã hóa DRM, hệ thống phát hiện gian lận hay cơ sở hạ tầng kỹ thuật của VietShort.',
      'Không phát tán nội dung vi phạm pháp luật, khiêu dâm, bạo lực, kích động hận thù hay ảnh hưởng đến an ninh quốc gia.',
      'Vi phạm các quy tắc trên có thể dẫn đến chấm dứt tài khoản vĩnh viễn, thu hồi quyền lợi đã mua và/hoặc truy cứu trách nhiệm pháp lý.',
    ],
  },
  {
    id: 'noi-dung-nguoi-dung',
    title: '7. Nội dung do người dùng đóng góp',
    items: [
      'VietShort cho phép người dùng đăng bình luận, đánh giá và nhận xét về nội dung trên nền tảng.',
      'Bằng cách đăng nội dung, bạn cấp cho VietShort giấy phép toàn cầu, miễn phí, không độc quyền để sử dụng, hiển thị và điều chỉnh nội dung đó cho mục đích cải thiện dịch vụ.',
      'Bạn chịu hoàn toàn trách nhiệm về nội dung mình đăng. Không đăng thông tin cá nhân của người khác, nội dung phỉ báng, spam hay quảng cáo trái phép.',
      'VietShort có quyền xóa bất kỳ nội dung nào vi phạm điều khoản hoặc gây hại cho cộng đồng mà không cần thông báo trước.',
    ],
  },
  {
    id: 'tuong-thich',
    title: '8. Tương thích thiết bị và dịch vụ',
    items: [
      'VietShort hoạt động tốt nhất trên các trình duyệt hiện đại (Chrome, Firefox, Edge, Safari) phiên bản mới nhất.',
      'Ứng dụng di động hỗ trợ Android 8.0+ và iOS 14+.',
      'Chất lượng phát trực tuyến phụ thuộc vào tốc độ kết nối internet của bạn. Yêu cầu tối thiểu: 5 Mbps cho HD, 25 Mbps cho 4K.',
      'VietShort không đảm bảo tính khả dụng 24/7 và có thể tạm dừng dịch vụ để bảo trì với thông báo trước khi có thể.',
    ],
  },
  {
    id: 'trach-nhiem',
    title: '9. Giới hạn trách nhiệm',
    items: [
      'VietShort cung cấp dịch vụ theo nguyên tắc "hiện trạng" (as-is) và không chịu trách nhiệm về thiệt hại gián tiếp, ngẫu nhiên hay hệ quả phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.',
      'Trách nhiệm tổng cộng của VietShort trong mọi trường hợp không vượt quá số tiền bạn đã thanh toán cho VietShort trong 3 tháng gần nhất.',
      'VietShort không chịu trách nhiệm về nội dung liên kết từ các trang web bên thứ ba xuất hiện trong nền tảng.',
      'Người dùng chịu trách nhiệm đảm bảo việc sử dụng dịch vụ tuân thủ pháp luật của quốc gia/vùng lãnh thổ nơi họ đang cư trú.',
    ],
  },
  {
    id: 'cham-dut',
    title: '10. Chấm dứt dịch vụ',
    items: [
      'Bạn có thể xóa tài khoản bất cứ lúc nào trong phần Cài đặt > Tài khoản > Xóa tài khoản.',
      'VietShort có thể chấm dứt hoặc đình chỉ dịch vụ với bạn nếu phát hiện vi phạm điều khoản, hoạt động gian lận hoặc theo yêu cầu pháp lý.',
      'Khi chấm dứt, quyền truy cập của bạn bị thu hồi ngay lập tức. Dữ liệu cá nhân sẽ được xử lý theo Chính sách bảo mật.',
      'Các giao dịch đã hoàn tất (mua phim, VIP đã kích hoạt) không được hoàn tiền khi bạn chủ động xóa tài khoản.',
    ],
  },
  {
    id: 'luat-ap-dung',
    title: '11. Luật áp dụng và giải quyết tranh chấp',
    items: [
      'Điều khoản sử dụng này được điều chỉnh bởi pháp luật nước Cộng hòa xã hội chủ nghĩa Việt Nam.',
      'Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng và hòa giải.',
      'Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra giải quyết tại Tòa án nhân dân có thẩm quyền tại Hà Nội, Việt Nam.',
      'Người dùng quốc tế đồng ý tuân theo thẩm quyền tài phán độc quyền của Tòa án Việt Nam.',
    ],
  },
  {
    id: 'thay-doi',
    title: '12. Thay đổi điều khoản',
    items: [
      'VietShort có quyền sửa đổi Điều khoản sử dụng này bất cứ lúc nào.',
      'Đối với thay đổi quan trọng ảnh hưởng đến quyền lợi người dùng, chúng tôi sẽ thông báo qua email và/hoặc thông báo nổi bật trên nền tảng ít nhất 14 ngày trước khi có hiệu lực.',
      'Đối với thay đổi nhỏ (chỉnh sửa văn phong, lỗi chính tả), hiệu lực có thể áp dụng ngay sau khi đăng tải.',
      'Tiếp tục sử dụng dịch vụ sau ngày hiệu lực đồng nghĩa với việc bạn chấp nhận điều khoản cập nhật. Nếu không đồng ý, hãy xóa tài khoản trước ngày hiệu lực.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <Breadcrumb items={[{ label: 'Điều khoản sử dụng' }]} />
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <ScrollText className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                Điều khoản sử dụng
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
                  href="#lien-he-terms"
                  className="block text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all py-1"
                >
                  13. Liên hệ
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-10 sm:space-y-12">
            {/* Important notice */}
            <div className="p-5 sm:p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl sm:rounded-2xl flex gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Vui lòng đọc kỹ Điều khoản sử dụng trước khi sử dụng dịch vụ VietShort.
                Đây là thỏa thuận pháp lý ràng buộc giữa bạn và{' '}
                <strong className="text-white">Công ty TNHH VietShort Media</strong>, quy định
                các quyền và nghĩa vụ của các bên khi sử dụng nền tảng xem phim trực tuyến.
              </p>
            </div>

            {/* Sections */}
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5 pb-3 border-b border-gray-800/60">
                  {section.title}
                </h2>
                <ul className="space-y-2.5 sm:space-y-3">
                  {section.items.map((item, ii) => (
                    <li key={ii} className="flex gap-3 text-sm sm:text-base text-gray-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/70 flex-shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Copyright callout */}
            <div className="p-5 sm:p-6 bg-red-500/5 border border-red-500/20 rounded-xl sm:rounded-2xl">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
                Cam kết bản quyền của VietShort
              </h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-3">
                VietShort tự hào là nền tảng 100% nội dung có bản quyền hợp pháp. Chúng tôi đầu
                tư mạnh mẽ vào việc mua bản quyền từ các hãng phim, nhà sản xuất trong và ngoài
                nước để mang đến trải nghiệm xem phim chất lượng, đồng thời bảo vệ quyền lợi
                chính đáng của các nghệ sĩ, đạo diễn và nhà sản xuất sáng tạo nội dung.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Khi bạn chọn xem phim trên VietShort, bạn đang trực tiếp ủng hộ nền công nghiệp
                điện ảnh Việt Nam và quốc tế phát triển bền vững.
              </p>
            </div>

            {/* Contact */}
            <section id="lien-he-terms" className="scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5 pb-3 border-b border-gray-800/60">
                13. Liên hệ
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-5 leading-relaxed">
                Nếu bạn có câu hỏi về Điều khoản sử dụng, muốn báo cáo vi phạm hoặc cần hỗ trợ
                pháp lý, vui lòng liên hệ với chúng tôi:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Mail, label: 'Email pháp lý', value: 'legal@vietshort.vn' },
                  { icon: Mail, label: 'Email hỗ trợ', value: 'support@vietshort.vn' },
                  { icon: Phone, label: 'Hotline', value: '1900 1234 (8:00 – 22:00)' },
                  { icon: Mail, label: 'Khiếu nại bản quyền', value: 'dmca@vietshort.vn' },
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

            {/* Related links */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800/50">
              <Link
                href="/privacy"
                className="flex-1 flex items-center justify-between px-5 py-4 bg-gray-900/50 border border-gray-800/50 hover:border-gray-600/50 rounded-xl transition-colors group"
              >
                <span className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                  Xem Chính sách bảo mật
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
