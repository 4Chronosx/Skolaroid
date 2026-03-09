'use client';

import { TagInput } from '@/components/tag-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCreateMemory } from '@/lib/hooks/useCreateMemory';
import { useLocations } from '@/lib/hooks/useLocations';
import {
  createMemorySchema,
  MAX_TAGS,
  VISIBILITY_LABELS,
  type MemoryVisibility,
} from '@/lib/schemas';
import {
  Eye,
  FileText,
  ImageIcon,
  MapPin,
  Upload,
  X,
  Calendar,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCreateCustomLocation } from '@/lib/hooks/useCreateCustomLocation';
import type { MapLocationSelection } from '@/lib/types/map';

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
  /** Optional era (decade start year) for context display, e.g. 2020. */
  defaultEra?: number | null;
  /** Callback to enter map location selection mode. */
  onRequestMapSelection?: (
    mode: 'landmark' | 'custom',
    onSelect: (selection: MapLocationSelection) => void
  ) => void;
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
  {
    value: 'PUBLIC',
    label: VISIBILITY_LABELS.PUBLIC,
    description: 'Visible to everyone',
  },
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
    label: VISIBILITY_LABELS.PRIVATE,
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

export function AddMemoryModal({
  open,
  onOpenChange,
  defaultEra,
  onRequestMapSelection,
}: AddMemoryModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedLocationName, setSelectedLocationName] = useState<
    string | null
  >(null);

  const { mutate: createMemory, isPending } = useCreateMemory();
  const { data: locationsData, isLoading: locationsLoading } = useLocations();
  const { mutateAsync: createCustomLocation, isPending: isCreatingLocation } =
    useCreateCustomLocation();
  const locations = useMemo(
    () => locationsData?.data ?? [],
    [locationsData?.data]
  );

  const currentStepIndex = STEPS.indexOf(currentStep);

  // ---------------------------------------------------------------------------
  // Cleanup Object URLs on unmount to prevent memory leaks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (formData.mediaPreviewUrl) {
        URL.revokeObjectURL(formData.mediaPreviewUrl);
      }
    };
    // Only run cleanup on unmount — intentionally excluding formData.mediaPreviewUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    () => locations.find((loc) => loc.id === formData.locationId),
    [locations, formData.locationId]
  );

  /** Build the input shape expected by createMemorySchema from current form state. */
  const buildSchemaInput = useCallback(
    () => ({
      title: formData.title,
      description: formData.description || undefined,
      visibility: formData.visibility,
      locationId: formData.locationId,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }),
    [
      formData.title,
      formData.description,
      formData.visibility,
      formData.locationId,
      formData.tags,
    ]
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

      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        mediaFile: file,
        mediaPreviewUrl: previewUrl,
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next['mediaFile'];
        delete next['mediaPreviewUrl'];
        return next;
      });
    },
    [formData.mediaPreviewUrl]
  );

  const handleRemoveFile = useCallback(() => {
    if (formData.mediaPreviewUrl) {
      URL.revokeObjectURL(formData.mediaPreviewUrl);
    }
    updateField('mediaFile', null);
    updateField('mediaPreviewUrl', null);
  }, [formData.mediaPreviewUrl, updateField]);

  // ---------------------------------------------------------------------------
  // Step validation
  // ---------------------------------------------------------------------------

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'landmark' && !formData.locationId) {
      newErrors.locationId = 'Please select a landmark';
    }

    if (currentStep === 'details') {
      const detailsOnly = createMemorySchema.pick({
        title: true,
        description: true,
        visibility: true,
        tags: true,
      });
      const result = detailsOnly.safeParse(buildSchemaInput());

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
    if (Object.keys(newErrors).length > 0) {
      console.log('[AddMemoryModal] Validation errors:', newErrors);
    }
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData.locationId, buildSchemaInput]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleNext = useCallback(() => {
    console.log(
      '[AddMemoryModal] attempting to go to next step from',
      currentStep
    );
    if (!validateCurrentStep()) return;
    if (currentStepIndex < STEPS.length - 1) {
      const next = STEPS[currentStepIndex + 1];
      console.log('[AddMemoryModal] stepping to', next);
      setCurrentStep(next);
    }
  }, [validateCurrentStep, currentStepIndex, currentStep]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  }, [currentStepIndex]);

  const handleCancel = useCallback(() => {
    if (formData.mediaPreviewUrl) {
      URL.revokeObjectURL(formData.mediaPreviewUrl);
    }
    onOpenChange(false);
    setCurrentStep('upload');
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setShowConfirmation(false);
    setHasAgreed(false);
    setSelectedLocationName(null);
  }, [onOpenChange, formData.mediaPreviewUrl]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = useCallback(() => {
    console.log(
      '[AddMemoryModal] handleSubmit triggered, current data:',
      buildSchemaInput()
    );
    const parsed = createMemorySchema.safeParse(buildSchemaInput());

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

    setShowConfirmation(true);
  }, [buildSchemaInput]);

  const handleConfirmedSubmit = useCallback(() => {
    if (!hasAgreed) return;

    const parsed = createMemorySchema.safeParse(buildSchemaInput());
    if (!parsed.success) return;

    const MOCK_PROGRAM_BATCH_ID = '50000000-0000-4000-8000-000000000001';

    createMemory(
      {
        ...parsed.data,
        programBatchId: MOCK_PROGRAM_BATCH_ID,
        mediaFile: formData.mediaFile ?? undefined,
      },
      {
        onSuccess: () => {
          handleCancel();
        },
        onError: (err) => console.error('create failed', err),
      }
    );
  }, [
    buildSchemaInput,
    createMemory,
    handleCancel,
    hasAgreed,
    formData.mediaFile,
  ]);

  // ---------------------------------------------------------------------------
  // Map selection handler
  // ---------------------------------------------------------------------------

  const handleMapSelection = useCallback(
    async (selection: MapLocationSelection) => {
      if (selection.mode === 'landmark' && selection.locationId) {
        updateField('locationId', selection.locationId);
        setSelectedLocationName(
          selection.landmark?.name ?? 'Selected Landmark'
        );
      } else if (selection.mode === 'custom' && selection.customLocation) {
        try {
          const result = await createCustomLocation({
            buildingName: selection.customLocation.buildingName,
            latitude: selection.customLocation.latitude,
            longitude: selection.customLocation.longitude,
          });
          updateField('locationId', result.data.id);
          setSelectedLocationName(result.data.buildingName);
        } catch (err) {
          console.error(
            '[AddMemoryModal] Failed to create custom location:',
            err
          );
          setErrors((prev) => ({
            ...prev,
            locationId: 'Failed to create location. Please try again.',
          }));
        }
      }
    },
    [updateField, createCustomLocation]
  );

  const handleSelectOnMap = useCallback(
    (mode: 'landmark' | 'custom') => {
      onRequestMapSelection?.(mode, handleMapSelection);
    },
    [onRequestMapSelection, handleMapSelection]
  );

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderUploadStep = () => (
    <div className="flex flex-col items-center justify-center gap-4">
      {defaultEra != null && (
        <div className="flex w-full items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
          <Calendar className="h-4 w-4 text-sky-600" />
          <span className="text-sm text-sky-700">
            Adding to the <span className="font-semibold">{defaultEra}s</span>{' '}
            era
          </span>
        </div>
      )}
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
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Select a Location
      </label>
      {errors.locationId && (
        <p className="text-sm text-red-500">{errors.locationId}</p>
      )}

      {/* Selected location display */}
      {formData.locationId && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            {selectedLocationName ??
              selectedLocation?.buildingName ??
              'Location selected'}
          </span>
          <button
            type="button"
            onClick={() => {
              updateField('locationId', '');
              setSelectedLocationName(null);
            }}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Map Selection Buttons */}
      {onRequestMapSelection && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelectOnMap('landmark')}
            className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-skolaroid-blue bg-blue-50/50 p-4 text-left transition-colors hover:bg-blue-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-skolaroid-blue text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-skolaroid-blue">
                Select Landmark on Map
              </p>
              <p className="text-xs text-gray-500">
                Click a landmark directly on the interactive map
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectOnMap('custom')}
            className="flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50/50 p-4 text-left transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-500 text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Pinpoint Custom Location
              </p>
              <p className="text-xs text-gray-500">
                Click anywhere on the map to drop a pin
              </p>
            </div>
          </button>
        </div>
      )}

      {/* List Selection Fallback */}
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Or select from list
        </p>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {locationsLoading && (
            <p className="text-sm text-gray-400">Loading landmarks…</p>
          )}
          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => {
                updateField('locationId', location.id);
                setSelectedLocationName(location.buildingName);
              }}
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
                  <p className="text-xs text-gray-500">
                    {location.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
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
          Tags ({formData.tags.length}/{MAX_TAGS})
        </label>
        <TagInput
          tags={formData.tags}
          onTagsChange={(newTags) => updateField('tags', newTags)}
        />
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
    <>
      {/* Confirmation Modal */}
      <Dialog
        open={showConfirmation}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowConfirmation(false);
            setHasAgreed(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Confirm Submission
          </DialogTitle>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm leading-relaxed text-gray-700">
                By submitting this content, you confirm that:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-skolaroid-blue">•</span>
                  <span>You have the legal right to share this content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-skolaroid-blue">•</span>
                  <span>
                    The content does not infringe on any intellectual property
                    rights
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-skolaroid-blue">•</span>
                  <span>
                    You agree to our content policy and community guidelines
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-skolaroid-blue">•</span>
                  <span>
                    The content is appropriate and does not violate any laws or
                    regulations
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-3 rounded-lg border-2 border-gray-300 p-4">
              <Checkbox
                id="agree-terms"
                checked={hasAgreed}
                onCheckedChange={(checked) => setHasAgreed(checked === true)}
                className="mt-0.5"
              />
              <label
                htmlFor="agree-terms"
                className="cursor-pointer text-sm font-medium leading-relaxed text-gray-900"
              >
                I confirm that I have read and agree to all of the above terms
                and conditions
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                setHasAgreed(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmedSubmit}
              disabled={!hasAgreed || isPending}
              className="bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
            >
              {isPending ? 'Submitting...' : 'Confirm & Submit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Add Memory Modal */}
      <Dialog
        open={open && !showConfirmation}
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
                  disabled={isPending || isCreatingLocation}
                  className="bg-skolaroid-blue text-white hover:bg-skolaroid-blue/90"
                >
                  {isPending
                    ? 'Submitting...'
                    : isCreatingLocation
                      ? 'Creating location...'
                      : isLastStep
                        ? 'Submit'
                        : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
