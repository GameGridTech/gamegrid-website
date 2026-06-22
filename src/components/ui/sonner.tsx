"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

/**
 * Toaster
 * App-wide toast surface. Uses a fixed light theme to match the admin console
 * (the app does not ship a dark mode), with GameGrid green accents.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-[#0D5A1E] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
