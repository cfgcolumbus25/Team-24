import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Simple token validation (in production, use proper JWT verification)
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [universityId] = decoded.split(":")

      if (!universityId) {
        throw new Error("Invalid token")
      }

      return NextResponse.json({
        valid: true,
        universityId: Number.parseInt(universityId),
      })
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
