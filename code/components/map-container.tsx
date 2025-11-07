"use client"

import type React from "react"

import { useEffect, useRef } from "react"
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
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = "#0a0d14"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid pattern
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    if (schools.length === 0 || !center) {
      // Draw placeholder text
      ctx.fillStyle = "#64748b"
      ctx.font = "16px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("Enter a location to view schools on map", canvas.width / 2, canvas.height / 2)
      return
    }

    // Calculate bounds
    let minLat = schools[0].latitude
    let maxLat = schools[0].latitude
    let minLng = schools[0].longitude
    let maxLng = schools[0].longitude

    schools.forEach((school) => {
      minLat = Math.min(minLat, school.latitude)
      maxLat = Math.max(maxLat, school.latitude)
      minLng = Math.min(minLng, school.longitude)
      maxLng = Math.max(maxLng, school.longitude)
    })

    const padding = 50
    const mapWidth = canvas.width - padding * 2
    const mapHeight = canvas.height - padding * 2

    // Draw radius circle if specified
    if (radius && center) {
      const centerX = padding + ((center.lng - minLng) / (maxLng - minLng)) * mapWidth
      const centerY = padding + ((maxLat - center.lat) / (maxLat - minLat)) * mapHeight

      // Approximate radius in pixels (rough conversion)
      const radiusPixels = (radius / 50) * Math.min(mapWidth, mapHeight) * 0.4

      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, radiusPixels, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    // Draw school markers
    schools.forEach((school) => {
      const x = padding + ((school.longitude - minLng) / (maxLng - minLng)) * mapWidth
      const y = padding + ((maxLat - school.latitude) / (maxLat - minLat)) * mapHeight

      const isSelected = selectedSchoolId === school.id
      const markerSize = isSelected ? 12 : 8

      // Draw marker
      ctx.fillStyle = isSelected ? "#3b82f6" : "#6366f1"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, markerSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Draw label for selected school
      if (isSelected) {
        ctx.fillStyle = "#1e293b"
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.font = "12px system-ui"
        ctx.textAlign = "center"

        const labelY = y - markerSize - 8
        const labelText = school.name
        const metrics = ctx.measureText(labelText)
        const labelPadding = 6

        // Draw label background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(x - metrics.width / 2 - labelPadding, labelY - 12, metrics.width + labelPadding * 2, 20)

        // Draw label border
        ctx.strokeStyle = "#e2e8f0"
        ctx.lineWidth = 1
        ctx.strokeRect(x - metrics.width / 2 - labelPadding, labelY - 12, metrics.width + labelPadding * 2, 20)

        // Draw label text
        ctx.fillStyle = "#1e293b"
        ctx.fillText(labelText, x, labelY)
      }
    })
  }, [schools, center, radius, selectedSchoolId])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (schools.length === 0 || !center) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Calculate bounds
    let minLat = schools[0].latitude
    let maxLat = schools[0].latitude
    let minLng = schools[0].longitude
    let maxLng = schools[0].longitude

    schools.forEach((school) => {
      minLat = Math.min(minLat, school.latitude)
      maxLat = Math.max(maxLat, school.latitude)
      minLng = Math.min(minLng, school.longitude)
      maxLng = Math.max(maxLng, school.longitude)
    })

    const padding = 50
    const mapWidth = canvas.width - padding * 2
    const mapHeight = canvas.height - padding * 2

    // Check if click is near any school marker
    for (const school of schools) {
      const markerX = padding + ((school.longitude - minLng) / (maxLng - minLng)) * mapWidth
      const markerY = padding + ((maxLat - school.latitude) / (maxLat - minLat)) * mapHeight

      const distance = Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2)
      const hitRadius = selectedSchoolId === school.id ? 12 : 8

      if (distance <= hitRadius + 5) {
        onSchoolSelect(school.id)
        break
      }
    }
  }

  return (
    <div className="w-full h-full bg-muted relative">
      <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full cursor-pointer" />
      <div className="absolute top-4 left-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>Interactive Map View</span>
        </div>
      </div>
    </div>
  )
}
