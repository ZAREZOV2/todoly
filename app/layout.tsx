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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu+Sans:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <GravityProvider>
          <AuthProvider>{children}</AuthProvider>
        </GravityProvider>
      </body>
    </html>
  )
}
