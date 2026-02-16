'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface BatchesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockBatches = [
  { id: '1', year: 2023, program: 'BSCS' },
  { id: '2', year: 2022, program: 'BSCS' },
  { id: '3', year: 2023, program: 'BSIT' },
  { id: '4', year: 2021, program: 'BSCS' },
];

export function BatchesModal({ open, onOpenChange }: BatchesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(mockBatches[0]);

  const filteredBatches = mockBatches.filter(
    (batch) =>
      batch.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.year.toString().includes(searchQuery)
  );

  const handleCancel = () => {
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleNext = () => {
    // TODO: Implement next/save logic
    console.log('Next clicked for batch:', selectedBatch);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[500px] max-w-2xl gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Batches</DialogTitle>

        {/* Sidebar */}
        <div className="flex w-48 flex-col border-r bg-gray-50">
          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-2 text-sm placeholder-gray-400 focus:border-skolaroid-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Batch List */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      selectedBatch.id === batch.id
                        ? 'bg-skolaroid-blue/10 text-skolaroid-blue'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {batch.program} {batch.year}
                  </button>
                ))
              ) : (
                <p className="px-2 py-4 text-center text-xs text-gray-400">
                  No batches found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-px bg-gray-200" />

        {/* Content Area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                {selectedBatch.program} {selectedBatch.year}
              </h3>
              <p className="text-sm text-gray-500">
                Manage batch {selectedBatch.program} {selectedBatch.year}.
              </p>
            </div>
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
