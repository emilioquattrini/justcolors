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

test('checkout cart return restores the selected set quantity and both components', async ({ page }) => {
  await page.goto('/?vv_cart=1&vv_sets=3#/vaguevase');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel('Number of sets')).toHaveValue('3');
  await expect(dialog.getByText('Total: €296.70', { exact: true })).toBeVisible();
  const link = dialog.getByRole('link', { name: 'Continue to secure checkout' });
  expect(new URL((await link.getAttribute('href'))!).pathname)
    .toBe('/cart/55637478736211:3,55637479326035:3');
  await dialog.getByLabel('Number of sets').selectOption('2');
  await expect(dialog.getByText('Total: €197.80', { exact: true })).toBeVisible();
  expect(new URL((await link.getAttribute('href'))!).pathname)
    .toBe('/cart/55637478736211:2,55637479326035:2');
});

test('returned quantities outside the quick choices are preserved', async ({ page }) => {
  await page.goto('/?vv_cart=1&vv_sets=8#/vaguevase');
  await expect(page.getByRole('dialog').getByLabel('Number of sets')).toHaveValue('8');
});

test('invalid cart return data does not open or change the purchase dialog', async ({ page }) => {
  await page.goto('/?vv_cart=1&vv_sets=-2#/vaguevase');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.locator('.vv-hero').getByRole('button', { name: 'Buy vase + stem', exact: true }).click();
  await expect(page.getByRole('dialog').getByLabel('Number of sets')).toHaveValue('1');
});
