"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SchoolPolicy } from "@/lib/types"
import { CLEP_EXAMS } from "@/lib/constants"

interface PolicyEditorProps {
  policy: SchoolPolicy | null
  isCreating: boolean
  onSave: (policy: Partial<SchoolPolicy>) => void
  onCancel: () => void
}

export function PolicyEditor({ policy, isCreating, onSave, onCancel }: PolicyEditorProps) {
  const [formData, setFormData] = useState({
    examId: 0,
    minScore: 50,
    courseCode: "",
    courseName: "",
    credits: 3.0,
    isGeneralCredit: false,
    notes: "",
  })

  useEffect(() => {
    if (policy) {
      setFormData({
        examId: policy.examId,
        minScore: policy.minScore,
        courseCode: policy.courseCode,
        courseName: policy.courseName,
        credits: policy.credits,
        isGeneralCredit: policy.isGeneralCredit,
        notes: policy.notes || "",
      })
    } else if (isCreating) {
      setFormData({
        examId: 0,
        minScore: 50,
        courseCode: "",
        courseName: "",
        credits: 3.0,
        isGeneralCredit: false,
        notes: "",
      })
    }
  }, [policy, isCreating])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      isUpdated: true,
      updatedAt: new Date().toISOString().split("T")[0],
    })
  }

  const isActive = policy || isCreating
  const categoryGroups = CLEP_EXAMS.reduce(
    (acc, exam) => {
      if (!acc[exam.category]) acc[exam.category] = []
      acc[exam.category].push(exam)
      return acc
    },
    {} as Record<string, typeof CLEP_EXAMS>,
  )

  if (!isActive) {
    return (
      <Card className="h-[calc(100vh-12rem)]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p>Select a policy to edit or create a new one</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>{policy ? "Edit Policy" : "Create New Policy"}</CardTitle>
        <CardDescription>
          {policy ? "Update the CLEP credit policy details" : "Add a new CLEP credit policy"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="examId">CLEP Exam *</Label>
              <Select
                value={formData.examId.toString()}
                onValueChange={(value) => setFormData({ ...formData, examId: Number.parseInt(value) })}
              >
                <SelectTrigger id="examId">
                  <SelectValue placeholder="Select a CLEP exam" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryGroups).map(([category, exams]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{category}</div>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minScore">Minimum Score *</Label>
              <Input
                id="minScore"
                type="number"
                min="20"
                max="80"
                value={formData.minScore}
                onChange={(e) => setFormData({ ...formData, minScore: Number.parseInt(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">CLEP scores range from 20 to 80</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input
                  id="courseCode"
                  placeholder="BIO 101"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits *</Label>
                <Input
                  id="credits"
                  type="number"
                  step="0.5"
                  min="0"
                  max="12"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                placeholder="Introduction to Biology"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isGeneralCredit">General Education Credit</Label>
                <p className="text-xs text-muted-foreground">Credit applies to general education requirements</p>
              </div>
              <Switch
                id="isGeneralCredit"
                checked={formData.isGeneralCredit}
                onCheckedChange={(checked) => setFormData({ ...formData, isGeneralCredit: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about this policy..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={formData.examId === 0}>
                Save Policy
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
