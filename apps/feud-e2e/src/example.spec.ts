import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  expect(await page.locator('lib-cardify').innerText()).toContain('Cardify');
});
