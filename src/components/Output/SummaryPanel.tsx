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
    <div className="glass-card p-5 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-200 dark:border-slate-800">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Seating Arrangement Computed Successfully
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic allocation algorithm executed with full paired & leftover invariant enforcement.
          </p>
        </div>

        {/* Top KPIs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Total Placed */}
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-900/40">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                Placed Students
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {summary.totalPlaced} / {summary.totalStudents}
              </span>
            </div>
          </div>

          {/* Rooms Used */}
          <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40">
              <School className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider block">
                Rooms Utilized
              </span>
              <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                {summary.roomsUsed}
              </span>
            </div>
          </div>

          {/* Unplaced (if any) */}
          {summary.unplaced > 0 && (
            <div className="px-3.5 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-rose-700 dark:text-rose-400 tracking-wider block">
                  Unplaced
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-rose-700 dark:text-rose-400">
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
          <span className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Section Breakdown & Filter
          </span>
          {selectedFilter && (
            <button
              type="button"
              onClick={() => onSelectFilter('')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {sectionCounts.map(([secId, { count, category }]) => {
            const isSelected = selectedFilter === secId;
            const color = sectionColors.get(secId) || '#2563eb';
            return (
              <button
                key={secId}
                type="button"
                onClick={() => onSelectFilter(isSelected ? '' : secId)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-150 border ${
                  isSelected
                    ? 'ring-2 ring-blue-600 border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{secId}</span>
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                  {count}
                </span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded text-slate-500 bg-slate-100 dark:bg-slate-800 font-mono">
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
