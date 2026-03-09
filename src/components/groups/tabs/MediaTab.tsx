'use client';

import { Image as ImageIcon } from 'lucide-react';

export function MediaTab() {
  // TODO: Fetch group memories from API when database integration is ready
  // This will display Memory cards that belong to this group
  // and are also visible on the map

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
        <ImageIcon size={24} className="text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">No posts yet</h3>
      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-gray-400">
        Posts shared in this group will appear here. They&apos;ll also be
        visible on the map.
      </p>
    </div>
  );
}
