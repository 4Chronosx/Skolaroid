'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const mockActivity = [
  {
    date: 'Feb 28, 2026',
    title: 'Sunset Watch with Blockmates',
    location: 'Amphitheater',
  },
  { date: 'Feb 14, 2026', title: 'Cultural Night', location: 'Sunset Garden' },
  { date: 'Jan 30, 2026', title: 'Block Photo at the Oval', location: 'Oval' },
];

export function ProfileActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {mockActivity.map(({ date, title, location }) => (
            <li key={title} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                {date} · {location}
              </span>
              <span className="text-sm font-medium text-foreground/80">
                {title}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs italic text-muted-foreground">
          Activity feed coming soon.
        </p>
      </CardContent>
    </Card>
  );
}
