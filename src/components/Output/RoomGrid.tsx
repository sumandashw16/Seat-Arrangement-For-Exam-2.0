import React, { useMemo } from 'react';
import type { RoomLayout, Bench, StudentsPerBench } from '../../engine/types';
import { SeatCell } from './SeatCell';
import { School, Armchair, Users } from 'lucide-react';

interface Props {
  layout: RoomLayout;
  studentsPerBench: StudentsPerBench;
  sectionColors: Map<string, string>;
  searchQuery?: string;
  selectedFilter?: string;
}

export const RoomGrid: React.FC<Props> = ({
  layout,
  studentsPerBench,
  sectionColors,
  searchQuery = '',
  selectedFilter = '',
}) => {
  const { room, benches, totalStudents, totalBenchesUsed, emptySeats, sectionsPresent } =
    layout;

  // Build a quick lookup map: "col,row" -> Bench
  const benchMap = useMemo(() => {
    const map = new Map<string, Bench>();
    for (const b of benches) {
      map.set(`${b.column},${b.row}`, b);
    }
    return map;
  }, [benches]);

  // Generate grid columns (1..columns) and rows (1..rows)
  const cols = Array.from({ length: room.columns }, (_, i) => i + 1);
  const rows = Array.from({ length: room.rows }, (_, i) => i + 1);

  return (
    <div className="glass-card overflow-hidden room-card-print mb-8">
      {/* Room Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151d2c]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40 font-bold">
              <School className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {room.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
                  {room.columns} cols × {room.rows} rows
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Sections in room:</span>
                {sectionsPresent.length === 0 ? (
                  <span className="text-xs text-slate-400">None</span>
                ) : (
                  sectionsPresent.map((sec) => (
                    <span
                      key={sec}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.2 rounded text-white"
                      style={{ backgroundColor: sectionColors.get(sec) || '#2563eb' }}
                    >
                      {sec}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <div className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>{totalStudents}</strong> students
              </span>
            </div>
            <div className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>
                <strong>{totalBenchesUsed}</strong> / {room.columns * room.rows} benches
              </span>
            </div>
            {emptySeats > 0 && (
              <div className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500">
                <span>{emptySeats} empty seats</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Podium / Board Banner */}
      <div className="face-banner select-none">
        ▲ FRONT OF ROOM — FACE THIS SIDE (BOARD / PODIUM / SCREEN) ▲
      </div>

      {/* Bench Matrix Container */}
      <div className="p-5 sm:p-6 overflow-x-auto bg-slate-50 dark:bg-[#0e1420]">
        <div
          className="grid gap-4 justify-center min-w-max mx-auto"
          style={{
            gridTemplateColumns: `repeat(${room.columns}, minmax(180px, 1fr))`,
          }}
        >
          {cols.map((col) => (
            <div key={col} className="flex flex-col gap-2.5">
              {/* Column Label */}
              <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Column {col}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  (Front → Back)
                </span>
              </div>

              {/* Benches in this column, row 1 to R */}
              {rows.map((row) => {
                const bench = benchMap.get(`${col},${row}`);
                const isLeftover = bench?.phase === 'leftover';

                let leftSeat = null;
                let rightSeat = null;
                let singleSeat = null;

                if (bench && bench.seats.length > 0) {
                  if (studentsPerBench === 1) {
                    singleSeat = bench.seats[0];
                  } else {
                    leftSeat = bench.seats.find((s) => s.side === 'left') || null;
                    rightSeat = bench.seats.find((s) => s.side === 'right') || null;
                    if (!leftSeat && !rightSeat && bench.seats.length === 1) {
                      leftSeat = bench.seats[0];
                    }
                  }
                }

                return (
                  <div
                    key={row}
                    className="p-2 rounded-md bg-white dark:bg-[#151d2c] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 transition-all duration-150"
                  >
                    {/* Bench Header / Coordinates */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5 px-0.5">
                      <span>Row {row}</span>
                      <span className="text-slate-500 font-semibold">C{col}·R{row}</span>
                    </div>

                    {/* Seats on this bench */}
                    {studentsPerBench === 1 ? (
                      <SeatCell
                        seat={singleSeat}
                        color={singleSeat ? sectionColors.get(singleSeat.sectionId) : undefined}
                        searchQuery={searchQuery}
                        selectedFilter={selectedFilter}
                        isLeftover={isLeftover}
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        <SeatCell
                          seat={leftSeat}
                          color={leftSeat ? sectionColors.get(leftSeat.sectionId) : undefined}
                          searchQuery={searchQuery}
                          selectedFilter={selectedFilter}
                          isLeftover={isLeftover}
                        />
                        <SeatCell
                          seat={rightSeat}
                          color={rightSeat ? sectionColors.get(rightSeat.sectionId) : undefined}
                          searchQuery={searchQuery}
                          selectedFilter={selectedFilter}
                          isLeftover={isLeftover}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
