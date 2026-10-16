begin;
alter table public.justcolors_vaguevase_preorders
  add column product_type text,
  add column product_label text,
  add column unit_price numeric(10,2),
  add column potential_value numeric(12,2) generated always as (unit_price * quantity) stored,
  add constraint preorder_product_pricing check (
    (product_type is null and product_label is null and unit_price is null)
    or (product_type is not null and product_label is not null and unit_price is not null and (
      (product_type = 'small_vase_flower' and product_label = 'Small vase + flower' and unit_price = 99)
      or (product_type = 'big_vase_flower' and product_label = 'Big vase + flower' and unit_price = 159)
      or (product_type = 'flower_stem' and product_label = 'Flower stem' and unit_price = 29.90)
    ))
  );
grant select (product_type, product_label, unit_price, potential_value)
  on public.justcolors_vaguevase_preorders to authenticated;
commit;
