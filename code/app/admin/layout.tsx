import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - CLEP PathFinder",
  description: "University admin dashboard for managing CLEP credit policies",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
