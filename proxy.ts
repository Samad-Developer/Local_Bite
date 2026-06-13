import { auth } from "@/auth"
import { NextResponse } from "next/server"

const OWNER_ONLY = [
  "/settings",
]

const OWNER_AND_MANAGER = [
  "/dashboard",
  "/menu",
]

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role

  const protectedRoutes = ["/dashboard", "/menu", "/orders", "/settings"]
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // not logged in → send to login
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // already logged in → send to dashboard
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // owner only
  if (
    OWNER_ONLY.some((route) => pathname.startsWith(route)) &&
    role !== "OWNER"
  ) {
    return NextResponse.redirect(new URL("/orders", req.url))
  }

  // cashier blocked from owner and manager routes
  if (
    OWNER_AND_MANAGER.some((route) => pathname.startsWith(route)) &&
    role === "CASHIER"
  ) {
    return NextResponse.redirect(new URL("/orders", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/menu/:path*",
    "/orders/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
}