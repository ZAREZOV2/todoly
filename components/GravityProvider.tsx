"use client"

import { ThemeProvider } from "@gravity-ui/uikit"

export function GravityProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme="light">{children}</ThemeProvider>
}
