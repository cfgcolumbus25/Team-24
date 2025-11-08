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
      <div className="space-y-3 animate-in fade-in duration-300">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" />
          Available CLEP Credits ({school.policies.length})
        </h4>

        {school.policies.map((policy, index) => {
          const examName = CLEP_EXAMS.find((exam) => exam.id === policy.examId)?.name || "Unknown Exam"
          const examCategory = CLEP_EXAMS.find((exam) => exam.id === policy.examId)?.category || "General"
          
          return (
            <div
              key={policy.id}
              className="p-3.5 rounded-lg border bg-gradient-to-br from-card to-card/50 border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group animate-in slide-in-from-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-sm text-foreground mb-0.5">{examName}</div>
                      <Badge variant="secondary" className="text-xs">
                        {examCategory}
                      </Badge>
                    </div>
                    <Badge variant="default" className="shrink-0 bg-primary hover:bg-primary/90">
                      Min: {policy.minScore}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2 mb-2.5 line-clamp-1">
                    <span className="font-semibold text-foreground">{policy.courseCode}</span> • {policy.courseName}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-xs font-medium bg-accent/5">
                      {policy.credits} {policy.credits === 1 ? 'Credit' : 'Credits'}
                    </Badge>

                    {policy.isGeneralCredit && (
                      <TooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="text-xs cursor-help hover:bg-primary/10 transition-colors">
                              <Info className="w-3 h-3 mr-1 text-primary" />
                              General Credit
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-xs font-semibold mb-1">General Elective Credit</p>
                            <p className="text-xs text-muted-foreground">
                              This credit counts as a general elective and may not fulfill specific degree requirements. 
                              Verify with your academic advisor how this applies to your program.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {policy.isUpdated && (
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Updated {new Date(policy.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </Badge>
                    )}
                    
                    {!policy.isUpdated && (
                      <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-warning/20">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Verify Policy
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
    <div className="space-y-3 animate-in fade-in duration-300">
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-primary" />
        Credit Eligibility for Your Scores
      </h4>

      {matchedPolicies.map((item, index) => {
        const { policy, isAccepted } = item

        if (!policy) {
          return (
            <div 
              key={item.examId} 
              className="p-3.5 rounded-lg bg-muted/30 border border-border animate-in slide-in-from-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground mb-1">{item.examName}</div>
                  <div className="text-xs text-muted-foreground">Not accepted at this institution</div>
                </div>
              </div>
            </div>
          )
        }

        return (
          <div
            key={item.examId}
            className={`p-3.5 rounded-lg border transition-all duration-200 hover:shadow-md group animate-in slide-in-from-left ${
              isAccepted 
                ? "bg-gradient-to-br from-success/5 to-success/10 border-success/30 hover:border-success/50" 
                : "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30 hover:border-destructive/50"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                isAccepted ? "bg-success/20" : "bg-destructive/20"
              }`}>
                {isAccepted ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-sm text-foreground">{item.examName}</div>
                  <Badge 
                    variant={isAccepted ? "default" : "secondary"} 
                    className={`shrink-0 font-semibold ${
                      isAccepted 
                        ? "bg-success hover:bg-success/90 text-white" 
                        : "bg-destructive/20 text-destructive border-destructive/30"
                    }`}
                  >
                    {item.score} / {policy.minScore}
                  </Badge>
                </div>

                {isAccepted && (
                  <>
                    <div className="text-xs text-muted-foreground mt-1 mb-2.5">
                      <span className="font-semibold text-foreground">{policy.courseCode}</span> • {policy.courseName}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-xs font-medium bg-accent/5">
                        {policy.credits} {policy.credits === 1 ? 'Credit' : 'Credits'}
                      </Badge>

                      {policy.isGeneralCredit && (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-help hover:bg-primary/10 transition-colors">
                                <Info className="w-3 h-3 mr-1 text-primary" />
                                General Credit
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs font-semibold mb-1">General Elective Credit</p>
                              <p className="text-xs text-muted-foreground">
                                This credit counts as a general elective and may not fulfill specific degree requirements. 
                                Verify with your academic advisor how this applies to your program.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {policy.isUpdated && (
                        <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Updated {new Date(policy.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Badge>
                      )}
                    </div>
                  </>
                )}

                {!isAccepted && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Need {policy.minScore - item.score} more points to qualify
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
