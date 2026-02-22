import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { GravityProvider } from "@/components/GravityProvider"

export const metadata: Metadata = {
  title: "Todoly",
  description: "Task management platform for development teams",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <GravityProvider>
          <AuthProvider>{children}</AuthProvider>
        </GravityProvider>
      </body>
    </html>
  )
}
