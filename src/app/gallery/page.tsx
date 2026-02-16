'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/header';
import Image from 'next/image';

interface MemoryBatch {
  id: string;
  caption: string;
  photos: {
    id: string;
    src: string;
    rotation: string;
    offsetX: string;
    offsetY: string;
    zIndex: number;
    width: number;
    height: number;
  }[];
}

const memoryBatches: MemoryBatch[] = [
  {
    id: '1',
    caption: "doesn't this postcard\ngive vintage UPC\nvibes?",
    photos: [
      {
        id: '1a',
        src: '/assets/images/temporary_map.png',
        rotation: '-6deg',
        offsetX: '0px',
        offsetY: '30px',
        zIndex: 2,
        width: 380,
        height: 560,
      },
      {
        id: '1b',
        src: '/assets/images/temporary_map.png',
        rotation: '3deg',
        offsetX: '-60px',
        offsetY: '-15px',
        zIndex: 3,
        width: 420,
        height: 600,
      },
      {
        id: '1c',
        src: '/assets/images/temporary_map.png',
        rotation: '-2deg',
        offsetX: '-80px',
        offsetY: '40px',
        zIndex: 1,
        width: 340,
        height: 500,
      },
      {
        id: '1d',
        src: '/assets/images/temporary_map.png',
        rotation: '5deg',
        offsetX: '-70px',
        offsetY: '0px',
        zIndex: 4,
        width: 360,
        height: 530,
      },
    ],
  },
  {
    id: '2',
    caption: 'the oblation stands\ntall through every\ngeneration',
    photos: [
      {
        id: '2a',
        src: '/assets/images/temporary_map.png',
        rotation: '4deg',
        offsetX: '0px',
        offsetY: '15px',
        zIndex: 1,
        width: 360,
        height: 530,
      },
      {
        id: '2b',
        src: '/assets/images/temporary_map.png',
        rotation: '-5deg',
        offsetX: '-50px',
        offsetY: '-30px',
        zIndex: 3,
        width: 400,
        height: 580,
      },
      {
        id: '2c',
        src: '/assets/images/temporary_map.png',
        rotation: '2deg',
        offsetX: '-70px',
        offsetY: '20px',
        zIndex: 2,
        width: 370,
        height: 540,
      },
    ],
  },
  {
    id: '3',
    caption: 'where memories\nbecome timeless',
    photos: [
      {
        id: '3a',
        src: '/assets/images/temporary_map.png',
        rotation: '-3deg',
        offsetX: '0px',
        offsetY: '0px',
        zIndex: 2,
        width: 400,
        height: 580,
      },
      {
        id: '3b',
        src: '/assets/images/temporary_map.png',
        rotation: '6deg',
        offsetX: '-60px',
        offsetY: '35px',
        zIndex: 1,
        width: 360,
        height: 520,
      },
      {
        id: '3c',
        src: '/assets/images/temporary_map.png',
        rotation: '-4deg',
        offsetX: '-50px',
        offsetY: '-20px',
        zIndex: 3,
        width: 380,
        height: 560,
      },
      {
        id: '3d',
        src: '/assets/images/temporary_map.png',
        rotation: '1deg',
        offsetX: '-80px',
        offsetY: '15px',
        zIndex: 4,
        width: 340,
        height: 500,
      },
    ],
  },
];

export default function GalleryPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const walk = (startX - e.pageX) * 2;
      scrollRef.current.scrollLeft = scrollLeft + walk;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, scrollLeft]);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 pt-16">
        {/* Color Strip - Left Edge */}
        <div className="flex w-2.5 shrink-0 flex-col">
          <div className="flex-1 bg-[#8E1537]" />
          <div className="flex-1 bg-[#FFB81D]" />
          <div className="flex-1 bg-[#005740]" />
          <div className="flex-1 bg-[#7BC122]" />
          <div className="flex-1 bg-[#208CD4]" />
        </div>

        {/* Horizontal Scroll Area */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          className={`scrollbar-hide flex flex-1 items-center overflow-x-auto overflow-y-hidden ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          <div className="flex items-center gap-0 px-16 py-8">
            {memoryBatches.map((batch) => (
              <div key={batch.id} className="flex shrink-0 items-center">
                {/* Photo Cluster */}
                <div className="relative flex shrink-0 items-end">
                  {batch.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="shrink-0"
                      style={{
                        transform: `rotate(${photo.rotation})`,
                        marginLeft: photo.offsetX,
                        marginTop: photo.offsetY,
                        zIndex: photo.zIndex,
                        position: 'relative',
                      }}
                    >
                      {/* Polaroid Frame */}
                      <div
                        className="bg-white p-2 pb-12 shadow-xl"
                        style={{
                          width: photo.width,
                        }}
                      >
                        <div
                          className="relative overflow-hidden bg-gray-200"
                          style={{ height: photo.height - 56 }}
                        >
                          <Image
                            src={photo.src}
                            alt="Memory"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Caption */}
                <div className="flex shrink-0 items-center px-20">
                  <p className="whitespace-pre-line text-center font-dancing text-4xl italic leading-relaxed text-gray-700">
                    {batch.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
