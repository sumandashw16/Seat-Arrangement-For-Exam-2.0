import React from 'react';
import type { StudentsPerBench } from '../../engine/types';
import { Users, User } from 'lucide-react';

interface Props {
  value: StudentsPerBench;
  onChange: (value: StudentsPerBench) => void;
}

export const GlobalSettings: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
            Global Bench Configuration
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Specify how many students sit on each bench. This rule applies uniformly across all exam halls.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#12121a] p-1.5 rounded-xl border border-[#2a2a4a]">
          <button
            type="button"
            id="students-per-bench-1"
            onClick={() => onChange(1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              value === 1
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1 per bench</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">Alternating</span>
          </button>

          <button
            type="button"
            id="students-per-bench-2"
            onClick={() => onChange(2)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              value === 2
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2 per bench</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">L/R Swap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
