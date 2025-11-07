"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Plus, X } from "lucide-react"
import { CLEP_EXAMS } from "@/lib/constants"
import type { SelectedCourse } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface CourseFilterProps {
  selectedCourses: SelectedCourse[]
  onCoursesChange: (courses: SelectedCourse[]) => void
}

export function CourseFilter({ selectedCourses, onCoursesChange }: CourseFilterProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState<string>("")
  const [score, setScore] = useState("")

  const handleAddCourse = () => {
    if (selectedExamId && score) {
      const exam = CLEP_EXAMS.find((e) => e.id.toString() === selectedExamId)
      if (exam) {
        onCoursesChange([
          ...selectedCourses,
          {
            examId: exam.id,
            examName: exam.name,
            score: Number.parseInt(score),
          },
        ])
        setSelectedExamId("")
        setScore("")
        setShowAddForm(false)
      }
    }
  }

  const handleRemoveCourse = (examId: number) => {
    onCoursesChange(selectedCourses.filter((c) => c.examId !== examId))
  }

  const availableExams = CLEP_EXAMS.filter((exam) => !selectedCourses.some((c) => c.examId === exam.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Your CLEP Exams</h2>
        </div>
        {!showAddForm && availableExams.length > 0 && (
          <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Exam
          </Button>
        )}
      </div>

      {selectedCourses.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground">
          Add your CLEP exam scores to see which credits you qualify for at each institution.
        </p>
      )}

      {selectedCourses.map((course) => (
        <div
          key={course.examId}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
        >
          <div>
            <div className="font-medium text-sm text-foreground">{course.examName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Score: {course.score}</div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleRemoveCourse(course.examId)}
            className="h-7 w-7 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}

      {showAddForm && (
        <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
          <div>
            <Label htmlFor="examSelect" className="text-sm">
              CLEP Exam
            </Label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger id="examSelect" className="mt-1.5">
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {availableExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id.toString()}>
                    {exam.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {exam.category}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scoreInput" className="text-sm">
              Your Score (20-80)
            </Label>
            <Input
              id="scoreInput"
              type="number"
              placeholder="e.g., 65"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min={20}
              max={80}
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddCourse} disabled={!selectedExamId || !score} className="flex-1">
              Add Exam
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
