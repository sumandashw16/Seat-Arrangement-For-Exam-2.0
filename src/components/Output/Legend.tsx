import React from 'react';
import { Info } from 'lucide-react';

interface Props {
  sectionColors: Map<string, string>;
}

export const Legend: React.FC<Props> = ({ sectionColors }) => {
  const sectionsList = Array.from(sectionColors.entries());

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Visual Legend & Seating Invariants
          </h4>
        </div>

        {sectionsList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Sections:</span>
            {sectionsList.map(([sec, color]) => (
              <span
                key={sec}
                className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {sec}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-300">
        {/* L/R Pairing rule */}
        <div className="flex items-start gap-2.5">
          <div className="flex items-center gap-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-blue-600 dark:text-blue-400 font-bold">L</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">R</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">Paired Benches</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Circuital & Non-circuital swap positions every row to prevent collusion.
            </span>
          </div>
        </div>

        {/* Leftover phase */}
        <div className="flex items-start gap-2.5">
          <span className="text-[10px] font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-1.5 py-1 rounded">
            Leftover
          </span>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">Leftover Students</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Placed 1-per-bench in vacant halls or trailing benches.
            </span>
          </div>
        </div>

        {/* Empty Seat */}
        <div className="flex items-start gap-2.5">
          <span className="text-[10px] font-mono text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1 rounded">
            Empty
          </span>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">Unoccupied Seat</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Available buffer bench or single-student seat.
            </span>
          </div>
        </div>

        {/* Search Highlight */}
        <div className="flex items-start gap-2.5">
          <span className="text-[10px] font-mono text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-1 rounded font-bold">
            2402...
          </span>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 block">Highlighted Search</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Matches active search query across rooms.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
