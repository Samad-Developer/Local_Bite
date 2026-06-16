"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { UploadButton } from "@/lib/uploadthing-client"

interface ImageUploadFieldProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function ImageUploadField({
  value,
  onChange,
  maxImages = 4,
}: ImageUploadFieldProps) {
  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#374151]">
        Images
        <span className="text-xs text-[#9ca3af] font-normal ml-1">
          (up to {maxImages}, first is main)
        </span>
      </p>

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, index) => (
            <div key={url} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-[#e5e7eb] bg-[#f9fafb]">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#dc2626] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <UploadButton
          // Remove explicit generics to avoid "Cannot find name 'OurFileRouter'" and
          // "Expected 1 type arguments, but got 2" errors in this file. Generics
          // should be provided where OurFileRouter is defined (e.g., in a shared
          // types file) if needed.
          endpoint="menuItemImage"
          onClientUploadComplete={(res) => {
            const newUrls = res.map((r) => r.url)
            onChange([...value, ...newUrls].slice(0, maxImages))
          }}
          onUploadError={(error) => console.error("Upload error:", error)}
          appearance={{
            button:
              "border-dashed text-black border-[#e5e7eb] hover:bg-[#f9f9f9] text-sm h-10 px-4 rounded-lg shadow-sm w-full",
            allowedContent: " text-xs mt-1",
          }}
        />
      )}
    </div>
  )
}