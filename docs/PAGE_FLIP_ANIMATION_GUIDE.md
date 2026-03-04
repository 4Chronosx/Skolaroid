# Page Flip Animation Implementation Guide

This guide documents the implementation of the book-style page flipping animation used in the MemoryDetailModal component. The animation creates a realistic 3D page turn effect when navigating between memories.

## Overview

The page flip animation system consists of:

- **Book opening/closing animation**: Blue covers that split and rotate to reveal content
- **Page flipping animation**: 3D page turns that show new content on the back face
- **Layered architecture**: Base pages + animated overlay pages
- **True book behavior**: Pages flip once, revealing new content underneath

## Key Files

### 1. `memory-modal-animations.ts`

Contains all animation variants and timing constants:

```typescript
// Animation timing
export const BOOK_OPEN_DURATION = 0.8; // seconds
export const PAGE_FLIP_DURATION = 0.8; // seconds

// Variants for covers, page flips, and UI elements
export const coverLeftVariants = {
  /* cover animations */
};
export const rightPageFlipVariants = {
  /* right page flip */
};
export const leftPageFlipVariants = {
  /* left page flip */
};
```

### 2. `MemoryDetailModal.tsx`

Main component implementing the animation system (~970 lines).

## Architecture

### Layer Structure (z-index hierarchy)

```
1. Base pages (z-index: auto) - always visible, show current content
2. Spine/rings (z-index: 30) - always on top
3. Animated overlays (z-index: 10) - conditional, show cached content during flip
4. Covers (z-index: auto) - only during open/close
```

### Page Styles

```typescript
// Base pages (left/right content areas)
const PAGE_BASE_STYLES =
  'flex flex-col gap-4 rounded-xl bg-stone-50 p-6 px-10 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.25)]';

// Animated page faces (front/back of flipping pages)
const PAGE_FACE_STYLES =
  'absolute top-0 left-0 w-full h-full flex flex-col gap-4 rounded-xl bg-stone-50 p-6 px-10 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.25)] overflow-hidden';
```

## Animation Flow

### 1. Book Opening (Initial)

1. Modal opens with blue covers closed
2. Covers rotate ±180° around their inner edges
3. Content becomes visible underneath
4. Covers disappear after animation

### 2. Page Navigation

1. User clicks chevron (left/right)
2. Current memory cached in state
3. Navigation callback updates memory
4. Animated page overlay appears showing old content
5. Page rotates 180° revealing new content on back face
6. Animation completes, overlay disappears

## State Management

### Key State Variables

```typescript
const [cachedMemory, setCachedMemory] = useState<Memory | null>(null);
const [cachedDateInfo, setCachedDateInfo] = useState<DateInfo | null>(null);
const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
const [isRightPageFlipped, setIsRightPageFlipped] = useState(false);
const [isLeftPageFlipped, setIsLeftPageFlipped] = useState(false);
const [isFlipping, setIsFlipping] = useState(false);
```

### Navigation Handlers

```typescript
const handleNext = useCallback(() => {
  if (!hasNext || isFlipping) return;

  // Cache current content
  setCachedMemory(memory);
  setCachedDateInfo(dateInfo);
  setFlipDirection('next');

  // Navigate to new memory
  onNavigate('next');

  // Trigger flip animation
  setIsFlipping(true);
  setIsRightPageFlipped(true);

  // Reset after animation
  setTimeout(() => {
    setIsRightPageFlipped(false);
    setIsFlipping(false);
    setCachedMemory(null);
    setCachedDateInfo(null);
  }, PAGE_FLIP_DURATION * 1000);
}, [memory, dateInfo, hasNext, isFlipping, onNavigate]);
```

## Component Structure

### Base Layer (Always Visible)

```tsx
<div className="relative flex h-full gap-2">
  {/* BASE LEFT PAGE - shows current content */}
  <div className={`${PAGE_BASE_STYLES} relative w-1/2`}>
    {/* Date, photo, calendar using current memory */}
  </div>

  {/* BASE RIGHT PAGE - shows current content */}
  <div className={`${PAGE_BASE_STYLES} relative w-1/2`}>
    {/* Author, description, comments using current memory */}
  </div>

  {/* SPINE (rings) - always on top */}
  <div className="absolute left-1/2 top-0 z-30">
    {/* Ring binding elements */}
  </div>
</div>
```

