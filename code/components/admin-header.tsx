"use client"

import { Button } from "@/components/ui/button"
import { GraduationCap, LogOut } from "lucide-react"

interface AdminHeaderProps {
  universityName: string
  onLogout: () => void
}

export function AdminHeader({ universityName, onLogout }: AdminHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{universityName}</p>
          </div>
        </div>

        <Button variant="outline" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}
