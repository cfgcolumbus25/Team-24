import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

//register endpoint
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, email, password } = body

        //call backend register endpoint
        const response = await fetch(`${BACKEND_URL}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json({ error: data.error || "Registration failed" }, { status: response.status })
        }

        //create response with user data
        const frontendResponse = NextResponse.json({
            message: data.message,
            user: data.user,
        })

        //store session token in http-only cookie
        const cookieStore = await cookies()
        cookieStore.set("session_token", data.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24, //24 hours
            path: "/",
        })

        return frontendResponse
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}