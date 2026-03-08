# Page Flip Animation: Pre-load New Content Before Flip

## Goal

Fix the page flip animation so the back face of the flipping page shows the NEW memory content (not the old), by calling `setSelectedMemory` immediately instead of deferring it to the `flyToMemoryWithSequence` completion callback.

## Prerequisites

Make sure that you are currently on the `fix/page-flip-preload-content` branch before beginning implementation.
If not, move to the correct branch. If the branch does not exist, create it from main.

### Step-by-Step Instructions

#### Step 1: Update onNext/onPrevious callbacks in map.tsx

The only file that needs to change is `src/components/map.tsx`. Both the `onPrevious` and `onNext` callbacks currently defer `setSelectedMemory` inside the `flyToMemoryWithSequence` completion callback. This means the `memory` prop doesn't update until ~1500ms later (when the map flyTo finishes), but the page flip animation is only 600ms — so the back face shows stale content the entire time.

The fix moves `setSelectedMemory` to fire **immediately** (before the flyTo), so React batches it with the child's `setCachedMemory` call into a single render where `cachedMemory` = old and `memory` = new.

- [x] Open `src/components/map.tsx`
- [x] Find the `onPrevious` callback (around line 603–616) and replace it with the version below
- [x] Find the `onNext` callback (around line 617–631) and replace it with the version below

Replace the **onPrevious** callback — find this code:

```tsx
        onPrevious={() => {
          if (selectedMemory) {
            const currentIndex = memories.findIndex(
              (m) => m.id === selectedMemory.id
            );
            const prevMemory = memories[currentIndex - 1];
            if (prevMemory) {
              // Fly to previous memory with sequence animation
              flyToMemoryWithSequence(prevMemory, () => {
                setSelectedMemory(prevMemory);
              });
            }
          }
        }}
```

Replace it with:

```tsx
        onPrevious={() => {
          if (selectedMemory) {
            const currentIndex = memories.findIndex(
              (m) => m.id === selectedMemory.id
            );
            const prevMemory = memories[currentIndex - 1];
            if (prevMemory) {
              // Set memory immediately so the flip back-face shows new content
              setSelectedMemory(prevMemory);
              flyToMemoryWithSequence(prevMemory);
            }
          }
        }}
```

Replace the **onNext** callback — find this code:

```tsx
        onNext={() => {
          if (selectedMemory) {
            const currentIndex = memories.findIndex(
              (m) => m.id === selectedMemory.id
            );
            const nextMemory = memories[currentIndex + 1];
            if (nextMemory) {
              // Fly to next memory with sequence animation
              flyToMemoryWithSequence(nextMemory, () => {
                setSelectedMemory(nextMemory);
              });
            }
          }
        }}
```

Replace it with:

```tsx
        onNext={() => {
          if (selectedMemory) {
            const currentIndex = memories.findIndex(
              (m) => m.id === selectedMemory.id
            );
            const nextMemory = memories[currentIndex + 1];
            if (nextMemory) {
              // Set memory immediately so the flip back-face shows new content
              setSelectedMemory(nextMemory);
              flyToMemoryWithSequence(nextMemory);
            }
          }
        }}
```

##### Step 1 Verification Checklist

- [ ] Run `pnpm type-check` — no type errors (the `onComplete` param is already optional: `onComplete?: () => void`)
- [ ] Run `pnpm lint` — no lint errors
- [ ] Open the app in the browser, navigate to the map page
- [ ] Click a memory pin to open the MemoryDetailModal
- [ ] Click the **right chevron** (next): the right page should flip left and the **back face should show the new memory's date/photo**, not the old one
- [ ] Click the **left chevron** (previous): the left page should flip right and the **back face should show the new memory's author/description**, not the old one
- [ ] Verify the map still smoothly flies to the new memory's location in parallel with the flip
- [ ] When the flip animation completes and the overlay is removed, the base pages should already show the same new content — no visible "pop" or flash

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.
