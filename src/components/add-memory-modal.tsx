'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Tab = 'upload' | 'caption' | 'privacy';

interface AddMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemoryModal({ open, onOpenChange }: AddMemoryModalProps) {
  const [currentTab, setCurrentTab] = useState<Tab>('upload');

  const tabs: Tab[] = ['upload', 'caption', 'privacy'];
  const tabLabels: Record<Tab, string> = {
    upload: 'Upload Media',
    caption: 'Add Caption',
    privacy: 'Privacy',
  };

  const handleNext = () => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving memory...');
    onOpenChange(false);
    setCurrentTab('upload');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCurrentTab('upload');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[500px] max-w-2xl gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        {/* Tabs Sidebar */}
        <div className="flex w-48 flex-col border-r bg-gray-50">
          <div className="flex-1 p-6">
            <DialogTitle className="sr-only">Add Memory</DialogTitle>
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
            {currentTab === 'upload' && (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Drag and drop your media here
                    </p>
                    <p className="text-xs text-gray-400">or click to browse</p>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'caption' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Caption
                </label>
                <textarea
                  placeholder="Add a caption for your memory..."
                  className="h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-skolaroid-blue focus:outline-none"
                />
              </div>
            )}

            {currentTab === 'privacy' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Privacy Settings
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      defaultChecked
                      className="h-4 w-4 text-skolaroid-blue"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      className="h-4 w-4 text-skolaroid-blue"
                    />
                    <span className="text-sm text-gray-700">Private</span>
                  </label>
                </div>
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
              onClick={currentTab === 'privacy' ? handleSave : handleNext}
              className="bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
            >
              {currentTab === 'privacy' ? 'Save' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
