import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const envVars = {
    NEON_POSTGRES_PRISMA_URL: process.env.NEON_POSTGRES_PRISMA_URL ? "✅ Set" : "❌ Not set",
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_URL: process.env.POSTGRES_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "✅ Set" : "❌ Not set",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set (legacy)" : "❌ Not set",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "✅ Set" : "❌ Not set",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ? "✅ Set" : "❌ Not set",
  }

  const url =
    process.env.NEON_POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL

  // Show first 60 chars of Neon pooled URL (for security)
  const dbUrlPreview = url ? url.substring(0, 60) + "..." : "Not set"

  let dbStatus: "connected" | "error" | "not_configured" = "not_configured"
  let dbError: string | undefined

  if (!url) {
    dbStatus = "not_configured"
  } else {
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = "connected"
    } catch (error: any) {
      dbStatus = "error"
      dbError = error?.message || "Unknown error"
    }
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    variables: envVars,
    databaseUrlPreview: dbUrlPreview,
    database: {
      status: dbStatus,
      error: process.env.NODE_ENV === "development" ? dbError : undefined,
    },
    message:
      "Neon PostgreSQL / Prisma diagnostic endpoint. Verify that POSTGRES_PRISMA_URL is set to the pooled connection string from Neon (with sslmode=require, channel_binding=require, connect_timeout=15).",
  })
}
