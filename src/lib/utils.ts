import type { RoomLayout } from '../engine/types';

/**
 * Generate a distinguishable color for each section using evenly-spaced HSL hues.
 */
export function generateSectionColors(sectionIds: string[]): Map<string, string> {
  const map = new Map<string, string>();
  const n = sectionIds.length;
  const saturation = 70;
  const lightness = 55;

  for (let i = 0; i < n; i++) {
    const hue = Math.round((360 / n) * i + 220) % 360; // Start from blue range
    map.set(sectionIds[i], `hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return map;
}

/**
 * Generate CSV content from layouts.
 */
export function generateCSV(layouts: RoomLayout[]): string {
  const rows: string[] = ['Room,Column,Row,Side,Roll Number,Branch,Section'];

  for (const layout of layouts) {
    for (const bench of layout.benches) {
      for (const seat of bench.seats) {
        rows.push(
          [
            csvEscape(bench.roomName),
            bench.column,
            bench.row,
            seat.side === 'left' ? 'Left' : seat.side === 'right' ? 'Right' : 'Single',
            seat.rollNumber,
            csvEscape(seat.branchName),
            csvEscape(seat.sectionId),
          ].join(',')
        );
      }
    }
  }

  return rows.join('\n');
}

function csvEscape(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Download a string as a file.
 */
export function downloadFile(content: string, filename: string, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Compute live stats from the form for the input panel.
 */
export function computeLiveStats(form: import('../engine/types').FormState) {
  const totalRooms = form.rooms.length;
  const totalBenches = form.rooms.reduce(
    (s, r) => s + (r.columns > 0 && r.rows > 0 ? r.columns * r.rows : 0),
    0
  );
  const totalSeats = totalBenches * form.studentsPerBench;

  let totalStudents = 0;
  const sectionCounts: { sectionId: string; count: number }[] = [];

  const countCategory = (cat: typeof form.circuital) => {
    for (const branch of cat.branches) {
      for (const section of branch.sections) {
        let count = 0;
        for (const range of section.rollRanges) {
          if (range.start && range.end && /^\d+$/.test(range.start) && /^\d+$/.test(range.end)) {
            const s = BigInt(range.start);
            const e = BigInt(range.end);
            if (e >= s) count += Number(e - s) + 1;
          }
        }
        // Rough count for additional (just count comma/space separated items)
        const addRolls = section.additionalRolls
          .split(/[\s,]+/)
          .filter((s) => s.trim().length > 0);
        count += addRolls.length;

        const exclRolls = section.excludedRolls
          .split(/[\s,]+/)
          .filter((s) => s.trim().length > 0);
        count = Math.max(0, count - exclRolls.length);

        const label = `${branch.name || '?'}-${section.name || '?'}`;
        sectionCounts.push({ sectionId: label, count });
        totalStudents += count;
      }
    }
  };

  countCategory(form.circuital);
  countCategory(form.nonCircuital);

  return { totalRooms, totalBenches, totalSeats, totalStudents, sectionCounts };
}
