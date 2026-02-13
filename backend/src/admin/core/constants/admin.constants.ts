export const ADMIN_CONSTANTS = {
  // Cache keys
  CACHE: {
    DASHBOARD_STATS: 'admin:dashboard_stats',
    USER_SESSION: (userId: string) => `user:${userId}`,
    VIDEO_CACHE: (videoId: string) => `video:${videoId}`,
    ADMIN_LOGIN_RATE_LIMIT: (email: string) => `admin_login:${email}`,
  },

  // Cache durations (seconds)
  CACHE_DURATION: {
    DASHBOARD_STATS: 300,
    RATE_LIMIT: 1800,
  },

  // Audit actions
  AUDIT_ACTIONS: {
    ADMIN_LOGIN: 'ADMIN_LOGIN',
    LOCK_USER: 'LOCK_USER',
    UNLOCK_USER: 'UNLOCK_USER',
    ADJUST_GOLD: 'ADJUST_GOLD',
    ADJUST_VIP: 'ADJUST_VIP',
    APPROVE_VIDEO: 'APPROVE_VIDEO',
    REJECT_VIDEO: 'REJECT_VIDEO',
    APPROVE_PAYOUT: 'APPROVE_PAYOUT',
    REJECT_PAYOUT: 'REJECT_PAYOUT',
  },

  // Audit resources
  AUDIT_RESOURCES: {
    ADMIN: 'admin',
    USER: 'user',
    VIDEO: 'video',
    PAYOUT: 'payout',
  },

  // JWT config
  JWT: {
    EXPIRATION: '4h',
  },

  // Bcrypt config
  BCRYPT_ROUNDS: 12,

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    AUDIT_LOG_LIMIT: 50,
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_SECONDS: 1800,
  },

  // Transaction types
  TRANSACTION_TYPES: {
    ADMIN_ADJUST: 'ADMIN_ADJUST',
    PURCHASE_GOLD: 'PURCHASE_GOLD',
    PURCHASE_VIP: 'PURCHASE_VIP',
  },

  // Transaction status
  TRANSACTION_STATUS: {
    COMPLETED: 'COMPLETED',
  },

  // Provider types
  PROVIDER_TYPES: {
    ADMIN: 'ADMIN',
  },
} as const;

export const ADMIN_ERROR_MESSAGES = {
  INVALID_ACCOUNT: 'Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa',
  INVALID_PASSWORD: 'Mật khẩu không đúng',
  TOO_MANY_LOGIN_ATTEMPTS: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 30 phút.',
  ONLY_SUPER_ADMIN_CAN_CREATE: 'Chỉ Super Admin mới tạo được admin',
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
  NICKNAME_ALREADY_EXISTS: 'Nickname đã tồn tại',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  ACCOUNT_ALREADY_LOCKED: 'Tài khoản đã bị khóa',
  ACCOUNT_NOT_LOCKED: 'Tài khoản không bị khóa',
  INSUFFICIENT_BALANCE: 'Số dư không đủ để trừ',
  VIDEO_NOT_FOUND: 'Video không tồn tại',
  VIDEO_NOT_DRAFT: 'Chỉ video ở trạng thái nháp mới duyệt được',
  PAYOUT_NOT_FOUND: 'Yêu cầu rút tiền không tồn tại',
  PAYOUT_ALREADY_PROCESSED: 'Yêu cầu này đã được xử lý',
} as const;
