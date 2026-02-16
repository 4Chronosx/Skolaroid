'use client';

import { MapComponent } from '@/components/map';
import { Header } from '@/components/header';

export default function MapPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex-1 pt-16">
        <MapComponent />
      </div>
    </div>
  );
}
