import { expect, test } from '@playwright/test';

test('purchase uses the WAZP variant and selected quantity without recording a reservation', async ({ page }) => {
  let reservationRequests = 0;
  await page.route('**/functions/v1/vaguevase-preorder', async route => {
    reservationRequests++;
    await route.abort();
  });
  await page.goto('/#/vaguevase');
  await page.locator('.vv-hero').getByRole('button', { name: 'Buy now', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'VagueVase 1 Small' })).toBeVisible();
  await expect(dialog.getByText('Total: €79.00', { exact: true })).toBeVisible();
  await dialog.getByLabel('Quantity').selectOption('3');
  await expect(dialog.getByText('Total: €237.00', { exact: true })).toBeVisible();
  const checkout = dialog.getByRole('link', { name: 'Continue to secure checkout' });
  const destination = new URL((await checkout.getAttribute('href'))!);
  expect(destination.origin).toBe('https://chiarazhu.myshopify.com');
  expect(destination.pathname).toBe('/cart/55637478736211:3');
  await expect(dialog.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.getByText('Reserve without payment', { exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  expect(reservationRequests).toBe(0);
});

