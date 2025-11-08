import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

//handle voting on schools
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { voteType, previousVote } = body

        if (!voteType || (voteType !== "upvote" && voteType !== "downvote")) {
            return NextResponse.json({ error: "Invalid vote type. Must be 'upvote' or 'downvote'" }, { status: 400 })
        }

        //call backend vote endpoint
        const response = await fetch(`${BACKEND_URL}/api/schools/${id}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voteType,
                previousVote,
                userIp: request.ip || 'unknown' //get user ip for tracking
            })
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json({ error: data.error || "Failed to process vote" }, { status: response.status })
        }

        return NextResponse.json({
            success: true,
            votes: data.votes
        })
    } catch (error) {
        console.error("Vote error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}