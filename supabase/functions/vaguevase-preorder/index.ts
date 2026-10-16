import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type JsonRecord = Record<string, unknown>;
type ReservationPayload = {
  submissionToken?: unknown;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  countryCity?: unknown;
  version?: unknown;
  product_type?: unknown;
  quantity?: unknown;
  notes?: unknown;
  consent?: unknown;
  consentAt?: unknown;
  formStartedAt?: unknown;
  website?: unknown;
  landingUrl?: unknown;
  referrer?: unknown;
  locale?: unknown;
  pageVersion?: unknown;
  tracking?: unknown;
};

const allowedOrigins = new Set([
  "https://vaguevase.justcolors.net",
  "https://emilioquattrini.github.io",
  "https://justcolors.net",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const versionLabels: Record<string, string> = {
  small: "Small — Lilac / Blue",
  large: "Large — Orange / Magenta",
  set: "Set — Small + Large",
};

const products: Record<string, { label: string; cents: number }> = {"small_vase_flower":{"label":"Small vase + flower","cents":9900},"big_vase_flower":{"label":"Big vase + flower","cents":15900},"flower_stem":{"label":"Flower stem","cents":2990}};

const eventCode = "BIG Milano 2026";
const source = "vaguevase-landing";
const maxBodyBytes = 20_000;

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin)
    ? origin
    : "https://vaguevase.justcolors.net",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
});

const jsonResponse = (body: JsonRecord, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

const cleanText = (
  value: unknown,
  maxLength: number,
  required = false,
): string | null => {
  if (typeof value !== "string") return required ? null : "";
  const cleaned = value.normalize("NFKC").replace(/\u0000/g, "").trim();
  if (required && cleaned.length === 0) return null;
  return cleaned.slice(0, maxLength);
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value) && value.length <= 254;

const sha256 = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const restHeaders = (serviceRoleKey: string) => ({
  "Authorization": `Bearer ${serviceRoleKey}`,
  "apikey": serviceRoleKey,
  "Content-Type": "application/json",
});

const getExistingReservation = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  submissionToken: string,
) => {
  const query = new URLSearchParams({
    submission_token: `eq.${submissionToken}`,
    select: "reference_code,created_at",
    limit: "1",
  });
  const response = await fetch(
    `${supabaseUrl}/rest/v1/justcolors_vaguevase_preorders?${query.toString()}`,
    { headers: restHeaders(serviceRoleKey) },
  );

  if (!response.ok) return null;
  const rows = (await response.json()) as Array<{
    reference_code: string;
    created_at: string;
  }>;
  return rows[0] ?? null;
};

