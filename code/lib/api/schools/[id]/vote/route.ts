import { type NextRequest, NextResponse } from "next/server"
import { schoolsStore } from "@/lib/schools-store"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { voteType } = body // 'upvote' or 'downvote'

    if (!voteType || (voteType !== "upvote" && voteType !== "downvote")) {
      return NextResponse.json({ error: "Invalid vote type. Must be 'upvote' or 'downvote'" }, { status: 400 })
    }

    const schoolId = Number.parseInt(id)
    const school = schoolsStore.find((s) => s.id === schoolId)

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    // Initialize votes if they don't exist
    if (!school.votes) {
      school.votes = {
        upvotes: 0,
        downvotes: 0,
      }
    }

    // Update vote counts
    if (voteType === "upvote") {
      school.votes.upvotes += 1
    } else {
      school.votes.downvotes += 1
    }

    return NextResponse.json({
      success: true,
      votes: school.votes,
    })
  } catch (error) {
    console.error("[v0] Vote error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

