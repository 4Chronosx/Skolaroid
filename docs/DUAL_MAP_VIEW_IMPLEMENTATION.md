# Dual Map View Feature - Implementation Complete

## Overview

The map now supports two types of markers simultaneously:

1. **Landmark Markers** - Circular icons representing buildings/locations with memory count badges
2. **Memory Pins** - Individual memory images displayed as clickable pins at exact coordinates

---

## Components Created

### 1. `MemoryPin.tsx` (`src/components/map/MemoryPin.tsx`)

- Displays individual memory as a 64x64px image pin
- White 2px border with shadow
- Triangular pointer tail pointing to location
- Hover effect: scales to 110%
- Clickable to open memory details

### 2. `MemoryDetailModal.tsx` (`src/components/map/MemoryDetailModal.tsx`)

- Full-screen modal showing complete memory information
- Displays: title, image, description, location, tags, visibility, vote count
- Uses shadcn/ui Dialog component
- Responsive design with scroll support

### 3. `useAllMemoriesWithCoordinates.ts` (`src/lib/hooks/useAllMemoriesWithCoordinates.ts`)

- React Query hook to fetch all memories with coordinate data
- Returns `MemoryWithCoordinates[]` type
- Includes: memory data + location with latitude/longitude
- 5-minute cache (staleTime)

### 4. API Route (`src/app/api/prisma/memory/get-all-with-coordinates/route.ts`)

- Endpoint: `GET /api/prisma/memory/get-all-with-coordinates`
- Returns empty array (ready for database integration)
- Prisma query template included (commented out)
- Filters for memories with `mediaURL` (images only)

---

## Updated Components

### `map.tsx`

**New State:**

- `selectedMemory` - Currently selected memory for detail modal
- `memoryDetailOpen` - Modal visibility state
- `memoryMarkersRef` - Array of memory pin markers
- `memoryRootsRef` - Array of React roots for memory pins

**New Effects:**

- Memory pin rendering effect - Creates/updates pins when memories data changes
- Async unmount handling - Prevents React race condition errors

**Features:**

- Bounded map area to prevent scrolling too far
- Min zoom: 16, prevents markers from appearing too large when zoomed out
- Simultaneous landmark and memory pin rendering

---

## Data Flow

```
User Actions:
├── Click Landmark Marker
│   └── Opens LandmarkMemoriesPanel (sidebar)
│       └── Shows MemoryList for that location
│
└── Click Memory Pin
    └── Opens MemoryDetailModal (center overlay)
        └── Shows full memory details

API Integration:
└── useAllMemoriesWithCoordinates hook
    └── GET /api/prisma/memory/get-all-with-coordinates
        └── Returns MemoryWithCoordinates[]
            ├── Memory data (id, title, description, mediaURL, tags, votes)
            └── Location data (buildingName, latitude, longitude)
```

---

## Database Integration Checklist

When ready to connect to the database:

### Step 1: API Route

Uncomment the Prisma query in:

- `src/app/api/prisma/memory/get-all-with-coordinates/route.ts`
- Import Prisma client
- Query will fetch memories with `mediaURL IS NOT NULL` and include location coordinates

### Step 2: Memory Schema

Ensure the following exists in your Prisma schema:

```prisma
model Memory {
  mediaURL   String?   // URL to uploaded image
  location   Location  @relation(...)
  // ... other fields
}

model Location {
  latitude   Float
  longitude  Float
  // ... other fields
}
```

### Step 3: Image Storage

Configure Next.js `next.config.ts` to allow your image domain:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-storage-domain.com', // e.g., Supabase storage
    },
  ],
}
```

---

## Component Sizes (Current)

**Landmark Markers:**

- Circle: 16px (h-4 w-4)
- Icon: 8px (h-2 w-2)
- Badge: 12px (h-3)
- Pin tail: 4px

**Memory Pins:**

- Image: 64x64px (h-16 w-16)
- Border: 2px white
- Pointer tail: 15px tall, 10px base width

---

## Map Configuration

**Center:** `[123.8986, 10.3224]`
**Zoom Levels:**

- Default: 17
- Min: 16 (prevents markers appearing too large)
- Max: 22

**Bounds:**

```
Southwest: [123.89, 10.32]
Northeast: [123.91, 10.33]
```

---

## Mock Data Locations (for testing)

Coordinates adjusted to match map center `[123.8986, 10.3224]`:

1. Oblation Plaza: `[123.8980, 10.3224]`
2. UP Main Library: `[123.8986, 10.3230]`
3. AS Steps: `[123.8992, 10.3218]`
4. Sunken Garden: `[123.8975, 10.3235]`
5. College of Engineering: `[123.8982, 10.3210]`

---

## Next Steps

1. **Memory Submission Feature** - Build form to create memories with image upload
2. **Image Upload Service** - Integrate with Supabase Storage or similar
3. **Database Connection** - Uncomment Prisma queries in API routes
4. **Authentication** - Add user ownership checks for memory editing
5. **Filtering** - Add ability to filter memory pins by tags, date, visibility
6. **Clustering** - Consider marker clustering when many memories exist in one area

---

## Known Limitations

- Memory pins have fixed pixel size (don't scale with zoom)
- No clustering - all pins render individually
- No pin priority/z-index management (overlapping pins)
- Single image per memory (no galleries)

---

## Testing Instructions

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/map`
3. Expected behavior with no data:
   - 5 landmark markers visible (circular icons)
   - No memory pins visible (empty data array)
   - Map bounded to small area
   - Can't zoom out below level 16

4. To test with data:
   - Add memories via submission form (when built)
   - Or temporarily modify API route to return test data
