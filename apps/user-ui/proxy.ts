import { NextRequest, NextResponse } from "next/server";

const AUTH_ACCESS_COOKIE_NAMES = [
  "userAccessToken",
  "merchantAccessToken",
  "bankAdminAccessToken",
  "superAdminAccessToken",
] as const;

const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/private"] as const;
const AUTH_ROUTE_PREFIX = "/auth";

const AUTH_ONBOARDING_PATHS = ["/auth/create-pin", "/auth/kyc"] as const;

function hasAuthCookie(request: NextRequest): boolean {
  return AUTH_ACCESS_COOKIE_NAMES.some((cookieName) =>
    Boolean(request.cookies.get(cookieName)?.value),
  );
}

function matchesRoutePrefix(
  pathname: string,
  routePrefix: (typeof PROTECTED_ROUTE_PREFIXES)[number] | string,
): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((routePrefix) =>
    matchesRoutePrefix(pathname, routePrefix),
  );
}

function isAuthRoute(pathname: string): boolean {
  return (
    pathname === AUTH_ROUTE_PREFIX ||
    pathname.startsWith(`${AUTH_ROUTE_PREFIX}/`)
  );
}

function isOnboardingRoute(pathname: string): boolean {
  return AUTH_ONBOARDING_PATHS.some((routePrefix) =>
    matchesRoutePrefix(pathname, routePrefix),
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = hasAuthCookie(request);

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    const nextPath = `${pathname}${search}`;

    if (nextPath && nextPath !== "/auth/login") {
      loginUrl.searchParams.set("next", nextPath);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (
    isAuthenticated &&
    isAuthRoute(pathname) &&
    !isOnboardingRoute(pathname)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/private/:path*", "/auth/:path*"],
};
