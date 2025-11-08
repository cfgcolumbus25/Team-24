import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

//get policies for a university
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const universityId = searchParams.get("universityId")

        if (!universityId) {
            return NextResponse.json({ error: "University ID is required" }, { status: 400 })
        }

        //fetch school from backend
        const response = await fetch(`${BACKEND_URL}/api/schools/${universityId}`)

        if (!response.ok) {
            return NextResponse.json({ error: "University not found" }, { status: 404 })
        }

        const data = await response.json()

        return NextResponse.json({ policies: data.school.policies })
    } catch (error) {
        console.error("Get policies error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

//create new policy
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { universityId, examId, minScore, courseCode, courseName, credits, isGeneralCredit, notes } = body

        if (!universityId || !examId || !minScore || !courseCode || !courseName || credits === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        //get session token for authentication
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('session_token')?.value

        if (!sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        //create policy in backend
        const response = await fetch(`${BACKEND_URL}/api/admin/policies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                schoolId: universityId,
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
            return NextResponse.json({ error: data.error || "Failed to create policy" }, { status: response.status })
        }

        return NextResponse.json({ policy: data.policy })
    } catch (error) {
        console.error("Create policy error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}