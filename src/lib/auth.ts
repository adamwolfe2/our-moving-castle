// Shared-password auth. One household, two people, one password.
// Cookie = signed JWT (jose). No user table.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "mc_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secretKey() {
  const secret =
    process.env.SESSION_SECRET || process.env.APP_PASSWORD || "calcifer-castle-dev-secret";
  return new TextEncoder().encode(secret);
}

export function expectedPassword() {
  return process.env.APP_PASSWORD || "calcifer";
}

/** Constant-time-ish password check. */
export function passwordMatches(input: string) {
  const a = input ?? "";
  const b = expectedPassword();
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken() {
  return new SignJWT({ household: "cadet" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey());
    return true;
  } catch {
    return false;
  }
}

export const SESSION_MAX_AGE = MAX_AGE;
