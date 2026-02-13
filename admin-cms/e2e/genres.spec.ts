import { test, expect, Page } from '@playwright/test';
import { setupAuth } from './helpers';

const ADMIN_URL = 'http://127.0.0.1:3002/genres';
const API_BASE = 'http://127.0.0.1:3000';

// Run tests serially to avoid cross-test data races
test.describe.configure({ mode: 'serial' });
test.setTimeout(45000);

// Helper to wait for table data
async function waitForTableData(page: Page) {
  await page.waitForSelector('table tbody tr, .ant-empty', { timeout: 15000 }).catch(() => {});
}

async function waitForGenresResponse(page: Page) {
  await page.waitForResponse(
    (resp) => resp.url().includes('/api/v1/admin/genres') && resp.status() < 500,
    { timeout: 15000 },
  ).catch(() => {});
  await waitForTableData(page);
}

// Helper to create a test genre via API
async function createGenreViaAPI(page: Page, genreData: any) {
  const token = await page.evaluate(() => localStorage.getItem('admin_token'));
  
  const response = await page.request.post(`${API_BASE}/api/v1/admin/genres`, {
    data: genreData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

// Helper to delete a genre via API
async function deleteGenreViaAPI(page: Page, genreId: string) {
  const token = await page.evaluate(() => localStorage.getItem('admin_token'));
  
  return await page.request.delete(`${API_BASE}/api/v1/admin/genres/${genreId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Cleanup helper to remove test genres
async function cleanupTestGenres(page: Page) {
  if (page.isClosed()) return;
  const token = await page.evaluate(() => localStorage.getItem('admin_token'));
  
  const listResponse = await page.request.get(
    `${API_BASE}/api/v1/admin/genres?limit=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  
  const data = await listResponse.json();
  const payload = data?.data ?? data;
  const genres = payload?.data ?? payload ?? [];
  
  for (const genre of genres) {
    if (genre.name.startsWith('Test Genre') || genre.name.startsWith('E2E-') || genre.name.startsWith('Duplicate Test')) {
      try {
        await deleteGenreViaAPI(page, genre.id);
      } catch (err) {
        // Ignore errors during cleanup
      }
    }
  }
}

test.describe('Genres Management (Frontend E2E)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authentication
    await setupAuth(page);
    
    // Navigate to genres page
    await page.goto(ADMIN_URL, { waitUntil: 'networkidle' });
    await waitForGenresResponse(page);
    
    // Wait for page content to load
    try {
      await page.waitForSelector('text=Quản lý thể loại', { timeout: 10000 });
    } catch (err) {
      throw new Error(`Failed to load genres page. URL: ${page.url()}`);
    }
  });

  test.afterEach(async ({ page }) => {
    // Cleanup test data
    await cleanupTestGenres(page);
    await page.close().catch(() => {});
  });

  test('should display genres management page title', async ({ page }) => {
    const title = page.locator('text=Quản lý thể loại');
    await expect(title).toBeVisible();
  });

  test('should display Add Genre button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Thêm thể loại")');
    await expect(addButton).toBeVisible();
  });

  test('should display search input and filter controls', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await expect(searchInput).toBeVisible();
    
    const searchButton = page.locator('button:has-text("Tìm kiếm")');
    await expect(searchButton).toBeVisible();
  });

  test('should display genres table with columns', async ({ page }) => {
    await waitForTableData(page);
    
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Check table headers exist
    await expect(page.locator('th:has-text("Tên thể loại")')).toBeVisible();
    await expect(page.locator('th:has-text("Slug")')).toBeVisible();
    await expect(page.locator('th:has-text("Thao tác")')).toBeVisible();
  });

  test('should open create modal when clicking Add Genre button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Thêm thể loại")');
    await addButton.click();
    
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();
    
    const title = page.locator('.ant-modal-title:has-text("Thêm thể loại mới")');
    await expect(title).toBeVisible();
  });

  test('should close modal when clicking Cancel button', async ({ page }) => {
    const addButton = page.locator('button:has-text("Thêm thể loại")');
    await addButton.click();
    
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();
    
    const cancelButton = page.locator('button:has-text("Hủy")');
    await cancelButton.click();
    
    await expect(modal).not.toBeVisible();
  });

  test('should create a new genre successfully', async ({ page }) => {
    const genreName = `Test Genre ${Date.now()}`;
    const genreSlug = `test-genre-${Date.now()}`;
    
    const addButton = page.locator('button:has-text("Thêm thể loại")');
    await addButton.click();
    
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();
    
    // Fill form
    const nameInput = page.locator('input[placeholder*="VD: Hành động"]');
    await nameInput.fill(genreName);
    
    const slugInput = page.locator('input[placeholder*="VD: hanh-dong"]');
    await slugInput.fill(genreSlug);
    
    const descriptionInput = page.locator('textarea[placeholder*="Mô tả ngắn"]');
    await descriptionInput.fill('Test genre description');
    
    // Submit
    const submitButton = page.locator('button:has-text("Lưu")').last();
    await submitButton.click();
    
    // Wait for success message  
    await page.waitForSelector('text=Đã tạo thể loại mới', { timeout: 5000 });
    
    // Verify modal closed
    await expect(modal).not.toBeVisible();
  });

  test('should show validation error for empty name', async ({ page }) => {
    const addButton = page.locator('button:has-text("Thêm thể loại")');
    await addButton.click();
    
    const slugInput = page.locator('input[placeholder*="VD: hanh-dong"]');
    await slugInput.fill('test-slug');
    
    const submitButton = page.locator('button:has-text("Lưu")').last();
    await submitButton.click();
    
    // Check for validation error
    await page.waitForSelector('text=Vui lòng nhập tên thể loại', { timeout: 5000 });
  });

  test('should show error for duplicate genre name', async ({ page }) => {
    const genreName = `Duplicate Test ${Date.now()}`;
    
    // Create first genre via API
    await createGenreViaAPI(page, {
      name: genreName,
      slug: `duplicate-test-${Date.now()}`,
    });
    
    // Reload to refresh data
    await page.reload({ waitUntil: 'networkidle' });
    await waitForGenresResponse(page);
    
    // Try to create genre with same name
    const addButton = page.locator('button:has-text("Thêm thể loại")');
    await addButton.click();
    
    const nameInput = page.locator('input[placeholder*="VD: Hành động"]');
    await nameInput.fill(genreName);
    
    const slugInput = page.locator('input[placeholder*="VD: hanh-dong"]');
    await slugInput.fill(`another-slug-${Date.now()}`);
    
    const submitButton = page.locator('button:has-text("Lưu")').last();
    await submitButton.click();
    
    // Check for error message
    await page.waitForSelector('text=đã tồn tại', { timeout: 10000 });
  });

  test('should set default values for new genre', async ({ page }) => {
    const addButton = page.locator('button:has-text("Thêm thể loại")');
    await addButton.click();
    
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();
    
    // Check if isActive switch is checked by default
    const switchButtons = page.locator('.ant-switch');
    const isActiveSwitchChecked = await switchButtons.first().evaluate((el: any) => {
      return el.classList.contains('ant-switch-checked');
    });
    expect(isActiveSwitchChecked).toBe(true);
  });

  test('should filter genres by search term', async ({ page }) => {
    // Create test genre
    const genreName = `E2E-Search-Test-${Date.now()}`;
    await createGenreViaAPI(page, {
      name: genreName,
      slug: `e2e-search-${Date.now()}`,
    });
    
    // Reload to refresh data
    await page.reload({ waitUntil: 'networkidle' });
    await waitForGenresResponse(page);
    
    // Search for specific genre
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.fill('E2E-Search-Test');
    
    const searchButton = page.locator('button:has-text("Tìm kiếm")');
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/v1/admin/genres') && resp.status() < 500),
      searchButton.click(),
    ]);
    await waitForTableData(page);
    
    // Verify search result visible
    const genreRow = page.locator(`text=${genreName}`);
    await expect(genreRow).toBeVisible({ timeout: 10000 });
  });

  test('should filter genres by status', async ({ page }) => {
    // Create active genre
    const genreName = `E2E-Active-${Date.now()}`;
    await createGenreViaAPI(page, {
      name: genreName,
      slug: `e2e-active-${Date.now()}`,
      isActive: true,
    });
    
    // Reload to refresh data
    await page.reload({ waitUntil: 'networkidle' });
    await waitForGenresResponse(page);
    
    // Filter by active status
    const statusSelect = page.locator('.ant-select').first();
    await statusSelect.click();
    
    const activeOption = page.locator('text=Hoạt động').first();
    await Promise.all([
      page.waitForResponse((resp) => resp.url().includes('/api/v1/admin/genres') && resp.status() < 500),
      activeOption.click(),
    ]);
    
    await waitForTableData(page);
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should clear search and filters with reset button', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.fill('test search');
    
    const resetButton = page.locator('button:has-text("Đặt lại")');
    await resetButton.click();
    
    // Verify search input is cleared
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe('');
  });

  test('should delete genre successfully', async ({ page }) => {
    const genreName = `E2E-Delete-${Date.now()}`;
    const genre = await createGenreViaAPI(page, {
      name: genreName,
      slug: `e2e-delete-${Date.now()}`,
    });
    
    // Reload to refresh
    await page.reload({ waitUntil: 'networkidle' });
    await waitForGenresResponse(page);
    
    // Find and click delete button
    const rows = page.locator('table tbody tr');
    let found = false;
    for (let i = 0; i < await rows.count(); i++) {
      const row = rows.nth(i);
      const name = await row.locator('td').first().textContent();
      if (name?.includes(genreName)) {
        await row.locator('[data-icon="delete"]').click();
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
    
    // Confirm deletion
    const confirmButton = page.locator('button.ant-btn-primary:has-text("Xóa")').first();
    await confirmButton.click();
    
    // Wait for success message
    await page.waitForSelector('text=Đã xóa thể loại', { timeout: 5000 });
  });

  test('should cancel delete when clicking cancel button', async ({ page }) => {
    const genreName = `E2E-Cancel-${Date.now()}`;
    const genre = await createGenreViaAPI(page, {
      name: genreName,
      slug: `e2e-cancel-${Date.now()}`,
    });
    
    // Reload to refresh
    await page.reload({ waitUntil: 'networkidle' });
    await waitForGenresResponse(page);
    
    // Find and click delete button
    const rows = page.locator('table tbody tr');
    let found = false;
    for (let i = 0; i < await rows.count(); i++) {
      const row = rows.nth(i);
      const name = await row.locator('td').first().textContent();
      if (name?.includes(genreName)) {
        await row.locator('[data-icon="delete"]').click();
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
    
    // Click cancel
    const cancelButton = page.locator('button.ant-btn:not(.ant-btn-primary):has-text("Hủy")').first();
    await cancelButton.click();
    
    // Verify modal closed
    const modal = page.locator('.ant-modal');
    await expect(modal).not.toBeVisible();
  });

  test('should display video count for genres', async ({ page }) => {
    await waitForTableData(page);
    
    const videoCounts = page.locator('table tbody tr td:nth-child(6)');
    const count = await videoCounts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display edit and delete buttons for each genre', async ({ page }) => {
    await waitForTableData(page);
    
    const editButtons = page.locator('[data-icon="edit"]');
    const deleteButtons = page.locator('[data-icon="delete"]');
    
    expect(await editButtons.count()).toBeGreaterThan(0);
    expect(await deleteButtons.count()).toBeGreaterThan(0);
  });

  test('should display proper badges and tags for genres', async ({ page }) => {
    await waitForTableData(page);
    
    const slugTags = page.locator('.ant-tag');
    expect(await slugTags.count()).toBeGreaterThan(0);
    
    const badges = page.locator('.ant-badge-status');
    expect(await badges.count()).toBeGreaterThan(0);
  });

  test('should load different pages using pagination', async ({ page }) => {
    await waitForTableData(page);
    
    const nextPageButton = page.locator('button[aria-label*="next"]').first();
    const isNextEnabled = await nextPageButton.isEnabled().catch(() => false);
    
    if (!isNextEnabled) {
      expect(isNextEnabled).toBe(false);
      return;
    }

    await nextPageButton.click();
    await waitForGenresResponse(page);
    
    const newRows = page.locator('table tbody tr');
    const newCount = await newRows.count();
    expect(newCount).toBeGreaterThan(0);
  });
});
