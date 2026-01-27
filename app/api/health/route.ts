import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Health check database error:", error)

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: process.env.NODE_ENV === "development" ? error?.message : "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
