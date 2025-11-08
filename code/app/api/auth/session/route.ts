import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('session_token')?.value

        if (!sessionToken) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        // Verify session with backend
        const response = await fetch(`${BACKEND_URL}/api/profile`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
            },
        })

        if (!response.ok) {
            cookieStore.delete('session_token')
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        const data = await response.json()

        return NextResponse.json({
            authenticated: true,
            user: data.user,
        })
    } catch (error) {
        console.error("[Session] Error:", error)
        return NextResponse.json({ authenticated: false }, { status: 500 })
    }
}