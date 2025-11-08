import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001"

//login endpoint
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        //call backend login endpoint (backend accepts email in username field)
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: email,
                password: password,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json({ error: data.error || "Login failed" }, { status: response.status })
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
        console.error("Login error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

//logout endpoint
export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get("session_token")?.value

        if (sessionToken) {
            //call backend logout to invalidate session
            await fetch(`${BACKEND_URL}/api/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sessionToken}`,
                },
            })
        }

        //clear the cookie
        cookieStore.delete("session_token")

        return NextResponse.json({ message: "Logged out successfully" })
    } catch (error) {
        console.error("Logout error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
