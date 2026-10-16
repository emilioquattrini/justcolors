begin;
create schema if not exists justcolors_private;
revoke all on schema justcolors_private from public, anon, authenticated;
grant usage on schema justcolors_private to authenticated;
create table if not exists justcolors_private.preorder_admin_emails (email text primary key);
revoke all on justcolors_private.preorder_admin_emails from public, anon, authenticated;
alter table justcolors_private.preorder_admin_emails enable row level security;
-- Provision the two approved email addresses separately using the SQL editor.
-- Never commit personal addresses to this public repository.
create or replace function justcolors_private.is_preorder_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
 select auth.uid() is not null and exists (
   select 1 from auth.users u join justcolors_private.preorder_admin_emails a on lower(u.email) = a.email
   where u.id = auth.uid() and u.email_confirmed_at is not null
   and u.is_anonymous is not true
 );
$$;
revoke all on function justcolors_private.is_preorder_admin() from public, anon;
grant execute on function justcolors_private.is_preorder_admin() to authenticated;
create or replace function public.justcolors_is_preorder_admin()
returns boolean language sql stable security invoker set search_path = ''
as $$ select justcolors_private.is_preorder_admin(); $$;
revoke all on function public.justcolors_is_preorder_admin() from public, anon;
grant execute on function public.justcolors_is_preorder_admin() to authenticated;
alter table public.justcolors_vaguevase_preorders enable row level security;
grant select (id, reference_code, created_at, full_name, email, phone, country_city, version_label, quantity, notes, status) on public.justcolors_vaguevase_preorders to authenticated;
grant update (status) on public.justcolors_vaguevase_preorders to authenticated;
drop policy if exists justcolors_admin_read on public.justcolors_vaguevase_preorders;
create policy justcolors_admin_read on public.justcolors_vaguevase_preorders for select to authenticated using ((select justcolors_private.is_preorder_admin()) and coalesce((select auth.jwt()->>'is_anonymous'), 'false') = 'false');
drop policy if exists justcolors_admin_status on public.justcolors_vaguevase_preorders;
create policy justcolors_admin_status on public.justcolors_vaguevase_preorders for update to authenticated using ((select justcolors_private.is_preorder_admin()) and coalesce((select auth.jwt()->>'is_anonymous'), 'false') = 'false') with check ((select justcolors_private.is_preorder_admin()) and coalesce((select auth.jwt()->>'is_anonymous'), 'false') = 'false' and status in ('new','contacted','confirmed','declined','cancelled'));
commit;
