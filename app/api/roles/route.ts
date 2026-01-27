// Roles API is disabled because the new schema
// no longer has a separate Role model.
// This route is kept for backward compatibility and returns 404.

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ error: "Roles API is disabled" }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ error: "Roles API is disabled" }, { status: 404 })
}
