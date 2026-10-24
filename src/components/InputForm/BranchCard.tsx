import React from 'react';
import type { BranchInput, SectionInput, RollRange, ValidationError } from '../../engine/types';
import { SectionCard } from './SectionCard';
import { Plus, Trash2, GitBranch } from 'lucide-react';

interface Props {
  branch: BranchInput;
  branchIndex: number;
  category: 'circuital' | 'non-circuital';
  canRemove: boolean;
  onUpdateBranch: (updates: Partial<BranchInput>) => void;
  onRemoveBranch: () => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<SectionInput>) => void;
  onAddRollRange: (sectionId: string) => void;
  onUpdateRollRange: (
    sectionId: string,
    rangeIndex: number,
    updates: Partial<RollRange>
  ) => void;
  onRemoveRollRange: (sectionId: string, rangeIndex: number) => void;
  fieldPrefix: string;
  errors: ValidationError[];
}

export const BranchCard: React.FC<Props> = ({
  branch,
  branchIndex,
  category,
  canRemove,
  onUpdateBranch,
  onRemoveBranch,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  onAddRollRange,
  onUpdateRollRange,
  onRemoveRollRange,
  fieldPrefix,
  errors,
}) => {
  const nameError = errors.find((e) => e.field === `${fieldPrefix}.name`);

  return (
    <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3.5">
      {/* Branch Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-1 max-w-sm">
          <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40">
            <GitBranch className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
                Branch / Dept:
              </label>
              <input
                type="text"
                value={branch.name}
                onChange={(e) => onUpdateBranch({ name: e.target.value })}
                placeholder="e.g. CSE, ECE, MECH"
                className={`input-field py-1 px-2.5 text-xs font-bold uppercase ${
                  nameError ? 'border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {nameError && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">{nameError.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onAddSection}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 font-medium hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Plus className="w-3 h-3" />
            Add Section
          </button>

          {canRemove && (
            <button
              type="button"
              onClick={onRemoveBranch}
              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete branch"
              aria-label={`Delete branch ${branch.name || branchIndex + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {branch.sections.map((section, sIdx) => (
          <SectionCard
            key={section.id}
            section={section}
            sectionIndex={sIdx}
            branchName={branch.name}
            category={category}
            canRemove={branch.sections.length > 1}
            onUpdate={(updates) => onUpdateSection(section.id, updates)}
            onRemove={() => onRemoveSection(section.id)}
            onAddRange={() => onAddRollRange(section.id)}
            onUpdateRange={(rIdx, updates) =>
              onUpdateRollRange(section.id, rIdx, updates)
            }
            onRemoveRange={(rIdx) => onRemoveRollRange(section.id, rIdx)}
            fieldPrefix={`${fieldPrefix}.sections[${sIdx}]`}
            errors={errors}
          />
        ))}
      </div>
    </div>
  );
};
