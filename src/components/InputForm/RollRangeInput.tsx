import React from 'react';
import type { RollRange, ValidationError } from '../../engine/types';
import { Plus, Trash2, Hash } from 'lucide-react';

interface Props {
  ranges: RollRange[];
  onAddRange: () => void;
  onUpdateRange: (index: number, updates: Partial<RollRange>) => void;
  onRemoveRange: (index: number) => void;
  fieldPrefix: string; // e.g. "circuital.branches[0].sections[0]"
  errors: ValidationError[];
}

export const RollRangeInput: React.FC<Props> = ({
  ranges,
  onAddRange,
  onUpdateRange,
  onRemoveRange,
  fieldPrefix,
  errors,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Hash className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Roll Number Ranges (Continuous blocks)
        </label>
        <button
          type="button"
          onClick={onAddRange}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Range
        </button>
      </div>

      <div className="space-y-2">
        {ranges.map((range, idx) => {
          const startField = `${fieldPrefix}.rollRanges[${idx}].start`;
          const endField = `${fieldPrefix}.rollRanges[${idx}].end`;
          const rangeField = `${fieldPrefix}.rollRanges[${idx}]`;

          const startErr = errors.find((e) => e.field === startField);
          const endErr = errors.find((e) => e.field === endField);
          const rangeErr = errors.find((e) => e.field === rangeField);

          let rangeCount: number | null = null;
          if (
            range.start &&
            range.end &&
            /^\d+$/.test(range.start) &&
            /^\d+$/.test(range.end)
          ) {
            try {
              const s = BigInt(range.start);
              const e = BigInt(range.end);
              if (e >= s) {
                rangeCount = Number(e - s) + 1;
              }
            } catch {
              // ignore BigInt parsing issues
            }
          }

          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={range.start}
                    onChange={(e) => onUpdateRange(idx, { start: e.target.value.trim() })}
                    placeholder="Start roll (e.g. 2402041101)"
                    className={`input-field font-mono text-xs py-1.5 px-2.5 ${
                      startErr || rangeErr ? 'border-red-500 ring-1 ring-red-500' : ''
                    }`}
                  />
                </div>

                <span className="text-xs text-slate-400 font-mono">to</span>

                <div className="flex-1">
                  <input
                    type="text"
                    value={range.end}
                    onChange={(e) => onUpdateRange(idx, { end: e.target.value.trim() })}
                    placeholder="End roll (e.g. 2402041160)"
                    className={`input-field font-mono text-xs py-1.5 px-2.5 ${
                      endErr || rangeErr ? 'border-red-500 ring-1 ring-red-500' : ''
                    }`}
                  />
                </div>

                {rangeCount !== null && (
                  <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded border border-blue-200 dark:border-blue-900/50 whitespace-nowrap">
                    {rangeCount} stds
                  </span>
                )}

                {ranges.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveRange(idx)}
                    className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove range"
                    aria-label={`Remove range ${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {(startErr || endErr || rangeErr) && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                  {startErr?.message || endErr?.message || rangeErr?.message}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
