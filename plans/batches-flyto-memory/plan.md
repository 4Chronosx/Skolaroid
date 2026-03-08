# Batches Modal → Map FlyTo → Memory Detail Transition

**Branch:** `feat/batches-flyto-memory-transition`
**Description:** Clicking a memory in the Batches Modal closes the modal, flies the map to the memory's location, and then opens the MemoryDetailModal from the map.

## Goal

When a user clicks a memory card in the Batches Modal, instead of opening the MemoryDetailModal inside the modal, the modal should close, the map should smoothly fly/zoom to the memory's coordinates, and once the fly animation completes, the MemoryDetailModal opens from the map context. This creates a spatial connection between browsing memories and their map locations.

## Current Behavior

1. User clicks a memory card in `BatchesModal`
2. If same era → `MemoryDetailModal` opens **inside** the `BatchesModal` (disconnected from the map)
3. If different era → confirmation dialog to switch eras, then just closes the modal (doesn't navigate to the memory)

## Desired Behavior

1. User clicks a memory card in `BatchesModal`
2. `BatchesModal` closes
3. If the memory belongs to a different era → switch the map era first
4. Map flies/zooms to the memory's `[longitude, latitude]` coordinates
5. Once the fly animation completes → `MemoryDetailModal` opens from the map component

## Implementation Steps

### Step 1: Add `onMemorySelected` callback to BatchesModal

**Files:** `src/components/batches-modal.tsx`
**What:**

- Add a new prop `onMemorySelected?: (memory: MemoryWithCoordinates) => void` to `BatchesModalProps`.
- Rewrite `handleMemoryCardClick` so that it **always** calls `onMemorySelected(memory)` and closes the modal instead of opening its own `MemoryDetailModal`.
- Remove the internal `selectedMemory`, `memoryDetailOpen`, and `eraSwitchTarget` state variables — the batches modal no longer manages memory viewing.
- Remove the `MemoryDetailModal` render and the era-switch confirmation `Dialog` from the BatchesModal JSX — the parent (MapComponent) will handle era switching and memory viewing.
- Keep the existing decade sidebar filtering, search, and filter panel unchanged.

**Testing:**

- Open BatchesModal → click a memory card → modal closes, `onMemorySelected` is called (verify via console.log in MapComponent temporarily).
- The MemoryDetailModal and era-switch dialog no longer render inside BatchesModal.

### Step 2: Wire up MapComponent to handle the batches→map→detail flow

**Files:** `src/components/map.tsx`
**What:**

- Pass `onMemorySelected` to `<BatchesModal>` that:
  1. Closes the batches modal (`setBatchesModalOpen(false)`).
  2. If the memory's era differs from `activeMapEra`, switches the era (`setActiveMapEra(newEra)`).
  3. Calls `mapRef.current.flyTo()` targeting `[memory.location.longitude, memory.location.latitude]` with a zoom of ~20 (close-up) and a duration of ~1.5s.
  4. Listens for the Mapbox `moveend` event (fires when flyTo completes) and then sets `selectedMemory` + `memoryDetailOpen` to open the `MemoryDetailModal` from the map.
- Use a ref or state to track the "pending memory" so the `moveend` handler knows which memory to open.
- Guard against stale events: if the user triggers another action before `moveend` fires, clear the pending memory.

**Testing:**

- Open BatchesModal → click memory in the **same era** → modal closes → map flies to the memory location → MemoryDetailModal opens.
- Open BatchesModal → click memory in a **different era** → modal closes → era switches (map style changes) → map flies to location → MemoryDetailModal opens.
- Clicking another UI element (e.g., opening GroupModal) while the map is flying should cancel the pending memory open.
- Close MemoryDetailModal → map stays at the zoomed location.

### Step 3: Polish timing and edge cases

**Files:** `src/components/map.tsx`, `src/components/batches-modal.tsx`
**What:**

- Ensure the Dialog close animation of BatchesModal completes before the flyTo begins (add a small delay ~300ms, or chain off the Dialog's `onAnimationEnd` / a timeout after `onOpenChange(false)`).
- Handle the case where a memory's coordinates are already centered on the map — skip the flyTo and open the detail modal immediately (compare current map center with target, if within a threshold, skip).
- If `mapRef.current` is null (map not loaded yet), fall back to just setting the memory and opening the detail modal without animation.
- Era switches cause a `setStyle` call which reloads the map style — the `style.load` event must fire before `flyTo` is called. Chain: close modal → setActiveMapEra → wait for `style.load` → flyTo → wait for `moveend` → open detail modal.

**Testing:**

- Rapid sequence: open batches → click memory → before fly completes, open batches again → click different memory → only the second memory's detail modal should open.
- Memory at current map center → detail modal opens immediately without a noticeable fly animation.
- Memory in a different era → smooth transition: era switch → style loads → fly → modal opens (no flicker or error).
