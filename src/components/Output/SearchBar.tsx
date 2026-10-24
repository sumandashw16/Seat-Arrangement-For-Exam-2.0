import React, { useMemo } from 'react';
import type { RoomLayout } from '../../engine/types';
import { Search, X, Crosshair } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  layouts: RoomLayout[];
}

export const SearchBar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  layouts,
}) => {
  // Find matches across all room benches
  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const found: {
      roll: string;
      section: string;
      room: string;
      column: number;
      row: number;
      side: string;
    }[] = [];

    for (const layout of layouts) {
      for (const bench of layout.benches) {
        for (const seat of bench.seats) {
          if (seat.rollNumber.toLowerCase().includes(q)) {
            found.push({
              roll: seat.rollNumber,
              section: seat.sectionId,
              room: bench.roomName,
              column: bench.column,
              row: bench.row,
              side: seat.side,
            });
          }
        }
      }
    }
    return found;
  }, [searchQuery, layouts]);

  const scrollToSeat = (rollNumber: string) => {
    const el = document.getElementById(`seat-${rollNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-500');
      setTimeout(() => el.classList.remove('ring-4', 'ring-amber-500'), 1500);
    }
  };

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="roll-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search student by Roll Number (e.g. 2402041126)..."
            className="input-field pl-10 pr-9 py-2 text-xs font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Match Count Badge */}
        {searchQuery.trim().length > 0 && (
          <div className="text-xs font-mono px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {matches.length === 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">0 matches</span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 font-bold">
                {matches.length} match{matches.length > 1 ? 'es' : ''} found
              </span>
            )}
          </div>
        )}
      </div>

      {/* Match Results Quick Jumps */}
      {matches.length > 0 && matches.length <= 6 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Jump to seat:
          </span>
          {matches.map((m) => (
            <button
              key={`${m.room}-${m.roll}`}
              type="button"
              onClick={() => scrollToSeat(m.roll)}
              className="text-xs px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1.5 transition-colors font-mono"
            >
              <span>{m.roll}</span>
              <span className="text-slate-500">({m.room} C{m.column}:R{m.row})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
