/**
 * Admin API — backward-compatible barrel re-export.
 *
 * All logic now lives in `./api/` domain modules.
 * Existing consumers can keep `import adminAPI from '@/lib/admin-api'`.
 *
 * For new code prefer importing the domain API directly:
 *   import { videosAPI } from '@/lib/api';
 */
export {
  adminAPI,
  apiClient,
  sanitizeParams,
  authAPI,
  dashboardAPI,
  videosAPI,
  bannersAPI,
  categoriesAPI,
  genresAPI,
  usersAPI,
  analyticsAPI,
  affiliatesAPI,
  exchangeCodesAPI,
  subtitlesAPI,
  settingsAPI,
  gamificationAPI,
  socialAPI,
  vipAPI,
  adsAPI,
} from './api';

export { default } from './api';

