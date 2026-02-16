// Domain API modules — re-exported for direct usage
export { apiClient, sanitizeParams } from './client';
export { authAPI } from './auth';
export { dashboardAPI } from './dashboard';
export { videosAPI } from './videos';
export { bannersAPI } from './banners';
export { categoriesAPI } from './categories';
export { genresAPI } from './genres';
export { usersAPI } from './users';
export { analyticsAPI } from './analytics';
export { affiliatesAPI } from './affiliates';
export { exchangeCodesAPI } from './exchange-codes';
export { subtitlesAPI } from './subtitles';
export { settingsAPI } from './settings';
export { gamificationAPI } from './gamification';
export { socialAPI } from './social';
export { vipAPI } from './vip';
export { adsAPI } from './ads';

// Composed adminAPI — backward-compatible unified object
import { authAPI } from './auth';
import { dashboardAPI } from './dashboard';
import { videosAPI } from './videos';
import { bannersAPI } from './banners';
import { categoriesAPI } from './categories';
import { genresAPI } from './genres';
import { usersAPI } from './users';
import { analyticsAPI } from './analytics';
import { affiliatesAPI } from './affiliates';
import { exchangeCodesAPI } from './exchange-codes';
import { subtitlesAPI } from './subtitles';
import { settingsAPI } from './settings';
import { gamificationAPI } from './gamification';
import { socialAPI } from './social';
import { vipAPI } from './vip';
import { adsAPI } from './ads';

export const adminAPI = {
  ...authAPI,
  ...dashboardAPI,
  ...videosAPI,
  ...bannersAPI,
  ...categoriesAPI,
  ...genresAPI,
  ...usersAPI,
  ...analyticsAPI,
  ...affiliatesAPI,
  ...exchangeCodesAPI,
  ...subtitlesAPI,
  ...settingsAPI,
  ...gamificationAPI,
  ...socialAPI,
  ...vipAPI,
  ...adsAPI,
};

export default adminAPI;
