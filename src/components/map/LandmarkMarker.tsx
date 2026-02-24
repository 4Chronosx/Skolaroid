'use client';

import React, { useState, useCallback } from 'react';
import { Building2, Trees, ShieldCheck } from 'lucide-react';
import {
  type Landmark,
  type LandmarkType,
  LANDMARK_TYPE_COLORS,
  LANDMARK_TYPE_HOVER_COLORS,
} from '@/lib/constants/landmarks';
import { cn } from '@/lib/utils';

interface LandmarkMarkerProps {
  landmark: Landmark;
  memoryCount?: number;
  onClick?: (landmark: Landmark) => void;
}

const typeIconMap: Record<LandmarkType, React.ElementType> = {
  buildings: Building2,
  activity: Trees,
  security: ShieldCheck,
};

/**
 * Pure DOM component rendered inside a raw mapboxgl.Marker via createRoot.
 * Do NOT wrap this in a react-map-gl <Marker> — the parent map.tsx handles positioning.
 */
export const LandmarkMarker = React.forwardRef<
  HTMLDivElement,
  LandmarkMarkerProps
>(({ landmark, memoryCount = 0, onClick }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    console.log(`[LandmarkMarker] Clicked: ${landmark.name} (${landmark.id})`);
    onClick?.(landmark);
  }, [landmark, onClick]);

  const Icon = typeIconMap[landmark.type];
  const bgColor = LANDMARK_TYPE_COLORS[landmark.type];
  const hoverBgColor = LANDMARK_TYPE_HOVER_COLORS[landmark.type];

  return (
    <div
      ref={ref}
      className="group relative cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Landmark: ${landmark.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Tooltip on hover */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-200',
          isHovered
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-1 opacity-0'
        )}
      >
        <span>{landmark.name}</span>
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>

      {/* Memory count badge */}
      {memoryCount > 0 && (
        <div
          className={cn(
            'absolute -right-2 -top-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white transition-transform duration-200',
            isHovered && 'scale-110'
          )}
        >
          {memoryCount > 99 ? '99+' : memoryCount}
        </div>
      )}

      {/* Marker icon container */}
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full shadow-md ring-2 ring-white transition-all duration-200',
          bgColor,
          hoverBgColor,
          isHovered && 'scale-125 shadow-lg'
        )}
      >
        <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>

      {/* Pin tail */}
      <div className="flex justify-center">
        <div
          className={cn(
            'h-2 w-0.5 rounded-b-full bg-gray-700 transition-all duration-200',
            isHovered && 'h-3'
          )}
        />
      </div>
    </div>
  );
});

LandmarkMarker.displayName = 'LandmarkMarker';
