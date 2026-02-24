'use client';

import Image from 'next/image';

export interface MemoryPinProps {
  src: string;
  alt?: string;
  onClick?: () => void;
}

export function MemoryPin({ src, alt = 'Memory', onClick }: MemoryPinProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-fit cursor-pointer transition-transform hover:scale-110"
      aria-label={alt}
    >
      {/* Pin container with white border and shadow */}
      <div className="relative h-16 w-16 overflow-hidden rounded-lg border-2 border-white bg-white shadow-lg transition-shadow group-hover:shadow-xl">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>

      {/* Pointer at the bottom */}
      <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
    </button>
  );
}
