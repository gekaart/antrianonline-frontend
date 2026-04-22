import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/admin/login", "/counter/login", "/setup", "/visitor", "/presentasi"];

// Visitor-facing dynamic routes: /{alias}/queue/*, /{alias}/antrian/*, /{alias}/monitor/*
const publicDynamicPattern = /^\/[^/]+\/(queue|antrian|monitor)(\/|$)/;

// Counter login under alias: /{alias}/counter/login
const counterLoginPattern = /^\/[^/]+\/counter\/login(\/|$)/;

// Any counter route under alias: /{alias}/counter/*
const counterAliasPattern = /^\/([^/]+)\/counter(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminToken = request.cookies.get("auth_token")?.value;
  const counterToken = request.cookies.get("counter_token")?.value;

  // Allow public static paths
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Allow visitor-facing pages (scan QR, antrian ticket, monitor display)
  if (publicDynamicPattern.test(pathname)) {
    return NextResponse.next();
  }

  // Allow /{alias}/counter/login as public
  if (counterLoginPattern.test(pathname)) {
    return NextResponse.next();
  }

  // Allow API and static paths
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // /{alias}/counter/* — require counter_token
  const counterAliasMatch = pathname.match(counterAliasPattern);
  if (counterAliasMatch) {
    const alias = counterAliasMatch[1];
    if (!counterToken) {
      return NextResponse.redirect(new URL(`/${alias}/counter/login`, request.url));
    }
    return NextResponse.next();
  }

  // Legacy /counter/* routes — require counter_token
  if (pathname.startsWith("/counter")) {
    if (!counterToken) {
      return NextResponse.redirect(new URL("/counter/login", request.url));
    }
    return NextResponse.next();
  }

  // Admin routes: require auth_token
  if (!adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
