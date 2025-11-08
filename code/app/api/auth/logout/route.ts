import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('session_token')?.value

        if (sessionToken) {
            // Call backend to delete session from database
            await fetch(`${BACKEND_URL}/api/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                },
            })
        }

        cookieStore.delete('session_token')

        return NextResponse.json({ message: 'Logged out successfully' })
    } catch (error) {
        console.error("[Logout] Error:", error)
        return NextResponse.json(
            { error: "Logout failed" },
            { status: 500 }
        )
    }
}