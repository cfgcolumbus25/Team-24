import { type NextRequest, NextResponse } from "next/server"
import { mockSchools } from "@/lib/mock-data"

// In-memory storage for demo (in production, use a database)
const policiesStore = [...mockSchools]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const universityId = searchParams.get("universityId")

  if (!universityId) {
    return NextResponse.json({ error: "University ID is required" }, { status: 400 })
  }

  const school = policiesStore.find((s) => s.id === Number.parseInt(universityId))

  if (!school) {
    return NextResponse.json({ error: "University not found" }, { status: 404 })
  }

  return NextResponse.json({ policies: school.policies })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { universityId, examId, minScore, courseCode, courseName, credits, isGeneralCredit, notes } = body

    if (!universityId || !examId || !minScore || !courseCode || !courseName || credits === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const school = policiesStore.find((s) => s.id === Number.parseInt(universityId))

    if (!school) {
      return NextResponse.json({ error: "University not found" }, { status: 404 })
    }

    const newPolicy = {
      id: Date.now(), // Simple ID generation for demo
      examId,
      minScore,
      courseCode,
      courseName,
      credits,
      isGeneralCredit: isGeneralCredit || false,
      notes,
      isUpdated: true,
      updatedAt: new Date().toISOString().split("T")[0],
    }

    school.policies.push(newPolicy)

    return NextResponse.json({ policy: newPolicy })
  } catch (error) {
    console.error("[v0] Create policy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
