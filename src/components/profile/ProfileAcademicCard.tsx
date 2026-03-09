'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const academicRows = [
  { label: 'Student ID', value: '—' },
  { label: 'Program', value: '—' },
  { label: 'Batch', value: '—' },
  { label: 'Status', value: 'Student' },
];

export function ProfileAcademicCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Academic Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {academicRows.map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-foreground/70">
                {label}
              </span>
              <span className="text-sm text-muted-foreground">{value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
