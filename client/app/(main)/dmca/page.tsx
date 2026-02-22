import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldAlert, Mail, ChevronRight, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export const metadata: Metadata = {
  title: 'Chính sách DMCA – VietShort',
  description:
    'Chính sách DMCA của VietShort: quy trình khiếu nại vi phạm bản quyền, yêu cầu gỡ nội dung và phản khiếu nại theo Đạo luật bảo vệ bản quyền kỹ thuật số thiên niên kỷ.',
};

const sections = [
  {
    id: 'cam-ket',
    title: '1. Cam kết bảo vệ bản quyền',
    items: [
      'VietShort nghiêm túc tôn trọng quyền sở hữu trí tuệ và tuân thủ Đạo luật bảo vệ bản quyền kỹ thuật số thiên niên kỷ (Digital Millennium Copyright Act — DMCA) và Luật Sở hữu trí tuệ Việt Nam.',
      'Toàn bộ nội dung phát trực tuyến trên VietShort đều được cấp phép hoặc mua bản quyền hợp lệ từ chủ sở hữu. Chúng tôi không dung thứ và không chủ động lưu trữ bất kỳ nội dung vi phạm bản quyền nào.',
      'Nếu bạn là chủ sở hữu bản quyền hoặc đại diện được ủy quyền hợp pháp và tin rằng nội dung trên VietShort vi phạm quyền của bạn, hãy sử dụng quy trình khiếu nại được mô tả trong trang này.',
      'VietShort áp dụng chính sách "vi phạm nhiều lần" (repeat infringer): tài khoản người dùng vi phạm bản quyền nhiều lần sẽ bị chấm dứt vĩnh viễn.',
    ],
  },
  {
    id: 'khieu-nai',
    title: '2. Quy trình khiếu nại vi phạm (DMCA Takedown)',
    items: [
      'Để gửi khiếu nại vi phạm bản quyền, hãy gửi thông báo bằng văn bản đến Đại lý DMCA được chỉ định của chúng tôi (xem phần liên hệ bên dưới).',
    'Thông báo phải đáp ứng đầy đủ các điều kiện theo §512(c)(3) DMCA, bao gồm: mô tả tác phẩm bị vi phạm, URL cụ thể, thông tin liên hệ, tuyên bố về quyền sở hữu và chữ ký điện tử hoặc vật lý. Xem mục 3 bên dưới để biết chi tiết.',
      'Chúng tôi sẽ phản hồi xác nhận nhận được khiếu nại trong vòng 2 ngày làm việc và hoàn tất xem xét trong vòng 10 ngày làm việc.',
      'Nội dung bị khiếu nại sẽ được gỡ tạm thời trong thời gian điều tra nếu khiếu nại đáp ứng đủ điều kiện theo luật.',
    ],
  },
  {
    id: 'yeu-cau',
    title: '3. Thông tin bắt buộc trong thông báo DMCA',
    items: [
      'Chữ ký điện tử hoặc vật lý của người được ủy quyền hành động thay mặt chủ sở hữu bản quyền bị vi phạm.',
      'Mô tả tác phẩm được bảo vệ bản quyền mà bạn khiếu nại bị vi phạm (tên phim, tập số, mô tả cụ thể).',
      'URL cụ thể (đường dẫn đầy đủ) đến nội dung bị cho là vi phạm trên VietShort.',
      'Thông tin liên hệ của bạn: tên đầy đủ, địa chỉ, số điện thoại, địa chỉ email.',
      'Tuyên bố với độ tin cậy thực sự rằng việc sử dụng nội dung đó chưa được chủ sở hữu bản quyền, đại diện của họ hoặc pháp luật cho phép.',
      'Tuyên bố dưới hình thức khai báo rằng thông tin trong thông báo là chính xác và bạn là chủ sở hữu bản quyền hoặc được ủy quyền hành động thay mặt họ.',
      'Lưu ý: Cung cấp thông tin sai lệch có chủ đích trong khiếu nại DMCA có thể dẫn đến trách nhiệm pháp lý theo §512(f) DMCA.',
    ],
  },
  {
    id: 'phan-khieu-nai',
    title: '4. Phản khiếu nại (Counter-Notification)',
    items: [
      'Nếu bạn tin rằng nội dung của bạn bị gỡ do nhầm lẫn hoặc xác định sai, bạn có thể gửi phản khiếu nại đến Đại lý DMCA.',
      'Phản khiếu nại phải bao gồm: chữ ký của bạn, tên và vị trí của nội dung bị gỡ, tuyên bố dưới hình thức khai báo rằng nội dung bị gỡ do nhầm lẫn hoặc xác định sai.',
      'Phản khiếu nại phải bao gồm sự đồng ý chịu thẩm quyền của Tòa án liên quan đến khiếu nại từ bên gửi thông báo gốc.',
      'Sau khi nhận phản khiếu nại hợp lệ, VietShort sẽ thông báo cho bên khiếu nại gốc và có thể khôi phục nội dung sau 10–14 ngày làm việc nếu bên khiếu nại không thông báo sẽ kiện tụng.',
    ],
  },
  {
    id: 'vi-pham-nhieu-lan',
    title: '5. Chính sách vi phạm nhiều lần',
    items: [
      'VietShort áp dụng chính sách nghiêm ngặt đối với tài khoản vi phạm bản quyền nhiều lần theo §512(i) DMCA.',
      'Vi phạm lần 1: Cảnh báo chính thức và gỡ nội dung vi phạm.',
      'Vi phạm lần 2: Đình chỉ tài khoản tạm thời 30 ngày, gỡ toàn bộ nội dung liên quan.',
      'Vi phạm lần 3 trở đi: Chấm dứt tài khoản vĩnh viễn, không hoàn tiền, và có thể thông báo cơ quan chức năng.',
      'Vi phạm đặc biệt nghiêm trọng (phân phối nội dung có bản quyền với mục đích thương mại) có thể dẫn đến chấm dứt ngay lập tức mà không cần cảnh báo trước.',
    ],
  },
  {
    id: 'bien-phap-ky-thuat',
    title: '6. Biện pháp kỹ thuật bảo vệ bản quyền',
    items: [
      'VietShort áp dụng hệ thống DRM (Digital Rights Management) để ngăn chặn sao chép và phân phối trái phép nội dung.',
      'Watermark vô hình (forensic watermarking) được nhúng vào từng luồng video để truy vết nguồn gốc rò rỉ.',
      'Hệ thống phát hiện nội dung tự động quét và ngăn chặn upload nội dung vi phạm bản quyền.',
      'Mã hóa đầu cuối (end-to-end encryption) cho tất cả luồng video ngăn chặn chặn/ghi lại trái phép.',
      'Phá khóa hoặc vô hiệu hóa bất kỳ biện pháp kỹ thuật bảo vệ nào vi phạm §1201 DMCA và Điều 28 Luật SHTT Việt Nam.',
    ],
  },
  {
    id: 'giai-phep',
    title: '7. Cấp phép và liên hệ thương mại',
    items: [
      'Nếu bạn là chủ sở hữu nội dung muốn hợp tác phân phối nội dung hợp pháp trên VietShort, hãy liên hệ đội ngũ mua bản quyền của chúng tôi.',
      'VietShort cung cấp các mô hình hợp tác: mua đứt bản quyền, chia sẻ doanh thu (revenue share), và phân phối theo khu vực (territorial licensing).',
      'Chúng tôi cam kết điều khoản minh bạch, thanh toán đúng hạn và báo cáo hiệu quả phân phối định kỳ.',
      'Email hợp tác: licensing@vietshort.vn',
    ],
  },
];

