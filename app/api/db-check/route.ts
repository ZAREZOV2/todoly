import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_URL: process.env.POSTGRES_URL ? "✅ Set" : "❌ Not set",
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "✅ Set" : "❌ Not set",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Not set",
  }

  // Show first 50 chars of URLs (for security)
  const dbUrlPreview = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.substring(0, 50) + "..."
    : "Not set"

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    variables: envVars,
    databaseUrlPreview: dbUrlPreview,
    message: "Check which database URL variables are available",
  })
}
