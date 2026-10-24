import React from 'react';
import type { Seat } from '../../engine/types';

interface Props {
  seat: Seat | null; // null if empty seat on bench
  color?: string; // HSL section color
  searchQuery?: string;
  selectedFilter?: string; // filter by sectionId
  isLeftover?: boolean;
}

export const SeatCell: React.FC<Props> = ({
  seat,
  color = '#2563eb',
  searchQuery = '',
  selectedFilter = '',
  isLeftover = false,
}) => {
  if (!seat) {
    return (
      <div className="seat-cell empty h-13 flex items-center justify-center text-slate-400 dark:text-slate-500 font-mono text-[11px] select-none">
        Empty
      </div>
    );
  }

  const query = searchQuery.trim().toLowerCase();
  const isMatchSearch =
    query.length > 0 && seat.rollNumber.toLowerCase().includes(query);

  const isDimmed =
    selectedFilter !== '' && seat.sectionId !== selectedFilter;

  const sideLabel =
    seat.side === 'left' ? 'L' : seat.side === 'right' ? 'R' : '1/B';

  return (
    <div
      id={`seat-${seat.rollNumber}`}
      className={`seat-cell occupied h-13 flex flex-col justify-between p-1.5 transition-all duration-150 group ${
        isMatchSearch ? 'highlighted ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/30' : ''
      } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
      style={{
        backgroundColor: isMatchSearch ? undefined : `${color}14`, // subtle tint
        borderLeft: `3px solid ${color}`,
      }}
      title={`Roll: ${seat.rollNumber} | ${seat.sectionId} (${seat.category})`}
    >
      {/* Top row: Section tag and seat side */}
      <div className="flex items-center justify-between gap-1 w-full text-[10px]">
        <span
          className="font-bold px-1.5 py-0.2 rounded text-white tracking-wide truncate max-w-[70%]"
          style={{ backgroundColor: color }}
        >
          {seat.sectionId}
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
          {sideLabel}
        </span>
      </div>

      {/* Middle/Bottom: Roll number */}
      <div className="flex items-center justify-between mt-0.5">
        <span
          className={`font-mono text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 ${
            isMatchSearch ? 'text-amber-800 dark:text-amber-300 font-black' : ''
          }`}
        >
          {seat.rollNumber}
        </span>
        {isLeftover && (
          <span className="text-[9px] font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-1 rounded border border-blue-200 dark:border-blue-900" title="Single/Leftover phase placement">
            Leftover
          </span>
        )}
      </div>
    </div>
  );
};