const timeline = [
  { icon: Mail, title: 'Gửi khiếu nại', desc: 'Gửi email đến dmca@vietshort.vn với đầy đủ thông tin theo §512(c)(3)', color: 'bg-blue-500/20 text-blue-400' },
  { icon: Clock, title: 'Xác nhận (2 ngày)', desc: 'Chúng tôi xác nhận nhận được và bắt đầu xem xét khiếu nại', color: 'bg-yellow-500/20 text-yellow-400' },
  { icon: ShieldAlert, title: 'Gỡ tạm thời', desc: 'Nội dung bị khiếu nại được gỡ tạm thời trong thời gian điều tra', color: 'bg-orange-500/20 text-orange-400' },
  { icon: CheckCircle2, title: 'Hoàn tất (10 ngày)', desc: 'Quyết định cuối cùng: giữ nguyên việc gỡ hoặc khôi phục nội dung', color: 'bg-green-500/20 text-green-400' },
];

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <Breadcrumb items={[{ label: 'Chính sách DMCA' }]} />
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                Chính sách DMCA
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
                  href="#lien-he-dmca"
                  className="block text-sm text-gray-400 hover:text-white hover:translate-x-1 transition-all py-1"
                >
                  8. Liên hệ Đại lý DMCA
                </a>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-10 sm:space-y-12">
            {/* Notice */}
            <div className="p-5 sm:p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl sm:rounded-2xl flex gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Chính sách này áp dụng cho các khiếu nại liên quan đến nội dung lưu trữ trên nền tảng VietShort.
                Nếu bạn phát hiện nội dung của mình bị sử dụng trái phép, vui lòng làm theo quy trình bên dưới.
                <strong className="text-amber-400"> Khiếu nại sai lệch có chủ đích sẽ bị xử lý theo luật.</strong>
              </p>
            </div>

            {/* Process Timeline */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-5 pb-3 border-b border-gray-800/60">
                Quy trình xử lý khiếu nại
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {timeline.map((step, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 sm:p-5 bg-gray-900/50 border border-gray-800/50 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white mb-1">{step.title}</p>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
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

            {/* DMCA Agent Contact */}
            <section id="lien-he-dmca" className="scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5 pb-3 border-b border-gray-800/60">
                8. Liên hệ Đại lý DMCA được chỉ định
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-5 leading-relaxed">
                Tất cả thông báo khiếu nại DMCA và phản khiếu nại phải được gửi đến Đại lý DMCA được chỉ định.
                Vui lòng đảm bảo thông báo đáp ứng đầy đủ các yêu cầu pháp lý nêu ở mục 3.
              </p>

              <div className="p-5 sm:p-6 bg-gray-900/60 border border-gray-700/50 rounded-xl sm:rounded-2xl mb-6">
                <h3 className="text-base font-semibold text-white mb-4">Đại lý DMCA — VietShort Media</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Tên tổ chức', value: 'Công ty TNHH VietShort Media' },
                    { label: 'Địa chỉ', value: 'Hà Nội, Việt Nam' },
                    { label: 'Email DMCA (ưu tiên)', value: 'dmca@vietshort.vn' },
                    { label: 'Email pháp lý', value: 'legal@vietshort.vn' },
                    { label: 'Email hợp tác cấp phép', value: 'licensing@vietshort.vn' },
                    { label: 'Thời gian xử lý', value: 'Thứ 2 – Thứ 6, 9:00 – 17:30 (GMT+7)' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <span className="text-xs sm:text-sm text-gray-500 sm:w-48 flex-shrink-0">{label}</span>
                      <span className="text-sm sm:text-base text-gray-200 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-red-500/5 border border-red-500/20 rounded-xl text-sm sm:text-base text-gray-400 leading-relaxed">
                Để đảm bảo phản hồi nhanh nhất, vui lòng đặt tiêu đề email theo mẫu:{' '}
                <span className="text-white font-mono bg-gray-800/60 px-2 py-0.5 rounded text-xs sm:text-sm">
                  [DMCA] Tên tác phẩm – Tên công ty/cá nhân
                </span>
              </div>
            </section>

            {/* Related links */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800/50">
              <Link
                href="/terms"
                className="flex-1 flex items-center justify-between px-5 py-4 bg-gray-900/50 border border-gray-800/50 hover:border-gray-600/50 rounded-xl transition-colors group"
              >
                <span className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                  Điều khoản sử dụng
                </span>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </Link>
              <Link
                href="/privacy"
                className="flex-1 flex items-center justify-between px-5 py-4 bg-gray-900/50 border border-gray-800/50 hover:border-gray-600/50 rounded-xl transition-colors group"
              >
                <span className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                  Chính sách bảo mật
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
