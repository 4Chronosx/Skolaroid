'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTags } from '@/lib/hooks/useTags';
import { useUpdateMemoryTags } from '@/lib/hooks/useUpdateMemoryTags';
import { X } from 'lucide-react';

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
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: tagsData } = useTags();
  const { mutate: updateTags, isPending } = useUpdateMemoryTags();

  // Reset state when dialog opens with a (potentially different) memory
  useEffect(() => {
    if (open) {
      setTags(memory.tags?.map((t) => t.name) ?? []);
      setTagInput('');
      setShowSuggestions(false);
    }
  }, [open, memory.id, memory.tags]);

  const filteredSuggestions = useMemo(() => {
    const query = tagInput.trim().toLowerCase();
    if (!query) return [];
    const allTags = tagsData?.data ?? [];
    return allTags
      .filter(
        (t) => t.name.toLowerCase().includes(query) && !tags.includes(t.name)
      )
      .slice(0, 5);
  }, [tagInput, tagsData?.data, tags]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    updateTags(
      { memoryId: memory.id, tags },
      {
        onSuccess: () => {
          onOpenChange(false);
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
          {/* Tag input with autocomplete */}
          <div className="relative">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                placeholder="Add a tag and press Enter"
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                Add
              </Button>
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-white shadow-lg">
                {filteredSuggestions.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setTags((prev) => [...prev, tag.name]);
                      setTagInput('');
                      setShowSuggestions(false);
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tag count */}
          <p className="text-xs text-muted-foreground">{tags.length}/10 tags</p>

          {/* Current tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-0.5 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
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
