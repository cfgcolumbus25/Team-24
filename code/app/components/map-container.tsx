"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import type { School } from "@/lib/types"
import "leaflet/dist/leaflet.css"

interface MapContainerProps {
  schools: School[]
  center: { lat: number; lng: number } | null
  radius?: number
  selectedSchoolId: number | null
  onSchoolSelect: (id: number) => void
}

export function MapContainer({ schools, center, radius, selectedSchoolId, onSchoolSelect }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const circleRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    // Dynamically import Leaflet only on client side
    import("leaflet").then((L) => {
      // Fix for default marker icons in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      // Create custom icons for selected and unselected markers
      const defaultIcon = new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      })

      const selectedIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41],
      })

      // Initialize map only once
      if (!mapInstanceRef.current && mapRef.current) {
        const map = L.map(mapRef.current, {
          center: [39.8283, -98.5795], // Center of US
          zoom: 4,
          zoomControl: true,
        })

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        mapInstanceRef.current = map
      }

      const map = mapInstanceRef.current
      if (!map) return

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Clear existing circle
      if (circleRef.current) {
        circleRef.current.remove()
        circleRef.current = null
      }

      if (schools.length === 0 || !center) {
        // Reset to default view
        map.setView([39.8283, -98.5795], 4)
        return
      }

      // Draw radius circle if specified
      if (radius && center) {
        const circle = L.circle([center.lat, center.lng], {
          radius: radius * 1609.34, // Convert miles to meters
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          color: "#3b82f6",
          opacity: 0.3,
          weight: 2,
        }).addTo(map)
        circleRef.current = circle
      }

      // Add school markers
      schools.forEach((school) => {
        const isSelected = selectedSchoolId === school.id
        const marker = L.marker([school.latitude, school.longitude], {
          icon: isSelected ? selectedIcon : defaultIcon,
        }).addTo(map)

        // Bind popup with school name
        if (isSelected) {
          marker.bindTooltip(school.name, {
            permanent: true,
            direction: "top",
            className: "school-tooltip",
          }).openTooltip()
        }

        // Add click handler
        marker.on("click", () => {
          onSchoolSelect(school.id)
        })

        markersRef.current.push(marker)
      })

      // Fit bounds to show all schools
      if (schools.length > 0) {
        const bounds = L.latLngBounds(schools.map((s) => [s.latitude, s.longitude]))
        map.fitBounds(bounds, { padding: [50, 50] })
      } else if (center) {
        map.setView([center.lat, center.lng], 10)
      }
    })
  }, [isClient, schools, center, radius, selectedSchoolId, onSchoolSelect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="w-full h-full bg-muted relative">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-[1000]">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>Interactive Map View - {schools.length} {schools.length === 1 ? "School" : "Schools"}</span>
        </div>
      </div>
    </div>
  )
}
