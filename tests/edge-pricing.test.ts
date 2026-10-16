import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('Edge Function fixes prices server-side, rejects unknown products and keeps retry compatibility', async () => {
  let handler: (request: Request) => Promise<Response>;
  let inserted: Record<string, unknown> | undefined;
  let duplicate = false;
  const source = readFileSync('supabase/functions/vaguevase-preorder/index.ts', 'utf8').replace(/^import .*;\r?\n/, '');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText, {
    Deno: { env: { get: () => 'mock-only' }, serve: (fn: typeof handler) => { handler = fn; } },
    Request, Response, URLSearchParams, TextEncoder, crypto, console,
    fetch: async (_url: string, init: RequestInit) => {
      if (init?.method === 'POST') {
        inserted = JSON.parse(String(init.body));
        return Response.json([{ reference_code: 'VV-TEST', created_at: new Date().toISOString() }]);
      }
      return Response.json(duplicate && String(_url).includes('submission_token') ? [{ reference_code: 'VV-OLD', created_at: new Date().toISOString() }] : []);
    },
  });
  const submit = (extra: Record<string, unknown>) => handler(new Request('https://example.test', {
    method: 'POST', headers: { origin: 'https://vaguevase.justcolors.net', 'content-type': 'application/json' },
    body: JSON.stringify({ submissionToken: crypto.randomUUID(), fullName: 'Test Customer', email: 'test@example.test', quantity: 3, consent: true, consentAt: new Date().toISOString(), formStartedAt: new Date(Date.now()-5000).toISOString(), ...extra }),
  }));
  for (const [type, label, price] of [['small_vase_flower', 'Small vase + flower', 99], ['big_vase_flower', 'Big vase + flower', 159], ['flower_stem', 'Flower stem', 29.9]] as const) {
    assert.equal((await submit({ product_type: type, unit_price: 1, potential_value: 1 })).status, 201);
    assert.equal(inserted?.product_type, type);
    assert.equal(inserted?.product_label, label);
    assert.equal(inserted?.unit_price, price);
    assert.equal(inserted?.quantity, 3);
    assert.equal(inserted?.potential_value, undefined); // Generated in Postgres.
  }
  for (const product_type of ['unknown', 'toString', '__proto__']) {
    assert.equal((await submit({ product_type })).status, 400);
  }
  assert.equal((await submit({ product_type: 'flower_stem', quantity: 1.5 })).status, 400);
  assert.equal((await submit({ version: 'small' })).status, 201);
  assert.equal(inserted?.unit_price, null);
  duplicate = true;
  assert.equal((await (await submit({ version: 'small' })).json()).duplicate, true);
});
