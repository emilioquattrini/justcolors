const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PRINTFUL_TOKEN = Deno.env.get("PRINTFUL_TOKEN") ?? "";
const PRINTFUL_STORE_ID = Deno.env.get("PRINTFUL_STORE_ID") ?? "";
const PRINTFUL_API_URL = "https://api.printful.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function requireJustcolorsAdmin(
  req: Request,
): Promise<{ id: string; email: string } | Response> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing Supabase server configuration");
    return json({ error: "Server configuration error" }, 500);
  }

  const bearer = req.headers.get("authorization") ?? "";
  const token = bearer.replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Login required" }, 401);

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      authorization: `Bearer ${token}`,
    },
  });

  if (!userResponse.ok) return json({ error: "Login required" }, 401);

  const user = await userResponse.json();
  if (
    !user?.id || !user?.email || !user?.email_confirmed_at ||
    user?.is_anonymous
  ) {
    return json({ error: "Login required" }, 401);
  }

  const adminResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/justcolors_dashboard_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    },
  );

  if (!adminResponse.ok) {
    console.error("Admin authorization lookup failed", adminResponse.status);
    return json({ error: "Authorization error" }, 500);
  }

  const admins = await adminResponse.json();
  if (!Array.isArray(admins) || admins.length === 0) {
    return json({ error: "Access denied: admin authorization required" }, 403);
  }

  return { id: user.id, email: user.email };
}

async function printfulGet(path: string): Promise<Response> {
  if (!PRINTFUL_TOKEN) {
    return json({
      connected: false,
      error: "Printful secret not configured",
      requiredSecret: "PRINTFUL_TOKEN",
    }, 503);
  }

  const headers: Record<string, string> = {
    authorization: `Bearer ${PRINTFUL_TOKEN}`,
    accept: "application/json",
  };
  if (PRINTFUL_STORE_ID) headers["X-PF-Store-Id"] = PRINTFUL_STORE_ID;

  const response = await fetch(`${PRINTFUL_API_URL}${path}`, { headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Printful API request failed", response.status);
    const message = typeof payload?.result === "string"
      ? payload.result
      : payload?.error?.message ?? "Printful API request failed";
    return json({
      connected: false,
      error: message,
      printfulStatus: response.status,
    }, response.status);
  }

  return json(payload);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const admin = await requireJustcolorsAdmin(req);
  if (admin instanceof Response) return admin;

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "connection";

  if (action === "connection") {
    const upstream = await printfulGet("/sync/products?limit=1&offset=0");
    if (!upstream.ok) return upstream;
    const payload = await upstream.json();

    return json({
      connected: true,
      account: "JUSTCOLORS",
      scope: PRINTFUL_STORE_ID
        ? "account-token-with-store-id"
        : "single-store-token",
      syncProducts: {
        total: Number(payload?.paging?.total ?? 0),
        sample: Array.isArray(payload?.result)
          ? payload.result.slice(0, 1).map((item: Record<string, unknown>) => ({
            id: item.id,
            externalId: item.external_id,
            name: item.name,
            variants: item.variants,
            synced: item.synced,
            ignored: item.is_ignored,
          }))
          : [],
      },
    });
  }

  if (action === "sync-products") {
    const rawLimit = Number(url.searchParams.get("limit") ?? 20);
    const rawOffset = Number(url.searchParams.get("offset") ?? 0);
    const limit = Math.min(
      Math.max(Number.isFinite(rawLimit) ? rawLimit : 20, 1),
      100,
    );
    const offset = Math.max(
      Number.isFinite(rawOffset) ? rawOffset : 0,
      0,
    );
    return printfulGet(`/sync/products?limit=${limit}&offset=${offset}`);
  }

  return json({ error: "Unsupported action" }, 400);
});
