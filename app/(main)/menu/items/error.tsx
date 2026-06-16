"use client"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-sm text-destructive">Failed to load products</p>
      <Button variant="outline" onClick={reset}>Try again</Button>
    </div>
  )
}