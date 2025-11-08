
export interface UniversityInfo {
    id: string
    name: string
}

export async function getUniversityInfo(): Promise<UniversityInfo | null> {
    try {
        const response = await fetch('/api/auth/session')

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        if (!data.authenticated) {
            return null
        }

        return {
            id: data.user.id.toString(),
            name: data.user.username,
        }
    } catch (error) {
        console.error('Failed to get university info:', error)
        return null
    }
}

export async function clearAuth(): Promise<void> {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
        })
    } catch (error) {
        console.error('Failed to clear auth:', error)
    }
}

export async function isAuthenticated(): Promise<boolean> {
    const info = await getUniversityInfo()
    return info !== null
}

export async function verifyAuth(): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/session')

        if (!response.ok) {
            return false
        }

        const data = await response.json()
        return data.authenticated === true
    } catch (error) {
        console.error('Failed to verify auth:', error)
        return false
    }
}