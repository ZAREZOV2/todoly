import { NextRequest, NextResponse } from "next/server"
import { getSessionWithPermissions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithPermissions(req.headers)

    return NextResponse.json({
      session,
    })
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
