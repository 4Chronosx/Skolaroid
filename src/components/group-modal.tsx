'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  X,
  Users2,
  Plus,
  Link2,
  Lock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { useGroupToast } from '@/components/groups/GroupToast';
import { useUserGroups } from '@/lib/hooks/useUserGroups';

// ─── PROPS ──────────────────────────────────────────────────────────

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── COMPONENT ──────────────────────────────────────────────────────

export function GroupModal({ open, onOpenChange }: GroupModalProps) {
  const router = useRouter();
  const { data: groups = [], isLoading } = useUserGroups();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pasteInviteOpen, setPasteInviteOpen] = useState(false); // TODO: Implement paste invite link modal in future sprint
  const { showSuccess, ToastPortal } = useGroupToast();

  const handleCreated = () => {
    showSuccess('Group created successfully!');
  };

  const handleGroupClick = (groupId: string) => {
    onOpenChange(false);
    router.push(`/groups/${groupId}`);
  };

  const handlePasteInvite = () => {
    // TODO: Implement paste invite link functionality in future sprint
    console.log('Paste invite link clicked');
    setPasteInviteOpen(!pasteInviteOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-w-md gap-0 overflow-hidden p-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Your Groups</DialogTitle>

          <div className="flex w-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 pb-4 pt-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Groups
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {isLoading ? (
              /* Loading State */
              <div className="flex items-center justify-center px-6 py-12">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            ) : groups.length === 0 ? (
              /* Empty State */
              <div className="space-y-4 px-6 py-12 text-center">
                <Users2 size={48} className="mx-auto text-gray-300" />
                <h3 className="text-base font-semibold text-gray-700">
                  No groups yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create your first group to start sharing memories with your
                  batch or circle.
                </p>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="w-full bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
                >
                  Create Your First Group
                </Button>
              </div>
            ) : (
              /* Groups List */
              <>
                {/* Action buttons */}
                <div className="flex items-center gap-2 px-6 pb-3 pt-4">
                  <Button
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    className="gap-1.5 bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
                  >
                    <Plus size={14} />
                    Create Group
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePasteInvite}
                    className="gap-1.5"
                  >
                    <Link2 size={14} />
                    Paste Invite Link
                  </Button>
                </div>

                {/* Scrollable group list */}
                <div className="scrollbar-hide max-h-72 space-y-1 overflow-y-auto px-3 pb-3">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleGroupClick(group.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-skolaroid-blue/10 text-sm font-semibold text-skolaroid-blue">
                        {group.name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {group.name}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Lock size={12} className="shrink-0" />
                          <span>Private</span>
                          <span>·</span>
                          <span>{group._count.members} members</span>
                        </p>
                      </div>

                      {/* Chevron */}
                      <ChevronRight
                        size={16}
                        className="ml-auto shrink-0 text-gray-400"
                      />
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onOpenChange(false)}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={handleCreated}
      />

      {/* Toast Portal */}
      <ToastPortal />
    </>
  );
}
