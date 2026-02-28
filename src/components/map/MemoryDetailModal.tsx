'use client';

import { Copy, Heart, Share, MoreHorizontal, Globe } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { MemoryWithCoordinates } from '@/lib/hooks/useAllMemoriesWithCoordinates';
import Image from 'next/image';
import { useState } from 'react';

interface MemoryDetailModalProps {
  memory: MemoryWithCoordinates | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

type ImageOrientation = 'portrait' | 'landscape' | 'square';

export function MemoryDetailModal({
  memory,
  open,
  onOpenChange,
}: MemoryDetailModalProps) {
  const [imageOrientation, setImageOrientation] =
    useState<ImageOrientation>('portrait');

  if (!memory) return null;

  const createdDate = new Date(memory.createdAt || Date.now());
  const eventDate = {
    dayOfWeek: createdDate.toLocaleDateString('en-US', { weekday: 'long' }),
    month: createdDate.toLocaleDateString('en-US', { month: 'long' }),
    dayNumber: createdDate.getDate(),
  };
  const uploadTime = createdDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Get calendar week with full day names
  const getCalendarWeek = () => {
    const currentDay = createdDate.getDay();
    const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const startOfWeek = new Date(createdDate);
    startOfWeek.setDate(createdDate.getDate() - currentDay);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return {
        label: daysLabels[i],
        number: day.getDate(),
        active: i === currentDay,
      };
    });
  };

  // Detect image orientation on load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;

    if (Math.abs(ratio - 1) < 0.1) {
      setImageOrientation('square');
    } else if (ratio > 1) {
      setImageOrientation('landscape');
    } else {
      setImageOrientation('portrait');
    }
  };

  // Get polaroid width based on orientation - image height is constant
  const getPolaroidWidth = () => {
    switch (imageOrientation) {
      case 'landscape':
        return 'w-full'; // full width for landscape
      case 'square':
        return 'w-72'; // 288px for square
      case 'portrait':
      default:
        return 'w-64'; // 256px for portrait
    }
  };

  const polaroidWidth = getPolaroidWidth();

  // Get author display info (creator not in current type - using placeholder)
  // TODO: Update when creator is added to MemoryWithRelations
  const authorName = 'Memory Author';
  const authorInitial = 'M';

  const mockComments = [
    {
      authorName: 'Kint Louise',
      subtitle: 'Covers collection',
      date: 'Today',
    },
  ];

  const commentCount = 120; // Mock count matching Figma

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[1000px] border-none bg-transparent p-0 shadow-none sm:max-w-[1000px]"
      >
        <DialogTitle className="sr-only">{memory.title}</DialogTitle>

        {/* Outer notebook frame - sky blue cover */}
        <div className="relative overflow-hidden rounded-2xl bg-sky-200 p-2 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]">
          {/* Notebook title tab */}
          <div className="absolute -top-5 left-3 rounded-t-md bg-sky-200 px-3 py-0.5">
            <span className="text-[10px] text-slate-600">
              {memory.location?.buildingName || 'Memory'}
            </span>
          </div>

          {/* Inner notebook pages container */}
          <div className="relative grid grid-cols-2 gap-3">
            {/* ===== LEFT PAGE ===== */}
            <div className="relative flex flex-col gap-4 rounded-xl bg-stone-50 p-6 px-10 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.25)]">
              {/* Date card */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs font-normal text-skolaroid-blue">
                    WHEN
                  </p>
                  <p className="text-base font-medium text-black">
                    {eventDate.dayOfWeek}, {eventDate.month}{' '}
                    {eventDate.dayNumber}
                  </p>
                  <p className="text-[8px] text-gray-400">
                    {uploadTime.replace(/:/g, '-')}
                  </p>
                </div>
                {/* Calendar icon with blue top bar */}
                <div className="flex h-14 w-14 flex-col overflow-hidden rounded-md border border-slate-200 bg-gradient-to-b from-neutral-50/50 to-gray-400/50">
                  <div className="h-3 w-full rounded-t-md bg-skolaroid-blue" />
                  <div className="flex flex-1 items-center justify-center">
                    <span className="text-2xl font-medium text-black">
                      {eventDate.dayNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Polaroid-style photo - fixed height container */}
              <div className="flex h-96 items-center justify-center">
                <div className={`${polaroidWidth}`}>
                  {memory.mediaURL ? (
                    <div className="bg-white p-2 pb-8 shadow-[0px_2px_8px_2px_rgba(0,0,0,0.15)]">
                      <div className="relative h-72 w-full overflow-hidden bg-gray-50">
                        <Image
                          src={memory.mediaURL}
                          alt={memory.title}
                          fill
                          className="object-cover"
                          onLoad={handleImageLoad}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-2 pb-8 shadow-[0px_2px_8px_2px_rgba(0,0,0,0.15)]">
                      <div className="flex h-72 w-full items-center justify-center bg-gray-100">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar week strip - vertical tiles */}
              <div className="flex items-center justify-center gap-0.5">
                {getCalendarWeek().map((day) => (
                  <div
                    key={day.label + day.number}
                    className="flex h-20 w-14 flex-col items-center overflow-hidden rounded bg-stone-50"
                  >
                    <span className="mt-1 text-[10px] text-gray-400">
                      {day.label}
                    </span>
                    <div className="flex flex-1 items-center justify-center">
                      {day.active ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-skolaroid-blue">
                          <span className="text-sm font-medium text-white">
                            {day.number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-slate-700">
                          {day.number}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== SPINE / RINGS ===== */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex w-14 -translate-x-1/2 flex-col items-center justify-around py-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="relative flex h-4 w-14 items-center justify-center"
                >
                  {/* Black circles behind */}
                  <div className="absolute left-0.5 h-3.5 w-3.5 rounded-full bg-black" />
                  <div className="absolute right-0.5 h-3.5 w-3.5 rounded-full bg-black" />
                  {/* Gray bar on top */}
                  <div className="relative z-10 h-1.5 w-10 rounded bg-zinc-400" />
                </div>
              ))}
            </div>

            {/* ===== RIGHT PAGE ===== */}
            <div className="px-15 relative flex flex-col gap-4 rounded-xl bg-stone-50 p-6 px-10 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.25)]">
              {/* Author info header */}
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-zinc-300 text-sm text-slate-600">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {authorName}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Globe className="h-3 w-3" />
                    <span>Public</span>
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-slate-600"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Caption card with gradient and white outline */}
              <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-gray-100 p-5 shadow-[0px_1px_2px_0.5px_rgba(0,0,0,0.25)] outline outline-[3px] outline-white">
                <p className="text-center font-dancing text-2xl leading-relaxed text-slate-800">
                  {memory.description || 'A memorable moment...'}
                </p>
              </div>

              {/* Action icons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  className="text-slate-600 hover:text-slate-800"
                  aria-label="Copy"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  className="text-slate-600 hover:text-slate-800"
                  aria-label="Like"
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  className="text-slate-600 hover:text-slate-800"
                  aria-label="Share"
                >
                  <Share className="h-5 w-5" />
                </button>
              </div>

              {/* Comments section */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-base font-medium text-black">Comments</h3>
                  <span className="rounded-lg bg-gray-200 px-2 py-0.5 text-sm font-medium text-black">
                    {commentCount}
                  </span>
                </div>

                <div className="flex max-h-32 flex-col gap-3 overflow-y-auto pr-1">
                  {mockComments.map((comment, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-zinc-300 text-sm text-slate-600">
                          {comment.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">
                            {comment.authorName}
                          </p>
                          <span className="text-xs text-gray-400">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800">
                          {comment.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
