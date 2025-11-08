import { mockSchools } from "./mock-data"
import type { School } from "./types"

// In-memory storage for demo (in production, use a database)
// This is shared across API routes to maintain consistency
export const schoolsStore: School[] = mockSchools.map((school) => ({
  ...school,
  votes: school.votes || { upvotes: 0, downvotes: 0 },
}))

