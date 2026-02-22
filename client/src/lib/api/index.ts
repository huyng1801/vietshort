// Re-export all API modules from a single entry point.
// Pages import from '@/lib/api' — this barrel keeps that working.

export { api } from './client';

export { videoApi, subtitleApi, watchHistoryApi } from './video';
export type { PaginatedVideos } from './video';

export { searchApi } from './search';
export type { SearchParams } from './search';

export {
  likesApi,
  ratingsApi,
  commentsApi,
  bookmarksApi,
  bannerApi,
  recommendApi,
} from './social';

export {
  walletApi,
  vipApi,
  paymentApi,
  unlockApi,
} from './payment';
export type {
  GoldPackageResponse,
  VipPlan,
  VipStatus,
  CreatePaymentParams,
  PaymentResult,
  Transaction,
  AccessCheck,
} from './payment';

export { checkInApi, dailyTasksApi, achievementsApi } from './gamification';

export { userApi } from './user';
