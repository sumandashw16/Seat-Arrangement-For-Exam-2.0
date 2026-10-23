import React from 'react';
import type { EngineSummary, RoomLayout } from '../../engine/types';
import { School, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

interface Props {
  summary: EngineSummary;
  layouts: RoomLayout[];
  sectionColors: Map<string, string>;
  selectedFilter: string;
  onSelectFilter: (sectionId: string) => void;
}

export const SummaryPanel: React.FC<Props> = ({
  summary,
  layouts,
  sectionColors,
  selectedFilter,
  onSelectFilter,
}) => {
  // Aggregate section student counts across all room layouts
  const sectionCounts = React.useMemo(() => {
    const counts = new Map<string, { count: number; category: string }>();
    for (const layout of layouts) {
      for (const bench of layout.benches) {
        for (const seat of bench.seats) {
          const existing = counts.get(seat.sectionId) || {
            count: 0,
            category: seat.category,
          };
          existing.count += 1;
          counts.set(seat.sectionId, existing);
        }
      }
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [layouts]);

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#232338]">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Seating Arrangement Generated Successfully
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Deterministic seating algorithm executed with full paired & leftover invariant enforcement.
          </p>
        </div>

        {/* Top KPIs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Total Placed */}
          <div className="px-4 py-2 rounded-xl bg-[#141424] border border-[#232338] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider block">
                Placed Students
              </span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {summary.totalPlaced} / {summary.totalStudents}
              </span>
            </div>
          </div>

          {/* Rooms Used */}
          <div className="px-4 py-2 rounded-xl bg-[#141424] border border-[#232338] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-gray-400 tracking-wider block">
                Rooms Utilized
              </span>
              <span className="text-base font-bold font-mono text-white">
                {summary.roomsUsed}
              </span>
            </div>
          </div>

          {/* Unplaced (if any) */}
          {summary.unplaced > 0 && (
            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-red-300 tracking-wider block">
                  Unplaced
                </span>
                <span className="text-base font-bold font-mono text-red-400">
                  {summary.unplaced}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Distribution Breakdown */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Section Breakdown & Filter
          </span>
          {selectedFilter && (
            <button
              type="button"
              onClick={() => onSelectFilter('')}
              className="text-xs text-indigo-400 hover:text-white underline font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {sectionCounts.map(([secId, { count, category }]) => {
            const isSelected = selectedFilter === secId;
            const color = sectionColors.get(secId) || '#6366f1';
            return (
              <button
                key={secId}
                type="button"
                onClick={() => onSelectFilter(isSelected ? '' : secId)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  isSelected
                    ? 'ring-2 ring-white shadow-lg'
                    : 'hover:bg-white/5 opacity-90 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: `${color}25`,
                  borderColor: color,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white">{secId}</span>
                <span className="text-[11px] font-mono text-gray-300 bg-black/40 px-1.5 py-0.5 rounded">
                  {count}
                </span>
                <span className="text-[9px] uppercase px-1 py-0.5 rounded text-gray-400 bg-black/20">
                  {category === 'circuital' ? 'Circ' : 'Non-Circ'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
