import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectRows, toCsv } from '../src/lib/preorders.ts';
import type { Preorder } from '../src/lib/preorders.ts';
import { parseAdminEmailLink } from '../src/lib/adminEmailLink.ts';
const rows: Preorder[] = [
  { id: '1', reference_code: 'VV-1', created_at: '2026-10-15T10:00:00Z', full_name: 'Chiara', email: 'test@example.test', phone: null, country_city: 'Milano', version_label: 'Small', quantity: 2, notes: 'hello;"world"\nline', status: 'new' },
  { id: '2', reference_code: 'VV-2', created_at: '2026-10-16T10:00:00Z', full_name: 'Emilio', email: 'other@example.test', phone: '+39000', country_city: 'Padova', version_label: 'Large', quantity: 10, notes: '=HYPERLINK("bad")', status: 'confirmed' },
];
test('combined filters and case-insensitive search', () => {
  assert.deepEqual(selectRows(rows, 'new', 'Small', 'MILANO', 'created_at', false).map(r => r.id), ['1']);
  assert.equal(selectRows(rows, 'new', 'Large', '', 'created_at', false).length, 0);
});
test('numeric quantity sort and descending dates without mutating source', () => {
  assert.deepEqual(selectRows(rows, '', '', '', 'quantity', false).map(r => r.quantity), [10, 2]);
  assert.deepEqual(selectRows(rows, '', '', '', 'created_at', false).map(r => r.id), ['2', '1']);
  assert.equal(rows[0].id, '1');
});
test('CSV quotes separators, quotes and newlines and neutralizes formulas', () => {
  const csv = toCsv(rows);
  assert.ok(csv.startsWith('\ufeff'));
  assert.ok(csv.includes('"hello;""world""\nline"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"\'+39000"'));
  assert.equal(toCsv([]).split('\r\n').length, 1);
});

test('priced products filter independently from historical variants and sort by numeric value', () => {
  const priced: Preorder[] = [
    { ...rows[0], product_type: 'flower_stem', product_label: 'Flower stem', unit_price: 29.9, potential_value: 59.8 },
    { ...rows[1], product_type: 'big_vase_flower', product_label: 'Big vase + flower', unit_price: 159, potential_value: 1590 },
  ];
  assert.deepEqual(selectRows([...rows, ...priced], '', 'flower_stem', '', 'created_at', false).map(row => row.product_label), ['Flower stem']);
  assert.equal(selectRows([...rows, ...priced], '', 'Small', '', 'created_at', false).length, 1);
  assert.deepEqual(selectRows(priced, '', '', '', 'potential_value', false).map(row => row.potential_value), [1590, 59.8]);
  assert.ok(toCsv(priced).includes('"59.8"'));
});

test('activation accepts only verification links belonging to this Supabase project', () => {
  const token = 'a'.repeat(64);
  assert.deepEqual(parseAdminEmailLink(`https://zwjzlzyqsqxqtjxhgmbs.supabase.co/auth/v1/verify?token=${token}&type=signup&redirect_to=http://localhost:3000`), { token_hash: token, type: 'signup' });
  for (const url of [
    `https://attacker.test/auth/v1/verify?token=${token}&type=signup`,
    `http://zwjzlzyqsqxqtjxhgmbs.supabase.co/auth/v1/verify?token=${token}&type=signup`,
    `https://zwjzlzyqsqxqtjxhgmbs.supabase.co/auth/v1/verify?token=${token}&type=email_change`,
    'http://localhost:3000/#access_token=secret',
  ]) assert.throws(() => parseAdminEmailLink(url));
});
