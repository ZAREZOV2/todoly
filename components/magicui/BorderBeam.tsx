"use client"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  duration?: number
  colorFrom?: string
  colorTo?: string
  className?: string
  borderWidth?: number
}

export function BorderBeam({
  className,
  duration = 4,
  colorFrom = "#6366f1",
  colorTo = "#8b5cf6",
  borderWidth = 1,
}: BorderBeamProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
    >
      <div
        className="absolute -inset-[100%] animate-[spin_var(--duration)_linear_infinite]"
        style={
          {
            "--duration": `${duration}s`,
            background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom}, ${colorTo}, transparent 360deg)`,
          } as React.CSSProperties
        }
      />
      <div
        className="absolute inset-[var(--bw)] rounded-[inherit] bg-white dark:bg-gray-900"
        style={{ ["--bw" as string]: `${borderWidth}px` } as React.CSSProperties}
      />
    </div>
  )
}
