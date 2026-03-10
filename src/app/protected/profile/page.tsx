'use client';

import { useUserAuth } from '@/lib/hooks/useUserAuth';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileBioCard } from '@/components/profile/ProfileBioCard';
import { ProfileContactCard } from '@/components/profile/ProfileContactCard';
import { ProfileAcademicCard } from '@/components/profile/ProfileAcademicCard';
import { ProfileActivityCard } from '@/components/profile/ProfileActivityCard';
import { ProfileSettingsCard } from '@/components/profile/ProfileSettingsCard';

export default function ProfilePage() {
  const { user, loading } = useUserAuth();

  if (loading) {
    return (
      <div className="flex w-full flex-1 flex-col gap-6">
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <ProfileHero user={user} />
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileBioCard />
        <ProfileContactCard />
        <ProfileAcademicCard />
        <ProfileActivityCard />
        <ProfileSettingsCard />
      </div>
    </div>
  );
}
