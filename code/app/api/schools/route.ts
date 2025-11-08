import { type NextRequest, NextResponse } from "next/server"
import { getSchoolsStore } from "@/lib/schools-store"

// Get the schools from the JSON file
export async function GET(request: NextRequest) {
  try {
    // Get the search parameters from the request
    const searchParams = request.nextUrl.searchParams
    const state = searchParams.get("state")
    const zip = searchParams.get("zip")

    // Get schools with votes from JSON file merged in
    let schools = await getSchoolsStore()

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
