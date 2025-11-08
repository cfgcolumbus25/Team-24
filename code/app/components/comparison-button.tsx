"use client"

import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Scale } from "lucide-react"
import { cn } from "@/lib/utils"

// Inferface for the Comparison Button props
interface ComparisonButtonProps {
  favoriteCount: number
  onClick: () => void
  disabled?: boolean
}

// Comparison button component
export function ComparisonButton({ 
  favoriteCount, 
  onClick, 
  disabled = false 
}: ComparisonButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || favoriteCount === 0}
      className={cn(
        "relative",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Scale className="w-4 h-4 mr-2" />
      Compare Schools
      {favoriteCount > 0 && (
        <Badge 
          variant="default" 
          className="ml-2 h-5 min-w-[20px] px-1.5 flex items-center justify-center"
        >
          {favoriteCount}
        </Badge>
      )}
    </Button>
  )
}

