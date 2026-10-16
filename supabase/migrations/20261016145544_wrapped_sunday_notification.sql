-- Sunday "your Wrapped is ready" notice: one inbox row per user who traded this week (Mon–Sun, Paraguay time).
-- push-dispatch turns new ft_notifications rows into pushes (respecting each user's settings and quiet hours).
create or replace function jourfund_private.wrapped_targets(p_day date)
returns table(user_id uuid, lang text)
language sql stable security definer set search_path = public, pg_temp as $$
  with wk as (select (p_day - ((extract(isodow from p_day)::int) - 1)) as s),
  acc as (
    select w.user_id, a
    from fundedtrack_workspaces w cross join lateral jsonb_array_elements(case when jsonb_typeof(w.accounts)='array' then w.accounts else '[]'::jsonb end) a
    where coalesce(a->>'accountType','') <> 'personal'
  ),
  trades as (
    select acc.user_id, tr->>'date' d
    from acc cross join lateral (
      select jsonb_array_elements(coalesce(p->'trades','[]'::jsonb)) tr from jsonb_array_elements(coalesce(acc.a->'phases','[]'::jsonb)) p
      union all select jsonb_array_elements(coalesce(acc.a->'pa'->'trades','[]'::jsonb))
    ) x
  ),
  langs as (
    select distinct on (user_id) user_id, a->'preferences'->>'language' lang
    from acc where a->'preferences'->>'language' in ('es','en','pt-BR')
    order by user_id, coalesce(a->'preferences'->>'languageChangedAt','') desc
  )
  select t.user_id, coalesce(l.lang,'es')
  from (select distinct trades.user_id from trades, wk where trades.d ~ '^\d{4}-\d{2}-\d{2}$' and trades.d::date between wk.s and wk.s + 6) t
  left join langs l using (user_id);
$$;

create or replace function jourfund_private.queue_wrapped_notifications()
returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare d date := (now() at time zone 'America/Asuncion')::date; s date; n integer;
begin
  s := d - (extract(isodow from d)::int - 1);
  insert into ft_notifications (user_id, event_key, kind, title, body, page)
  select user_id, 'wrapped:' || s, 'progress',
    case lang when 'en' then 'Your Wrapped is ready' when 'pt-BR' then 'Seu Wrapped está pronto' else 'Tu Wrapped ya está listo' end,
    case lang when 'en' then 'Your trading week in stories: result, best day, discipline and your song. Open it and share your Weekly Pass.'
              when 'pt-BR' then 'Sua semana de trading em histórias: resultado, melhor dia, disciplina e sua música. Abra e compartilhe seu Weekly Pass.'
              else 'Tu semana de trading en historias: resultado, mejor día, disciplina y tu canción. Abrilo y compartí tu Weekly Pass.' end,
    'ftPageHome'
  from jourfund_private.wrapped_targets(d)
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

revoke all on function jourfund_private.wrapped_targets(date) from public, anon, authenticated;
revoke all on function jourfund_private.queue_wrapped_notifications() from public, anon, authenticated;

-- Sundays 17:00 Paraguay (20:00 UTC).
select cron.schedule('jourfund-wrapped-sunday', '0 20 * * 0', 'select jourfund_private.queue_wrapped_notifications()');
