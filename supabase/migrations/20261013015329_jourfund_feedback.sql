-- In-app "Reportar un problema / Sugerencia". Users can only add (and read) their own reports.
create table public.jf_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('bug','idea')),
  message text not null check (char_length(btrim(message)) between 3 and 4000),
  page text check (char_length(page) <= 80),
  app_version text check (char_length(app_version) <= 40),
  device text check (char_length(device) <= 300),
  lang text check (char_length(lang) <= 10),
  created_at timestamptz not null default now()
);
create index jf_feedback_user_created on public.jf_feedback (user_id, created_at desc);
alter table public.jf_feedback enable row level security;

create policy "Enviar mis reportes" on public.jf_feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Leer mis reportes" on public.jf_feedback for select to authenticated
  using ((select auth.uid()) = user_id);
create policy jourfund_valid_session on public.jf_feedback as restrictive for all to authenticated
  using ((select jourfund_private.session_allowed())) with check ((select jourfund_private.session_allowed()));

-- At most 20 reports per user per day.
create or replace function jourfund_private.feedback_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.jf_feedback where user_id = new.user_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Llegaste al límite de reportes por hoy.' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger jf_feedback_limit before insert on public.jf_feedback for each row execute function jourfund_private.feedback_limit();

revoke all on public.jf_feedback from anon;
grant select, insert on public.jf_feedback to authenticated;