const countRecent = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  field: "client_ip_hash" | "email",
  value: string,
  sinceIso: string,
  limit: number,
) => {
  const query = new URLSearchParams({
    [field]: `eq.${value}`,
    created_at: `gte.${sinceIso}`,
    select: "id",
    limit: String(limit),
  });
  const response = await fetch(
    `${supabaseUrl}/rest/v1/justcolors_vaguevase_preorders?${query.toString()}`,
    { headers: restHeaders(serviceRoleKey) },
  );

  if (!response.ok) return 0;
  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length;
};

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    if (!origin || !allowedOrigins.has(origin)) {
      return new Response(null, { status: 403, headers: corsHeaders(origin) });
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed." }, 405, origin);
  }
  if (!origin || !allowedOrigins.has(origin)) {
    return jsonResponse({ success: false, error: "Origin not allowed." }, 403, origin);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse({ success: false, error: "Invalid content type." }, 415, origin);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > maxBodyBytes) {
    return jsonResponse({ success: false, error: "Request too large." }, 413, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("VagueVase preorder function is missing Supabase environment variables.");
    return jsonResponse({ success: false, error: "Service unavailable." }, 503, origin);
  }

  let payload: ReservationPayload;
  try {
    payload = (await request.json()) as ReservationPayload;
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON payload." }, 400, origin);
  }

  const honeypot = cleanText(payload.website, 120) ?? "";
  if (honeypot.length > 0) {
    return jsonResponse({ success: true, referenceCode: "VV-RECEIVED" }, 200, origin);
  }

  const submissionToken = cleanText(payload.submissionToken, 64, true);
  const fullName = cleanText(payload.fullName, 120, true);
  const email = cleanText(payload.email, 254, true)?.toLowerCase() ?? null;
  const phone = cleanText(payload.phone, 40);
  const countryCity = cleanText(payload.countryCity, 120);
  const productType = cleanText(payload.product_type, 80);
  const product = productType && Object.hasOwn(products, productType) ? products[productType] : null;
  const versionValue = product ? productType : cleanText(payload.version, 80, true);
  const notes = cleanText(payload.notes, 2000);
  const landingUrl = cleanText(payload.landingUrl, 1000);
  const referrer = cleanText(payload.referrer, 1000);
  const locale = cleanText(payload.locale, 40);
  const pageVersion = cleanText(payload.pageVersion, 80);
  const quantity = Number(payload.quantity);
  const consentAt = typeof payload.consentAt === "string" ? new Date(payload.consentAt) : null;
  const formStartedAt = typeof payload.formStartedAt === "string" ? new Date(payload.formStartedAt) : null;
  const now = new Date();

  if (!submissionToken || !isUuid(submissionToken)) {
    return jsonResponse({ success: false, error: "Invalid submission token." }, 400, origin);
  }

  const existing = await getExistingReservation(supabaseUrl, serviceRoleKey, submissionToken);
  if (existing) {
    return jsonResponse({
      success: true,
      duplicate: true,
      referenceCode: existing.reference_code,
      createdAt: existing.created_at,
    }, 200, origin);
  }

  if (!fullName || fullName.length < 2) {
    return jsonResponse({ success: false, error: "Please enter your name." }, 400, origin);
  }
  if (!email || !isEmail(email)) {
    return jsonResponse({ success: false, error: "Please enter a valid email address." }, 400, origin);
  }
  if (!versionValue || (!product && (productType || !Object.hasOwn(versionLabels, versionValue)))) {
    return jsonResponse({ success: false, error: "Please choose a valid VagueVase version." }, 400, origin);
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return jsonResponse({ success: false, error: "Please choose a valid quantity." }, 400, origin);
  }
  if (payload.consent !== true || !consentAt || Number.isNaN(consentAt.getTime())) {
    return jsonResponse({ success: false, error: "Consent is required." }, 400, origin);
  }
  if (!formStartedAt || Number.isNaN(formStartedAt.getTime())) {
    return jsonResponse({ success: false, error: "Please reopen the form and try again." }, 400, origin);
  }

  const completionTime = now.getTime() - formStartedAt.getTime();
  if (completionTime < 1500 || completionTime > 86_400_000) {
    return jsonResponse({ success: false, error: "Please reopen the form and try again." }, 400, origin);
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientIp = request.headers.get("cf-connecting-ip") ?? forwardedFor ?? "unknown";
  const clientIpHash = await sha256(`${serviceRoleKey.slice(-32)}:${clientIp}`);
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Event visitors can share venue Wi-Fi and therefore a public IP. Keep the
  // IP ceiling generous, while limiting repeated submissions per email.
  const [ipHourCount, ipDayCount, emailDayCount] = await Promise.all([
    countRecent(supabaseUrl, serviceRoleKey, "client_ip_hash", clientIpHash, hourAgo, 101),
    countRecent(supabaseUrl, serviceRoleKey, "client_ip_hash", clientIpHash, dayAgo, 501),
    countRecent(supabaseUrl, serviceRoleKey, "email", email, dayAgo, 4),
  ]);

  if (ipHourCount >= 100 || ipDayCount >= 500 || emailDayCount >= 3) {
    return jsonResponse({
      success: false,
      error: "Too many reservation attempts. Please contact JUSTCOLORS directly if you need help.",
    }, 429, origin);
  }

  const tracking = payload.tracking && typeof payload.tracking === "object"
    ? payload.tracking as Record<string, unknown>
    : {};
  const userAgent = cleanText(request.headers.get("user-agent"), 500);

  const reservation = {
    submission_token: submissionToken,
    full_name: fullName,
    email,
    phone: phone || null,
    country_city: countryCity || null,
    version_value: versionValue,
    version_label: product?.label ?? versionLabels[versionValue],
    product_type: product ? productType : null,
    product_label: product?.label ?? null,
    unit_price: product ? product.cents / 100 : null,
    quantity,
    notes: notes || null,
    consent_contact: true,
    consent_at: consentAt.toISOString(),
    event_code: eventCode,
    source,
    landing_url: landingUrl || null,
    referrer: referrer || null,
    user_agent: userAgent || null,
    locale: locale || null,
    page_version: pageVersion || null,
    client_ip_hash: clientIpHash,
    utm_source: cleanText(tracking.utmSource, 160) || null,
    utm_medium: cleanText(tracking.utmMedium, 160) || null,
    utm_campaign: cleanText(tracking.utmCampaign, 160) || null,
    utm_content: cleanText(tracking.utmContent, 160) || null,
  };

  const insertResponse = await fetch(
    `${supabaseUrl}/rest/v1/justcolors_vaguevase_preorders?select=reference_code,created_at`,
    {
      method: "POST",
      headers: {
        ...restHeaders(serviceRoleKey),
        "Prefer": "return=representation",
      },
      body: JSON.stringify(reservation),
    },
  );

  if (!insertResponse.ok) {
    if (insertResponse.status === 409) {
      const duplicate = await getExistingReservation(supabaseUrl, serviceRoleKey, submissionToken);
      if (duplicate) {
        return jsonResponse({
          success: true,
          duplicate: true,
          referenceCode: duplicate.reference_code,
          createdAt: duplicate.created_at,
        }, 200, origin);
      }
    }

    const diagnostic = await insertResponse.text();
    console.error("VagueVase preorder insert failed", insertResponse.status, diagnostic.slice(0, 500));
    return jsonResponse({
      success: false,
      error: "We could not save your reservation. Please try again.",
    }, 500, origin);
  }

  const rows = (await insertResponse.json()) as Array<{
    reference_code: string;
    created_at: string;
  }>;
  const saved = rows[0];

  if (!saved) {
    return jsonResponse({
      success: false,
      error: "We could not confirm your reservation. Please try again.",
    }, 500, origin);
  }

  return jsonResponse({
    success: true,
    referenceCode: saved.reference_code,
    createdAt: saved.created_at,
    message: "Reservation received. No payment has been collected.",
  }, 201, origin);
});
