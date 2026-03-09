'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Copy, Check } from 'lucide-react';

interface ShareGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  groupId: string;
  showSuccess: (message: string) => void;
}

export function ShareGroupModal({
  open,
  onOpenChange,
  groupName,
  groupId,
  showSuccess,
}: ShareGroupModalProps) {
  const [copied, setCopied] = useState(false);

  // TODO: Replace with real shareable link via API
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/groups/${groupId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      showSuccess('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClose = () => {
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        className="max-w-xs gap-0 overflow-hidden rounded-2xl border-gray-100 p-0 shadow-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Share {groupName}</DialogTitle>

        <div className="flex flex-col">
          <div className="px-6 pb-1 pt-6">
            <h2 className="text-base font-semibold text-gray-900">
              Share Group
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Copy the link to share this group.
            </p>
          </div>

          <div className="px-6 pt-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate text-xs text-gray-600">
                {shareLink}
              </span>
              <button
                onClick={handleCopy}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 active:scale-[0.96]"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end px-6 pb-6 pt-5">
            <button
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
