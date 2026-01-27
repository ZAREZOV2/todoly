// Task comments API is disabled because the new schema
// no longer has a Comment model.

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { error: "Task comments API is disabled" },
    { status: 404 }
  )
}

export async function POST() {
  return NextResponse.json(
    { error: "Task comments API is disabled" },
    { status: 404 }
  )
}
