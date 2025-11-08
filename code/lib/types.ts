/*Data models*/

export type LocationType = "zip" | "state"
export type SortOption = "distance" | "alphabetical"

export interface CLEPExam {
  id: number
  name: string
  category: string
}

export interface SelectedCourse {
  examId: number
  examName: string
  score: number
}

export interface SchoolPolicy {
  id: number
  examId: number
  minScore: number
  courseCode: string
  courseName: string
  credits: number
  isGeneralCredit: boolean
  notes?: string
  isUpdated: boolean
  updatedAt: string
}

export interface School {
  id: number
  name: string
  address: string

  city: string
  state: string
  zip: string
  latitude: number
  longitude: number
  websiteUrl?: string
  registrarEmail?: string
  distance?: number
  policies: SchoolPolicy[]
  votes?: {
    upvotes: number
    downvotes: number
  }
}
