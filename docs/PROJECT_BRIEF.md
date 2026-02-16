# Skolaroid - Project Brief

> CMSC 128 Software Engineering | Team GOAT

## About

Skolaroid is a digitized and customizable memory platform for the University of the Philippines Cebu, designed to strengthen alumni relations. It goes beyond being a repository of names and pictures — it serves as a **living memory platform** where achievements, milestones, and shared experiences of every batch are preserved, celebrated, and explored.

### Goals

- Document the journey of every batch from beginning to end in a structured yet creative format
- Make content accessible for both alumni and current students across all generations
- Promote timeless connections, allowing alumni to revisit their batch and reconnect with classmates
- Make exploration engaging through visual and interactive tools (photo galleries, carousels, flipbooks, maps)
- Provide advanced search features for exploring specific batches, events, and places

---

## Core Features

### 1. User Profiles and Accounts

- Sign-ups restricted to verified UP students and alumni only
- Registration requires an official UP or alumni email (`@up.edu.ph`, `@upcebu.edu.ph`, `@alumni.up.edu.ph`)
- Each user has a unique username and password for login
- Personalized profile containing:
  - Photo
  - Bio
  - Contact information
  - Activity timeline
- Users can contribute content to archives and participate in preserving shared memories

### 2. Batch Archives and Story Highlights

- Every batch (ongoing or graduated) has a dedicated archive page
- Archives store verified memories, achievements, milestones, and shared experiences
- Supported formats: photos, documents, news features
- Instagram-style story feature for visual highlights from each batch
- All submitted content undergoes an approval process before being added

### 3. Immersive Mapping

- Interactive map showcasing places a batch has been to
- Not limited to the school vicinity — shows the full reach of a batch
- Locations can be categorized into:
  - Academic-related activities
  - Non-academic-related activities
- Visual representation of a batch's exploration and experiences

### 4. Batch Heatmap Overlay

- Visual overlay on the campus map
- Highlights the most active and memorable areas based on archived entries
- Reveals where events, activities, and gatherings most often took place
- Shows which parts of the university were most vibrant for each batch

### 5. Advanced Searching

- Search for specific batches, people, events, achievements, and milestones
- Results organized in chronological batch order
- Provides a clearer view of the university's history and progression

### 6. Groups and Communities

- Organizations and communities within the university have their own archives
- Ensures the legacy of respective organizations is preserved
- Functions similarly to batch archives

### 7. Fundraising Platform

- Centralized platform for raising funds
- Anyone can post fundraising projects
- Projects are displayed publicly to garner engagement
- All fundraising projects undergo an application process before going public
- Ensures trustworthiness and authenticity of the cause

### 8. "On This Day" Digital Time Capsule

- Showcases memories from a specific date in the university's history
- Appears on the main page after login (no batch selection needed)
- Examples of content:
  - A photo from a batch's foundation day 10 years ago
  - A news clipping of a university achievement from 25 years ago
  - A scanned photo from a student event in the 1980s
- Makes the university's collective history feel dynamic, shared, and personal

### 9. Input a Story

- Encourages users to share personal experiences and memories
- Users can post moments like "My First Day in UP" or other significant events
- Users who haven't shared stories see: _"Oh no, you haven't inputted a memory yet! You are not shown on the map."_
- Visual distinction for active storytellers:
  - Users with stories: Instagram-like ring border around profile picture
  - Users without stories: no ring border, but still searchable
- Promotes participation and active contribution to the platform

---

## Tech Stack

- **Frontend**: Next.js (App Router), React 19, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Data Fetching**: TanStack Query
- **Validation**: Zod
- **Database**: PostgreSQL via Prisma
- **Authentication**: Supabase
- **Maps**: Mapbox GL
- **Deployment**: Vercel
