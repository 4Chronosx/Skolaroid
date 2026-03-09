'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link2, Mail, Copy, Check } from 'lucide-react';

interface InviteMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  groupId: string;
  showSuccess: (message: string) => void;
}

export function InviteMembersModal({
  open,
  onOpenChange,
  groupName,
  groupId,
  showSuccess,
}: InviteMembersModalProps) {
  const [emails, setEmails] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // TODO: Replace with real invite link generation via API
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${groupId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      showSuccess('Invite link copied!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback: select the text for manual copy
    }
  };

  const handleSendInvites = () => {
    if (!emails.trim()) return;
    // TODO: API call to send email invites
    showSuccess('Invitations sent!');
    setEmails('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setEmails('');
    setLinkCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        className="max-w-sm gap-0 overflow-hidden rounded-2xl border-gray-100 p-0 shadow-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Invite Members to {groupName}
        </DialogTitle>

        <div className="flex flex-col">
          {/* Header */}
          <div className="px-6 pb-1 pt-6">
            <h2 className="text-base font-semibold text-gray-900">
              Invite Members
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Share a link or invite people by email.
            </p>
          </div>

          {/* Invite Link */}
          <div className="space-y-2 px-6 pt-4">
            <label className="text-xs font-medium text-gray-500">
              Invite Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                <Link2 size={14} className="shrink-0 text-gray-400" />
                <span className="truncate text-xs text-gray-600">
                  {inviteLink}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 active:scale-[0.96]"
                aria-label="Copy invite link"
              >
                {linkCopied ? (
                  <Check size={15} className="text-green-500" />
                ) : (
                  <Copy size={15} />
                )}
              </button>
            </div>
          </div>

          {/* Email Invites */}
          <div className="space-y-2 px-6 pt-4">
            <label className="text-xs font-medium text-gray-500">
              Invite by Email
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                className="rounded-xl border-gray-100 bg-gray-50 pl-9 text-xs"
                placeholder="email@example.com, comma separated"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 pb-6 pt-5">
            <button
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvites}
              disabled={!emails.trim()}
              className={`rounded-xl bg-skolaroid-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-skolaroid-blue/90 active:scale-[0.98] ${
                !emails.trim() ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              Send Invites
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
