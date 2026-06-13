"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loginUser } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(loginUser, null)

  useEffect(() => {
  if (state?.success) {
    router.push("/dashboard")
  }
}, [state])

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-8 w-full max-w-md">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">
            Welcome back
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Sign in to your restaurant dashboard
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-[#374151] mb-1.5 block">
              Email Address
            </Label>
            <Input
              name="email"
              type="email"
              placeholder="ahmed@restaurant.com"
              required
              className="bg-white border-[#e5e7eb] h-10"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-[#374151] mb-1.5 block">
              Password
            </Label>
            <Input
              name="password"
              type="password"
              placeholder="your password"
              required
              className="bg-white border-[#e5e7eb] h-10"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white h-10 rounded-lg"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-[#6b7280] text-center mt-6">
          Do not have an account?{" "}
          <Link href="/register" className="text-[#f97316] font-medium hover:underline">
            Create one
          </Link>
        </p>

      </div>
    </div>
  )
}