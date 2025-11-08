import { type NextRequest, NextResponse } from "next/server"
import { mockSchools } from "@/lib/mock-data"

// In production, this would query a real database
// For now, we use the same in-memory store as the admin panel
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get("state")
    const zip = searchParams.get("zip")

    let schools = [...mockSchools]

    // Filter by state if provided
    if (state) {
      schools = schools.filter((school) => school.state.toLowerCase() === state.toLowerCase())
    }

    return NextResponse.json({ schools })
  } catch (error) {
    console.error("[v0] Schools API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
