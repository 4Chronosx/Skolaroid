'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { UserMinus } from 'lucide-react';

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  memberName,
  isLoading,
  onConfirm,
}: RemoveMemberDialogProps) {
  const handleClose = () => {
    if (!isLoading) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        className="max-w-xs gap-0 overflow-hidden rounded-2xl border-gray-100 p-0 shadow-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Remove Member</DialogTitle>

        <div className="flex flex-col items-center px-6 pb-6 pt-7 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <UserMinus size={18} className="text-red-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Remove Member?
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
            Are you sure you want to remove{' '}
            <span className="font-medium text-gray-600">{memberName}</span> from
            this group? They will need a new invite to rejoin.
          </p>

          <div className="mt-5 flex w-full gap-2">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
