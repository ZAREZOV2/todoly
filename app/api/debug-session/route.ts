import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getToken } from "next-auth/jwt"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    return NextResponse.json({
      session,
      token,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}

