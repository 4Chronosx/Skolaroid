'use client';

import {
  Copy,
  Heart,
  Share,
  MoreHorizontal,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { MemoryWithCoordinates } from '@/lib/hooks/useAllMemoriesWithCoordinates';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  coverLeftVariants,
  coverRightVariants,
  rightPageFlipVariants,
  leftPageFlipVariants,
  chevronVariants,
  overlayVariants,
  PAGE_FLIP_DURATION,
  BOOK_OPEN_DURATION,
} from './memory-modal-animations';

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
type AnimationPhase = 'closed' | 'opening' | 'open' | 'closing';

// Page styles shared between left and right pages
const PAGE_BASE_STYLES =
  'flex flex-col gap-4 rounded-xl bg-stone-50 p-6 px-10 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.25)]';

// Styles for absolutely positioned page faces (front/back of flipping pages)
const PAGE_FACE_STYLES =
  'absolute top-0 left-0 w-full h-full flex flex-col gap-4 rounded-xl bg-stone-50 p-6 px-10 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.25)] overflow-hidden';

export function MemoryDetailModal({
  memory,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: MemoryDetailModalProps) {
  const [imageOrientation, setImageOrientation] =
    useState<ImageOrientation>('portrait');
  const [animationPhase, setAnimationPhase] =
    useState<AnimationPhase>('closed');
  const [isRightPageFlipped, setIsRightPageFlipped] = useState(false);
  const [isLeftPageFlipped, setIsLeftPageFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  // Cache the old memory during flip animation so flipping page shows old content
  const [cachedMemory, setCachedMemory] =
    useState<MemoryWithCoordinates | null>(null);
  // Track which direction we're flipping for animation state
  type FlipDirection = 'next' | 'prev' | null;
  const [flipDirection, setFlipDirection] = useState<FlipDirection>(null);

  // Handle open/close state changes
  useEffect(() => {
    if (open) {
      // Opening sequence
      setAnimationPhase('opening');
      const timer = setTimeout(() => {
        setAnimationPhase('open');
      }, BOOK_OPEN_DURATION * 1000);
      return () => clearTimeout(timer);
    } else {
      // Closing sequence
      setAnimationPhase('closing');
      const timer = setTimeout(() => {
        setAnimationPhase('closed');
      }, BOOK_OPEN_DURATION * 1000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset flip state when modal closes
  useEffect(() => {
    if (!open) {
      setIsRightPageFlipped(false);
      setIsLeftPageFlipped(false);
      setIsFlipping(false);
      setCachedMemory(null);
      setFlipDirection(null);
    }
  }, [open]);

  // Handle NEXT: right page flips over to the left, revealing new content underneath
  const handleNext = () => {
    if (!hasNext || isFlipping || !onNext) return;

    // Cache current memory so flipping page shows OLD content
    setCachedMemory(memory);
    setFlipDirection('next');
    setIsFlipping(true);

    // Call onNext immediately - base layer will show NEW content
    onNext();

    // Start the flip animation
    setIsRightPageFlipped(true);

    // After animation completes, clean up
    setTimeout(() => {
      setCachedMemory(null);
      setFlipDirection(null);
      setIsRightPageFlipped(false);
      setIsFlipping(false);
    }, PAGE_FLIP_DURATION * 1000);
  };

  // Handle PREVIOUS: left page flips over to the right, revealing new content underneath
  const handlePrevious = () => {
    if (!hasPrevious || isFlipping || !onPrevious) return;

    // Cache current memory so flipping page shows OLD content
    setCachedMemory(memory);
    setFlipDirection('prev');
    setIsFlipping(true);

    // Call onPrevious immediately - base layer will show NEW content
    onPrevious();

    // Start the flip animation
    setIsLeftPageFlipped(true);

    // After animation completes, clean up
    setTimeout(() => {
      setCachedMemory(null);
      setFlipDirection(null);
      setIsLeftPageFlipped(false);
      setIsFlipping(false);
    }, PAGE_FLIP_DURATION * 1000);
  };

  // Helper function to compute date info for a memory
  const getDateInfo = (mem: MemoryWithCoordinates | null) => {
    if (!mem) return null;
    const date = new Date(mem.createdAt || Date.now());
    const currentDay = date.getDay();
    const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - currentDay);

    return {
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      dayNumber: date.getDate(),
      uploadTime: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      calendarWeek: Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return {
          label: daysLabels[i],
          number: day.getDate(),
          active: i === currentDay,
        };
      }),
    };
  };

  // Memoize derived date values for current memory
  const dateInfo = useMemo(() => getDateInfo(memory), [memory]);

  // Get date info for cached memory (during flip animation)
  const cachedDateInfo = useMemo(
    () => getDateInfo(cachedMemory),
    [cachedMemory]
  );

  // Get polaroid width based on orientation
  const getPolaroidWidth = () => {
    switch (imageOrientation) {
      case 'landscape':
        return 'w-full';
      case 'square':
        return 'w-72';
      case 'portrait':
      default:
        return 'w-64';
    }
  };

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

  if (!memory || !dateInfo) return null;

  const polaroidWidth = getPolaroidWidth();
  const authorName = 'Memory Author';
  const authorInitial = 'M';
  const commentCount = 120;

  const mockComments = [
    { authorName: 'Kint Louise', subtitle: 'Covers collection', date: 'Today' },
  ];

  // Whether covers should be visible (during open/close animations or closed state)
  const showCovers = animationPhase !== 'open';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
            />

            {/* Content Container */}
            <DialogPrimitive.Content asChild forceMount>
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <DialogTitle className="sr-only">{memory.title}</DialogTitle>

                {/* Wrapper with perspective for 3D */}
                <div
                  className="flex items-center gap-6"
                  style={{ perspective: '2000px' }}
                >
                  {/* Left chevron */}
                  <motion.button
                    onClick={handlePrevious}
                    disabled={!hasPrevious || isFlipping}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                    variants={chevronVariants}
                    initial="idle"
                    whileHover={hasPrevious ? 'hover' : 'disabled'}
                    whileTap={hasPrevious ? 'tap' : 'disabled'}
                    aria-label="Previous memory"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>

                  {/* Book */}
                  <div
                    className="relative"
                    style={{
                      width: '968px',
                      height: '650px', // Fixed height for the book
                    }}
                  >
                    {/* Pages Layer (always visible) */}
                    <div className="absolute inset-0 rounded-2xl bg-sky-200 p-2 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]">
                      {/* Notebook tab */}
                      <div className="absolute -top-5 left-3 rounded-t-md bg-sky-200 px-3 py-0.5">
                        <span className="text-[10px] text-slate-600">
                          {memory.location?.buildingName || 'Memory'}
                        </span>
                      </div>

                      {/* Two-page spread */}
                      <div className="relative flex h-full gap-2">
                        {/* BASE LEFT PAGE (shows current/new content) */}
                        <div className={`${PAGE_BASE_STYLES} relative w-1/2`}>
                          {/* Date card */}
                          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                            <div>
                              <p className="text-xs font-normal text-skolaroid-blue">
                                WHEN
                              </p>
                              <p className="text-base font-medium text-black">
                                {dateInfo.dayOfWeek}, {dateInfo.month}{' '}
                                {dateInfo.dayNumber}
                              </p>
                              <p className="text-[8px] text-gray-400">
                                {dateInfo.uploadTime.replace(/:/g, '-')}
                              </p>
                            </div>
                            <div className="flex h-14 w-14 flex-col overflow-hidden rounded-md border border-slate-200 bg-gradient-to-b from-neutral-50/50 to-gray-400/50">
                              <div className="h-3 w-full rounded-t-md bg-skolaroid-blue" />
                              <div className="flex flex-1 items-center justify-center">
                                <span className="text-2xl font-medium text-black">
                                  {dateInfo.dayNumber}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Polaroid photo */}
                          <div className="flex flex-1 items-center justify-center">
                            <div className={polaroidWidth}>
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
                                    <span className="text-xs text-gray-400">
                                      No image
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Calendar week strip */}
                          <div className="flex items-center justify-center gap-0.5">
                            {dateInfo.calendarWeek.map((day) => (
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

                        {/* SPINE (rings) - positioned to overlap pages */}
                        <div className="pointer-events-none absolute left-1/2 top-0 z-30 flex h-full w-14 -translate-x-1/2 flex-col items-center justify-around py-4">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="relative flex h-4 w-14 items-center justify-center"
                            >
                              <div className="absolute left-0.5 h-3.5 w-3.5 rounded-full bg-black" />
                              <div className="absolute right-0.5 h-3.5 w-3.5 rounded-full bg-black" />
                              <div className="relative z-10 h-1.5 w-10 rounded bg-zinc-400" />
                            </div>
                          ))}
                        </div>

                        {/* BASE RIGHT PAGE (shows current/new content) */}
                        <div className={`${PAGE_BASE_STYLES} relative w-1/2`}>
                          {/* Author header */}
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

                          {/* Caption card */}
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
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h3 className="text-base font-medium text-black">
                                Comments
                              </h3>
                              <span className="rounded-lg bg-gray-200 px-2 py-0.5 text-sm font-medium text-black">
                                {commentCount}
                              </span>
                            </div>
                            <div className="flex max-h-32 flex-col gap-3 overflow-y-auto pr-1">
                              {mockComments.map((comment, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
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

                        {/* ANIMATED LEFT PAGE OVERLAY - shows cached/old content during PREV flip */}
                        {cachedMemory &&
                          cachedDateInfo &&
                          flipDirection === 'prev' && (
                            <motion.div
                              className="absolute left-0 top-0 h-full w-[calc(50%-4px)]"
                              style={{
                                transformStyle: 'preserve-3d',
                                transformOrigin: 'right center',
                                zIndex: 10,
                              }}
                              variants={leftPageFlipVariants}
                              initial="flat"
                              animate={isLeftPageFlipped ? 'flipped' : 'flat'}
                            >
                              {/* Front of flipping left page - shows cached/old content */}
                              <div
                                className={PAGE_FACE_STYLES}
                                style={{ backfaceVisibility: 'hidden' }}
                              >
                                {/* Date card - cached content */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                                  <div>
                                    <p className="text-xs font-normal text-skolaroid-blue">
                                      WHEN
                                    </p>
                                    <p className="text-base font-medium text-black">
                                      {cachedDateInfo.dayOfWeek},{' '}
                                      {cachedDateInfo.month}{' '}
                                      {cachedDateInfo.dayNumber}
                                    </p>
                                    <p className="text-[8px] text-gray-400">
                                      {cachedDateInfo.uploadTime.replace(
                                        /:/g,
                                        '-'
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex h-14 w-14 flex-col overflow-hidden rounded-md border border-slate-200 bg-gradient-to-b from-neutral-50/50 to-gray-400/50">
                                    <div className="h-3 w-full rounded-t-md bg-skolaroid-blue" />
                                    <div className="flex flex-1 items-center justify-center">
                                      <span className="text-2xl font-medium text-black">
                                        {cachedDateInfo.dayNumber}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Polaroid photo - cached content */}
                                <div className="flex flex-1 items-center justify-center">
                                  <div className={polaroidWidth}>
                                    {cachedMemory.mediaURL ? (
                                      <div className="bg-white p-2 pb-8 shadow-[0px_2px_8px_2px_rgba(0,0,0,0.15)]">
                                        <div className="relative h-72 w-full overflow-hidden bg-gray-50">
                                          <Image
                                            src={cachedMemory.mediaURL}
                                            alt={cachedMemory.title}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-white p-2 pb-8 shadow-[0px_2px_8px_2px_rgba(0,0,0,0.15)]">
                                        <div className="flex h-72 w-full items-center justify-center bg-gray-100">
                                          <span className="text-xs text-gray-400">
                                            No image
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Calendar week strip - cached content */}
                                <div className="flex items-center justify-center gap-0.5">
                                  {cachedDateInfo.calendarWeek.map((day) => (
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
                              {/* Back of flipping left page - shows NEW right content */}
                              <div
                                className={PAGE_FACE_STYLES}
                                style={{
                                  transform: 'rotateY(180deg)',
                                  backfaceVisibility: 'hidden',
                                }}
                              >
                                {/* Author header */}
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

                                {/* Caption card */}
                                <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-gray-100 p-5 shadow-[0px_1px_2px_0.5px_rgba(0,0,0,0.25)] outline outline-[3px] outline-white">
                                  <p className="text-center font-dancing text-2xl leading-relaxed text-slate-800">
                                    {memory.description ||
                                      'A memorable moment...'}
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
                                <div className="flex-1">
                                  <div className="mb-2 flex items-center gap-2">
                                    <h3 className="text-base font-medium text-black">
                                      Comments
                                    </h3>
                                    <span className="rounded-lg bg-gray-200 px-2 py-0.5 text-sm font-medium text-black">
                                      {commentCount}
                                    </span>
                                  </div>
                                  <div className="flex max-h-32 flex-col gap-3 overflow-y-auto pr-1">
                                    {mockComments.map((comment, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2"
                                      >
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
                            </motion.div>
                          )}

                        {/* ANIMATED RIGHT PAGE OVERLAY - shows cached/old content during NEXT flip */}
                        {cachedMemory && flipDirection === 'next' && (
                          <motion.div
                            className="absolute right-0 top-0 h-full w-[calc(50%-4px)]"
                            style={{
                              transformStyle: 'preserve-3d',
                              transformOrigin: 'left center',
                              zIndex: 10,
                            }}
                            variants={rightPageFlipVariants}
                            initial="flat"
                            animate={isRightPageFlipped ? 'flipped' : 'flat'}
                          >
                            {/* Front of flipping right page - shows cached/old content */}
                            <div
                              className={PAGE_FACE_STYLES}
                              style={{ backfaceVisibility: 'hidden' }}
                            >
                              {/* Author header */}
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

                              {/* Caption card - cached content */}
                              <div className="rounded-2xl bg-gradient-to-b from-slate-100 to-gray-100 p-5 shadow-[0px_1px_2px_0.5px_rgba(0,0,0,0.25)] outline outline-[3px] outline-white">
                                <p className="text-center font-dancing text-2xl leading-relaxed text-slate-800">
                                  {cachedMemory.description ||
                                    'A memorable moment...'}
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
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <h3 className="text-base font-medium text-black">
                                    Comments
                                  </h3>
                                  <span className="rounded-lg bg-gray-200 px-2 py-0.5 text-sm font-medium text-black">
                                    {commentCount}
                                  </span>
                                </div>
                                <div className="flex max-h-32 flex-col gap-3 overflow-y-auto pr-1">
                                  {mockComments.map((comment, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2"
                                    >
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
                            {/* Back of flipping right page - shows NEW left content */}
                            <div
                              className={PAGE_FACE_STYLES}
                              style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                              }}
                            >
                              {/* Date card */}
                              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                                <div>
                                  <p className="text-xs font-normal text-skolaroid-blue">
                                    WHEN
                                  </p>
                                  <p className="text-base font-medium text-black">
                                    {dateInfo.dayOfWeek}, {dateInfo.month}{' '}
                                    {dateInfo.dayNumber}
                                  </p>
                                  <p className="text-[8px] text-gray-400">
                                    {dateInfo.uploadTime.replace(/:/g, '-')}
                                  </p>
                                </div>
                                <div className="flex h-14 w-14 flex-col overflow-hidden rounded-md border border-slate-200 bg-gradient-to-b from-neutral-50/50 to-gray-400/50">
                                  <div className="h-3 w-full rounded-t-md bg-skolaroid-blue" />
                                  <div className="flex flex-1 items-center justify-center">
                                    <span className="text-2xl font-medium text-black">
                                      {dateInfo.dayNumber}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Polaroid photo */}
                              <div className="flex flex-1 items-center justify-center">
                                <div className={polaroidWidth}>
                                  {memory.mediaURL ? (
                                    <div className="bg-white p-2 pb-8 shadow-[0px_2px_8px_2px_rgba(0,0,0,0.15)]">
                                      <div className="relative h-72 w-full overflow-hidden bg-gray-50">
                                        <Image
                                          src={memory.mediaURL}
                                          alt={memory.title}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-white p-2 pb-8 shadow-[0px_2px_8px_2px_rgba(0,0,0,0.15)]">
                                      <div className="flex h-72 w-full items-center justify-center bg-gray-100">
                                        <span className="text-xs text-gray-400">
                                          No image
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Calendar week strip */}
                              <div className="flex items-center justify-center gap-0.5">
                                {dateInfo.calendarWeek.map((day) => (
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
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Covers Layer (visible during open/close animation) */}
                    {showCovers && (
                      <>
                        {/* Left cover */}
                        <motion.div
                          className="absolute left-0 top-0 h-full w-1/2 rounded-l-2xl bg-sky-200 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.3)]"
                          style={{
                            transformOrigin: 'right center',
                            transformStyle: 'preserve-3d',
                          }}
                          variants={coverLeftVariants}
                          initial="closed"
                          animate={animationPhase}
                        >
                          <div
                            className="flex h-full items-center justify-center rounded-l-2xl bg-sky-200"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-24 w-1 rounded-full bg-sky-300" />
                              <p className="text-xs text-sky-400">Memories</p>
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 rounded-r-2xl bg-sky-100"
                            style={{
                              transform: 'rotateY(180deg)',
                              backfaceVisibility: 'hidden',
                            }}
                          />
                        </motion.div>

                        {/* Right cover */}
                        <motion.div
                          className="absolute right-0 top-0 h-full w-1/2 rounded-r-2xl bg-sky-200 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.3)]"
                          style={{
                            transformOrigin: 'left center',
                            transformStyle: 'preserve-3d',
                          }}
                          variants={coverRightVariants}
                          initial="closed"
                          animate={animationPhase}
                        >
                          <div
                            className="flex h-full items-center justify-center rounded-r-2xl bg-sky-200"
                            style={{ backfaceVisibility: 'hidden' }}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-24 w-1 rounded-full bg-sky-300" />
                              <p className="text-xs text-sky-400">Book</p>
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 rounded-l-2xl bg-sky-100"
                            style={{
                              transform: 'rotateY(180deg)',
                              backfaceVisibility: 'hidden',
                            }}
                          />
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Right chevron */}
                  <motion.button
                    onClick={handleNext}
                    disabled={!hasNext || isFlipping}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur-sm transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                    variants={chevronVariants}
                    initial="idle"
                    whileHover={hasNext ? 'hover' : 'disabled'}
                    whileTap={hasNext ? 'tap' : 'disabled'}
                    aria-label="Next memory"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
