'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ContactRow {
  label: string;
  value?: string;
}

const contactRows: ContactRow[] = [
  { label: 'Phone' },
  { label: 'LinkedIn' },
  { label: 'Facebook' },
  { label: 'Other' },
];

export function ProfileContactCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {contactRows.map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground/70">
                {label}
              </span>
              <span className="text-sm text-muted-foreground">
                {value ?? 'Not provided'}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
