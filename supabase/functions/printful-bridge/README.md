# Printful bridge

Secure, admin-only Supabase Edge Function used by the JUSTCOLORS dashboard to access the store-scoped Printful API token.

## Required Edge Function secret

Set the following secret in the Supabase project dashboard:

```text
PRINTFUL_TOKEN=<store-scoped private token>
```

Do not commit the token to this repository or expose it to the browser.

`PRINTFUL_STORE_ID` is optional and should only be set when an account-level Printful token is used. The current JUSTCOLORS token is store-scoped, so this value should remain unset.

## Authentication

The Edge Function validates the caller's Supabase access token and checks membership in `justcolors_dashboard_admins` before calling Printful.

## Current read-only actions

```text
GET ?action=connection
GET ?action=sync-products&limit=20&offset=0
```

The connection action tests the Printful token by requesting the store's synced product list. No token value is ever returned or logged.

## Deployment

The production function name is `printful-bridge`. It intentionally uses manual JWT validation so browser CORS preflight requests can complete while all data requests remain admin-protected.
