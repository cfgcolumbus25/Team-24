"use client"
import {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { getUniversityInfo, clearAuth } from "@/lib/auth"
import { AdminHeader } from "./admin-header"
import { PolicyList } from "./policy-list"
import { PolicyEditor } from "./policy-editor"
import type { SchoolPolicy } from "@/lib/types"

export function AdminDashboard() {
    const router = useRouter()
    const [universityInfo, setUniversityInfo] = useState<{ id: string; name: string } | null>(null)
    const [policies, setPolicies] = useState<SchoolPolicy[]>([])
    const [editingPolicy, setEditingPolicy] = useState<SchoolPolicy | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const info = await getUniversityInfo()
            if (!info) {
                router.push("/admin/login")
                return
            }
            setUniversityInfo(info)
            loadPolicies(info.id)
        }
        checkAuth()
    }, [router])

    const loadPolicies = async (universityId: string) => {
        try {
            const response = await fetch(`/api/admin/policies?universityId=${universityId}`)
            if (response.ok) {
                const data = await response.json()
                setPolicies(data.policies)
            }
        } catch (error) {
            console.error("Failed to load policies:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        await clearAuth()
        router.push("/admin/login")
    }

    const handleCreateNew = () => {
        setIsCreating(true)
        setEditingPolicy(null)
    }

    const handleEdit = (policy: SchoolPolicy) => {
        setEditingPolicy(policy)
        setIsCreating(false)
    }

    const handleSave = async (policy: Partial<SchoolPolicy>) => {
        if (!universityInfo) return

        try {
            const url = editingPolicy ? `/api/admin/policies/${editingPolicy.id}` : `/api/admin/policies`

            const response = await fetch(url, {
                method: editingPolicy ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...policy,
                    universityId: universityInfo.id,
                }),
            })

            if (response.ok) {
                await loadPolicies(universityInfo.id)
                setEditingPolicy(null)
                setIsCreating(false)
            }
        } catch (error) {
            console.error("Failed to save policy:", error)
        }
    }

    const handleDelete = async (policyId: number) => {
        if (!universityInfo) return

        if (!confirm("Are you sure you want to delete this policy?")) return

        try {
            const response = await fetch(`/api/admin/policies/${policyId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                await loadPolicies(universityInfo.id)
            }
        } catch (error) {
            console.error("Failed to delete policy:", error)
        }
    }

    const handleCancel = () => {
        setEditingPolicy(null)
        setIsCreating(false)
    }

    if (!universityInfo) return null

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <AdminHeader universityName={universityInfo.name} onLogout={handleLogout} />

            <div className="flex-1 container mx-auto p-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PolicyList
                        policies={policies}
                        isLoading={isLoading}
                        onCreateNew={handleCreateNew}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    <PolicyEditor policy={editingPolicy} isCreating={isCreating} onSave={handleSave} onCancel={handleCancel} />
                </div>
            </div>
        </div>
    )
}