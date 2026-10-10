-- Baseline for objects that existed in production but were never in the repo, plus two performance fixes.
-- Applied to production on 2026-10-10 (version 20261010222858).
-- Non-destructive: create-if-missing, alter in place, add-only grants and indexes.
-- Not included on purpose: the pg_cron job "fundedtrack-push" (runs push-dispatch every minute) reads its secret
-- from Vault (name 'ft_push_cron'); create it with the private script kept outside GitHub, never commit the secret.
create table if not exists public.fundedtrack_workspaces (
  user_id uuid not null,
  accounts jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  id uuid not null default gen_random_uuid(),
  constraint fundedtrack_workspaces_pkey primary key (id),
  constraint fundedtrack_workspaces_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade,
  constraint fundedtrack_workspaces_user_id_key unique (user_id)
);
alter table public.fundedtrack_workspaces enable row level security;
grant select, insert, update on public.fundedtrack_workspaces to authenticated;
grant select on public.fundedtrack_workspaces to service_role;

-- Own-row policies; (select auth.uid()) is evaluated once per query instead of once per row.
-- On a fresh database these policies must be created first (create policy ... with the same expressions).
-- The restrictive jourfund_valid_session policy and the validation trigger live in supabase/security-v111.sql.
alter policy "Leer mis datos" on public.fundedtrack_workspaces using ((select auth.uid()) = user_id);
alter policy "Crear mis datos" on public.fundedtrack_workspaces with check ((select auth.uid()) = user_id);
alter policy "Actualizar mis datos" on public.fundedtrack_workspaces using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Notification actions (complete / snooze), server-only.
create table if not exists public.ft_notice_actions (
  user_id uuid not null,
  event_key text not null,
  mode text not null,
  until_at timestamptz,
  revision uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  constraint ft_notice_actions_pkey primary key (user_id, event_key),
  constraint ft_notice_actions_mode_check check (mode = any (array['complete'::text, 'snooze'::text])),
  constraint ft_notice_actions_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade
);
alter table public.ft_notice_actions enable row level security;
grant select, insert, update, delete on public.ft_notice_actions to service_role;

-- Forex Factory calendar cache, server-only, single row id='forexfactory'.
create table if not exists public.ft_calendar_cache (
  id text not null,
  payload jsonb not null default '[]'::jsonb,
  fetched_at timestamptz,
  attempted_at timestamptz,
  constraint ft_calendar_cache_pkey primary key (id)
);
alter table public.ft_calendar_cache enable row level security;
grant select, insert, update, delete on public.ft_calendar_cache to service_role;
insert into public.ft_calendar_cache (id) values ('forexfactory') on conflict (id) do nothing;

-- Lets one worker at a time refresh the calendar: at most every 15 min, retry after 5 min.
create or replace function public.ft_claim_calendar_refresh()
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  update public.ft_calendar_cache set attempted_at=now() where id='forexfactory'
    and (fetched_at is null or fetched_at<now()-interval '15 minutes')
    and (attempted_at is null or attempted_at<now()-interval '5 minutes');
  return found;
end;$$;
grant execute on function public.ft_claim_calendar_refresh() to service_role;

-- Covering indexes for foreign keys flagged by the performance advisor.
create index if not exists ft_push_subscriptions_user_id_idx on public.ft_push_subscriptions(user_id);
create index if not exists ft_push_deliveries_subscription_id_idx on public.ft_push_deliveries(subscription_id);
