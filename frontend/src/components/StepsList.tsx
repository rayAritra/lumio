import React from 'react';
import { CheckCircle, Circle, Loader2, FileCode, FolderPlus, Edit3, Trash2, Terminal } from 'lucide-react';
import { Step, StepType } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

const stepTypeIcon = (type: StepType) => {
  switch (type) {
    case StepType.CreateFile: return <FileCode className="w-3 h-3" />;
    case StepType.CreateFolder: return <FolderPlus className="w-3 h-3" />;
    case StepType.EditFile: return <Edit3 className="w-3 h-3" />;
    case StepType.DeleteFile: return <Trash2 className="w-3 h-3" />;
    case StepType.RunScript: return <Terminal className="w-3 h-3" />;
    default: return <FileCode className="w-3 h-3" />;
  }
};

const stepTypeLabel = (type: StepType) => {
  switch (type) {
    case StepType.CreateFile: return 'Create file';
    case StepType.CreateFolder: return 'Create folder';
    case StepType.EditFile: return 'Edit file';
    case StepType.DeleteFile: return 'Delete file';
    case StepType.RunScript: return 'Run script';
    default: return 'Action';
  }
};

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-surface-raised border border-surface-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Build Steps</h2>
          <span className="text-xs text-gray-600 font-mono">{completedCount}/{steps.length}</span>
        </div>
        {/* Progress bar */}
        {steps.length > 0 && (
          <div className="h-0.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-cyan-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hidden">
        {steps.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="w-8 h-8 rounded-lg bg-surface-border flex items-center justify-center mb-2">
              <FileCode className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xs text-gray-600">Generating steps...</p>
          </div>
        )}

        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in-progress';

          return (
            <div
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`group flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 animate-fade-in ${isActive
                  ? 'bg-accent/10 border border-accent/20'
                  : 'hover:bg-white/4 border border-transparent'
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                ) : isInProgress ? (
                  <div className="w-5 h-5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-accent-light animate-spin" />
                  </div>
                ) : (
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'border-accent/40 bg-accent/10' : 'border-surface-border'
                    }`}>
                    <Circle className={`w-2.5 h-2.5 ${isActive ? 'text-accent-light' : 'text-gray-700'}`} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`${isActive ? 'text-accent-light' : 'text-gray-600'} flex-shrink-0`}>
                    {stepTypeIcon(step.type)}
                  </span>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${isActive ? 'text-accent-light/70' : 'text-gray-700'
                    }`}>
                    {stepTypeLabel(step.type)}
                  </span>
                </div>
                <p className={`text-sm font-medium truncate leading-snug ${isCompleted ? 'text-gray-500' : isActive ? 'text-gray-100' : 'text-gray-400'
                  }`}>
                  {step.title}
                </p>
                {step.path && (
                  <p className="text-xs text-gray-700 font-mono truncate mt-0.5">
                    {step.path}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}