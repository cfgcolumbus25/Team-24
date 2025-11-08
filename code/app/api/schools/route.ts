import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

//get schools from database via express backend
export async function GET(request: NextRequest) {
    try {
        //get search parameters from request
        const searchParams = request.nextUrl.searchParams
        const state = searchParams.get("state")
        const city = searchParams.get("city")
        const examId = searchParams.get("examId")

        //build query string for backend
        const params = new URLSearchParams()
        if (state) params.append('state', state)
        if (city) params.append('city', city)
        if (examId) params.append('examId', examId)

        //call express backend
        const backendUrl = `${BACKEND_URL}/api/schools${params.toString() ? `?${params.toString()}` : ''}`
        const response = await fetch(backendUrl)

        //handle backend errors
        if (!response.ok) {
            throw new Error('Failed to fetch schools from backend')
        }

        //get data from backend
        const data = await response.json()

        //return schools data
        return NextResponse.json({ schools: data.schools })
    } catch (error) {
        console.error("Schools API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}