"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing-client";
import { twMerge } from "tailwind-merge";

interface ImageUploadFieldProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  multiple?: boolean; // false = single image only
  aspect?: "square" | "video"; // defaults to "square"
  /** Names what this uploader is for. Falls back to a generic "Image"/"Images". */
  label?: string;
  /** Helper line under the label — sizing guidance, where it gets used, etc. */
  hint?: string;
}

export function ImageUploadField({
  value,
  onChange,
  maxImages = 4,
  multiple = true,
  aspect = "square",
  label,
  hint,
}: ImageUploadFieldProps) {
  const effectiveMax = multiple ? maxImages : 1;
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";

  function removeImage(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-title">
          {label ?? (multiple ? "Images" : "Image")}
          {/* Only the unlabelled (generic) form inlines the count. */}
          {!label && multiple && (
            <span className="text-xs text-soft font-normal ml-1">
              (up to {effectiveMax}, first is main)
            </span>
          )}
        </p>
        {hint && <p className="text-xs text-soft leading-relaxed">{hint}</p>}
      </div>

      {value.length > 0 && (
        <div
          className={
            multiple
              ? "grid grid-cols-4 gap-2"
              : "w-32" // single mode: one fixed-size tile, not a grid
          }
        >
          {value.map((url, index) => (
            <div key={url} className="relative group">
              <div
                className={twMerge(
                  "rounded-lg overflow-hidden border border-[#e5e7eb] bg-[#f9fafb]",
                  aspectClass
                )}
              >
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  width={200}
                  height={200}
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
              {multiple && index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length < effectiveMax && (
        <UploadButton
          endpoint="menuItemImage"
          onClientUploadComplete={(res) => {
            const newUrls = res.map((r) => r.url);
            onChange(
              multiple
                ? [...value, ...newUrls].slice(0, effectiveMax)
                : newUrls.slice(0, 1) // single mode: replace, don't append
            );
          }}
          onUploadError={(error) => console.error("Upload error:", error)}
          config={{ cn: twMerge }}
          appearance={{
            button:
              "text-black border border-dashed border-gray-400 hover:bg-gray-100 transition rounded-md h-16 px-4 w-full",
          }}
        />
      )}
    </div>
  );
}