'use client';

import { GalleryPolaroid } from '../GalleryPolaroid';

interface SinglePhotoProps {
  photo: { src: string; alt: string };
  onPhotoClick?: () => void;
}

export function SinglePhoto({ photo, onPhotoClick }: SinglePhotoProps) {
  return (
    <div className="relative" style={{ width: 380, height: 560 }}>
      <GalleryPolaroid
        src={photo.src}
        alt={photo.alt}
        width={380}
        height={560}
        rotation="2deg"
        zIndex={1}
        onClick={onPhotoClick}
      />
    </div>
  );
}
