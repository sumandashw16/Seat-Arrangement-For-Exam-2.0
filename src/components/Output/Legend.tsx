import React from 'react';
import { Info } from 'lucide-react';

interface Props {
  sectionColors: Map<string, string>;
}

export const Legend: React.FC<Props> = ({ sectionColors }) => {
  const sectionsList = Array.from(sectionColors.entries());

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            Visual Legend & Seating Invariants
          </h4>
        </div>

        {sectionsList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-gray-400">Section Colors:</span>
            {sectionsList.map(([sec, color]) => (
              <span
                key={sec}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {sec}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-300">
        {/* L/R Pairing rule */}
        <div className="flex items-start gap-2.5">
          <div className="flex items-center gap-1 font-mono text-[10px] bg-black/40 px-2 py-1 rounded border border-gray-700">
            <span className="text-indigo-400 font-bold">L</span>
            <span className="text-gray-500">|</span>
            <span className="text-purple-400 font-bold">R</span>
          </div>
          <div>
            <span className="font-semibold text-white block">Paired Benches</span>
            <span className="text-[11px] text-gray-400">
              Circuital & Non-circuital swap positions every row to prevent cheating.
            </span>
          </div>
        </div>

        {/* Leftover phase */}
        <div className="flex items-start gap-2.5">
          <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 border border-purple-500/40 px-1.5 py-1 rounded">
            Leftover
          </span>
          <div>
            <span className="font-semibold text-white block">Leftover Students</span>
            <span className="text-[11px] text-gray-400">
              Placed 1-per-bench in vacant halls or trailing benches.
            </span>
          </div>
        </div>

        {/* Empty Seat */}
        <div className="flex items-start gap-2.5">
          <span className="text-[10px] font-mono text-gray-500 border border-dashed border-gray-600 px-2 py-1 rounded">
            Empty
          </span>
          <div>
            <span className="font-semibold text-white block">Unoccupied Seat</span>
            <span className="text-[11px] text-gray-400">
              Available buffer bench or single-student seat.
            </span>
          </div>
        </div>

        {/* Search Highlight */}
        <div className="flex items-start gap-2.5">
          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 border border-amber-400 px-2 py-1 rounded font-bold">
            2402...
          </span>
          <div>
            <span className="font-semibold text-white block">Highlighted Search</span>
            <span className="text-[11px] text-gray-400">
              Matches active search query across rooms.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
