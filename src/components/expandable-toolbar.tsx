'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Settings, Share2, Bell } from 'lucide-react';

interface ExpandableToolbarProps {
  onPrimaryClick?: () => void;
  onSettingsClick?: () => void;
  onShareClick?: () => void;
}

export function ExpandableToolbar({
  onPrimaryClick,
  onSettingsClick,
  onShareClick,
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
          aria-label="Primary action"
        >
          <Bell size={20} />
        </button>

        {/* Expanded Buttons */}
        {isExpanded && (
          <>
            <button
              onClick={onSettingsClick}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-skolaroid-blue text-white shadow-lg transition-all hover:bg-skolaroid-blue/90 hover:shadow-xl active:scale-95"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onShareClick}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-skolaroid-blue text-white shadow-lg transition-all hover:bg-skolaroid-blue/90 hover:shadow-xl active:scale-95"
              aria-label="Share"
            >
              <Share2 size={20} />
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
