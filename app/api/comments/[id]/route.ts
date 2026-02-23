// Comments API is disabled because the new schema
// no longer has a Comment model.

import { NextResponse } from "next/server"

export async function PUT() {
  return NextResponse.json(
    { error: "Comments API is disabled" },
    { status: 404 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Comments API is disabled" },
    { status: 404 }
  )
}
