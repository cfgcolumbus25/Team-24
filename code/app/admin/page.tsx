import { AdminAuthGuard } from "@/app/components/admin-auth-guard"
import { AdminDashboard } from "@/app/components/admin-dashboard"

export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <AdminDashboard />
    </AdminAuthGuard>
  )
}
