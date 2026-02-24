'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/tag-input';
import { useUpdateMemoryTags } from '@/lib/hooks/useUpdateMemoryTags';
import { MAX_TAGS } from '@/lib/schemas';

interface EditTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory: {
    id: string;
    title: string;
    tags?: { id: string; name: string }[];
  };
}

export function EditTagsDialog({
  open,
  onOpenChange,
  memory,
}: EditTagsDialogProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutate: updateTags, isPending } = useUpdateMemoryTags();

  // Reset state when dialog opens with a (potentially different) memory
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTags(memory.tags?.map((t) => t.name) ?? []);
      setError(null);
    }
  }, [open, memory.id, memory.tags]);

  const handleSave = () => {
    setError(null);
    updateTags(
      { memoryId: memory.id, tags },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
        onError: (err) => {
          setError(err.message);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
          <DialogDescription className="truncate">
            {memory.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <TagInput tags={tags} onTagsChange={setTags} />

          {/* Tag count */}
          <p className="text-xs text-muted-foreground">
            {tags.length}/{MAX_TAGS} tags
          </p>

          {/* Error message */}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
