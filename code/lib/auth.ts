// Client-side auth utilities

/*Retrieves stored login token*/
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("admin_token")
}

/*Gets logged University info*/
export function getUniversityInfo(): { id: string; name: string } | null {
  if (typeof window === "undefined") return null

  const id = localStorage.getItem("university_id")
  const name = localStorage.getItem("university_name")

  if (!id || !name) return null

  return { id, name }
}

/*Clears the auth token*/
export function clearAuth(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("admin_token")
  localStorage.removeItem("university_name")
  localStorage.removeItem("university_id")
}


/*Checks if user is still logged in*/
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
