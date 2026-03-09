'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LogOut } from 'lucide-react';

interface LeaveGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onConfirmLeave: () => void;
}

export function LeaveGroupModal({
  open,
  onOpenChange,
  groupName,
  onConfirmLeave,
}: LeaveGroupModalProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        className="max-w-xs gap-0 overflow-hidden rounded-2xl border-gray-100 p-0 shadow-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Leave {groupName}</DialogTitle>

        <div className="flex flex-col items-center px-6 pb-6 pt-7 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <LogOut size={18} className="text-red-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Leave Group?
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-400">
            Are you sure you want to leave{' '}
            <span className="font-medium text-gray-600">{groupName}</span>?
            You&apos;ll need a new invite to rejoin.
          </p>

          <div className="mt-5 flex w-full gap-2">
            <button
              onClick={handleClose}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirmLeave();
                handleClose();
              }}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 active:scale-[0.98]"
            >
              Leave
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
