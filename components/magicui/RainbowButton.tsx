"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl px-8 text-sm font-medium text-white",
        "bg-[length:200%] transition-all duration-300",
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#6366f1)]",
        "[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:2px_solid_transparent]",
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#6366f1)] before:[filter:blur(12px)]",
        "hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  )
}
