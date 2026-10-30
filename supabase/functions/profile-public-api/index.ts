import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const PROJECT_URL = "https://qkexfgadhtnkgzdfbcnf.supabase.co";
const OWNER_ORIGIN = "https://myprofil-rizki.vercel.app";
const MAX_BODY_BYTES = 12_000;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && (
      url.hostname === "myprofil-rizki.vercel.app" ||
      url.hostname === "profil-pribadi-flame.vercel.app" ||
      url.hostname === "profil-pribadi-rizki-amalludin.vercel.app" ||
      url.hostname === "profil-pribadi-git-main-rizki-amalludin.vercel.app" ||
      (url.hostname.startsWith("profil-pribadi-") && url.hostname.endsWith(".vercel.app"))
    );
  } catch {
    return false;
  }
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : OWNER_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(status: number, body: Record<string, unknown>, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function getSecretKey(): string {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.default) return parsed.default;
  }
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacy) return legacy;
  throw new Error("Server secret is not configured");
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validText(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

function looksSuspicious(value: string): boolean {
  return /(https?:\/\/|www\.)/i.test(value) || /(.)\1{11,}/u.test(value);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") return json(405, { error: "Method not allowed" }, origin);
  if (origin && !isAllowedOrigin(origin)) return json(403, { error: "Origin not allowed" }, origin);

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return json(413, { error: "Payload too large" }, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
    if (new TextEncoder().encode(JSON.stringify(body)).length > MAX_BODY_BYTES) {
      return json(413, { error: "Payload too large" }, origin);
    }
  } catch {
    return json(400, { error: "Invalid JSON" }, origin);
  }

  const type = body.type;
  if (!["contact", "guestbook", "comment", "reaction"].includes(String(type))) {
    return json(400, { error: "Unknown request type" }, origin);
  }

  // Honeypot: bots fill this field, real visitors never see or complete it.
  if (typeof body.website === "string" && body.website.trim()) {
    return json(201, { ok: true, message: "Thank you." }, origin);
  }

  try {
    const secret = getSecretKey();
    const ip = req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
      "unknown";
    const ipHash = await sha256(secret + ":" + ip);

    const limits: Record<string, { count: number; window: number }> = {
      contact: { count: 3, window: 900 },
      guestbook: { count: 4, window: 3600 },
      comment: { count: 6, window: 900 },
      reaction: { count: 20, window: 3600 },
    };
    const limit = limits[String(type)];

    const rate = await fetch(PROJECT_URL + "/rest/v1/rpc/consume_public_rate_limit", {
      method: "POST",
      headers: {
        "apikey": secret,
        "Authorization": "Bearer " + secret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_bucket: type,
        p_ip_hash: ipHash,
        p_limit: limit.count,
        p_window_seconds: limit.window,
      }),
    });
    if (!rate.ok) return json(503, { error: "Rate limiter unavailable" }, origin);
    if (await rate.json() !== true) {
      return json(429, { error: "Terlalu banyak percobaan. Coba lagi nanti." }, origin);
    }

    const headers = {
      "apikey": secret,
      "Authorization": "Bearer " + secret,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    };

    if (type === "contact") {
      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim().toLowerCase();
      const subject = String(body.subject ?? "").trim();
      const message = String(body.message ?? "").trim();

      if (!validText(name, 2, 80) || !isValidEmail(email) ||
          !validText(subject, 3, 140) || !validText(message, 10, 5000)) {
        return json(400, { error: "Periksa kembali nama, email, subjek, dan pesan." }, origin);
      }

      const response = await fetch(PROJECT_URL + "/rest/v1/contact_messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender_name: name,
          sender_email: email,
          subject,
          message,
          status: "unread",
        }),
      });
      if (!response.ok) return json(502, { error: "Pesan belum berhasil disimpan." }, origin);
      return json(201, { ok: true, message: "Pesan berhasil masuk ke inbox pemilik." }, origin);
    }

    if (type === "guestbook") {
      const nickname = String(body.nickname ?? "").trim();
      const message = String(body.message ?? "").trim();
      if (!validText(nickname, 2, 40) || !validText(message, 2, 500)) {
        return json(400, { error: "Nama atau pesan tidak sesuai batas." }, origin);
      }
      const status = looksSuspicious(message) ? "pending" : "approved";
      const response = await fetch(PROJECT_URL + "/rest/v1/guestbook_entries", {
        method: "POST",
        headers,
        body: JSON.stringify({ nickname, message, status }),
      });
      if (!response.ok) return json(502, { error: "Pesan belum berhasil disimpan." }, origin);
      return json(201, {
        ok: true,
        status,
        message: status === "approved" ? "Salam berhasil ditampilkan." : "Pesan menunggu pemeriksaan.",
      }, origin);
    }

    if (type === "comment") {
      const slug = String(body.content_slug ?? "").trim();
      const nickname = String(body.nickname ?? "").trim();
      const message = String(body.message ?? "").trim();
      if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(slug) ||
          !validText(nickname, 2, 40) || !validText(message, 2, 1500)) {
        return json(400, { error: "Komentar tidak sesuai format." }, origin);
      }
      const status = looksSuspicious(message) ? "pending" : "approved";
      const response = await fetch(PROJECT_URL + "/rest/v1/comments", {
        method: "POST",
        headers,
        body: JSON.stringify({ content_slug: slug, nickname, message, status }),
      });
      if (!response.ok) return json(502, { error: "Komentar belum berhasil disimpan." }, origin);
      return json(201, {
        ok: true,
        status,
        message: status === "approved" ? "Komentar berhasil ditampilkan." : "Komentar menunggu pemeriksaan.",
      }, origin);
    }

    const slug = String(body.content_slug ?? "").trim();
    const reaction = String(body.reaction_type ?? "").trim();
    const visitorToken = String(body.visitor_token ?? "").trim();
    if (!/^[a-z0-9][a-z0-9-]{1,79}$/.test(slug) ||
        !["like", "cool", "inspiring", "interesting"].includes(reaction) ||
        visitorToken.length < 16 || visitorToken.length > 128) {
      return json(400, { error: "Reaksi tidak sesuai format." }, origin);
    }

    const visitorHash = await sha256(secret + ":" + visitorToken);
    const response = await fetch(
      PROJECT_URL + "/rest/v1/reactions?on_conflict=content_slug,reaction_type,visitor_token_hash",
      {
        method: "POST",
        headers: { ...headers, "Prefer": "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify({
          content_slug: slug,
          reaction_type: reaction,
          visitor_token_hash: visitorHash,
        }),
      },
    );
    if (!response.ok) return json(502, { error: "Reaksi belum berhasil disimpan." }, origin);
    return json(201, { ok: true, message: "Terima kasih atas reaksinya." }, origin);
  } catch {
    return json(500, { error: "Layanan sedang bermasalah. Coba lagi nanti." }, origin);
  }
});
