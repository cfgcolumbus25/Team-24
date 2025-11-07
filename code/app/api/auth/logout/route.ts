import { NextResponse } from "next/server"

export async function POST() {
  // In production, invalidate the token in the database
  return NextResponse.json({ success: true })
}
