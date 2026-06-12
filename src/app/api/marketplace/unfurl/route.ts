// Link unfurl: fetch a pasted listing URL and pull OpenGraph preview data.
// Auth-gated by middleware (under /api/marketplace). Best-effort — many FB
// Marketplace listings are login-gated, so a clean preview isn't guaranteed.
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function isBlockedHost(host: string) {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    /^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function meta(html: string, keys: string[]): string | null {
  for (const k of keys) {
    const a = html.match(
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${k}["'][^>]+content=["']([^"']*)["']`,
        "i",
      ),
    );
    if (a?.[1]) return decode(a[1]);
    const b = html.match(
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${k}["']`,
        "i",
      ),
    );
    if (b?.[1]) return decode(b[1]);
  }
  return null;
}

export async function POST(req: NextRequest) {
  let url = "";
  try {
    url = String((await req.json())?.url ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Not a valid URL" }, { status: 400 });
  }
  if (!["http:", "https:"].includes(parsed.protocol) || isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(parsed.toString(), {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);
    const html = (await res.text()).slice(0, 600_000);

    const title =
      meta(html, ["og:title", "twitter:title"]) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
      null;
    const image = meta(html, [
      "og:image:secure_url",
      "og:image",
      "twitter:image",
      "twitter:image:src",
    ]);
    const priceRaw = meta(html, [
      "product:price:amount",
      "og:price:amount",
      "product:sale_price:amount",
    ]);
    const price = priceRaw ? Math.round(Number(priceRaw.replace(/[^0-9.]/g, ""))) : null;

    return NextResponse.json({
      title: title ? decode(title) : null,
      image: image || null,
      price: Number.isFinite(price) ? price : null,
    });
  } catch {
    // Login-gated or unreachable — let the client fall back to manual entry.
    return NextResponse.json({ title: null, image: null, price: null });
  }
}
