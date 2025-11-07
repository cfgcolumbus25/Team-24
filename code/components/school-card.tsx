"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
      className={cn("transition-all duration-200 hover:shadow-md cursor-pointer", isSelected && "ring-2 ring-primary")}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-snug mb-1">{school.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {school.city}, {school.state}
              </span>
              {school.distance !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-medium">{school.distance.toFixed(1)} mi</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs">
              {school.websiteUrl && (
                <a
                  href={school.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {school.votes && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {school.votes.upvotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="w-3 h-3" />
                    {school.votes.downvotes}
                  </span>
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
            className="shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
            <SchoolDetails school={school} selectedCourses={selectedCourses} />
          </div>
        )}
      </div>
    </Card>
  )
}
