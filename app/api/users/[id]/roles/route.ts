// User roles API is disabled because roles are now
// represented by a simple string field on User.

import { NextResponse } from "next/server"

export async function PUT() {
  return NextResponse.json(
    { error: "User roles API is disabled" },
    { status: 404 }
  )
}
