import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

// Regex to validate .edu email addresses
const EDU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, email, password } = body

        // Validation
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "Username, email, and password are required" },
                { status: 400 }
            )
        }

        if (username.length < 3) {
            return NextResponse.json(
                { error: "Username must be at least 3 characters long" },
                { status: 400 }
            )
        }

        // Validate .edu email
        if (!EDU_EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { error: "Please use a valid .edu email address" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            )
        }

        // Call backend register endpoint
        const response = await fetch(`${BACKEND_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error || "Registration failed" },
                { status: response.status }
            )
        }

        // Store session token in HTTP-only cookie
        const cookieStore = await cookies()
        cookieStore.set('session_token', data.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        })

        return NextResponse.json({
            message: "Registration successful",
            universityId: data.user.id,
            universityName: data.user.username,
            user: data.user,
        })
    } catch (error) {
        console.error("[Register] Error:", error)
        return NextResponse.json(
            { error: "Internal server error. Make sure backend is running on port 5001." },
            { status: 500 }
        )
    }
}