# Profile Website — Backend Foundation

Branch: `redesign/profile-foundation`
Supabase project: `qkexfgadhtnkgzdfbcnf` (Singapore)

## Database foundation applied
Migration: `profile_website_core_foundation`

Tables:
- `profile_content`: bilingual profile/project/experience/achievement/blog/site-setting content with draft/published/archived status.
- `contact_messages`: private contact inbox records and unread/read/replied/archived status.
- `guestbook_entries`: nickname + message, pending/approved/hidden moderation.
- `comments`: per-content comments, pending/approved/hidden moderation.
- `reactions`: like/cool/inspiring/interesting, unique per content/reaction/visitor hash.
- `github_sync_log`: records repository sync attempts.

## Security model
- RLS enabled on all six tables.
- Public can read only published profile content and approved guestbook/comments.
- Public submissions enter pending moderation.
- Contact messages and GitHub sync logs are inaccessible to anon/authenticated roles.
- Admin write operations must be performed through a trusted server-side function using server-only credentials. Never put the Supabase service-role key in browser code.
- Reaction writes must be mediated by a server endpoint that hashes a visitor token and rate-limits requests before insertion. The current public insert policy is a temporary schema-stage allowance and must be replaced before public launch.

## Remaining implementation
1. Configure Supabase Auth admin allowlist for `rizkiamalludin99@gmail.com` only.
2. Add server-side endpoints for contact submission, moderation, and reactions; add spam/rate limits.
3. Build admin UI and CRUD workflow (draft → preview → publish).
4. Add guestbook/comments/reaction UI.
5. Add GitHub API sync via server-only token or public repository API, with no token in frontend.
6. Add ID/EN dictionary and editable translations.
7. Test preview on desktop/mobile and validate RLS with anon/authenticated/admin roles.

## Boundaries
No production deployment. No paid plan activation. No credentials or OTPs stored in this repository.