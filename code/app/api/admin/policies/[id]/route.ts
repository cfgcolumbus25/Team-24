import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

//update policy
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { examId, minScore, courseCode, courseName, credits, isGeneralCredit, notes } = body

        //get session token for authentication
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('session_token')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        //update policy in backend
        const response = await fetch(`${BACKEND_URL}/api/admin/policies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                examId,
                minScore,
                courseCode,
                courseName,
                credits,
                isGeneralCredit: isGeneralCredit || false,
                notes
            })
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json({ error: data.error || "Failed to update policy" }, { status: response.status })
        }

        return NextResponse.json({ policy: data.policy })
    } catch (error) {
        console.error("Update policy error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

//delete policy
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        //get session token for authentication
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('session_token')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        //delete policy in backend
        const response = await fetch(`${BACKEND_URL}/api/admin/policies/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        })

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to delete policy" }, { status: response.status })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete policy error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}