import { expect, test } from '@playwright/test';

test('each set includes matching quantities of the WAZP vase and stem', async ({ page }) => {
  let reservationRequests = 0;
  await page.route('**/functions/v1/vaguevase-preorder', async route => {
    reservationRequests++;
    await route.abort();
  });
  await page.goto('/#/vaguevase');
  await page.locator('.vv-hero').getByRole('button', { name: 'Buy vase + stem', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'VagueVase Small + Yellow Stem' })).toBeVisible();
  await expect(dialog.getByText('Total: €98.90', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Each set contains 1 vase (€79) + 1 yellow stem (€19.90). Both items are added to your checkout.')).toBeVisible();
  await dialog.getByLabel('Number of sets').selectOption('3');
  await expect(dialog.getByText('Total: €296.70', { exact: true })).toBeVisible();
  const checkout = dialog.getByRole('link', { name: 'Continue to secure checkout' });
  const destination = new URL((await checkout.getAttribute('href'))!);
  expect(destination.origin).toBe('https://chiarazhu.myshopify.com');
  expect(destination.pathname).toBe('/cart/55637478736211:3,55637479326035:3');
  await expect(dialog.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.getByText('Reserve without payment', { exact: true })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  expect(reservationRequests).toBe(0);
});
