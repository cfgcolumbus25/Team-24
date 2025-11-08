"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Badge } from "@/app/components/ui/badge"
import { X, MapPin, ExternalLink, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react"
import type { School } from "@/lib/types"
import { CLEP_EXAMS } from "@/lib/constants"

interface SchoolComparisonProps {
  schools: School[]
  isOpen: boolean
  onClose: () => void
  onRemoveSchool: (schoolId: number) => void
  onClearAll: () => void
}

// School comparison component
export function SchoolComparison({
  schools,
  isOpen,
  onClose,
  onRemoveSchool,
  onClearAll,
}: SchoolComparisonProps) {
  if (schools.length === 0) {
    return null
  }

  // Get all unique exam IDs from all schools' policies
  const allExamIds = new Set<number>()
  schools.forEach((school) => {
    school.policies.forEach((policy) => {
      allExamIds.add(policy.examId)
    })
  })
  const sortedExamIds = Array.from(allExamIds).sort()

  // Helper to get exam name
  const getExamName = (examId: number) => {
    return CLEP_EXAMS.find((exam) => exam.id === examId)?.name || `Exam ${examId}`
  }

  // Helper to get policy for a school and exam
  const getPolicy = (school: School, examId: number) => {
    return school.policies.find((p) => p.examId === examId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[98vw] w-full max-h-[90vh] overflow-y-auto !z-[9999]">
        <DialogHeader>
          <DialogTitle>Compare Schools</DialogTitle>
          <DialogDescription>
            {schools.length === 1
              ? "Review the details for your selected school."
              : `Side-by-side comparison of ${schools.length} schools.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-base font-medium">Selected Schools</p>
              <p className="text-sm text-muted-foreground">
                Review school details, community feedback, and CLEP credit policies without losing the big picture.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
              <span className="text-sm text-muted-foreground">
                {schools.length} {schools.length === 1 ? "school selected" : "schools selected"}
              </span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {schools.map((school) => (
              <Card
                key={school.id}
                className="group relative h-full overflow-hidden shadow-sm transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg leading-tight">{school.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {school.city}, {school.state}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveSchool(school.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <div>
                      <p>{school.address}</p>
                      <p>
                        {school.city}, {school.state} {school.zip}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {school.distance !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {school.distance.toFixed(1)} mi away
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {school.policies.length} {school.policies.length === 1 ? "policy" : "policies"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {school.websiteUrl ? (
                      <a
                        href={school.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Website unavailable</span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-success">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-medium">{school.votes?.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-destructive">
                        <ThumbsDown className="h-4 w-4" />
                        <span className="font-medium">{school.votes?.downvotes || 0}</span>
                      </div>
                    </div>
                  </div>

                  {sortedExamIds.length > 0 && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">CLEP Policies</p>
                        <p className="text-xs text-muted-foreground">
                          Quickly scan minimum scores, course equivalents, credits, and school-specific notes.
                        </p>
                      </div>
                      <div className="space-y-3">
                        {sortedExamIds.map((examId) => {
                          const policy = getPolicy(school, examId)
                          const examName = getExamName(examId)

                          return (
                            <div
                              key={`${school.id}-${examId}`}
                              className="rounded-lg border border-border/60 bg-card/80 p-4 shadow-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{examName}</p>
                                  {policy ? (
                                    <p className="text-xs text-muted-foreground">
                                      {policy.courseCode} – {policy.courseName}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">Not accepted</p>
                                  )}
                                </div>
                                <div>
                                  {policy ? (
                                    <Badge variant="outline" className="text-xs">
                                      Min Score: {policy.minScore}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs opacity-60">
                                      —
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {policy && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                  <Badge variant="secondary" className="text-xs">
                                    {policy.credits} {policy.credits === 1 ? "credit" : "credits"}
                                  </Badge>
                                  {policy.isGeneralCredit && (
                                    <Badge variant="outline" className="text-[10px] uppercase">
                                      General
                                    </Badge>
                                  )}
                                  {policy.notes && (
                                    <span className="text-muted-foreground italic">{policy.notes}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

