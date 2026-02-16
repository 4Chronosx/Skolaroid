'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

type Tab = 'uploads' | 'users' | 'admins';

interface GroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockGroups = [
  { id: '1', name: 'BSCS 2023' },
  { id: '2', name: 'BSIT 2022' },
];

export function GroupModal({ open, onOpenChange }: GroupModalProps) {
  const [currentTab, setCurrentTab] = useState<Tab>('uploads');
  const [groupSelectorOpen, setGroupSelectorOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]);

  const tabs: Tab[] = ['uploads', 'users', 'admins'];
  const tabLabels: Record<Tab, string> = {
    uploads: 'Uploads',
    users: 'Users',
    admins: 'Admins',
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCurrentTab('uploads');
    setGroupSelectorOpen(false);
  };

  const handleNext = () => {
    // TODO: Implement next/save logic
    console.log('Next clicked on tab:', currentTab);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[500px] max-w-2xl gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Group</DialogTitle>

        {/* Tabs Sidebar */}
        <div className="relative flex w-48 flex-col border-r bg-gray-50">
          {/* Group Selector */}
          <div className="relative border-b p-4">
            <button
              onClick={() => setGroupSelectorOpen(!groupSelectorOpen)}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100"
            >
              <span className="truncate">{selectedGroup.name}</span>
              {groupSelectorOpen ? (
                <ChevronUp size={16} className="shrink-0 text-gray-500" />
              ) : (
                <ChevronDown size={16} className="shrink-0 text-gray-500" />
              )}
            </button>

            {/* Floating dropdown */}
            {groupSelectorOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setGroupSelectorOpen(false)}
                />
                <div className="absolute left-2 right-2 top-full z-20 rounded-md border bg-white py-1 shadow-lg">
                  {mockGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setSelectedGroup(group);
                        setGroupSelectorOpen(false);
                      }}
                      className={`block w-full px-3 py-1.5 text-left text-sm transition-colors ${
                        selectedGroup.id === group.id
                          ? 'bg-skolaroid-blue/10 text-skolaroid-blue'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {group.name}
                    </button>
                  ))}
                  <div className="my-1 border-t" />
                  <button
                    onClick={() => {
                      // TODO: Implement create new group
                      console.log('Create new group');
                    }}
                    className="flex w-full items-center gap-1.5 px-3 py-1.5 text-sm text-skolaroid-blue transition-colors hover:bg-skolaroid-blue/10"
                  >
                    <Plus size={14} />
                    Create New
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tab List */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab)}
                  className={`block w-full text-left text-sm font-medium transition-colors ${
                    currentTab === tab
                      ? 'text-skolaroid-blue'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-px bg-gray-200" />

        {/* Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentTab === 'uploads' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Uploads</h3>
                <p className="text-sm text-gray-500">
                  Manage uploads for {selectedGroup.name}.
                </p>
              </div>
            )}

            {currentTab === 'users' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Users</h3>
                <p className="text-sm text-gray-500">
                  Manage users in {selectedGroup.name}.
                </p>
              </div>
            )}

            {currentTab === 'admins' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Admins</h3>
                <p className="text-sm text-gray-500">
                  Manage admins for {selectedGroup.name}.
                </p>
              </div>
            )}
          </div>

          {/* Footer with Buttons */}
          <div className="flex justify-end gap-3 border-t bg-white px-6 py-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              className="bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
