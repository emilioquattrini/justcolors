# VagueVase pre-order administration

Open `https://vaguevase.justcolors.net/#/admin/preorders`. The route is intentionally absent from public navigation. It is lazy loaded independently of the public campaign and portfolio.

## Access and first login

Supabase project: `zwjzlzyqsqxqtjxhgmbs` (Big Match). Authentication is separate from any Shopify account.

1. Apply `supabase/preorder-admin.sql` using the Supabase SQL editor. This grants authenticated users only the operational SELECT columns and UPDATE on `status`; RLS restricts both to confirmed, non-anonymous users in the private email allowlist.
2. Privately insert the approved, lowercase administrator emails into `justcolors_private.preorder_admin_emails`. Do not store emails, passwords or service keys in this public repository.
3. In Authentication → URL Configuration, add `https://vaguevase.justcolors.net/?admin-auth=1` to Redirect URLs. Preserve settings and URLs used by the other application in this shared project.
4. An approved administrator enters their email at the admin route and chooses **Primo accesso: invia link email**. This uses ordinary Supabase Auth `signInWithOtp` with `shouldCreateUser: true`, creating an unconfirmed Auth account when needed. No privileged invitation endpoint or service key is involved. Configure production SMTP if Supabase's default mail service rejects recipients or reaches its sending limit. Do not disable email verification.
5. Each recipient opens their own activation link and chooses a personal password on the setup screen. Returning users enter email and password at the admin route. **Recupera password** is only for existing accounts; it does not invite or create users. The email activation endpoint can create regular Auth users, but only verified email addresses already in the private allowlist can read or update pre-orders. No data permission is granted by signup itself.

If Auth's redirect allowlist is not yet configured and links open localhost, expand **Il link apre localhost o una pagina errata?** on the login page. Request a fresh email and copy the original email button's link without opening it. Paste it into the masked input on the dashboard and verify it there. The client accepts only HTTPS verification links from this exact Supabase project, extracts the token hash and allowed email type, and calls the ordinary `verifyOtp` endpoint. It never navigates to the link or its redirect destination, stores it, logs it, or grants access without Supabase verification and RLS authorization. Already-used links require a fresh email. Do not paste authentication links into chat or issues.

Only the publishable key is shipped to the browser. Sessions use sessionStorage and expire with the browser tab session. Logout clears displayed data and signs out the local session. No public signup UI is provided. The private helper checks the current Auth user and verified email against the server-managed allowlist, never user-editable metadata. To revoke an administrator immediately, remove their allowlist entry; RLS evaluates membership on each request.

The SECURITY DEFINER helper is confined to a non-exposed private schema, with a fixed empty search path and no anonymous execution. A SECURITY INVOKER public RPC exposes only the current caller's authorization boolean. No change is made to existing pre-order insertion permissions or the submission Edge Function.

## Use

KPIs always describe the full loaded dataset. Search, status and version filters apply together to the list and CSV. Click a column heading to sort; dates are displayed in Europe/Rome. The list shows 25 entries per page, but loading and export traverse the whole dataset, including beyond Supabase's response row limit. Refresh to see incoming reservations. This is an operational snapshot, not a real-time subscription or a transactional reporting system.

Change a row's status with its selector. Writes compare the previously read status to avoid silently overwriting a concurrent administrator's change; refresh if a conflict is reported. No contact, quantity or note editing is allowed. CSV is UTF-8 with BOM, semicolon separated and formula-safe, and includes all matching results rather than only the visible page. Treat downloaded customer contact files as private.

## Validation

Node 24 is used in CI because the pinned Supabase SDK requires Node 22+. Run:

```sh
npm ci
npm run build
node --experimental-strip-types --test tests/preorders.test.ts
npx eslint src/pages/VagueVaseAdmin.tsx src/lib/adminClient.ts src/lib/preorders.ts
npx playwright install chromium
npx playwright test
```

`supabase/test-preorder-admin.sql` exercises administrator and outsider access and column restrictions in a rolled-back transaction. Test users and records do not persist. Run it with privileged SQL editor access only. Browser tests use synthetic API responses and verify all-page loading with 501 reservations, filtering, status updates, export, logout and mobile layout; they do not replace the live RLS checks. Complete real invitation/password setup with each recipient before operational use.
