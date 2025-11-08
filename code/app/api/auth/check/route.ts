import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

//check authentication status
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('session_token')?.value

        if (!sessionToken) {
            return NextResponse.json({ authenticated: false })
        }

        //verify with backend
        const response = await fetch(`${BACKEND_URL}/api/profile`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        })

        if (!response.ok) {
            return NextResponse.json({ authenticated: false })
        }

        const data = await response.json()

        return NextResponse.json({
            authenticated: true,
            user: data.user
        })
    } catch (error) {
        console.error("Auth check error:", error)
        return NextResponse.json({ authenticated: false })
    }
}