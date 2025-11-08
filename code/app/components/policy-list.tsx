"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { Badge } from "@/app/components/ui/badge"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import type { SchoolPolicy } from "@/lib/types"
import { CLEP_EXAMS } from "@/lib/constants"

interface PolicyListProps {
  policies: SchoolPolicy[]
  isLoading: boolean
  onCreateNew: () => void
  onEdit: (policy: SchoolPolicy) => void
  onDelete: (policyId: number) => void
}

export function PolicyList({ policies, isLoading, onCreateNew, onEdit, onDelete }: PolicyListProps) {
  const getExamName = (examId: number) => {
    return CLEP_EXAMS.find((e) => e.id === examId)?.name || "Unknown Exam"
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>CLEP Credit Policies</CardTitle>
            <CardDescription>Manage your institution's credit policies</CardDescription>
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No policies created yet</p>
            <Button onClick={onCreateNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Policy
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-3">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground truncate">{getExamName(policy.examId)}</h4>
                        <Badge variant={policy.isUpdated ? "default" : "secondary"}>
                          {policy.isUpdated ? "Updated" : "Outdated"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {policy.courseCode} - {policy.courseName}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Min Score: {policy.minScore}</span>
                        <span>{policy.credits} Credits</span>
                        {policy.isGeneralCredit && (
                          <Badge variant="outline" className="text-xs">
                            General Credit
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(policy)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(policy.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
