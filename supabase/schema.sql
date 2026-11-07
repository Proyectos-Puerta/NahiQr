-- MUESTRA 26 · Puerta 18 teaser: run once in the Supabase SQL Editor.

-- 1. Table: one row per unique visitor (salted HMAC of their IP; raw IPs are never stored).
create table if not exists public.scans (
  id         bigint generated always as identity primary key,
  ip_hash    text        not null,
  created_at timestamptz not null default now(),
  constraint scans_ip_hash_key unique (ip_hash),
  constraint scans_ip_hash_format check (ip_hash ~ '^[0-9a-f]{64}$')
);

-- 2. Lock the table down. With RLS on and no SELECT policy, nobody using the public
--    anon key can read the hashes or the table. The service role bypasses RLS.
alter table public.scans enable row level security;

-- 3. Counter exposed as a function so the count is public but the rows are not.
create or replace function public.scan_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.scans;
$$;

revoke all on function public.scan_count() from public;
grant execute on function public.scan_count() to service_role;

-- ---------------------------------------------------------------------------
-- 4. ONLY IF the API runs with VITE_SUPABASE_ANON_KEY instead of SUPABASE_SERVICE_ROLE_KEY.
--    Warning: the anon key is public, so anyone holding it can insert rows straight
--    through Supabase's REST API, skipping /api/scan, and inflate the counter.
--    Prefer the service role key and skip this block.
-- ---------------------------------------------------------------------------
grant execute on function public.scan_count() to anon;

drop policy if exists "anon can register a scan" on public.scans;
create policy "anon can register a scan"
  on public.scans
  for insert
  to anon
  with check (true);

-- To close the anon path later (after switching to the service role key):
--   drop policy "anon can register a scan" on public.scans;
--   revoke execute on function public.scan_count() from anon;

-- Reset the counter for testing:
--   truncate public.scans;
