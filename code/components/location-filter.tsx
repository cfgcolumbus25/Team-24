"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"
import type { LocationType } from "@/lib/types"
import { US_STATES } from "@/lib/constants"

interface LocationFilterProps {
  locationType: LocationType
  location: string
  onLocationChange: (type: LocationType, value: string) => void
}

export function LocationFilter({ locationType, location, onLocationChange }: LocationFilterProps) {
  const [zipInput, setZipInput] = useState(locationType === "zip" ? location : "")
  const [stateInput, setStateInput] = useState(locationType === "state" ? location : "")

  const handleTypeChange = (value: string) => {
    const newType = value as LocationType
    if (newType === "zip") {
      onLocationChange("zip", zipInput)
    } else {
      onLocationChange("state", stateInput)
    }
  }

  const handleZipChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 5)
    setZipInput(cleaned)
    if (cleaned.length === 5) {
      onLocationChange("zip", cleaned)
    }
  }

  const handleStateChange = (value: string) => {
    setStateInput(value)
    onLocationChange("state", value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Location</h2>
      </div>

      <RadioGroup value={locationType} onValueChange={handleTypeChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="zip" id="zip" />
          <Label htmlFor="zip" className="cursor-pointer">
            ZIP Code (50 mile radius)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="state" id="state" />
          <Label htmlFor="state" className="cursor-pointer">
            State
          </Label>
        </div>
      </RadioGroup>

      {locationType === "zip" ? (
        <div>
          <Label htmlFor="zipInput" className="text-sm text-muted-foreground">
            Enter ZIP Code
          </Label>
          <Input
            id="zipInput"
            type="text"
            placeholder="e.g., 22003"
            value={zipInput}
            onChange={(e) => handleZipChange(e.target.value)}
            className="mt-1.5"
          />
        </div>
      ) : (
        <div>
          <Label htmlFor="stateSelect" className="text-sm text-muted-foreground">
            Select State
          </Label>
          <Select value={stateInput} onValueChange={handleStateChange}>
            <SelectTrigger id="stateSelect" className="mt-1.5">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
