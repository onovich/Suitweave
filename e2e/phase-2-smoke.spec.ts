import { expect, test } from '@playwright/test';

test('fixed-seed playable flow supports preview, execution, and turn advance', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('织花牌 · SUITWEAVE')).toBeVisible();
  await page.locator('.card:not(.wildcard)').first().click();
  await page.locator('.grid .cell').first().click();
  await expect(page.getByRole('status')).toContainText('落点预览');
  await page.getByRole('button', { name: '确认落牌' }).click();
  await expect(page.getByText('行动 2')).toBeVisible();
  await page.getByRole('button', { name: '结束回合' }).click();
  await expect(page.getByText('回合 2 / 24')).toBeVisible();
});

test('narrow view retains board summary and selectable board paging', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /21 点盘/ }).click();
  await expect(page.getByText('21 点盘').first()).toBeVisible();
  await expect(page.locator('.active-board .grid')).toBeVisible();
});
