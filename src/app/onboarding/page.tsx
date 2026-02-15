'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BatchSelectorModal } from '@/components/onboarding/batch-selector-modal';
import { CourseSelectorModal } from '@/components/onboarding/course-selector-modal';

interface OnboardingStep {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
}

export default function OnboardingPage() {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'verify',
      title: 'Verify your identity',
      icon: '👤',
      completed: false,
    },
    { id: 'batch', title: 'Select your batch', icon: '👥', completed: false },
    { id: 'course', title: 'Select your course', icon: '📚', completed: false },
    {
      id: 'memory',
      title: 'Upload your first memory',
      icon: '🔒',
      completed: false,
    },
  ]);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);

  const toggleStep = (stepId: string) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const handleStepClick = (stepId: string) => {
    if (stepId === 'batch') {
      setBatchModalOpen(true);
    } else if (stepId === 'course') {
      setCourseModalOpen(true);
    }
  };

  const handleBatchSelect = () => {
    setSteps(
      steps.map((step) =>
        step.id === 'batch' ? { ...step, completed: true } : step
      )
    );
  };

  const handleCourseSelect = () => {
    setSteps(
      steps.map((step) =>
        step.id === 'course' ? { ...step, completed: true } : step
      )
    );
  };

  const completedCount = steps.filter((step) => step.completed).length;
  const allCompleted = completedCount === steps.length;

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col px-6 py-8">
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between">
          <div>
            <h1 className="text-3xl font-normal">
              Welcome,{' '}
              <span className="font-dancing text-4xl text-skolaroid-blue">
                Kint
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              We&apos;re very excited to get started with you
            </p>
          </div>
          <button className="flex-shrink-0 rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-300">
            ❓ Need Help
          </button>
        </div>

        {/* Main Card - Flex to fill remaining space */}
        <div className="mt-6 flex min-h-0 flex-grow flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Card Title */}
          <div className="flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              Finish Onboarding
            </h2>
            <p className="mt-1 text-xs text-gray-600">
              Please ensure the following items are complete so that your use
              all of Skolaroid&apos;s feature
            </p>
          </div>

          {/* Steps List - Scrollable if needed but sized to fit */}
          <div className="mt-5 flex-grow space-y-2 overflow-hidden">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className="group flex w-full items-center justify-between rounded-lg border-2 border-gray-200 px-4 py-3 text-sm transition hover:border-skolaroid-blue hover:bg-blue-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleStep(step.id);
                    }}
                    className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 accent-skolaroid-blue"
                  />
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex-shrink-0 text-lg">{step.icon}</span>
                    <span className="text-left font-medium text-gray-900">
                      {step.title}
                    </span>
                  </div>
                </div>
                <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400 transition group-hover:text-skolaroid-blue" />
              </button>
            ))}
          </div>

          {/* Progress Info */}
          <div className="mt-4 flex-shrink-0 text-xs text-gray-500">
            {completedCount} of {steps.length} steps completed
          </div>

          {/* Footer Actions */}
          <div className="mt-4 flex flex-shrink-0 items-center justify-between border-t border-gray-200 pt-4">
            <a
              href="#"
              className="text-xs font-medium text-gray-700 underline hover:text-gray-900"
            >
              More info ↗
            </a>
            <div className="flex gap-2">
              <button className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200">
                Back
              </button>
              <button
                disabled={!allCompleted}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium text-white transition ${
                  allCompleted
                    ? 'cursor-pointer bg-skolaroid-blue hover:bg-blue-700'
                    : 'cursor-not-allowed bg-gray-300 opacity-50'
                }`}
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BatchSelectorModal
        open={batchModalOpen}
        onOpenChange={setBatchModalOpen}
        onSelect={handleBatchSelect}
      />
      <CourseSelectorModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        onSelect={handleCourseSelect}
      />
    </div>
  );
}
