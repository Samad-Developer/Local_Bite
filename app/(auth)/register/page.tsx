"use client"

import { useActionState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerOwner } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(registerOwner, null)

  // redirect to login after successful registration
  useEffect(() => {
    if (state?.success) {
      router.push("/login")
    }
  }, [state, router])

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm p-8 w-full max-w-md">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">
            Create your account
          </h1>
          <p className="text-sm text-[#6b7280] mt-1">
            Set up your restaurant in minutes
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-[#374151] mb-1.5 block">
              Your Name
            </Label>
            <Input
              name="name"
              placeholder="Ahmed Ali"
              required
              className="bg-white border-[#e5e7eb] h-10"
            />
            {state?.errors?.name && (
              <p className="text-sm text-[#dc2626] mt-1">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-[#374151] mb-1.5 block">
              Restaurant Name
            </Label>
            <Input
              name="restaurantName"
              placeholder="Lahore Darbar"
              required
              className="bg-white border-[#e5e7eb] h-10"
            />
            {state?.errors?.restaurantName && (
              <p className="text-sm text-[#dc2626] mt-1">
                {state.errors.restaurantName[0]}
              </p>
            )}
          </div>

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
            {state?.errors?.email && (
              <p className="text-sm text-[#dc2626] mt-1">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-[#374151] mb-1.5 block">
              Password
            </Label>
            <Input
              name="password"
              type="password"
              placeholder="minimum 8 characters"
              required
              className="bg-white border-[#e5e7eb] h-10"
            />
            {state?.errors?.password && (
              <p className="text-sm text-[#dc2626] mt-1">
                {state.errors.password[0]}
              </p>
            )}  
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white h-10 rounded-lg"
          >
            {isPending ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-sm text-[#6b7280] text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#f97316] font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}