import { type NextRequest, NextResponse } from "next/server"
import { mockSchools } from "@/lib/mock-data"

// In-memory storage for demo (in production, use a database)
const policiesStore = [...mockSchools]

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { examId, minScore, courseCode, courseName, credits, isGeneralCredit, notes } = body

    const policyId = Number.parseInt(id)

    for (const school of policiesStore) {
      const policyIndex = school.policies.findIndex((p) => p.id === policyId)

      if (policyIndex !== -1) {
        school.policies[policyIndex] = {
          ...school.policies[policyIndex],
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

        return NextResponse.json({ policy: school.policies[policyIndex] })
      }
    }

    return NextResponse.json({ error: "Policy not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Update policy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const policyId = Number.parseInt(id)

    for (const school of policiesStore) {
      const policyIndex = school.policies.findIndex((p) => p.id === policyId)

      if (policyIndex !== -1) {
        school.policies.splice(policyIndex, 1)
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: "Policy not found" }, { status: 404 })
  } catch (error) {
    console.error("[v0] Delete policy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
