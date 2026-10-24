import React from 'react';
import type { StudentsPerBench } from '../../engine/types';
import { Users, User, Settings2 } from 'lucide-react';

interface Props {
  value: StudentsPerBench;
  onChange: (value: StudentsPerBench) => void;
}

export const GlobalSettings: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Bench Allocation Policy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set student density per desk across all exam halls (1 student per bench or 2 students with alternating Left/Right pairing).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            id="students-per-bench-1"
            onClick={() => onChange(1)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-all duration-150 ${
              value === 1
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>1 per bench</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-900/60 font-mono text-slate-600 dark:text-slate-400">Single</span>
          </button>

          <button
            type="button"
            id="students-per-bench-2"
            onClick={() => onChange(2)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-all duration-150 ${
              value === 2
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>2 per bench</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-900/60 font-mono text-slate-600 dark:text-slate-400">Paired (L/R)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
