-- Called only by the delete-account Edge Function (service role) before deleting the auth user.
-- Public tables cascade from auth.users; this clears the private rows that do not.
create or replace function public.jourfund_purge_user(target uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from jourfund_private.request_limits where user_id = target;
$$;
revoke all on function public.jourfund_purge_user(uuid) from public, anon, authenticated;
grant execute on function public.jourfund_purge_user(uuid) to service_role;
