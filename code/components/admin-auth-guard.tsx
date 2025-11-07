"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { verifyAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await verifyAuth()

      if (!isAuthenticated) {
        router.push("/admin/login")
      } else {
        setIsVerifying(false)
      }
    }

    checkAuth()
  }, [router])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
