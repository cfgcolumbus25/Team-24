"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, ExternalLink, MapPin, ThumbsUp, ThumbsDown, Info } from "lucide-react"
import { SchoolDetails } from "./school-details"
import type { School, SelectedCourse } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SchoolCardProps {
  school: School
  selectedCourses: SelectedCourse[]
  isSelected: boolean
  onSelect: () => void
}

export function SchoolCard({ school, selectedCourses, isSelected, onSelect }: SchoolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [votes, setVotes] = useState(school.votes || { upvotes: 0, downvotes: 0 })
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  // Load user's previous vote from localStorage
  useEffect(() => {
    const savedVote = localStorage.getItem(`vote_${school.id}`)
    if (savedVote === "upvote" || savedVote === "downvote") {
      setUserVote(savedVote)
    }
  }, [school.id])

  // Update votes when school prop changes
  useEffect(() => {
    setVotes(school.votes || { upvotes: 0, downvotes: 0 })
  }, [school.votes])

  const handleVote = async (voteType: "upvote" | "downvote") => {
    setIsVoting(true)
    try {
      // If clicking the same button, remove the vote (unlike/undownvote)
      // If clicking different button, switch the vote
      const newVote = userVote === voteType ? null : voteType

      const response = await fetch(`/api/schools/${school.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          voteType,
          previousVote: userVote 
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit vote")
      }

      const data = await response.json()
      setVotes(data.votes)
      setUserVote(newVote)
      
      if (newVote) {
        localStorage.setItem(`vote_${school.id}`, newVote)
      } else {
        localStorage.removeItem(`vote_${school.id}`)
      }
    } catch (error) {
      console.error("Error submitting vote:", error)
    } finally {
      setIsVoting(false)
    }
  }

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
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
                    {school.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                        <Info 
                          className="w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-primary transition"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                          <p className="text-xs max-w-[180px]">
                            Reliability of cutoff scores. 
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-7 px-2 hover:bg-success/10",
                        userVote === "upvote" && "bg-success/20 text-success"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVote("upvote")
                      }}
                      disabled={isVoting}
                    >
                      <ThumbsUp className={cn(
                        "w-4 h-4",
                        userVote === "upvote" && "fill-current"
                      )} />
                      <span className="ml-1 text-xs font-medium">{votes.upvotes}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "h-7 px-2 hover:bg-destructive/10",
                        userVote === "downvote" && "bg-destructive/20 text-destructive"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVote("downvote")
                      }}
                      disabled={isVoting}
                    >
                      <ThumbsDown className={cn(
                        "w-4 h-4",
                        userVote === "downvote" && "fill-current"
                      )} />
                      <span className="ml-1 text-xs font-medium">{votes.downvotes}</span>
                    </Button>
                  </div>
                </div>
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
