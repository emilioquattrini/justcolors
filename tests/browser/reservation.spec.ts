import { expect, test } from '@playwright/test';

test('priced reservations update totals and send the selected product separately from quantity', async ({ page }) => {
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/functions/v1/vaguevase-preorder', async route => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { success: true, referenceCode: 'VV-TEST' } });
  });
  await page.goto('/#/vaguevase');
  await page.locator('.vv-hero').getByRole('button', { name: 'Pre-order', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('Choose your pre-order').locator('option')).toHaveText([
    'Small vase + flower — €99', 'Big vase + flower — €159', 'Flower stem — €29,90',
  ]);
  await expect(dialog.getByText('Estimated total: €99', { exact: true })).toBeVisible();
  await dialog.getByLabel('Choose your pre-order').selectOption('big_vase_flower');
  await dialog.getByRole('combobox', { name: /^Quantity/ }).selectOption('2');
  await expect(dialog.getByText('Estimated total: €318', { exact: true })).toBeVisible();
  await dialog.getByLabel('Choose your pre-order').selectOption('flower_stem');
  await dialog.getByRole('combobox', { name: /^Quantity/ }).selectOption('3');
  await expect(dialog.getByText('Estimated total: €89,70', { exact: true })).toBeVisible();
  await expect(dialog.locator('.vv-reservation-summary')).toContainText('No payment will be made now. This is a non-binding pre-order reservation. JUSTCOLORS will contact you before confirming production, availability and payment.');
  await dialog.getByLabel('Name', { exact: true }).fill('Test reservation');
  await dialog.getByLabel('Email', { exact: true }).fill('test@example.test');
  await dialog.getByLabel('I agree that JUSTCOLORS').check();
  await dialog.getByRole('button', { name: 'Reserve without payment', exact: true }).click();
  await expect(dialog.getByText('VV-TEST', { exact: true })).toBeVisible();
  expect(submitted).toMatchObject({ product_type: 'flower_stem', quantity: 3 });
});
