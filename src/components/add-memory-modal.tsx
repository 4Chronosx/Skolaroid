'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCreateMemory } from '@/lib/hooks/useCreateMemory';
import { MOCK_LOCATIONS } from '@/lib/mock-data';
import { createMemorySchema, type MemoryVisibility } from '@/lib/schemas';
import { Upload, MapPin, FileText, Eye, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

// =============================================================================
// TYPES
// =============================================================================

type Step = 'upload' | 'landmark' | 'details' | 'preview';

interface FormData {
  mediaFile: File | null;
  mediaPreviewUrl: string | null;
  locationId: string;
  title: string;
  description: string;
  tags: string[];
  visibility: MemoryVisibility;
}

interface AddMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STEPS: Step[] = ['upload', 'landmark', 'details', 'preview'];

const STEP_META: Record<Step, { label: string; icon: typeof Upload }> = {
  upload: { label: 'Upload', icon: Upload },
  landmark: { label: 'Landmark', icon: MapPin },
  details: { label: 'Details', icon: FileText },
  preview: { label: 'Preview', icon: Eye },
};

const VISIBILITY_OPTIONS: {
  value: MemoryVisibility;
  label: string;
  description: string;
}[] = [
  { value: 'PUBLIC', label: 'Public', description: 'Visible to everyone' },
  {
    value: 'PROGRAM_ONLY',
    label: 'Program Only',
    description: 'Visible to your program',
  },
  {
    value: 'BATCH_ONLY',
    label: 'Batch Only',
    description: 'Visible to your batch',
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Only you can see this',
  },
];

const INITIAL_FORM_DATA: FormData = {
  mediaFile: null,
  mediaPreviewUrl: null,
  locationId: '',
  title: '',
  description: '',
  tags: [],
  visibility: 'PUBLIC',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function AddMemoryModal({ open, onOpenChange }: AddMemoryModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createMemory, isPending } = useCreateMemory();

  const currentStepIndex = STEPS.indexOf(currentStep);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const selectedLocation = useMemo(
    () => MOCK_LOCATIONS.find((loc) => loc.id === formData.locationId),
    [formData.locationId]
  );

  // ---------------------------------------------------------------------------
  // File handling
  // ---------------------------------------------------------------------------

  const handleFileSelect = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      if (formData.mediaPreviewUrl) {
        URL.revokeObjectURL(formData.mediaPreviewUrl);
      }

      updateField('mediaFile', file);
      updateField('mediaPreviewUrl', URL.createObjectURL(file));
    },
    [formData.mediaPreviewUrl, updateField]
  );

  const handleRemoveFile = useCallback(() => {
    if (formData.mediaPreviewUrl) {
      URL.revokeObjectURL(formData.mediaPreviewUrl);
    }
    updateField('mediaFile', null);
    updateField('mediaPreviewUrl', null);
  }, [formData.mediaPreviewUrl, updateField]);

  // ---------------------------------------------------------------------------
  // Tag handling
  // ---------------------------------------------------------------------------

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim();
    if (!tag || formData.tags.includes(tag) || formData.tags.length >= 10)
      return;
    updateField('tags', [...formData.tags, tag]);
    setTagInput('');
  }, [tagInput, formData.tags, updateField]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      updateField(
        'tags',
        formData.tags.filter((t) => t !== tagToRemove)
      );
    },
    [formData.tags, updateField]
  );

  // ---------------------------------------------------------------------------
  // Step validation
  // ---------------------------------------------------------------------------

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'landmark' && !formData.locationId) {
      newErrors.locationId = 'Please select a landmark';
    }

    if (currentStep === 'details') {
      const result = createMemorySchema.safeParse({
        title: formData.title,
        description: formData.description || undefined,
        visibility: formData.visibility,
        locationId: formData.locationId,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      });

      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          if (field && typeof field === 'string') {
            newErrors[field] = issue.message;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return;
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  }, [validateCurrentStep, currentStepIndex]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  }, [currentStepIndex]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
    setCurrentStep('upload');
    setFormData(INITIAL_FORM_DATA);
    setTagInput('');
    setErrors({});
  }, [onOpenChange]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(() => {
    // Final validation before submitting
    const parsed = createMemorySchema.safeParse({
      title: formData.title,
      description: formData.description || undefined,
      visibility: formData.visibility,
      locationId: formData.locationId,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    });

    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field && typeof field === 'string') {
          newErrors[field] = issue.message;
        }
      }
      setErrors(newErrors);
      setCurrentStep('details');
      return;
    }

    // TODO: programBatchId should come from the authenticated user's session
    const MOCK_PROGRAM_BATCH_ID = '00000000-0000-0000-0000-000000000001';

    createMemory(
      { ...parsed.data, programBatchId: MOCK_PROGRAM_BATCH_ID },
      {
        onSuccess: () => {
          handleCancel();
        },
      }
    );
  }, [formData, createMemory, handleCancel]);

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderUploadStep = () => (
    <div className="flex flex-col items-center justify-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
      />

      {formData.mediaPreviewUrl ? (
        <div className="relative h-48 w-full">
          <Image
            src={formData.mediaPreviewUrl}
            alt="Preview"
            fill
            className="rounded-lg object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="mt-2 text-center text-xs text-gray-500">
            {formData.mediaFile?.name}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-skolaroid-blue hover:bg-gray-50"
        >
          <ImageIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">Click to browse your media</p>
          <p className="text-xs text-gray-400">Supports images and videos</p>
        </button>
      )}
    </div>
  );

  const renderLandmarkStep = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select a Landmark
      </label>
      {errors.locationId && (
        <p className="text-sm text-red-500">{errors.locationId}</p>
      )}
      <div className="space-y-2">
        {MOCK_LOCATIONS.map((location) => (
          <button
            key={location.id}
            type="button"
            onClick={() => updateField('locationId', location.id)}
            className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
              formData.locationId === location.id
                ? 'border-skolaroid-blue bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <MapPin
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                formData.locationId === location.id
                  ? 'text-skolaroid-blue'
                  : 'text-gray-400'
              }`}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {location.buildingName}
              </p>
              {location.description && (
                <p className="text-xs text-gray-500">{location.description}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Give your memory a title"
          maxLength={255}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Tell the story behind this memory..."
          className="h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-skolaroid-blue focus:outline-none"
          maxLength={5000}
        />
      </div>

      {/* Tags */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Tags ({formData.tags.length}/10)
        </label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Add a tag and press Enter"
            maxLength={50}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || formData.tags.length >= 10}
          >
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {formData.tags.map((tag) => (
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

      {/* Visibility */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Privacy
        </label>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3"
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={formData.visibility === option.value}
                onChange={() => updateField('visibility', option.value)}
                className="mt-0.5 h-4 w-4 text-skolaroid-blue"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {option.label}
                </span>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      {/* Media preview */}
      {formData.mediaPreviewUrl ? (
        <div className="relative h-32 w-full">
          <Image
            src={formData.mediaPreviewUrl}
            alt="Preview"
            fill
            className="rounded-lg object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          No media uploaded
        </div>
      )}

      {/* Location */}
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-skolaroid-blue" />
        <span className="font-medium">
          {selectedLocation?.buildingName ?? 'No location selected'}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {formData.title || 'Untitled'}
        </h3>
        {formData.description && (
          <p className="mt-1 text-sm text-gray-600">{formData.description}</p>
        )}
      </div>

      {/* Tags */}
      {formData.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Visibility */}
      <Badge variant="outline">
        {VISIBILITY_OPTIONS.find((v) => v.value === formData.visibility)?.label}
      </Badge>
    </div>
  );

  const STEP_RENDERERS: Record<Step, () => React.ReactNode> = {
    upload: renderUploadStep,
    landmark: renderLandmarkStep,
    details: renderDetailsStep,
    preview: renderPreviewStep,
  };

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  const isLastStep = currentStep === 'preview';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
        else onOpenChange(true);
      }}
    >
      <DialogContent
        className="flex h-[500px] max-w-2xl gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        {/* Tabs Sidebar */}
        <div className="flex w-48 flex-col border-r bg-gray-50">
          <div className="flex-1 p-6">
            <DialogTitle className="sr-only">Add Memory</DialogTitle>
            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const meta = STEP_META[step];
                const Icon = meta.icon;
                const isActive = currentStep === step;
                const isAccessible = index <= currentStepIndex;

                return (
                  <button
                    key={step}
                    onClick={() => isAccessible && setCurrentStep(step)}
                    disabled={!isAccessible}
                    className={`flex w-full items-center gap-2 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-skolaroid-blue'
                        : isAccessible
                          ? 'text-gray-500 hover:text-gray-700'
                          : 'cursor-not-allowed text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-px bg-gray-200" />

        {/* Content Area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {STEP_RENDERERS[currentStep]()}
          </div>

          {/* Footer */}
          <div className="flex justify-between border-t bg-white px-6 py-4">
            <div>
              {currentStepIndex > 0 && (
                <Button variant="ghost" onClick={handleBack}>
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={isLastStep ? handleSubmit : handleNext}
                disabled={isPending}
                className="bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
              >
                {isPending ? 'Submitting...' : isLastStep ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
