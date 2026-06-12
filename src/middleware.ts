// Guard the app. Marketing site (/) stays public.
// Protect /app/* pages and mutating data routes. Auth routes stay open.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PROTECTED_API = [
  "/api/tasks",
  "/api/payments",
  "/api/contacts",
  "/api/shopping",
  "/api/daily-log",
  "/api/export",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAppPage = pathname === "/app" || pathname.startsWith("/app/");
  const isProtectedApi = PROTECTED_API.some((p) => pathname.startsWith(p));
  if (!isAppPage && !isProtectedApi) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verifySessionToken(token);
  if (ok) return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};
