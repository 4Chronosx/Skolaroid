# Page Flip Animation: Pre-load New Content Before Flip

**Branch:** `fix/page-flip-preload-content`
**Description:** Fix the page flip animation so the back face of the flipping page shows the NEW memory content (not the old), creating a proper illusion of the new page covering the old one.

## Goal

When navigating between memories with the page flip animation, the back of the flipping page currently shows the old memory content and the new content only "pops in" after the flip completes. The fix ensures new content is loaded _before_ the flip begins so the back face reveals the incoming memory — creating a seamless page-turn illusion.

## Root Cause

The parent component (`map.tsx`) defers `setSelectedMemory(nextMemory)` inside the `flyToMemoryWithSequence` completion callback, which fires **~1500ms** after `onNext()` is called. But the page flip animation is only **600ms**. So during the entire flip, the `memory` prop is still the **old** memory, and the back face (which renders from `memory`) shows stale content.

```
Current timeline:
T=0ms      handleNext() → setCachedMemory(old) → onNext() → setIsRightPageFlipped(true)
T=0-600ms  Flip animation plays — back face renders memory (STILL OLD)
T=610ms    Overlay removed, base pages also still show OLD
T=~1500ms  flyTo completes → setSelectedMemory(new) → memory prop finally updates
           Content "pops" to new memory with no transition
```

The modal's rendering logic is actually **correct**: the front face uses `cachedMemory` (old) and the back face uses `memory` (new). The only problem is that `memory` hasn't updated yet when the flip happens.

## Fix

Update the parent's `onNext`/`onPrevious` callbacks to call `setSelectedMemory` **immediately** — before starting `flyToMemoryWithSequence`. This way React batches all state updates (child's `setCachedMemory` + parent's `setSelectedMemory`) into one render, and the back face correctly shows new content from T=0ms.

```
Fixed timeline:
T=0ms      handleNext() → setCachedMemory(old) → onNext() → setSelectedMemory(new) → flyTo starts → setIsRightPageFlipped(true)
T=0ms      React batched render: cachedMemory=old, memory=new
           Front face: cachedMemory (old) ✓  |  Back face: memory (new) ✓  |  Base pages: memory (new) ✓
T=0-600ms  Flip animation — back face correctly shows NEW content
T=610ms    Overlay removed, base pages show new content (seamless)
T=~1500ms  Map flyTo completes (visual camera move, no state change needed)
```

## Implementation Steps

### Step 1: Update onNext/onPrevious callbacks in map.tsx

**Files:** `src/components/map.tsx`

**What:** Move `setSelectedMemory(nextMemory)` / `setSelectedMemory(prevMemory)` out of the `flyToMemoryWithSequence` completion callback and call it **immediately** before the flyTo. The flyTo still runs for the camera animation but no longer gates the memory state update.

**Before (onNext):**

```tsx
onNext={() => {
  if (selectedMemory) {
    const currentIndex = memories.findIndex((m) => m.id === selectedMemory.id);
    const nextMemory = memories[currentIndex + 1];
    if (nextMemory) {
      flyToMemoryWithSequence(nextMemory, () => {
        setSelectedMemory(nextMemory);  // ← deferred by ~1500ms
      });
    }
  }
}}
```

**After (onNext):**

```tsx
onNext={() => {
  if (selectedMemory) {
    const currentIndex = memories.findIndex((m) => m.id === selectedMemory.id);
    const nextMemory = memories[currentIndex + 1];
    if (nextMemory) {
      setSelectedMemory(nextMemory);       // ← immediate
      flyToMemoryWithSequence(nextMemory); // camera moves in parallel
    }
  }
}}
```

**Same change for onPrevious:**

```tsx
onPrevious={() => {
  if (selectedMemory) {
    const currentIndex = memories.findIndex((m) => m.id === selectedMemory.id);
    const prevMemory = memories[currentIndex - 1];
    if (prevMemory) {
      setSelectedMemory(prevMemory);       // ← immediate
      flyToMemoryWithSequence(prevMemory); // camera moves in parallel
    }
  }
}}
```

**Why this works:** The child's `handleNext` calls `setCachedMemory(memory)` (capturing old) then `onNext()` which now synchronously calls `setSelectedMemory(newMemory)`. React 18+ batches both updates into a single re-render where `cachedMemory` = old and `memory` = new. The overlay's back face renders from `memory` (new content) from the very first frame of the animation.

**Testing:**

1. Open the map, click a memory pin to open the MemoryDetailModal
2. Click the right chevron (next) — the right page should flip left with the **back face showing the new memory's date/photo** (not the old one)
3. Click the left chevron (previous) — the left page should flip right with the **back face showing the new memory's author/description** (not the old one)
4. Verify the map still smoothly flies to the new memory's location in parallel
5. Verify content is seamless: when the flip animation completes and the overlay is removed, the base pages should already be showing the same new content (no "pop")
