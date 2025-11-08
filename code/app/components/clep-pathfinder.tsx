"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "./header"
import { LocationFilter } from "./location-filter"
import { CourseFilter } from "./course-filter"
import { SchoolList } from "./school-list"
import { MapContainer } from "./map-container"
import { ComparisonButton } from "./comparison-button"
import { SchoolComparison } from "./school-comparison"
import type { School, SelectedCourse, LocationType, SortOption } from "@/lib/types"
import { calculateDistance } from "@/lib/distance"

export function CLEPPathFinder() {
  const [locationType, setLocationType] = useState<LocationType>("zip")
  const [location, setLocation] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("distance")
  const [allSchools, setAllSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [centerCoords, setCenterCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null)
  const [isLoadingSchools, setIsLoadingSchools] = useState(false)
  const [favoritedSchools, setFavoritedSchools] = useState<Set<number>>(new Set())
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)


  const fetchSchools = async (filterState?: string) => {
    setIsLoadingSchools(true)
    try {
      const params = new URLSearchParams()
      if (filterState) {
        params.append("state", filterState)
      }

      const response = await fetch(`/api/schools?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        return data.schools
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error)
    } finally {
      setIsLoadingSchools(false)
    }
    return []
  }

  const handleLocationChange = async (type: LocationType, value: string) => {
    setLocationType(type)
    setLocation(value)

    if (type === "zip" && value.length === 5) {
      const zipCoords = getApproxCoordsFromZip(value)

      if (zipCoords) {
        setCenterCoords(zipCoords)

        const schools = await fetchSchools()
        const schoolsWithDistance = schools
          .map((school: School) => ({
            ...school,
            distance: calculateDistance(zipCoords.lat, zipCoords.lng, school.latitude, school.longitude),
          }))
          .filter((school: School) => (school.distance ?? 0) <= 50)

        setAllSchools(schoolsWithDistance)
      }
    } else if (type === "state" && value.length === 2) {
      const schools = await fetchSchools(value)
      setAllSchools(schools)

      if (schools.length > 0) {
        const avgLat = schools.reduce((sum: number, s: School) => sum + s.latitude, 0) / schools.length
        const avgLng = schools.reduce((sum: number, s: School) => sum + s.longitude, 0) / schools.length
        setCenterCoords({ lat: avgLat, lng: avgLng })
      }
    } else {
      // Clear schools when location is cleared
      setAllSchools([])
      setFilteredSchools([])
      setCenterCoords(null)
    }
  }

  // Filter schools based on selected courses and scores
  const filterSchoolsByCourses = useMemo(() => {
    return (schools: School[]): School[] => {
      if (selectedCourses.length === 0) {
        return schools
      }

      return schools.filter((school) => {
        // Check if school accepts at least one of the selected courses with the user's score
        return selectedCourses.some((course) => {
          const policy = school.policies.find((p) => p.examId === course.examId)
          if (!policy) return false

          // If no score provided, just check if school accepts the exam
          if (course.score === undefined) {
            return true
          }

          // If score provided, check if it meets the minimum requirement
          return course.score >= policy.minScore

        })
      })
    }
  }, [selectedCourses])

  // Apply course filtering whenever allSchools or selectedCourses change
  useEffect(() => {
    const filtered = filterSchoolsByCourses(allSchools)
    setFilteredSchools(sortSchools(filtered, sortBy))
  }, [allSchools, filterSchoolsByCourses, sortBy])

  // Load favorited schools from localStorage on mount and when schools change
  useEffect(() => {
    const favorites = new Set<number>()
    allSchools.forEach((school) => {
      const savedFavorite = localStorage.getItem(`favorite_${school.id}`)
      if (savedFavorite === "true") {
        favorites.add(school.id)
      }
    })
    setFavoritedSchools((prev) => {
      // Check if the Sets are equal
      if (prev.size === favorites.size &&
        Array.from(prev).every(id => favorites.has(id))) {
        return prev
      }
      return favorites
    })
  }, [allSchools])

  // Remove favorited schools that don't match course filter when courses are added/changed
  // Course filter takes priority over favoriting
  useEffect(() => {
    if (selectedCourses.length === 0) {
      return // No filtering when no courses selected
    }

    setFavoritedSchools((prev) => {
      const updated = new Set<number>()
      let hasChanges = false

      prev.forEach((schoolId) => {
        const school = allSchools.find((s) => s.id === schoolId)
        if (!school) {
          // School not in current list, remove it
          hasChanges = true
          localStorage.removeItem(`favorite_${schoolId}`)
          return
        }

        // Check if school accepts at least one of the selected courses with the user's score
        const matchesFilter = selectedCourses.some((course) => {
          const policy = school.policies.find((p) => p.examId === course.examId)
          if (!policy) return false

          // If no score provided, just check if school accepts the exam
          if (course.score === undefined) {
            return true
          }
          return policy && course.score >= policy.minScore
        })

        if (matchesFilter) {
          // School matches filter, keep it favorited
          updated.add(schoolId)
        } else {
          // School doesn't match filter, remove from favorites
          hasChanges = true
          localStorage.removeItem(`favorite_${schoolId}`)
        }
      })

      return hasChanges ? updated : prev
    })
  }, [selectedCourses, allSchools])

  const getApproxCoordsFromZip = (zip: string): { lat: number; lng: number } | null => {
    const firstDigit = Number.parseInt(zip[0])
    // Rough approximation of US regions by ZIP code prefix
    const regionMap: Record<number, { lat: number; lng: number }> = {
      0: { lat: 42.3601, lng: -71.0589 }, // Northeast
      1: { lat: 40.7128, lng: -74.006 }, // NY area
      2: { lat: 38.9072, lng: -77.0369 }, // DC area
      3: { lat: 33.749, lng: -84.388 }, // Southeast
      4: { lat: 30.2672, lng: -97.7431 }, // South
      5: { lat: 41.8781, lng: -87.6298 }, // Midwest
      6: { lat: 39.7392, lng: -104.9903 }, // Central
      7: { lat: 32.7767, lng: -96.797 }, // South Central
      8: { lat: 39.5501, lng: -105.7821 }, // Mountain
      9: { lat: 37.7749, lng: -122.4194 }, // West Coast
    }
    return regionMap[firstDigit] || { lat: 39.8283, lng: -98.5795 } // US center
  }

  const sortSchools = (schools: School[], sortOption: SortOption): School[] => {
    const sorted = [...schools]
    if (sortOption === "distance") {
      sorted.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    return sorted
  }

  const handleSortChange = (option: SortOption) => {
    setSortBy(option)
  }

  const handleFavoriteToggle = (schoolId: number, isFavorited: boolean) => {
    setFavoritedSchools((prev) => {
      const newSet = new Set(prev)
      if (isFavorited) {
        newSet.add(schoolId)
      } else {
        newSet.delete(schoolId)
      }
      return newSet
    })
  }

  // Get favorited schools as an array
  const favoritedSchoolsArray = useMemo(() => {
    return allSchools.filter((school) => favoritedSchools.has(school.id))
  }, [allSchools, favoritedSchools])

  // Handlers for comparison dialog
  const handleOpenComparison = () => {
    setIsComparisonOpen(true)
  }

  const handleCloseComparison = () => {
    setIsComparisonOpen(false)
  }

  const handleRemoveFromComparison = (schoolId: number) => {
    // Remove from favorites
    setFavoritedSchools((prev) => {
      const newSet = new Set(prev)
      newSet.delete(schoolId)
      return newSet
    })
    // Remove from localStorage
    localStorage.removeItem(`favorite_${schoolId}`)
  }

  const handleClearAllFavorites = () => {
    // Clear all favorites
    favoritedSchools.forEach((schoolId) => {
      localStorage.removeItem(`favorite_${schoolId}`)
    })
    setFavoritedSchools(new Set())
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Filters and School List */}
        <div className="w-full lg:w-2/5 border-r border-border flex flex-col">
          <div className="lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <div className="p-6 border-b border-border bg-card">
              <LocationFilter locationType={locationType} location={location} onLocationChange={handleLocationChange} />
            </div>

            <div className="p-6 border-b border-border bg-card">
              <CourseFilter selectedCourses={selectedCourses} onCoursesChange={setSelectedCourses} />
              <div className="flex justify-end mt-4">
                <ComparisonButton
                  favoriteCount={favoritedSchools.size}
                  onClick={handleOpenComparison}
                />
              </div>
            </div>

            <SchoolList
              schools={filteredSchools}
              selectedCourses={selectedCourses}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              selectedSchoolId={selectedSchoolId}
              onSchoolSelect={setSelectedSchoolId}
              isLoading={isLoadingSchools}
              favoritedSchoolIds={favoritedSchools}
              onFavoriteToggle={handleFavoriteToggle}
            />
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="w-full lg:w-3/5 h-[400px] lg:h-[calc(100vh-5rem)]">
          <MapContainer
            schools={filteredSchools}
            center={centerCoords}
            radius={locationType === "zip" ? 50 : undefined}
            selectedSchoolId={selectedSchoolId}
            onSchoolSelect={setSelectedSchoolId}
          />
        </div>
      </div>

      {/* Comparison Dialog */}
      <SchoolComparison
        schools={favoritedSchoolsArray}
        isOpen={isComparisonOpen}
        onClose={handleCloseComparison}
        onRemoveSchool={handleRemoveFromComparison}
        onClearAll={handleClearAllFavorites}
      />
    </div>
  )
}
