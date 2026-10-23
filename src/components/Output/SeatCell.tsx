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
  color = '#6366f1',
  searchQuery = '',
  selectedFilter = '',
  isLeftover = false,
}) => {
  if (!seat) {
    return (
      <div className="seat-cell empty h-14 flex items-center justify-center text-gray-600 font-mono text-[11px] select-none">
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
      className={`seat-cell occupied h-14 flex flex-col justify-between p-1.5 transition-all duration-200 group ${
        isMatchSearch ? 'highlighted ring-2 ring-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20' : ''
      } ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
      style={{
        backgroundColor: `${color}18`, // 10% opacity tint
        borderLeft: `3px solid ${color}`,
      }}
      title={`Roll: ${seat.rollNumber} | ${seat.sectionId} (${seat.category})`}
    >
      {/* Top row: Section tag and seat side */}
      <div className="flex items-center justify-between gap-1 w-full text-[10px]">
        <span
          className="font-bold px-1.5 py-0.5 rounded text-white tracking-wide truncate max-w-[70%]"
          style={{ backgroundColor: color }}
        >
          {seat.sectionId}
        </span>
        <span className="text-gray-400 font-mono text-[9px] uppercase px-1 py-0.5 rounded bg-black/40">
          {sideLabel}
        </span>
      </div>

      {/* Middle/Bottom: Roll number */}
      <div className="flex items-center justify-between mt-1">
        <span
          className={`font-mono text-xs font-bold tracking-tight text-white ${
            isMatchSearch ? 'text-amber-300 underline font-black text-sm' : ''
          }`}
        >
          {seat.rollNumber}
        </span>
        {isLeftover && (
          <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-1 rounded" title="Single/Leftover phase placement">
            Leftover
          </span>
        )}
      </div>
    </div>
  );
};
