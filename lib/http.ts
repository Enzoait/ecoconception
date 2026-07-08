import { NextResponse } from "next/server";

/**
 * JSON response for user-specific/authenticated data. Forces the response
 * to be excluded from any HTTP cache (browser, CDN, Vercel Edge) so it
 * always shows as MISS/BYPASS, never HIT.
 */
export function privateJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      ...init?.headers,
    },
  });
}
