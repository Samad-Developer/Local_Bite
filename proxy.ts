import { auth } from "@/auth"
import { NextResponse } from "next/server"

const OWNER_ONLY = ["/settings"]
const OWNER_AND_MANAGER = ["/dashboard", "/menu"]

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.STOREFRONT_URL ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role

  if (req.method === "OPTIONS" && pathname.startsWith("/api/v1")) {
    return new NextResponse(null, { status: 200, headers: corsHeaders })
  }

  if (pathname.startsWith("/api/v1")) {
    const response = NextResponse.next()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  const protectedRoutes = ["/dashboard", "/menu", "/orders", "/settings"]
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (
    OWNER_ONLY.some((route) => pathname.startsWith(route)) &&
    role !== "OWNER"
  ) {
    return NextResponse.redirect(new URL("/orders", req.url))
  }

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
    "/api/v1/:path*",
    "/dashboard/:path*",
    "/menu/:path*",
    "/orders/:path*",
    "/settings/:path*",
    "/delivery-areas/:path*", 
    "/login",
    "/register",
  ],
}
