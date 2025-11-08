import { promises as fs } from "fs" // A module to read and write files
import path from "path" // A module to join paths
import { mockSchools } from "./mock-data" // A module to get the mock schools

const VOTES_FILE_PATH = path.join(process.cwd(), "lib", "votes-data.json")

// Interface here for votes data, upvotes and downvotes are numbers
export interface VoteCounts {
  upvotes: number
  downvotes: number
}

// Initialize votes-data.json from mock-data.ts if it doesn't exist
async function initializeVotesFile(): Promise<void> {
  try {
    await fs.access(VOTES_FILE_PATH)
    // If ile exists, no need to initialize
  } catch {
    // If file doesn't exist, create it from mock-data.ts
    const initialVotes: Record<string, VoteCounts> = {}
    // Loop through mock-data.ts and add the votes to the initialVotes object
    for (const school of mockSchools) {
      if (school.votes) {
        initialVotes[school.id.toString()] = school.votes
      } else {
        initialVotes[school.id.toString()] = { upvotes: 0, downvotes: 0 }
      }
    }
    
    // Write the initialVotes to the vote-data json
    await fs.writeFile(VOTES_FILE_PATH, JSON.stringify(initialVotes, null, 2), "utf8")
    console.log("Initialized votes-data.json from mock-data.ts")
  }
}

// Read votes from the votes-data json
export async function readVotes(): Promise<Record<string, VoteCounts>> {
  await initializeVotesFile()
  
  try {
    // Read the file contents
    const fileContents = await fs.readFile(VOTES_FILE_PATH, "utf8")
    return JSON.parse(fileContents)
  } catch (error) {
    console.error("Error reading votes file:", error)
    // If the file fails to read, return the default votes from mock-data.ts
    const fallbackVotes: Record<string, VoteCounts> = {}
    for (const school of mockSchools) {
      fallbackVotes[school.id.toString()] = school.votes || { upvotes: 0, downvotes: 0 }
    }
    return fallbackVotes
  }
}

// Write votes to the votes-data json
export async function writeVotes(votes: Record<string, VoteCounts>): Promise<void> {
  try {
    // Write the votes to the votes-data json
    await fs.writeFile(VOTES_FILE_PATH, JSON.stringify(votes, null, 2), "utf8")
  } catch (error) {
    // If the file fails to write, throw an error
    console.error("Error writing votes file:", error)
    throw error
  }
}

// Get the votes for a specific school
export async function getSchoolVotes(schoolId: number): Promise<VoteCounts> {
  const votes = await readVotes()
  return votes[schoolId.toString()] || { upvotes: 0, downvotes: 0 }
}

// Update the votes for a specific school
export async function updateSchoolVotes(
  schoolId: number,
  // Update function to update the votes for the specific school
  updateFn: (current: VoteCounts) => VoteCounts
  // Return the updated votes
): Promise<VoteCounts> {
  const votes = await readVotes()
 // Get the current votes for the specific school
  const current = votes[schoolId.toString()] || { upvotes: 0, downvotes: 0 }
  const updated = updateFn(current)
  // Update the votes for the specific school
  votes[schoolId.toString()] = updated
  // Write the updated votes to the votes-data json
  await writeVotes(votes)
  return updated
}

