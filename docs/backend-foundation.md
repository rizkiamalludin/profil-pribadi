# Profile Website — Backend & Feature Foundation

Branch: `redesign/profile-foundation`
Supabase project: `qkexfgadhtnkgzdfbcnf` (Singapore)
Preview: `https://profil-pribadi-7r83cg67x-rizki-amalludin.vercel.app`

## Database and security

Migrations recorded in Supabase:
- `profile_website_core_foundation`
- `lock_reactions_until_server_endpoint`
- `profile_owner_access_and_public_rate_limits`
- `service_role_rate_limit_policy`

Tables with RLS enabled:
- `profile_content`: bilingual profile/project/experience/achievement/blog/site-setting content with draft/published/archived status.
- `contact_messages`: private contact inbox and unread/read/replied/archived status.
- `guestbook_entries`: nickname + message, pending/approved/hidden moderation.
- `comments`: content slug + nickname + message, pending/approved/hidden moderation.
- `reactions`: like/cool/inspiring/interesting, unique per content/reaction/visitor hash.
- `github_sync_log`: records GitHub sync attempts.
- `public_rate_limits`: private hashed-IP request counters for public write endpoints.

Authorization:
- Public readers see only published profile content and approved guestbook/comments.
- Public roles do not have direct insert/update/delete access to guestbook, comments, reactions, or contact inbox.
- Owner policies restrict content management, inbox, moderation, and sync history to the verified owner email `rizkiamalludin99@gmail.com`.
- Contact inbox and sync history are not publicly readable.
- The rate-limit table and its RPC are restricted to `service_role`; the RPC uses a fixed search path and only grants execution to that server role.
- The public browser uses a Supabase publishable key only. No service-role/secret key is included in frontend files.

## Implemented on the preview branch

- `/admin.html`: private admin interface with email OTP and Google OAuth PKCE flow, owner-email verification, content editor, inbox, moderation, and manual GitHub sync.
- `profile-public-api` Edge Function version 2: server-side validation, request-size limits, CORS allowlist, honeypot, IP-hash rate limits, contact storage, guestbook/comments submissions, and reaction writes.
- Contact form stores messages in the private inbox. Email notifications are not configured.
- Clean guestbook entries and comments are published immediately; links or obvious repeated-character spam are held for review. Owner can approve, hide, or delete submissions.
- Reactions are recorded server-side; each browser visitor token is hashed before storage.
- Homepage loads six bilingual project records from Supabase.
- ID/EN switch covers main navigation, hero, headings, about, experience, habits, skills, goals, interaction forms, and database-backed project cards. Some labels/embedded third-party content may remain in their original language.
- Manual GitHub sync reads public repositories for `rizkiamalludin` and saves new repositories as drafts. It does not yet use a push webhook/automatic sync.
- Content workflow supports draft, published, and archived states.

## Verified checks

- Supabase project status: `ACTIVE_HEALTHY`.
- RLS is enabled on every table listed above.
- Six featured project records were seeded and verified.
- Rate-limit RPC test passed.
- Anonymous access to private contact messages and rate-limit storage is denied by grants; public execution of the rate-limit RPC is denied.
- Edge Function `profile-public-api` is `ACTIVE`, version 2.
- Vercel preview build is `READY`; HTTP 200 returned for homepage, `/admin.html`, admin JS, public JS, and interaction CSS.
- No production deployment or alias promotion has been performed.
- Full browser-based click testing, actual mobile viewport testing, and authenticated owner login have not yet been completed.

## Owner setup still required

1. In Supabase Auth > Email Templates > Magic Link, configure the email template to include `{{ .Token }}` so the dashboard's numeric OTP field receives a code.
2. In Supabase Auth > URL Configuration, allow the intended `/admin.html` callback URL for the production domain and the preview domain used for testing.
3. To enable Google login, configure Google under Supabase Auth > Providers with a Google OAuth Client ID and Client Secret. Never commit these credentials to GitHub or put them in frontend code.
4. Sign in once using the owner email, then test content editing, inbox access, and moderation.
5. For email alerts and fully automatic GitHub push sync, configure a mail provider and a separately authenticated webhook; neither is active yet.

## Release boundaries

- All code changes remain on `redesign/profile-foundation`.
- No production deployment, promotion, paid plan, or social post was performed.
- Uplika remains connected but was not used because this website task does not require publishing social content.
