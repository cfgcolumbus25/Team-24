import { GraduationCap, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">CLEP PathFinder</h1>
              <p className="text-sm text-muted-foreground">Find colleges that accept your CLEP credits</p>
            </div>
          </div>

          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              University Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
