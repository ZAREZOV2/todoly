// Role permissions API is disabled because the new schema
// no longer has Role / Permission models.

import { NextResponse } from "next/server"

export async function PUT() {
  return NextResponse.json(
    { error: "Role permissions API is disabled" },
    { status: 404 }
  )
}
