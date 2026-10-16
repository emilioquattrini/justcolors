import { expect, test } from '@playwright/test';

test('login, complete KPIs, filters, search, status, CSV and logout', async ({ page }) => {
  const rows = Array.from({ length: 501 }, (_, i) => ({ id: `row-${i}`, reference_code: `VV-${i}`, created_at: '2026-10-15T12:00:00Z', full_name: i === 0 ? 'Cliente speciale' : 'Cliente test', email: 'test@example.test', phone: '+39000', country_city: 'Milano', version_label: i === 0 ? 'Small' : 'Large', quantity: 2, notes: '=formula', status: 'new' }));
  const user = { id: 'test-admin', email: 'admin@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '' };
  await page.route('https://*.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    let body: unknown = {};
    if (url.pathname.endsWith('/token')) body = { access_token: 'test-access-token', refresh_token: 'test-refresh', expires_in: 3600, token_type: 'bearer', user };
    else if (url.pathname.endsWith('/user')) body = user;
    else if (url.pathname.endsWith('/justcolors_is_preorder_admin')) body = true;
    else if (url.pathname.endsWith('/justcolors_vaguevase_preorders')) {
      if (route.request().method() === 'PATCH') {
        const id = url.searchParams.get('id')?.slice(3);
        const row = rows.find(item => item.id === id)!;
        row.status = route.request().postDataJSON().status;
        body = { id, status: row.status };
      } else {
        const offset = Number(url.searchParams.get('offset') || 0);
        body = rows.slice(offset, offset + 500);
      }
    }
    await route.fulfill({ json: body });
  });
  await page.goto('/#/admin/preorders');
  await expect(page.getByRole('heading', { name: 'Gestione pre-order' })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await page.getByLabel('Email', { exact: true }).fill('admin@example.test');
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Accedi', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('501 prenotazioni trovate');
  await expect(page.locator('.va-kpis')).toContainText('1002');
  await page.getByLabel('Versione', { exact: true }).selectOption('Small');
  await page.getByLabel('Cerca', { exact: true }).fill('SPECIALE');
  await expect(page.getByRole('status')).toContainText('1 prenotazioni trovate');
  await page.getByLabel('Stato VV-0', { exact: true }).selectOption('confirmed');
  await expect(page.getByLabel('Stato VV-0', { exact: true })).toBeEnabled();
  await expect(page.getByLabel('Stato VV-0', { exact: true })).toHaveValue('confirmed');
  await page.getByLabel('Stato', { exact: true }).selectOption('new');
  await expect(page.getByText('Nessuna prenotazione corrisponde ai filtri.')).toBeVisible();
  await page.getByLabel('Stato', { exact: true }).selectOption('confirmed');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Esporta CSV (1)' }).click();
  expect((await download).suggestedFilename()).toMatch(/vaguevase-preorders/);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.locator('body').evaluate(el => el.clientWidth));
  await page.screenshot({ path: `test-results/admin-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Esci', exact: true }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Accedi', exact: true })).toBeVisible();
});

test('hidden admin route excludes public navigation', async ({ page }) => {
  await page.goto('/#/admin/preorders');
  await expect(page.getByRole('heading', { name: 'Gestione pre-order' })).toBeVisible();
  await expect(page.getByRole('navigation')).toHaveCount(0);
});

test('first access requests email activation rather than password recovery', async ({ page }) => {
  let activationRequested = false;
  await page.route('https://*.supabase.co/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/otp')) {
      expect(route.request().postDataJSON()).toMatchObject({ email: 'new-admin@example.test', create_user: true });
      expect(url.searchParams.get('redirect_to')).toBe('http://127.0.0.1:4173/?admin-auth=1');
      activationRequested = true;
    } else if (url.pathname.endsWith('/recover')) throw new Error('First access must not call password recovery');
    await route.fulfill({ json: {} });
  });
  await page.goto('/#/admin/preorders');
  await page.getByLabel('Email', { exact: true }).fill('new-admin@example.test');
  await page.getByRole('button', { name: 'Primo accesso: invia link email' }).click();
  await expect(page.getByRole('status')).toContainText('Richiesta accettata');
  expect(activationRequested).toBe(true);
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('failed activation never claims an email was sent', async ({ page }) => {
  await page.route('https://*.supabase.co/**', async route => route.fulfill({ status: 429, json: { code: 'over_email_send_rate_limit', msg: 'Rate limited' } }));
  await page.goto('/#/admin/preorders');
  await page.getByLabel('Email', { exact: true }).fill('new-admin@example.test');
  await page.getByRole('button', { name: 'Primo accesso: invia link email' }).click();
  await expect(page.getByRole('alert')).toContainText('Troppi tentativi');
  await expect(page.getByText('Richiesta accettata', { exact: false })).toHaveCount(0);
});
