import { type NextRequest, NextResponse } from "next/server"

// Mock university database - in production, use a real database
const MOCK_UNIVERSITIES = [
  {
    id: 1,
    name: "George Mason University",
    email: "admin@gmu.edu",
    password: "password123", // In production, use hashed passwords
  },
  {
    id: 2,
    name: "Virginia Tech",
    email: "admin@vt.edu",
    password: "password123",
  },
  {
    id: 3,
    name: "Demo University",
    email: "admin@example.edu",
    password: "password123",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find university by email
    const university = MOCK_UNIVERSITIES.find((u) => u.email === email)

    if (!university || university.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate a simple token (in production, use JWT or session management)
    const token = Buffer.from(`${university.id}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      universityId: university.id,
      universityName: university.name,
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
