"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, ExternalLink, MapPin, ThumbsUp, ThumbsDown } from "lucide-react"
import { SchoolDetails } from "./school-details"
import type { School, SelectedCourse } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SchoolCardProps {
  school: School
  selectedCourses: SelectedCourse[]
  isSelected: boolean
  onSelect: () => void
}

export function SchoolCard({ school, selectedCourses, isSelected, onSelect }: SchoolCardProps) {
  const [isExpanded, setIsExpanded] = useState(true) // Start expanded to show courses by default

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg cursor-pointer group border-border bg-gradient-to-br from-card to-card/50",
        isSelected && "ring-2 ring-primary shadow-lg border-primary/50"
      )}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                <span className="text-lg font-bold text-primary">
                  {school.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base leading-snug mb-1 group-hover:text-primary transition-colors">
                  {school.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {school.city}, {school.state}
                    </span>
                  </div>
                  {school.distance !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {school.distance.toFixed(1)} mi
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {school.policies.length} {school.policies.length === 1 ? 'Course' : 'Courses'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs mt-2">
              {school.websiteUrl && (
                <a
                  href={school.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {school.votes && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <ThumbsUp className="w-3 h-3 text-success" />
                    {school.votes.upvotes}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <ThumbsDown className="w-3 h-3 text-destructive" />
                    {school.votes.downvotes}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="shrink-0 hover:bg-primary/10"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top" onClick={(e) => e.stopPropagation()}>
            <SchoolDetails school={school} selectedCourses={selectedCourses} />
          </div>
        )}
      </div>
    </Card>
  )
}
