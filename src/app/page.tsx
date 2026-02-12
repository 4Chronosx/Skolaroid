'use client';

import { useState, useRef, useEffect } from 'react';
import { BatchCard } from '@/components/batch-card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/sign-up-form';

const batches = [
  {
    year: 2020,
    message: 'We survived online classes! 💻',
    position: 'absolute top-40 left-40',
  },
  {
    year: 2021,
    message: 'Zoom University graduates! 🎓',
    position: 'absolute top-40 left-1/3',
  },
  {
    year: 2022,
    message: 'Back to campus vibes! 🏛️',
    position: 'absolute top-1/2 left-48 -translate-y-1/2',
  },
  {
    year: 2023,
    message: 'Hey! We just graduated 🎉',
    position: 'absolute top-32 right-56',
  },
  {
    year: 2024,
    message: 'Making memories together 📸',
    position: 'absolute top-64 right-40',
  },
  {
    year: 2025,
    message: 'Living our best college life! ✨',
    position: 'absolute bottom-40 right-56',
  },
  {
    year: 2026,
    message: 'First day jitters! 🎒',
    position: 'absolute bottom-40 left-48',
  },
];

// Sample polaroid images for the drawer
const polaroids = [
  { id: 1, color: 'bg-red-100' },
  { id: 2, color: 'bg-yellow-100' },
  { id: 3, color: 'bg-green-100' },
  { id: 4, color: 'bg-blue-100' },
  { id: 5, color: 'bg-purple-100' },
  { id: 6, color: 'bg-pink-100' },
  { id: 7, color: 'bg-orange-100' },
  { id: 8, color: 'bg-indigo-100' },
];

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !drawerContentRef.current) return;
      e.preventDefault();
      const y = e.pageY;
      const walk = (startY - y) * 2;
      drawerContentRef.current.scrollTop = scrollTop + walk;
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
  }, [isDragging, startY, scrollTop]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!drawerContentRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY);
    setScrollTop(drawerContentRef.current.scrollTop);
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Auth Buttons - Fixed top right */}
      <div className="fixed right-5 top-3 z-50 flex items-center gap-3">
        <button
          onClick={() => setLoginOpen(true)}
          className="px-3 py-2 text-xs transition hover:opacity-70"
        >
          Log In
        </button>
        <button
          onClick={() => setSignUpOpen(true)}
          className="rounded-md bg-skolaroid-blue px-4 py-2 text-xs text-white transition hover:bg-blue-700"
        >
          Sign Up
        </button>
      </div>

      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <LoginForm
            onSwitchToSignUp={() => {
              setLoginOpen(false);
              setSignUpOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog open={signUpOpen} onOpenChange={setSignUpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <SignUpForm
            onSwitchToLogin={() => {
              setSignUpOpen(false);
              setLoginOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Expandable Left Drawer */}
      <div
        className={`fixed left-0 top-0 z-40 flex h-screen transition-all duration-300 ease-in-out ${
          drawerOpen ? 'w-[600px]' : 'w-2.5'
        }`}
      >
        {/* Drawer Content - Polaroid Grid */}
        <div
          ref={drawerContentRef}
          onMouseDown={handleMouseDown}
          className={`scrollbar-hide h-screen overflow-y-auto bg-white transition-all duration-300 ease-in-out ${
            drawerOpen ? 'w-[calc(100%-10px)] opacity-100' : 'w-0 opacity-0'
          } ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {drawerOpen && (
            <div className="p-4 pt-8">
              {/* Polaroid Stack */}
              <div className="relative flex flex-col space-y-[-140px] pb-32 pl-12">
                {polaroids.map((polaroid, index) => {
                  const rotations = [
                    'rotate-[-8deg]',
                    'rotate-[5deg]',
                    'rotate-[-3deg]',
                    'rotate-[7deg]',
                    'rotate-[-6deg]',
                    'rotate-[4deg]',
                    'rotate-[-5deg]',
                    'rotate-[6deg]',
                  ];
                  const offsets = [
                    'ml-[20px]',
                    'ml-[150px]',
                    'ml-[-10px]',
                    'ml-[100px]',
                    'ml-[50px]',
                    'ml-[180px]',
                    'ml-[10px]',
                    'ml-[120px]',
                  ];
                  return (
                    <div
                      key={polaroid.id}
                      className={`relative transform transition-all hover:z-50 hover:rotate-0 hover:scale-110 ${rotations[index]} ${offsets[index]}`}
                      style={{ zIndex: index }}
                    >
                      {/* Polaroid Frame */}
                      <div
                        className={`h-96 w-80 ${polaroid.color} flex items-center justify-center shadow-xl`}
                      >
                        <span className="text-sm text-gray-400">Photo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Color Strip - Right Border */}
        <div className="flex h-screen w-2.5 flex-shrink-0 flex-col">
          <div className="flex-1 bg-[#8E1537]" />
          <div className="flex-1 bg-[#FFB81D]" />
          <div className="flex-1 bg-[#005740]" />
          <div className="flex-1 bg-[#7BC122]" />
          <div className="flex-1 bg-[#208CD4]" />
        </div>
      </div>

      {/* Overlay - Click to close drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close drawer overlay"
        />
      )}

      {/* Content Container - Shifts right when drawer opens */}
      <div
        className={`fixed inset-0 z-10 transition-all duration-300 ease-in-out ${
          drawerOpen ? 'ml-[600px]' : 'ml-0'
        }`}
      >
        {/* Batch Cards - Scattered Layout */}
        <div className="pointer-events-none">
          {batches.map((batch) => (
            <BatchCard
              key={batch.year}
              year={batch.year}
              message={batch.message}
              position={batch.position}
            />
          ))}
        </div>

        {/* Hero Section - Centered */}
        <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="!text-5xl font-normal tracking-tight text-gray-800 dark:text-gray-100 md:text-4xl lg:text-5xl">
            turn your memories
            <br />
            into{' '}
            <span className="font-dancing !text-6xl text-skolaroid-blue">
              Skolaroids
            </span>
          </h1>

          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="group relative h-16 w-40 overflow-hidden rounded-[10px] outline outline-1 outline-neutral-300 transition-all"
            aria-label="Explore Skolaroid"
          >
            <div className="absolute left-0 top-0 h-16 w-40 rounded-[5px] bg-gradient-to-b from-neutral-50/50 to-gray-400/50 transition-all group-hover:bg-skolaroid-blue group-active:bg-skolaroid-blue" />
            <div className="relative flex h-16 w-40 items-center justify-center text-center font-['Inter'] text-lg font-medium text-neutral-700 transition-colors group-hover:text-white group-active:text-white">
              {drawerOpen ? 'Close' : 'Explore'}
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
