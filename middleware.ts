import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Block access to browser-based streaming page
  if (request.nextUrl.pathname === "/stream") {
    // Redirect to OBS streaming page
    return NextResponse.redirect(new URL("/stream-obs", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match /stream but not /stream-obs or /stream/[id]
     */
    "/stream",
  ],
};
