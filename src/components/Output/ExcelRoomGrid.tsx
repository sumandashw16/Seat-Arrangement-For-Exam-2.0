import React, { useMemo } from 'react';
import type { RoomLayout, Bench, StudentsPerBench } from '../../engine/types';

interface Props {
  layout: RoomLayout;
  studentsPerBench: StudentsPerBench;
}

export const ExcelRoomGrid: React.FC<Props> = ({
  layout,
  studentsPerBench,
}) => {
  const { room, benches, totalStudents } = layout;

  // Build coordinate lookup: "col,row" -> Bench
  const benchMap = useMemo(() => {
    const map = new Map<string, Bench>();
    for (const b of benches) {
      map.set(`${b.column},${b.row}`, b);
    }
    return map;
  }, [benches]);

  const cols = Array.from({ length: room.columns }, (_, i) => i + 1);
  const rows = Array.from({ length: room.rows }, (_, i) => i + 1);

  return (
    <div className="excel-room-container mb-8 break-after-page">
      {/* Excel Table Header */}
      <div className="border border-black bg-gray-100 text-black px-4 py-2 font-bold flex items-center justify-between text-xs tracking-wider uppercase">
        <div className="flex items-center gap-3">
          <span>ROOM NO: {room.name} ({room.columns}C X {room.rows}R)</span>
          <span className="text-gray-600 font-normal">| Capacity: {room.columns * room.rows * studentsPerBench} seats</span>
        </div>
        <div>
          <span>TOTAL SEATED: {totalStudents}</span>
        </div>
      </div>

      {/* Podium Indicator Banner */}
      <div className="border-x border-b border-black bg-gray-200 text-black text-center py-1 text-[11px] font-bold tracking-widest uppercase">
        ▲ FRONT / BLACK BOARD / PODIUM ▲
      </div>

      {/* Fixed Grid Table */}
      <table className="excel-grid-table w-full border-collapse border border-black bg-white text-black table-fixed">
        <thead>
          <tr className="bg-gray-100 border-b border-black text-[11px] font-bold">
            <th className="border border-black px-1 py-1.5 w-14 text-center font-mono">Row</th>
            {cols.map((col) => (
              <th key={col} className="border border-black px-1 py-1.5 text-center font-mono uppercase">
                Column {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-b border-black">
              {/* Row Label */}
              <td className="border border-black px-1 py-1 text-center font-mono text-[11px] font-bold bg-gray-50 text-gray-700">
                R{row}
              </td>

              {/* Benches in this row */}
              {cols.map((col) => {
                const bench = benchMap.get(`${col},${row}`);
                const seats = bench?.seats || [];

                if (studentsPerBench === 1) {
                  const seat = seats[0] || null;
                  return (
                    <td
                      key={col}
                      className="border border-black p-1 text-center align-middle h-14 bg-white"
                    >
                      {seat ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-xs font-bold text-black uppercase leading-tight font-sans">
                            {seat.branchName || seat.sectionId}
                          </span>
                          <span className="text-xs font-semibold text-black font-mono tracking-tight leading-tight mt-0.5">
                            {seat.rollNumber}
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-300 font-mono text-xs select-none">
                          -
                        </div>
                      )}
                    </td>
                  );
                }

                // 2 students per bench: Split box (Left & Right)
                const leftSeat = seats.find((s) => s.side === 'left') || (seats.length === 1 && seats[0].side !== 'right' ? seats[0] : null);
                const rightSeat = seats.find((s) => s.side === 'right') || null;

                return (
                  <td
                    key={col}
                    className="border border-black p-0 text-center align-middle h-14 bg-white"
                  >
                    <div className="grid grid-cols-2 divide-x divide-black h-full">
                      {/* Left seat */}
                      <div className="flex flex-col items-center justify-center p-1">
                        {leftSeat ? (
                          <>
                            <span className="text-[11px] font-bold text-black uppercase leading-tight font-sans">
                              {leftSeat.branchName || leftSeat.sectionId}
                            </span>
                            <span className="text-[11px] font-semibold text-black font-mono tracking-tight leading-tight mt-0.5">
                              {leftSeat.rollNumber}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-300 font-mono text-xs">-</span>
                        )}
                      </div>

                      {/* Right seat */}
                      <div className="flex flex-col items-center justify-center p-1">
                        {rightSeat ? (
                          <>
                            <span className="text-[11px] font-bold text-black uppercase leading-tight font-sans">
                              {rightSeat.branchName || rightSeat.sectionId}
                            </span>
                            <span className="text-[11px] font-semibold text-black font-mono tracking-tight leading-tight mt-0.5">
                              {rightSeat.rollNumber}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-300 font-mono text-xs">-</span>
                        )}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
