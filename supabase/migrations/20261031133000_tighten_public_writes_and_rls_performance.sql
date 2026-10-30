-- Public inserts are served only through the rate-limited Edge Function.
drop policy if exists "Owner manages profile content" on public.profile_content;
create policy "Owner manages profile content" on public.profile_content
for all to authenticated
using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com')
with check (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
drop policy if exists "Public reads published profile content" on public.profile_content;
create policy "Public reads published profile content" on public.profile_content
for select to anon using (status = 'published');
drop policy if exists "Owner reads and updates inbox" on public.contact_messages;
create policy "Owner reads and updates inbox" on public.contact_messages
for all to authenticated
using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com')
with check (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
drop policy if exists "Owner moderates guestbook" on public.guestbook_entries;
drop policy if exists "Public reads approved guestbook" on public.guestbook_entries;
drop policy if exists "Public submits guestbook" on public.guestbook_entries;
create policy "Public reads approved guestbook" on public.guestbook_entries
for select to anon using (status = 'approved');
create policy "Owner reads guestbook" on public.guestbook_entries
for select to authenticated using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
create policy "Owner updates guestbook" on public.guestbook_entries
for update to authenticated using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com')
with check (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
create policy "Owner deletes guestbook" on public.guestbook_entries
for delete to authenticated using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
revoke insert on public.guestbook_entries from anon, authenticated;
drop policy if exists "Owner moderates comments" on public.comments;
drop policy if exists "Public reads approved comments" on public.comments;
drop policy if exists "Public submits comments" on public.comments;
create policy "Public reads approved comments" on public.comments
for select to anon using (status = 'approved');
create policy "Owner reads comments" on public.comments
for select to authenticated using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
create policy "Owner updates comments" on public.comments
for update to authenticated using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com')
with check (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
create policy "Owner deletes comments" on public.comments
for delete to authenticated using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
revoke insert on public.comments from anon, authenticated;
drop policy if exists "Owner reads GitHub sync log" on public.github_sync_log;
drop policy if exists "Owner records GitHub sync" on public.github_sync_log;
create policy "Owner reads GitHub sync log" on public.github_sync_log
for select to authenticated using (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
create policy "Owner records GitHub sync" on public.github_sync_log
for insert to authenticated with check (((select auth.jwt()) ->> 'email') = 'rizkiamalludin99@gmail.com');
drop index if exists public.uq_reactions_content_type_visitor;
