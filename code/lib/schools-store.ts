import { mockSchools } from "./mock-data"
import type { School } from "./types"
import { readVotes } from "./votes-storage"

// Get the schools store from the JSON file
export async function getSchoolsStore(): Promise<School[]> {
  // Read vote counts from JSON file
  const votes = await readVotes()
  
  // Merge schools from mock-data.ts with votes from JSON file
  return mockSchools.map((school) => ({
    ...school,
    // Use votes from JSON file if available, otherwise use default votes from mock-data.ts
    votes: votes[school.id.toString()] || school.votes || { upvotes: 0, downvotes: 0 },
  }))
}

// Synchronous version for backwards compatibility
export const schoolsStore: School[] = mockSchools.map((school) => ({
  // Merge schools from mock-data.ts with default votes
  ...school,
  votes: school.votes || { upvotes: 0, downvotes: 0 },
}))

