"use client"

import { Button } from "@/app/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"
import { X, MapPin, ExternalLink, ThumbsUp, ThumbsDown, Trash2 } from "lucide-react"
import type { School } from "@/lib/types"
import { CLEP_EXAMS } from "@/lib/constants"
import { cn } from "@/lib/utils"

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
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Schools</DialogTitle>
          <DialogDescription>
            Side-by-side comparison of {schools.length} {schools.length === 1 ? "school" : "schools"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <div className="text-sm text-muted-foreground">
              {schools.length} {schools.length === 1 ? "school" : "schools"} selected
            </div>
          </div>

          {/* Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] sticky left-0 bg-background z-10">
                    <div className="font-semibold">Comparison</div>
                  </TableHead>
                  {schools.map((school) => (
                    <TableHead key={school.id} className="min-w-[250px]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{school.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {school.city}, {school.state}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => onRemoveSchool(school.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Basic Info Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    Location
                  </TableCell>
                  {schools.map((school) => (
                    <TableCell key={school.id}>
                      <div className="text-sm">
                        <div>{school.address}</div>
                        <div className="text-muted-foreground">
                          {school.city}, {school.state} {school.zip}
                        </div>
                        {school.distance !== undefined && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {school.distance.toFixed(1)} mi
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Website Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    Website
                  </TableCell>
                  {schools.map((school) => (
                    <TableCell key={school.id}>
                      {school.websiteUrl ? (
                        <a
                          href={school.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Votes Row */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    Community Rating
                  </TableCell>
                  {schools.map((school) => (
                    <TableCell key={school.id}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-success">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {school.votes?.upvotes || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-destructive">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {school.votes?.downvotes || 0}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* Policies Section */}
                {sortedExamIds.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell
                        colSpan={schools.length + 1}
                        className="bg-muted/50 font-semibold"
                      >
                        CLEP Exam Policies
                      </TableCell>
                    </TableRow>
                    {sortedExamIds.map((examId) => (
                      <TableRow key={examId}>
                        <TableCell className="font-medium sticky left-0 bg-background z-10">
                          {getExamName(examId)}
                        </TableCell>
                        {schools.map((school) => {
                          const policy = getPolicy(school, examId)
                          return (
                            <TableCell key={school.id}>
                              {policy ? (
                                <div className="space-y-1 text-sm">
                                  <div>
                                    <Badge variant="outline" className="text-xs">
                                      Min Score: {policy.minScore}
                                    </Badge>
                                  </div>
                                  <div className="text-muted-foreground">
                                    {policy.courseCode} - {policy.courseName}
                                  </div>
                                  <div className="text-xs">
                                    <Badge variant="secondary" className="text-xs">
                                      {policy.credits} {policy.credits === 1 ? "credit" : "credits"}
                                    </Badge>
                                    {policy.isGeneralCredit && (
                                      <Badge variant="outline" className="ml-1 text-xs">
                                        General
                                      </Badge>
                                    )}
                                  </div>
                                  {policy.notes && (
                                    <div className="text-xs text-muted-foreground italic">
                                      {policy.notes}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not accepted</span>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </>
                )}

                {/* Total Policies Count */}
                <TableRow>
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    Total Policies
                  </TableCell>
                  {schools.map((school) => (
                    <TableCell key={school.id}>
                      <Badge variant="outline" className="text-sm">
                        {school.policies.length} {school.policies.length === 1 ? "policy" : "policies"}
                      </Badge>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

