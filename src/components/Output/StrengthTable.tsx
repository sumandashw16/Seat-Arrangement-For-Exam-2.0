import React, { useState, useMemo } from 'react';
import type { RoomLayout } from '../../engine/types';
import { Download, Printer } from 'lucide-react';
import { downloadFile } from '../../lib/utils';

interface Props {
  layouts: RoomLayout[];
}

interface StrengthRow {
  slNo: number;
  fullRoomStr: string;
  block: string;
  roomNo: string;
  course: string;
  semester: string;
  section: string;
  strength: number;
  registrationNos: string;
}

export const StrengthTable: React.FC<Props> = ({ layouts }) => {
  const [course, setCourse] = useState('B.Tech.');
  const [semester, setSemester] = useState('5th');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');

  // Extract strength rows from room layouts
  const rows = useMemo(() => {
    const list: StrengthRow[] = [];
    let sl = 1;

    for (const layout of layouts) {
      const room = layout.room;
      // Parse Block and Room No from room name (e.g. "C - 304" -> Block "C", Room "304")
      let block = 'C';
      let roomNo = room.name;

      const match = room.name.match(/^([A-Za-z]+)\s*[-_ ]*\s*(.*)$/);
      if (match && match[1] && match[2]) {
        block = match[1].toUpperCase();
        roomNo = match[2];
      }

      const fullRoomStr = `${room.name} (${room.columns}CX${room.rows}R)`;

      // Group seats by sectionId
      const sectionMap = new Map<string, string[]>();
      for (const bench of layout.benches) {
        for (const seat of bench.seats) {
          if (!sectionMap.has(seat.sectionId)) {
            sectionMap.set(seat.sectionId, []);
          }
          sectionMap.get(seat.sectionId)!.push(seat.rollNumber);
        }
      }

      // Add each section row
      for (const [secId, rolls] of sectionMap.entries()) {
        // Sort rolls numerically
        rolls.sort((a, b) => {
          const aTrim = a.replace(/^0+/, '') || '0';
          const bTrim = b.replace(/^0+/, '') || '0';
          if (aTrim.length !== bTrim.length) return aTrim.length - bTrim.length;
          return aTrim < bTrim ? -1 : aTrim > bTrim ? 1 : 0;
        });

        list.push({
          slNo: sl++,
          fullRoomStr,
          block,
          roomNo,
          course,
          semester,
          section: secId,
          strength: rolls.length,
          registrationNos: rolls.join(', '),
        });
      }
    }
    return list;
  }, [layouts, course, semester]);

  const handleExportCSV = () => {
    const csvRows = [
      'Sl.No,Room No,Block,Room No,Course,Semester,Section,Strength,Registration No.',
    ];

    for (const r of rows) {
      csvRows.push(
        [
          r.slNo,
          `"${r.fullRoomStr.replace(/"/g, '""')}"`,
          `"${r.block.replace(/"/g, '""')}"`,
          `"${r.roomNo.replace(/"/g, '""')}"`,
          `"${r.course.replace(/"/g, '""')}"`,
          `"${r.semester.replace(/"/g, '""')}"`,
          `"${r.section.replace(/"/g, '""')}"`,
          r.strength,
          `"${r.registrationNos.replace(/"/g, '""')}"`,
        ].join(',')
      );
    }

    const csvContent = csvRows.join('\n');
    downloadFile(
      csvContent,
      `room-allotment-strength-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="strength-sheet-container bg-white text-black p-4 rounded-xl border border-black shadow-sm mb-8">
      {/* Optional Top Bar & Actions (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-300 no-print">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-700">Course:</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. B.Tech."
              className="border border-gray-300 rounded px-2 py-1 text-xs w-24 bg-white text-black"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-700">Semester:</label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. 5th"
              className="border border-gray-300 rounded px-2 py-1 text-xs w-20 bg-white text-black"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-700">Exam Date:</label>
            <input
              type="text"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              placeholder="e.g. 14.10.2026 (Optional)"
              className="border border-gray-300 rounded px-2 py-1 text-xs w-36 bg-white text-black"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-700">Time:</label>
            <input
              type="text"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
              placeholder="e.g. 3:00 PM to 4:30 PM"
              className="border border-gray-300 rounded px-2 py-1 text-xs w-44 bg-white text-black"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Strength Sheet
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Institutional Header Banner */}
      <div className="border border-black bg-gray-100 p-2 text-center text-sm font-black tracking-wide uppercase mb-0">
        ROOM-WISE ALLOTMENT & STRENGTH SUMMARY
      </div>

      {(examDate || examTime) && (
        <div className="border-x border-b border-black bg-gray-50 px-4 py-1.5 flex items-center justify-between text-xs font-bold">
          {examDate && <span>EXAM Date : {examDate}</span>}
          {examTime && <span>Time : {examTime}</span>}
        </div>
      )}

      {/* Main Allotment Table */}
      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr className="bg-gray-200 border-b border-black text-center font-bold">
            <th className="border border-black px-2 py-2 w-12">SL.No</th>
            <th className="border border-black px-2 py-2 w-36">Room No</th>
            <th className="border border-black px-2 py-2 w-16">Block</th>
            <th className="border border-black px-2 py-2 w-20">Room No</th>
            <th className="border border-black px-2 py-2 w-20">Course</th>
            <th className="border border-black px-2 py-2 w-16">Semester</th>
            <th className="border border-black px-2 py-2 w-20">Section</th>
            <th className="border border-black px-2 py-2 w-16">Strength</th>
            <th className="border border-black px-3 py-2 text-left">Registration No.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.fullRoomStr}-${row.section}-${row.slNo}`} className="border-b border-black hover:bg-gray-50">
              <td className="border border-black px-2 py-1.5 text-center font-mono font-bold">
                {row.slNo}
              </td>
              <td className="border border-black px-2 py-1.5 text-center font-bold font-mono">
                {row.fullRoomStr}
              </td>
              <td className="border border-black px-2 py-1.5 text-center font-bold">
                {row.block}
              </td>
              <td className="border border-black px-2 py-1.5 text-center font-mono font-bold">
                {row.roomNo}
              </td>
              <td className="border border-black px-2 py-1.5 text-center">
                {row.course}
              </td>
              <td className="border border-black px-2 py-1.5 text-center">
                {row.semester}
              </td>
              <td className="border border-black px-2 py-1.5 text-center font-bold">
                {row.section}
              </td>
              <td className="border border-black px-2 py-1.5 text-center font-mono font-bold text-sm">
                {String(row.strength).padStart(2, '0')}
              </td>
              <td className="border border-black px-3 py-1.5 text-left font-mono text-[11px] leading-relaxed break-words">
                {row.registrationNos}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
