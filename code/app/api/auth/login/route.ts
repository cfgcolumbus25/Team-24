import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        const username = email.split('@')[0]

        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || "Invalid credentials" },
                { status: response.status }
            )
        }

        //store session token in http-only cookie
        const cookieStore = await cookies()
        cookieStore.set('session_token', data.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, //24 hours
            path: '/',
        })

        return NextResponse.json({
            universityId: data.user.schoolId,
            universityName: data.user.schoolName || data.user.username,
            user: data.user,
        })
    } catch (error) {
        console.error("[Login] Error:", error)
        return NextResponse.json(
            { error: "Internal server error. Make sure backend is running on port 5001." },
            { status: 500 }
        )
    }
}