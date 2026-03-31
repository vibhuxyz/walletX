import { NextRequest, NextResponse } from "next/server";

export function proxy(_request: NextRequest) {
  // In hosted cross-domain setups, auth cookies may live on the API origin
  // instead of the frontend origin. Client-side auth resolution already uses
  // the API session correctly, so avoid edge redirects here.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/private/:path*", "/auth/:path*"],
};
