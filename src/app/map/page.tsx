'use client';

import { MapComponent } from '@/components/map';
import { Header } from '@/components/header';

export default function MapPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Color Strip - Left Edge */}
        <div className="flex w-2.5 shrink-0 flex-col">
          <div className="flex-1 bg-[#8E1537]" />
          <div className="flex-1 bg-[#FFB81D]" />
          <div className="flex-1 bg-[#005740]" />
          <div className="flex-1 bg-[#7BC122]" />
          <div className="flex-1 bg-[#208CD4]" />
        </div>
        <div className="flex-1 overflow-hidden">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}
