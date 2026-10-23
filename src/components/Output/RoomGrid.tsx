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
      <div className="p-5 border-b border-[#232338] bg-[#141424]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 font-bold">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {room.name}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {room.columns} cols × {room.rows} rows
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">Sections in room:</span>
                {sectionsPresent.length === 0 ? (
                  <span className="text-xs text-gray-500">None</span>
                ) : (
                  sectionsPresent.map((sec) => (
                    <span
                      key={sec}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: sectionColors.get(sec) || '#6366f1' }}
                    >
                      {sec}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a44] text-gray-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                <strong className="text-white">{totalStudents}</strong> students
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[#2a2a44] text-gray-300 flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5 text-purple-400" />
              <span>
                <strong className="text-white">{totalBenchesUsed}</strong> / {room.columns * room.rows} benches
              </span>
            </div>
            {emptySeats > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-400">
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
      <div className="p-6 overflow-x-auto bg-[#0d0d17]">
        <div
          className="grid gap-6 justify-center min-w-max mx-auto"
          style={{
            gridTemplateColumns: `repeat(${room.columns}, minmax(180px, 1fr))`,
          }}
        >
          {cols.map((col) => (
            <div key={col} className="flex flex-col gap-3">
              {/* Column Label */}
              <div className="text-center pb-2 border-b border-[#232338]">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Column {col}
                </span>
                <span className="text-[10px] text-gray-500 block">
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
                    // If neither explicitly has left/right (fallback)
                    if (!leftSeat && !rightSeat && bench.seats.length === 1) {
                      leftSeat = bench.seats[0];
                    }
                  }
                }

                return (
                  <div
                    key={row}
                    className="p-2 rounded-xl bg-[#131322] border border-[#202036] hover:border-indigo-500/30 transition-all duration-200"
                  >
                    {/* Bench Header / Coordinates */}
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mb-1.5 px-0.5">
                      <span>Row {row}</span>
                      <span className="text-gray-600">C{col}·R{row}</span>
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
