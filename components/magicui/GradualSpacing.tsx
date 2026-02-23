"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GradualSpacingProps {
  text: string
  className?: string
  delay?: number
  duration?: number
}

export function GradualSpacing({
  text,
  className,
  delay = 0,
  duration = 0.5,
}: GradualSpacingProps) {
  const words = text.split(" ")
  return (
    <span className={cn("inline-flex flex-wrap justify-center", className)}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex overflow-hidden">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              initial={{ opacity: 0, letterSpacing: "-0.5em" }}
              animate={{
                opacity: 1,
                letterSpacing: "0em",
              }}
              transition={{
                duration,
                delay: delay + wordIndex * 0.05 + charIndex * 0.02,
                ease: "easeOut",
              }}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </span>
  )
}
