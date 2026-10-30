-- Owner-only access, least-privilege grants, and public API rate limits.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profile_content' and policyname='Owner manages profile content') then
    create policy "Owner manages profile content" on public.profile_content for all to authenticated
      using ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com')
      with check ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='contact_messages' and policyname='Owner reads and updates inbox') then
    create policy "Owner reads and updates inbox" on public.contact_messages for all to authenticated
      using ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com')
      with check ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='guestbook_entries' and policyname='Owner moderates guestbook') then
    create policy "Owner moderates guestbook" on public.guestbook_entries for all to authenticated
      using ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com')
      with check ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='comments' and policyname='Owner moderates comments') then
    create policy "Owner moderates comments" on public.comments for all to authenticated
      using ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com')
      with check ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='github_sync_log' and policyname='Owner reads GitHub sync log') then
    create policy "Owner reads GitHub sync log" on public.github_sync_log for select to authenticated
      using ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com');
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='github_sync_log' and policyname='Owner records GitHub sync') then
    create policy "Owner records GitHub sync" on public.github_sync_log for insert to authenticated
      with check ((select auth.jwt() ->> 'email') = 'rizkiamalludin99@gmail.com');
  end if;
end $$;

revoke all on public.contact_messages from anon, authenticated;
grant select, update on public.contact_messages to authenticated;
revoke all on public.github_sync_log from anon, authenticated;
grant select, insert on public.github_sync_log to authenticated;
revoke insert, update, delete on public.guestbook_entries from anon;
grant select on public.guestbook_entries to anon;
grant select, update, delete on public.guestbook_entries to authenticated;
revoke insert, update, delete on public.comments from anon;
grant select on public.comments to anon;
grant select, update, delete on public.comments to authenticated;
revoke insert, update, delete on public.profile_content from anon;
grant select on public.profile_content to anon;
grant select, insert, update, delete on public.profile_content to authenticated;
revoke insert, update, delete on public.reactions from anon, authenticated;
grant select on public.reactions to anon, authenticated;

create table if not exists public.public_rate_limits (
  bucket text not null,
  ip_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  primary key (bucket, ip_hash),
  constraint public_rate_limits_bucket_check check (bucket in ('contact','guestbook','comment','reaction')),
  constraint public_rate_limits_ip_hash_check check (char_length(ip_hash)=64),
  constraint public_rate_limits_count_check check (request_count >= 0)
);
alter table public.public_rate_limits enable row level security;
revoke all on public.public_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.public_rate_limits to service_role;

create or replace function public.consume_public_rate_limit(p_bucket text,p_ip_hash text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $function$
declare allowed boolean;
begin
  if p_bucket not in ('contact','guestbook','comment','reaction') or p_ip_hash !~ '^[0-9a-f]{64}$'
     or p_limit < 1 or p_window_seconds < 1 then return false; end if;
  insert into public.public_rate_limits(bucket,ip_hash,window_started_at,request_count)
  values (p_bucket,p_ip_hash,pg_catalog.now(),1)
  on conflict(bucket,ip_hash) do update
  set request_count = case when public.public_rate_limits.window_started_at < pg_catalog.now()-pg_catalog.make_interval(secs=>p_window_seconds)
    then 1 else public.public_rate_limits.request_count+1 end,
      window_started_at = case when public.public_rate_limits.window_started_at < pg_catalog.now()-pg_catalog.make_interval(secs=>p_window_seconds)
    then pg_catalog.now() else public.public_rate_limits.window_started_at end
  returning request_count <= p_limit into allowed;
  return case when allowed is null then false else allowed end;
end;
$function$;
revoke all on function public.consume_public_rate_limit(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_public_rate_limit(text,text,integer,integer) to service_role;
create unique index if not exists uq_reactions_content_type_visitor
on public.reactions(content_slug,reaction_type,visitor_token_hash);
