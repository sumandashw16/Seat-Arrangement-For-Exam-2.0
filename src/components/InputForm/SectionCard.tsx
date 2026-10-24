import React, { useMemo } from 'react';
import type { SectionInput, RollRange, ValidationError } from '../../engine/types';
import { RollRangeInput } from './RollRangeInput';
import { Trash2, UserPlus, UserMinus, Users } from 'lucide-react';
import { resolveSection } from '../../engine/resolveStudents';

interface Props {
  section: SectionInput;
  sectionIndex: number;
  branchName: string;
  category: 'circuital' | 'non-circuital';
  canRemove: boolean;
  onUpdate: (updates: Partial<SectionInput>) => void;
  onRemove: () => void;
  onAddRange: () => void;
  onUpdateRange: (rangeIndex: number, updates: Partial<RollRange>) => void;
  onRemoveRange: (rangeIndex: number) => void;
  fieldPrefix: string;
  errors: ValidationError[];
}

export const SectionCard: React.FC<Props> = ({
  section,
  sectionIndex,
  branchName,
  category,
  canRemove,
  onUpdate,
  onRemove,
  onAddRange,
  onUpdateRange,
  onRemoveRange,
  fieldPrefix,
  errors,
}) => {
  const nameError = errors.find((e) => e.field === `${fieldPrefix}.name`);

  // Calculate live student count safely
  const resolvedCount = useMemo(() => {
    try {
      const res = resolveSection(section, branchName || '?', category);
      return res.resolved.students.length;
    } catch {
      return 0;
    }
  }, [section, branchName, category]);

  return (
    <div className="p-3.5 rounded-md bg-white dark:bg-[#151d2c] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Section
          </label>
          <input
            type="text"
            value={section.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. A, B, 1"
            className={`input-field py-1 px-2.5 text-xs font-semibold uppercase ${
              nameError ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">{resolvedCount}</span> students
          </div>

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title="Delete section"
              aria-label={`Delete section ${section.name || sectionIndex + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {nameError && (
        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">{nameError.message}</p>
      )}

      {/* Roll Ranges */}
      <RollRangeInput
        ranges={section.rollRanges}
        onAddRange={onAddRange}
        onUpdateRange={onUpdateRange}
        onRemoveRange={onRemoveRange}
        fieldPrefix={fieldPrefix}
        errors={errors}
      />

      {/* Additionals & Exclusions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Additional rolls */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Additional Roll Numbers
          </label>
          <textarea
            rows={2}
            value={section.additionalRolls}
            onChange={(e) => onUpdate({ additionalRolls: e.target.value })}
            placeholder="e.g. 2402041180, 2402041182 (comma or space separated)"
            className="input-field text-xs font-mono resize-none py-1.5 px-2.5"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Lateral entries, transfers or unlisted students
          </span>
        </div>

        {/* Excluded rolls */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
            <UserMinus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Excluded Roll Numbers
          </label>
          <textarea
            rows={2}
            value={section.excludedRolls}
            onChange={(e) => onUpdate({ excludedRolls: e.target.value })}
            placeholder="e.g. 2402041112, 2402041130 (comma or space separated)"
            className="input-field text-xs font-mono resize-none py-1.5 px-2.5"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            Detained, fee-due, or dropout students to skip
          </span>
        </div>
      </div>
    </div>
  );
};
