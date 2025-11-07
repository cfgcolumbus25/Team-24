"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Info, AlertCircle, GraduationCap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { School, SelectedCourse } from "@/lib/types"
import { CLEP_EXAMS } from "@/lib/constants"

interface SchoolDetailsProps {
  school: School
  selectedCourses: SelectedCourse[]
}

export function SchoolDetails({ school, selectedCourses }: SchoolDetailsProps) {
  // If no courses selected, show ALL available courses for this school
  if (selectedCourses.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Available CLEP Credits ({school.policies.length})
        </h4>

        {school.policies.map((policy) => {
          const examName = CLEP_EXAMS.find((exam) => exam.id === policy.examId)?.name || "Unknown Exam"
          
          return (
            <div
              key={policy.id}
              className="p-3 rounded-lg border bg-card border-border hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-medium text-sm text-foreground">{examName}</div>
                    <Badge variant="secondary" className="shrink-0">
                      Min Score: {policy.minScore}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">{policy.courseCode}</span>: {policy.courseName}
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {policy.credits} Credits
                    </Badge>

                    {policy.isGeneralCredit && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                              <Info className="w-3 h-3" />
                              <span>General Credit</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Counts as general elective credit</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {policy.isUpdated && (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Updated {new Date(policy.updatedAt).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const matchedPolicies = selectedCourses.map((course) => {
    const policy = school.policies.find((p) => p.examId === course.examId)
    return {
      ...course,
      policy: policy || null,
      isAccepted: policy ? course.score >= policy.minScore : false,
    }
  })

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground mb-3">Credit Eligibility</h4>

      {matchedPolicies.map((item) => {
        const { policy, isAccepted } = item

        if (!policy) {
          return (
            <div key={item.examId} className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{item.examName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Not accepted at this institution</div>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div
            key={item.examId}
            className={`p-3 rounded-lg border ${
              isAccepted ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"
            }`}
          >
            <div className="flex items-start gap-2">
              {isAccepted ? (
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-medium text-sm text-foreground">{item.examName}</div>
                  <Badge variant={isAccepted ? "default" : "secondary"} className="shrink-0">
                    {item.score} / {policy.minScore}
                  </Badge>
                </div>

                {isAccepted && (
                  <>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{policy.courseCode}</span>: {policy.courseName}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {policy.credits} Credits
                      </Badge>

                      {policy.isGeneralCredit && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                                <Info className="w-3 h-3" />
                                <span>General Credit</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Counts as general elective credit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {policy.isUpdated && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Updated {new Date(policy.updatedAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </>
                )}

                {!isAccepted && (
                  <div className="text-xs text-muted-foreground mt-1">Minimum score required: {policy.minScore}</div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
