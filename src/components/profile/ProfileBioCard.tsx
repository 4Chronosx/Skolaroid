'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function ProfileBioCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About Me</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-dashed bg-muted/40 px-4 py-6 text-center">
          <p className="text-sm italic text-muted-foreground">
            No bio added yet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
