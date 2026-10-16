begin;
insert into justcolors_private.preorder_admin_emails(email) values ('test-admin@example.test');
insert into auth.users (id,email,email_confirmed_at,raw_app_meta_data) values ('00000000-0000-4000-a000-000000000001','test-admin@example.test',now(),'{"provider":"email"}'),('00000000-0000-4000-a000-000000000002','outsider@example.test',now(),'{"provider":"email"}');
insert into public.justcolors_vaguevase_preorders (id,submission_token,full_name,email,version_value,version_label,quantity,consent_contact,consent_at,event_code)
values ('00000000-0000-4000-a000-000000000003',gen_random_uuid(),'RLS Test','test@example.test','small','Small',1,true,now(),'security-test');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000002","role":"authenticated"}',true);
do $$ begin
 if public.justcolors_is_preorder_admin() then raise exception 'outsider authorized'; end if;
 if exists(select id from public.justcolors_vaguevase_preorders) then raise exception 'outsider read rows'; end if;
 update public.justcolors_vaguevase_preorders set status='confirmed' where id='00000000-0000-4000-a000-000000000003';
 if found then raise exception 'outsider updated row'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-a000-000000000001","role":"authenticated"}',true);
do $$ begin
 if not public.justcolors_is_preorder_admin() then raise exception 'admin denied'; end if;
 if not exists(select id from public.justcolors_vaguevase_preorders where id='00000000-0000-4000-a000-000000000003') then raise exception 'admin cannot read'; end if;
 update public.justcolors_vaguevase_preorders set status='confirmed' where id='00000000-0000-4000-a000-000000000003';
 if not found then raise exception 'admin cannot update'; end if;
 begin
 update public.justcolors_vaguevase_preorders set full_name='Forbidden' where id='00000000-0000-4000-a000-000000000003';
 raise exception 'admin modified personal data';
 exception when insufficient_privilege then null; end;
 begin
 perform client_ip_hash from public.justcolors_vaguevase_preorders;
 raise exception 'admin read technical data';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 if has_column_privilege('anon','public.justcolors_vaguevase_preorders','email','SELECT') then raise exception 'anon access'; end if;
end $$;
rollback;
