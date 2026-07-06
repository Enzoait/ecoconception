import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "luxe_auth";
const PROTECTED = ["/cart", "/collection"];
const AUTH_ONLY = ["/auth/login", "/auth/register"];

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "luxe-motors-secret-fallback"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let authenticated = false;
  if (token) {
    try {
      await jwtVerify(token, getSecret());
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (PROTECTED.some((r) => pathname.startsWith(r)) && !authenticated) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (AUTH_ONLY.some((r) => pathname.startsWith(r)) && authenticated) {
    return NextResponse.redirect(new URL("/vehicles", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