### Animation Overlays (Conditional)

```tsx
{
  /* LEFT PAGE FLIP - shows cached content, reveals new content on back */
}
{
  cachedMemory && flipDirection === 'prev' && (
    <motion.div
      className="absolute left-0 top-0 h-full w-[calc(50%-4px)]"
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'right center',
        zIndex: 10,
      }}
      variants={leftPageFlipVariants}
      animate={isLeftPageFlipped ? 'flipped' : 'flat'}
    >
      {/* Front face - cached/old content */}
      <div
        className={PAGE_FACE_STYLES}
        style={{ backfaceVisibility: 'hidden' }}
      >
        {/* OLD left page content */}
      </div>

      {/* Back face - new content */}
      <div
        className={PAGE_FACE_STYLES}
        style={{
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* NEW right page content */}
      </div>
    </motion.div>
  );
}
```

## Animation Variants

### Page Flip Variants

```typescript
export const rightPageFlipVariants = {
  flat: {
    rotateY: 0,
    transition: { duration: PAGE_FLIP_DURATION, ease: 'easeInOut' },
  },
  flipped: {
    rotateY: -180,
    transition: { duration: PAGE_FLIP_DURATION, ease: 'easeInOut' },
  },
};

export const leftPageFlipVariants = {
  flat: {
    rotateY: 0,
    transition: { duration: PAGE_FLIP_DURATION, ease: 'easeInOut' },
  },
  flipped: {
    rotateY: 180,
    transition: { duration: PAGE_FLIP_DURATION, ease: 'easeInOut' },
  },
};
```

## Critical Implementation Details

### 1. 3D CSS Setup

```css
perspective: 2000px; /* On container */
transformstyle: preserve-3d; /* On flipping element */
backfacevisibility: hidden; /* On both faces */
```

### 2. Transform Origins

- **Left page**: `transformOrigin: 'right center'` (flips around inner edge)
- **Right page**: `transformOrigin: 'left center'` (flips around inner edge)

### 3. Page Positioning

- Base pages: `relative w-1/2` (side-by-side)
- Animated overlays: `absolute` positioned over base pages
- Page faces: `absolute top-0 left-0 w-full h-full` within motion container

### 4. Content Mapping

- **Right page flip (next)**: Front = old right, Back = new left
- **Left page flip (prev)**: Front = old left, Back = new right

## Replication Steps

1. **Install Framer Motion**: `npm install framer-motion`

2. **Create animation variants** in separate file with timing constants

3. **Set up state management**:
   - Cached content state
   - Flip direction tracking
   - Animation flags

4. **Implement layered structure**:
   - Base pages with current content
   - Conditional animated overlays
   - Fixed spine elements

5. **Add 3D CSS properties**:
   - Perspective on container
   - Preserve-3d on motion elements
   - Backface-visibility hidden on faces

6. **Configure navigation handlers**:
   - Cache current content before navigation
   - Update memory via callback
   - Trigger flip animation
   - Clean up after timeout

## Performance Considerations

- Use `backfaceVisibility: 'hidden'` to optimize 3D rendering
- Limit simultaneous animations (max one page flip at a time)
- Clean up cached state after animations complete
- Use `transformStyle: 'preserve-3d'` only on elements that need it

## Troubleshooting

### Content Positioning Issues

- Ensure page faces use `absolute` positioning with explicit dimensions
- Add `overflow-hidden` to clip content within page bounds
- Verify transform origins are set correctly

### Z-Index Conflicts

- Set spine elements to highest z-index (z-30)
- Animated overlays should be above base pages (z-10)
- Use conditional rendering to avoid stacking issues

### Animation Glitches

- Ensure `backfaceVisibility: 'hidden'` is set on both faces
- Check that transform origins match flip direction
- Verify timing consistency between state updates and CSS transitions

## Example Usage

This pattern can be applied to any book-like interface:

- Magazine/catalog browsing
- Photo albums
- Documentation viewers
- Story/tutorial navigation
- Comic book readers

The key is maintaining the layered architecture and proper 3D CSS setup while adapting the content structure to your specific use case.
