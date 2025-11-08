"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { BookOpen, Plus, X } from "lucide-react"
import { CLEP_EXAMS } from "@/lib/constants"
import type { SelectedCourse } from "@/lib/types"
import { Badge } from "@/app/components/ui/badge"

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
          {selectedCourses.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedCourses.length}
            </Badge>
          )}
        </div>
        {!showAddForm && availableExams.length > 0 && (
          <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            Add Exam
          </Button>
        )}
      </div>

      {selectedCourses.length === 0 && !showAddForm && (
        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">
            Add your CLEP exam scores to see which credits you qualify for at each institution.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {selectedCourses.map((course, index) => {
          const exam = CLEP_EXAMS.find((e) => e.id === course.examId)
          return (
            <div
              key={course.examId}
              className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200 group animate-in slide-in-from-top"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">{course.examName}</span>
                    {exam && (
                      <Badge variant="secondary" className="text-xs">
                        {exam.category}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="default" className="text-xs bg-primary">
                    Score: {course.score}
                  </Badge>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveCourse(course.examId)}
                className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {showAddForm && (
        <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-sm animate-in slide-in-from-top">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Plus className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Add New Exam Score</h3>
          </div>
          
          <div>
            <Label htmlFor="examSelect" className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              CLEP Exam
            </Label>
            <Select value={selectedExamId} onValueChange={setSelectedExamId}>
              <SelectTrigger id="examSelect" className="mt-1.5">
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {availableExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{exam.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {exam.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="scoreInput" className="text-sm font-medium text-foreground mb-2 flex items-center justify-between">
              <span>Your Score</span>
              <span className="text-xs text-muted-foreground font-normal">(Range: 20-80)</span>
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

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleAddCourse} 
              disabled={!selectedExamId || !score} 
              className="flex-1 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
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
