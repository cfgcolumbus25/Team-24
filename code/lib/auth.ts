// Client-side auth utilities

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("admin_token")
}

export function getUniversityInfo(): { id: string; name: string } | null {
  if (typeof window === "undefined") return null

  const id = localStorage.getItem("university_id")
  const name = localStorage.getItem("university_name")

  if (!id || !name) return null

  return { id, name }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("admin_token")
  localStorage.removeItem("university_name")
  localStorage.removeItem("university_id")
}

export async function verifyAuth(): Promise<boolean> {
  const token = getAuthToken()

  if (!token) return false

  try {
    const response = await fetch("/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch {
    return false
  }
}
