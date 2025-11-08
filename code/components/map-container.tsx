"use client"

import { useMemo } from "react"
import { MapPin } from "lucide-react"
import type { School } from "@/lib/types"

interface MapContainerProps {
  schools: School[]
  center: { lat: number; lng: number } | null
  radius?: number
  selectedSchoolId: number | null
  onSchoolSelect: (id: number) => void
}

export function MapContainer({ schools, center, radius, selectedSchoolId, onSchoolSelect }: MapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  // Build the embed URL using Google Maps Embed API
  // The Embed API supports: view, directions, place, search, streetview
  // For multiple markers, we'll use a combination of view mode with search queries
  const mapUrl = useMemo(() => {
    if (!apiKey) return ""

    // Calculate center point for the map
    let mapCenter: { lat: number; lng: number }
    let zoom: number

    if (schools.length > 0) {
      // If a school is selected, center on that school
      if (selectedSchoolId) {
        const selectedSchool = schools.find((s) => s.id === selectedSchoolId)
        if (selectedSchool) {
          mapCenter = { lat: selectedSchool.latitude, lng: selectedSchool.longitude }
          zoom = 14
          
          // Use place mode for selected school to show marker
          const searchQuery = encodeURIComponent(`${selectedSchool.name}, ${selectedSchool.city}, ${selectedSchool.state}`)
          return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${searchQuery}&zoom=${zoom}`
        }
      }

      // Calculate average center from all schools
      const avgLat = schools.reduce((sum, s) => sum + s.latitude, 0) / schools.length
      const avgLng = schools.reduce((sum, s) => sum + s.longitude, 0) / schools.length
      mapCenter = { lat: avgLat, lng: avgLng }

      // Calculate zoom based on spread of schools
      if (schools.length === 1) {
        zoom = radius ? 12 : 10
        const school = schools[0]
        const searchQuery = encodeURIComponent(`${school.name}, ${school.city}, ${school.state}`)
        return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${searchQuery}&zoom=${zoom}`
      } else {
        // Calculate bounding box to determine zoom
        const lats = schools.map((s) => s.latitude)
        const lngs = schools.map((s) => s.longitude)
        const latDiff = Math.max(...lats) - Math.min(...lats)
        const lngDiff = Math.max(...lngs) - Math.min(...lngs)
        const maxDiff = Math.max(latDiff, lngDiff)
        
        if (maxDiff > 5) zoom = 6
        else if (maxDiff > 2) zoom = 7
        else if (maxDiff > 1) zoom = 8
        else if (maxDiff > 0.5) zoom = 9
        else if (maxDiff > 0.2) zoom = 10
        else zoom = 11

        // For multiple schools, use view mode centered on average
        // Note: Embed API doesn't easily show multiple custom markers
        // We'll center on the area and users can see the general location
        // Alternative: Use a search query with coordinates for one school as reference
        const baseUrl = "https://www.google.com/maps/embed/v1/view"
        const params = new URLSearchParams({
          key: apiKey,
          center: `${mapCenter.lat},${mapCenter.lng}`,
          zoom: zoom.toString(),
        })
        return `${baseUrl}?${params.toString()}`
      }
    } else if (center) {
      // No schools but we have a center point
      const baseUrl = "https://www.google.com/maps/embed/v1/view"
      const params = new URLSearchParams({
        key: apiKey,
        center: `${center.lat},${center.lng}`,
        zoom: radius ? "10" : "6",
      })
      return `${baseUrl}?${params.toString()}`
    } else {
      // Default view - show United States
      const baseUrl = "https://www.google.com/maps/embed/v1/view"
      const params = new URLSearchParams({
        key: apiKey,
        center: "39.8283,-98.5795", // Center of USA
        zoom: "4",
      })
      return `${baseUrl}?${params.toString()}`
    }
  }, [schools, center, radius, selectedSchoolId, apiKey])

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-muted relative flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground mb-2">Google Maps API key is required</p>
          <p className="text-xs text-muted-foreground">
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-muted relative">
      <iframe
        key={mapUrl} // Force re-render when URL changes
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        className="w-full h-full"
        title="Schools Map"
      />
      
      <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-10">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{schools.length} {schools.length === 1 ? "School" : "Schools"}</span>
        </div>
      </div>

      {/* Show school quick-select buttons when multiple schools are available */}
      {schools.length > 1 && schools.length <= 15 && (
        <div className="absolute bottom-4 left-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-10 max-h-40 overflow-y-auto">
          <div className="text-xs font-medium text-muted-foreground mb-2">View Schools:</div>
          <div className="flex flex-wrap gap-2">
            {schools.map((school) => {
              const isSelected = selectedSchoolId === school.id
              return (
                <button
                  key={school.id}
                  onClick={() => {
                    // Update map to show this school
                    onSchoolSelect(school.id)
                    // The mapUrl will update via useMemo when selectedSchoolId changes
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border hover:border-primary/50"
                  }`}
                >
                  {school.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
