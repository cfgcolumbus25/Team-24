# Team-24

## What the app does?
- Search and filter institutional CLEP policies to determine which of your CLEP scores qualify for college credit at nearby colleges/universities.

## Features
- Available CLEP Credits
  - Lists all CLEP credits that a particular college accepts.
  - Every university has a list of courses and course numbers (if applicable), minimum scores, credits, and badges (General Credit, Updated Month/Year).
  - The "General Credit" badge is for general electives and if you hover over it, it gives a tooltip/recommendation.

- The map provides a visual representation of colleges/universities in the selected region that accept CLEP credits.
  - You can click on the markers to view more details about each institution.

## How to run
- Open a terminal in the project node and run these:
```bash
# go into code directory (frontend)
cd code

# Install all packages
npm install

# Run the frontend
n8n run dev
```

-Open another terminal as well and run these:
```bash
# go into the app directory (backend)
cd app

# install dependences
npm i

# Run the server (supabase database, doesn't work on jpmc wifi)
npm run dev
```

-For the n8n workflow details are in the workflow folder inside code/workflow

- Open http://localhost:3000 (or the port shown in the terminal).

## How to use?
- Enter your state/zipcode to find colleges in the selected regions. 
- Then, enter the CLEP exams and scores (if you have).
- Based on your input, it provides a list of colleges/universities that accept CLEP credits in the region you selected.


## AI usage

- Used v0 for creating the basic page. Our prompt included our idea of design + the answers to the questions from the Q & A session
- Used claude/copilot/cursor to iteratively help with feature bugs that arised and some UI components, 