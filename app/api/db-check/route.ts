import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    STORAGE_POSTGRES_URL: process.env.STORAGE_POSTGRES_URL ? "✅ Set" : "❌ Not set",
    STORAGE_POSTGRES_URL_NON_POOLING: process.env.STORAGE_POSTGRES_URL_NON_POOLING ? "✅ Set" : "❌ Not set",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set (legacy)" : "❌ Not set",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Not set",
  }

  // Show first 50 chars of URLs (for security)
  const dbUrlPreview = process.env.STORAGE_POSTGRES_URL 
    ? process.env.STORAGE_POSTGRES_URL.substring(0, 50) + "..."
    : "Not set"

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    variables: envVars,
    databaseUrlPreview: dbUrlPreview,
    message: "Check which database URL variables are available (Supabase via Vercel)",
  })
}
