// Roles API by ID is disabled because the new schema
// no longer has a separate Role model.
// All handlers return 404 for backward compatibility.

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ error: "Roles API is disabled" }, { status: 404 })
}

export async function PUT() {
  return NextResponse.json({ error: "Roles API is disabled" }, { status: 404 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Roles API is disabled" }, { status: 404 })
}
