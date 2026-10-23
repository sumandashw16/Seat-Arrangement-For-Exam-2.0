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
    <div className="p-5 rounded-2xl bg-[#161626] border border-[#262640] space-y-4">
      {/* Branch Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232338]">
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Branch / Dept:
              </label>
              <input
                type="text"
                value={branch.name}
                onChange={(e) => onUpdateBranch({ name: e.target.value })}
                placeholder="e.g. CSE, ECE, MECH"
                className={`input-field py-1 px-3 text-sm font-bold uppercase ${
                  nameError ? 'border-red-500 ring-1 ring-red-500' : ''
                }`}
              />
            </div>
            {nameError && (
              <p className="text-[11px] text-red-400 font-medium mt-1">{nameError.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddSection}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Section
          </button>

          {canRemove && (
            <button
              type="button"
              onClick={onRemoveBranch}
              className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
              title="Delete branch"
              aria-label={`Delete branch ${branch.name || branchIndex + 1}`}
            >
              <Trash2 className="w-4 h-4" />
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
