'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { type Group, MOCK_GROUPS } from '@/lib/types/group';
import {
  GroupSwitcher,
  GroupDetailView,
  CreateGroupModal,
  useGroupToast,
} from '@/components/groups';

interface GroupPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupPanel({ open, onOpenChange }: GroupPanelProps) {
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(
    MOCK_GROUPS[0] ?? null
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { showSuccess, ToastPortal } = useGroupToast();

  const handleGroupCreated = useCallback(
    (newGroup: Group) => {
      setGroups((prev) => [newGroup, ...prev]);
      setSelectedGroup(newGroup);
      showSuccess('Group created successfully!');
    },
    [showSuccess]
  );

  const handleGroupDeleted = useCallback(
    (groupId: string) => {
      setGroups((prev) => {
        const updated = prev.filter((g) => g.id !== groupId);
        // Switch to first remaining group or null
        setSelectedGroup(updated[0] ?? null);
        return updated;
      });
      showSuccess('Group has been deleted.');
    },
    [showSuccess]
  );

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex h-[85vh] w-[500px] max-w-[90vw] flex-col gap-0 overflow-hidden rounded-2xl border-gray-100 p-0 shadow-2xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Groups</DialogTitle>

          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <GroupSwitcher
              groups={groups}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              onCreateGroup={() => setCreateModalOpen(true)}
            />
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-hidden">
            {selectedGroup ? (
              <GroupDetailView
                group={selectedGroup}
                onGroupDeleted={handleGroupDeleted}
                showSuccess={showSuccess}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-gray-300"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  No groups yet
                </h3>
                <p className="mt-1.5 text-sm text-gray-500">
                  Create your first group to start sharing memories with your
                  batch.
                </p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-5 rounded-xl bg-skolaroid-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-skolaroid-blue/90 active:scale-[0.98]"
                >
                  Create Group
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested Create Group Modal */}
      <CreateGroupModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={handleGroupCreated}
      />

      <ToastPortal />
    </>
  );
}
