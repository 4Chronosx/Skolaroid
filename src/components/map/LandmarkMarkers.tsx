'use client';

import React, { useCallback } from 'react';
import { LandmarkMarker } from '@/components/map/LandmarkMarker';
import { LANDMARKS, type Landmark } from '@/lib/constants/landmarks';

interface LandmarkMarkersProps {
  /** Optional map of landmark id → memory count for badge display */
  memoryCounts?: Record<string, number>;
  /** Optional callback when a landmark marker is clicked */
  onLandmarkClick?: (landmark: Landmark) => void;
}

/**
 * Renders all landmark markers as plain React elements.
 * Note: The main map.tsx currently creates markers via mapboxgl.Marker + createRoot,
 * so this component is available for alternative integration patterns.
 */
const LandmarkMarkers: React.FC<LandmarkMarkersProps> = ({
  memoryCounts = {},
  onLandmarkClick,
}) => {
  const handleClick = useCallback(
    (landmark: Landmark) => {
      onLandmarkClick?.(landmark);
    },
    [onLandmarkClick]
  );

  return (
    <>
      {LANDMARKS.map((landmark) => (
        <LandmarkMarker
          key={landmark.id}
          landmark={landmark}
          memoryCount={memoryCounts[landmark.id] ?? 0}
          onClick={handleClick}
        />
      ))}
    </>
  );
};

LandmarkMarkers.displayName = 'LandmarkMarkers';

export default LandmarkMarkers;
