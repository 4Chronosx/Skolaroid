# Batches Modal Revamp — Era-Based Memory Browser

**Branch:** `feat/batches-modal-era-browser`
**Description:** Revamp the batches modal to act as an era-based memory browser with active map indicator, clickable memory cards that open MemoryDetailModal, era-switch confirmation, "Add an entry" CTA, and tag+caption search.

## Goal

Transform the batches modal from a basic grid display into a fully interactive era-based memory browser. The 2020s era is highlighted as the "active map" (the one currently loaded on the main map), memory cards are clickable and open the MemoryDetailModal with prev/next navigation, switching to a different era triggers a confirmation dialog, the last card in the grid is an "Add an entry" button, and search covers tags and captions (description) in addition to title.

## Implementation Steps

### Step 1: Refactor Sidebar — Active Map Indicator & Era Concept

**Files:** `src/components/batches-modal.tsx`
**What:**

- Introduce a `CURRENT_MAP_ERA` constant set to `2020` representing the currently active map.
- Default `selectedDecade` to `2020` instead of `null` so the 2020s era is pre-selected on open.
- Add visual distinction for the active era item in the sidebar: show a small colored dot/badge (e.g., a blue dot or "Active" badge) next to the 2020s label, and use a bolder highlight style to differentiate it from merely "selected" eras.
- Keep the "All" option functional (shows all decades), but visually mark which era is the "active map."
  **Testing:** Open the batches modal — 2020s should be pre-selected and visually highlighted with an "Active" badge/dot. Switching to another decade should un-select 2020s but the active indicator should remain on 2020s.

### Step 2: Revamp Memory Cards With Full Details

**Files:** `src/components/batches-modal.tsx`
**What:**

- Redesign each memory card in the grid to prominently show:
  - **Thumbnail image** (existing)
  - **Title** (existing)
  - **Caption/description** — show a truncated version (2-3 lines) below the title
  - **Tags** as badges (existing, ensure visible)
  - **Like count** with heart icon (existing)
  - **Upload date** (existing)
  - **Location/building name** — small text or badge showing `memory.location.buildingName`
- Make the entire card clickable (cursor-pointer, hover state).
  **Testing:** All memory cards display thumbnail, title, caption snippet, tags, likes, date, and location. Cards have a pointer cursor and hover elevation/shadow.

### Step 3: Open MemoryDetailModal on Card Click

**Files:** `src/components/batches-modal.tsx`
**What:**

- Add state for the selected memory and detail modal open status: `selectedMemory`, `memoryDetailOpen`.
- Convert `MOCK_MEMORIES` items to `MemoryWithCoordinates` shape (add `latitude`/`longitude` to location from `MOCK_LOCATIONS` lookup, or extend mock data shape) so they're compatible with `MemoryDetailModal` props.
- On card click, set `selectedMemory` and open the detail modal.
- Implement `onPrevious`/`onNext` callbacks that navigate within the current `displayedMemories` list (filtered by the currently viewed decade/search/filters).
- Compute `hasPrevious`/`hasNext` based on the selected memory's index in the filtered list.
- Import and render `<MemoryDetailModal>` inside the batches modal.
  **Testing:** Click any memory card → MemoryDetailModal opens showing that memory's details with the book animation. Use left/right chevrons to navigate between memories in the filtered list. Close the detail modal to return to the grid.

### Step 4: Era-Switch Confirmation Dialog

**Files:** `src/components/batches-modal.tsx`
**What:**

- Create an inline confirmation dialog (using Radix Dialog) that appears when the user clicks on a memory card belonging to a decade different from the current active map era.
- The confirmation message: "This memory belongs to the {decade} era. Viewing it will switch the active map to the {decade} map. Do you want to continue?"
- Two buttons: "Cancel" (closes dialog, stays on current view) and "Switch Era" (calls `onEraSwitched(targetDecade)` callback to notify the parent map component, sets `selectedDecade` to the target era, and opens the `MemoryDetailModal`).
- The parent `map.tsx` receives the `onEraSwitched` callback to change the underlying map.
- If the user is already viewing the active era (2020s), clicking any card opens the detail modal directly with no confirmation.
  **Testing:** Set the decade to "All" → click a 2020s memory → detail modal opens directly. Click a 2010s memory → confirmation dialog appears. Press "Cancel" → nothing happens. Press "Switch Era" → era switches, parent is notified, and detail modal opens.

### Step 5: "Add an Entry" Button as Last Grid Item

**Files:** `src/components/batches-modal.tsx`, `src/components/add-memory-modal.tsx`
**What:**

- Replace the current placeholder "add" card with a styled "Add an Entry" CTA card.
- Use a `Plus` icon, bold "Add an Entry" text, and a subtle call-to-action style.
- On click, close the batches modal and open the `AddMemoryModal` pre-filled with the current era.
- Add `onAddMemory` callback prop to `BatchesModalProps` that passes the selected decade.
- Update `AddMemoryModal` to accept an optional `defaultEra` prop that prefills relevant context.
- The "Add an Entry" card always appears as the last item in the grid.
  **Testing:** Click "Add an Entry" → batches modal closes, add memory modal opens with the current era pre-filled.

### Step 6: Search by Tags + Caption (Description)

**Files:** `src/components/batches-modal.tsx`
**What:**

- Extend the search filter logic so `searchQuery` matches against:
  - `memory.title` (already implemented)
  - `memory.description` (already implemented — labeled as "description" in code)
  - `memory.tags[].name` — check if any tag name includes the search query
- Update the search placeholder text to "Search by title, caption, or tag..."
  **Testing:** Type a tag name (e.g., "freshman") in the search box → only memories with that tag appear. Type a caption snippet → matching memories appear. Type a title keyword → matching memories appear. All three search targets work with AND logic alongside other filters.

### Step 7: Wire Up Parent Component (map.tsx)

**Files:** `src/components/map.tsx`
**What:**

- Pass `onAddMemory` callback to `<BatchesModal>` that closes the batches modal and opens the add-memory modal with era pre-fill.
- Pass `onEraSwitched` callback to handle era switching on the underlying map (future: could change map style/data source).
- Store `activeMapEra` state in map.tsx, pass it as a prop to BatchesModal.
- Ensure no regressions.
  **Testing:** Full flow: open batches modal → browse → click card → detail modal → navigate → close → click "Add an Entry" → add memory modal opens with era. Click a different-era memory → confirmation → switch → map parent is notified. Search by tags/caption works. Active indicator on 2020s.
