import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userSession = request.cookies.get("user_session")

  if (!userSession && request.nextUrl.pathname.startsWith("/task-manager")) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  if (userSession && request.nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/task-manager", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/task-manager/:path*", "/auth"],
}

