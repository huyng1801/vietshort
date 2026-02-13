import { Page } from '@playwright/test';

const ADMIN_EMAIL = 'superadmin@vietshort.com';
const ADMIN_PASSWORD = 'superadmin123';
const API_BASE = 'http://127.0.0.1:3000';

/**
 * Login via API and inject tokens into localStorage using addInitScript.
 * This must be called BEFORE navigating to any page.
 */
export async function setupAuth(page: Page) {
  try {
    const response = await page.request.post(`${API_BASE}/api/v1/admin/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    
    if (!response.ok()) {
      console.error(`Login failed: ${response.status()} ${response.statusText()}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      throw new Error(`Login failed with status ${response.status()}`);
    }
    
    const data = await response.json() as any;

    await page.addInitScript(({ token, user }) => {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
    }, { token: data.accessToken || data.token, user: data.admin || data.user });
  } catch (error) {
    console.error('Setup auth error:', error);
    throw error;
  }
}

