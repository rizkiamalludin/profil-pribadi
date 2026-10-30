create policy "Service role manages rate limit windows"
on public.public_rate_limits
for all to service_role
using (true)
with check (true);
