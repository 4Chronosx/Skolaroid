'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';

interface StackedMemory {
  id: string;
  title: string;
  mediaURL: string;
}

interface MemoryPinStackProps {
  memories: StackedMemory[];
  onClick: (memoryId: string) => void;
}

const MAX_VISIBLE_PINS = 8;

/**
 * Renders a stack of memory pins that fan out in a circular pattern on hover.
 * Shows a count badge if 2+ memories are at the same location.
 */
export function MemoryPinStack({ memories, onClick }: MemoryPinStackProps) {
  const [isHovered, setIsHovered] = useState(false);

  const visibleMemories = useMemo(
    () => memories.slice(0, MAX_VISIBLE_PINS),
    [memories]
  );

  const overflow = memories.length - MAX_VISIBLE_PINS;

  /** Calculate fan-out position for each pin in the stack. */
  const getFanOutStyle = useCallback(
    (index: number): React.CSSProperties => {
      if (!isHovered || memories.length <= 1) {
        return {
          transform: `translateY(${-index * 3}px)`,
          zIndex: memories.length - index,
          transition: 'transform 300ms cubic-bezier(0.33, 1, 0.68, 1)',
        };
      }

      const count = visibleMemories.length;
      // Fan out in an arc above the stack point
      const totalArc = Math.min(count * 40, 240); // degrees of arc
      const startAngle = -90 - totalArc / 2; // Start from top-center
      const angleStep = count > 1 ? totalArc / (count - 1) : 0;
      const angle = startAngle + index * angleStep;
      const radians = (angle * Math.PI) / 180;

      // Radius increases with more pins for better spacing
      const radius = 40 + count * 4;
      const x = Math.cos(radians) * radius;
      const y = Math.sin(radians) * radius;

      return {
        transform: `translate(${x}px, ${y}px)`,
        zIndex: count - index + 10,
        transition: `transform 300ms cubic-bezier(0.33, 1, 0.68, 1) ${index * 30}ms`,
      };
    },
    [isHovered, memories.length, visibleMemories.length]
  );

  if (memories.length === 0) return null;

  // Single memory — just render a normal pin
  if (memories.length === 1) {
    const mem = memories[0];
    return (
      <button
        type="button"
        onClick={() => onClick(mem.id)}
        className="group relative w-fit cursor-pointer transition-transform hover:scale-110"
        aria-label={mem.title}
      >
        <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-white bg-white shadow-lg transition-shadow group-hover:shadow-xl">
          <Image
            src={mem.mediaURL}
            alt={mem.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
      </button>
    );
  }

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: 64, height: 64 }}
    >
      {/* Fanned pins */}
      {visibleMemories.map((mem, index) => (
        <button
          key={mem.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick(mem.id);
          }}
          className="absolute left-0 top-0 h-16 w-16 cursor-pointer"
          style={getFanOutStyle(index)}
          aria-label={mem.title}
        >
          <div className="relative h-full w-full overflow-hidden rounded-lg border-2 border-white bg-white shadow-lg transition-shadow hover:shadow-xl hover:ring-2 hover:ring-skolaroid-blue">
            <Image
              src={mem.mediaURL}
              alt={mem.title}
              fill
              className="object-cover"
            />
          </div>
        </button>
      ))}

      {/* Count badge — visible when NOT hovered, or when overflow exists */}
      <div
        className="absolute -right-2 -top-2 z-50 flex h-6 min-w-6 items-center justify-center rounded-full bg-skolaroid-blue px-1.5 text-[10px] font-bold text-white shadow-md ring-2 ring-white transition-opacity duration-200"
        style={{ opacity: isHovered && overflow <= 0 ? 0 : 1 }}
      >
        {isHovered && overflow > 0 ? `+${overflow}` : memories.length}
      </div>

      {/* Pointer at the bottom (only when not fanned) */}
      <div
        className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg transition-opacity duration-200"
        style={{ opacity: isHovered ? 0 : 1 }}
      />
    </div>
  );
}
