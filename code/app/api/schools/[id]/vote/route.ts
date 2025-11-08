import { type NextRequest, NextResponse } from "next/server"
import { schoolsStore } from "@/lib/schools-store"
import { updateSchoolVotes } from "@/lib/votes-storage"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Get the body of the request
    const body = await request.json()
    const { voteType } = body

    if (!voteType || (voteType !== "upvote" && voteType !== "downvote")) {
      return NextResponse.json({ error: "Invalid vote type. Must be 'upvote' or 'downvote'" }, { status: 400 })
    }

    const schoolId = Number.parseInt(id)
    
    // Verify school exists in mock-data.ts
    const school = schoolsStore.find((s) => s.id === schoolId)
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 })
    }

    // Get the user's previous vote from the request
    const { previousVote } = body

    // Update votes in JSON file so that it persists across server restarts
    const updatedVotes = await updateSchoolVotes(schoolId, (current) => {
      // If user is clicking the same button, remove the vote (unlike/undownvote)
      if (previousVote === voteType) {
        if (voteType === "upvote") {
          return { ...current, upvotes: Math.max(0, current.upvotes - 1) }
        } else {
          return { ...current, downvotes: Math.max(0, current.downvotes - 1) }
        }
      } else if (previousVote) {
        // User is switching votes: remove old vote, add new vote
        const newVotes = { ...current }
        if (previousVote === "upvote") {
          newVotes.upvotes = Math.max(0, newVotes.upvotes - 1)
        } else {
          newVotes.downvotes = Math.max(0, newVotes.downvotes - 1)
        }
        
        // Add the new vote
        if (voteType === "upvote") {
          newVotes.upvotes += 1
        } else {
          newVotes.downvotes += 1
        }
        return newVotes
      } else {
        // New vote
        if (voteType === "upvote") {
          return { ...current, upvotes: current.upvotes + 1 }
        } else {
          return { ...current, downvotes: current.downvotes + 1 }
        }
      }
    })

    return NextResponse.json({
      success: true,
      votes: updatedVotes,
    })
  } catch (error) {
    console.error("[v0] Vote error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

