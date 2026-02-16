'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Layers,
  SlidersHorizontal,
  Users,
} from 'lucide-react';

interface ExpandableToolbarProps {
  onPrimaryClick?: () => void;
  onBatchesClick?: () => void;
  onConfigureClick?: () => void;
}

export function ExpandableToolbar({
  onPrimaryClick,
  onBatchesClick,
  onConfigureClick,
}: ExpandableToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute right-6 top-6 z-10">
      {/* Toolbar Container - contains all buttons */}
      <div className="flex flex-col items-center gap-3 rounded-full bg-white p-2 shadow-lg transition-all duration-300">
        {/* Primary Blue Button - Always Visible */}
        <button
          onClick={onPrimaryClick}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-skolaroid-blue text-white shadow-lg transition-all hover:bg-skolaroid-blue/90 hover:shadow-xl active:scale-95"
          aria-label="Group"
        >
          <Users size={20} />
        </button>

        {/* Expanded Buttons */}
        {isExpanded && (
          <>
            <button
              onClick={onBatchesClick}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-skolaroid-blue text-white shadow-lg transition-all hover:bg-skolaroid-blue/90 hover:shadow-xl active:scale-95"
              aria-label="Batches"
            >
              <Layers size={20} />
            </button>
            <button
              onClick={onConfigureClick}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-skolaroid-blue text-white shadow-lg transition-all hover:bg-skolaroid-blue/90 hover:shadow-xl active:scale-95"
              aria-label="Configure"
            >
              <SlidersHorizontal size={20} />
            </button>
          </>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-all"
          style={{ backgroundColor: '#D9D9D9' }}
          aria-label={isExpanded ? 'Collapse toolbar' : 'Expand toolbar'}
        >
          {isExpanded ? (
            <ChevronUp size={20} className="text-skolaroid-blue" />
          ) : (
            <ChevronDown size={20} className="text-skolaroid-blue" />
          )}
        </button>
      </div>
    </div>
  );
}
