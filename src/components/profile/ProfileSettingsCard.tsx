'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ProfileSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Account Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="w-fit cursor-not-allowed opacity-50"
          >
            Change Password
          </Button>
          <p className="text-xs text-muted-foreground">
            Password change is not available yet.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="w-fit cursor-not-allowed border-destructive/50 text-destructive opacity-50 hover:bg-transparent"
          >
            Delete Account
          </Button>
          <p className="text-xs text-muted-foreground">
            Account deletion is not available yet.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
