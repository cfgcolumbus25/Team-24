"use client"
import { SchoolCard } from "./school-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { ArrowUpDown, Building2, Loader2 } from "lucide-react"
import type { School, SelectedCourse, SortOption } from "@/lib/types"

interface SchoolListProps {
  schools: School[]
  selectedCourses: SelectedCourse[]
  sortBy: SortOption
  onSortChange: (option: SortOption) => void
  selectedSchoolId: number | null
  onSchoolSelect: (id: number | null) => void
  isLoading?: boolean
  favoritedSchoolIds?: Set<number>
  onFavoriteToggle?: (schoolId: number, isFavorited: boolean) => void
}

export function SchoolList({
  schools,
  selectedCourses,
  sortBy,
  onSortChange,
  selectedSchoolId,
  onSchoolSelect,
  isLoading = false,
  favoritedSchoolIds,
  onFavoriteToggle,
}: SchoolListProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {schools.length} {schools.length === 1 ? "School" : "Schools"} Found
          </span>
        </div>

        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[160px] h-9">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Sort by Distance</SelectItem>
            <SelectItem value="alphabetical">Sort by Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading schools...</p>
          </div>
        ) : schools.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">Enter a location to find schools that accept CLEP credits</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {schools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                selectedCourses={selectedCourses}
                isSelected={selectedSchoolId === school.id}
                onSelect={() => onSchoolSelect(school.id)}
                isFavorited={favoritedSchoolIds?.has(school.id) ?? false}
                onFavoriteToggle={onFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
