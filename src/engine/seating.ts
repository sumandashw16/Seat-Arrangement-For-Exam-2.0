import type {
  FormState,
  ResolvedSection,
  Bench,
  RoomLayout,
  EngineSummary,
  EngineResult,
  StudentEntry,
} from './types';
import { validateInput } from './validate';

// ─── Single-Bench Student Dispatcher ──────────────────────────

/**
 * Dispatcher for single student per bench (studentsPerBench === 1):
 * - Guarantees strict sequential roll number order for every section (starts at first roll, extends till fillup).
 * - Distributes Circuital vs Non-Circuital diagonally on alternating parity (col + row) % 2.
 * - When non-circuital runs out (or vice-versa), alternates diagonally based on different available branches.
 * - When only ONE branch remains anywhere, fills remaining seats sequentially without jumping.
 */
class SingleBenchStudentDispatcher {
  private circuitalBranches: Map<string, StudentEntry[]> = new Map();
  private nonCircuitalBranches: Map<string, StudentEntry[]> = new Map();

  private activeBranchA: string | null = null;
  private activeBranchB: string | null = null;

  constructor(
    circuitalSections: ResolvedSection[],
    nonCircuitalSections: ResolvedSection[]
  ) {
    for (const sec of circuitalSections) {
      if (!this.circuitalBranches.has(sec.branchName)) {
        this.circuitalBranches.set(sec.branchName, []);
      }
      const list = this.circuitalBranches.get(sec.branchName)!;
      for (const roll of sec.students) {
        list.push({
          rollNumber: roll,
          sectionId: sec.sectionId,
          branchName: sec.branchName,
          category: 'circuital',
        });
      }
    }

    for (const sec of nonCircuitalSections) {
      if (!this.nonCircuitalBranches.has(sec.branchName)) {
        this.nonCircuitalBranches.set(sec.branchName, []);
      }
      const list = this.nonCircuitalBranches.get(sec.branchName)!;
      for (const roll of sec.students) {
        list.push({
          rollNumber: roll,
          sectionId: sec.sectionId,
          branchName: sec.branchName,
          category: 'non-circuital',
        });
      }
    }

    // Sort each branch list numerically by roll number ascending
    const numericSort = (a: StudentEntry, b: StudentEntry) => {
      const aT = a.rollNumber.replace(/^0+/, '') || '0';
      const bT = b.rollNumber.replace(/^0+/, '') || '0';
      if (aT.length !== bT.length) return aT.length - bT.length;
      return aT < bT ? -1 : aT > bT ? 1 : 0;
    };
    for (const list of this.circuitalBranches.values()) list.sort(numericSort);
    for (const list of this.nonCircuitalBranches.values()) list.sort(numericSort);
  }

  public hasRemaining(): boolean {
    return this.getTotalRemaining() > 0;
  }

  public getTotalRemaining(): number {
    let count = 0;
    for (const list of this.circuitalBranches.values()) count += list.length;
    for (const list of this.nonCircuitalBranches.values()) count += list.length;
    return count;
  }

  private getCircuitalRemaining(): number {
    let count = 0;
    for (const list of this.circuitalBranches.values()) count += list.length;
    return count;
  }

  private getNonCircuitalRemaining(): number {
    let count = 0;
    for (const list of this.nonCircuitalBranches.values()) count += list.length;
    return count;
  }

  private getActiveBranchesWithStudents(): string[] {
    const branches: string[] = [];
    for (const [name, list] of this.circuitalBranches.entries()) {
      if (list.length > 0) branches.push(name);
    }
    for (const [name, list] of this.nonCircuitalBranches.entries()) {
      if (list.length > 0) branches.push(name);
    }
    return branches;
  }

  private popFromBranch(branchName: string): StudentEntry | null {
    const cList = this.circuitalBranches.get(branchName);
    if (cList && cList.length > 0) return cList.shift()!;
    const nList = this.nonCircuitalBranches.get(branchName);
    if (nList && nList.length > 0) return nList.shift()!;
    return null;
  }

  private popFromCategory(category: 'circuital' | 'non-circuital'): StudentEntry | null {
    const map = category === 'circuital' ? this.circuitalBranches : this.nonCircuitalBranches;
    for (const list of map.values()) {
      if (list.length > 0) {
        return list.shift()!;
      }
    }
    return null;
  }

  private popAny(): StudentEntry | null {
    for (const list of this.circuitalBranches.values()) {
      if (list.length > 0) return list.shift()!;
    }
    for (const list of this.nonCircuitalBranches.values()) {
      if (list.length > 0) return list.shift()!;
    }
    return null;
  }

  private hasStudentsInBranch(branchName: string): boolean {
    const cList = this.circuitalBranches.get(branchName);
    if (cList && cList.length > 0) return true;
    const nList = this.nonCircuitalBranches.get(branchName);
    if (nList && nList.length > 0) return true;
    return false;
  }

  public getNext(targetParity: 'A' | 'B'): StudentEntry | null {
    if (!this.hasRemaining()) return null;

    const hasCircuital = this.getCircuitalRemaining() > 0;
    const hasNonCircuital = this.getNonCircuitalRemaining() > 0;

    // Rule 1: Circuital vs Non-circuital diagonal pairing
    if (hasCircuital && hasNonCircuital) {
      if (targetParity === 'A') {
        const student = this.popFromCategory('circuital');
        if (student) this.activeBranchA = student.branchName;
        return student;
      } else {
        const student = this.popFromCategory('non-circuital');
        if (student) this.activeBranchB = student.branchName;
        return student;
      }
    }

    // Rule 2: If no non-circuital left or vice-versa, alternate based on different branches
    const remainingBranches = this.getActiveBranchesWithStudents();
    if (remainingBranches.length > 1) {
      if (targetParity === 'A') {
        if (!this.activeBranchA || !this.hasStudentsInBranch(this.activeBranchA) || this.activeBranchA === this.activeBranchB) {
          const candidate = remainingBranches.find((b) => b !== this.activeBranchB) || remainingBranches[0];
          this.activeBranchA = candidate;
        }
        const student = this.popFromBranch(this.activeBranchA);
        return student;
      } else {
        if (!this.activeBranchB || !this.hasStudentsInBranch(this.activeBranchB) || this.activeBranchB === this.activeBranchA) {
          const candidate = remainingBranches.find((b) => b !== this.activeBranchA) || remainingBranches[0];
          this.activeBranchB = candidate;
        }
        const student = this.popFromBranch(this.activeBranchB);
        return student;
      }
    }

    // Rule 3: Only ONE branch left in total -> fill sequentially without randomness
    return this.popAny();
  }
}

// ─── Core algorithm ─────────────────────────────────────

export function generateSeating(form: FormState): EngineResult {
  const validation = validateInput(form);
  const allErrors = validation.errors;
  const allWarnings = validation.warnings;

  if (allErrors.length > 0) {
    return { ok: false, errors: [...allErrors, ...allWarnings] };
  }

  const { resolvedRooms, circuitalSections, nonCircuitalSections } = validation;
  const studentsPerBench = form.studentsPerBench;

  // Sort rooms by capacity descending, ties by entry order
  const sortedRoomIndices = resolvedRooms
    .map((r, i) => ({ room: r, originalIndex: i }))
    .sort((a, b) => {
      if (b.room.capacity !== a.room.capacity) return b.room.capacity - a.room.capacity;
      return a.originalIndex - b.originalIndex;
    });

  const sortedRooms = sortedRoomIndices.map((r) => r.room);
  const layouts: RoomLayout[] = [];

  if (studentsPerBench === 1) {
    // ─── Case 1: studentsPerBench === 1 (Single Box Grid) ───
    const dispatcher = new SingleBenchStudentDispatcher(circuitalSections, nonCircuitalSections);

    for (const room of sortedRooms) {
      const roomBenches: Bench[] = [];

      // Column-wise chronology: fill Column 1 front-to-back (Row 1..rows), then Column 2, etc.
      for (let col = 1; col <= room.columns; col++) {
        for (let row = 1; row <= room.rows; row++) {
          if (!dispatcher.hasRemaining()) break;

          const isEven = (col + row) % 2 === 0;
          const targetParity = isEven ? 'A' : 'B';
          const student = dispatcher.getNext(targetParity);

          if (student) {
            roomBenches.push({
              roomName: room.name,
              column: col,
              row: row,
              seats: [
                {
                  rollNumber: student.rollNumber,
                  sectionId: student.sectionId,
                  branchName: student.branchName,
                  category: student.category,
                  side: 'single',
                },
              ],
              phase: 'paired',
            });
          }
        }
        if (!dispatcher.hasRemaining()) break;
      }

      if (roomBenches.length > 0) {
        const totalStudents = roomBenches.reduce((s, b) => s + b.seats.length, 0);
        const sectionsPresent = [
          ...new Set(roomBenches.flatMap((b) => b.seats.map((s) => s.sectionId))),
        ];

        layouts.push({
          room,
          benches: roomBenches,
          totalStudents,
          totalBenchesUsed: roomBenches.length,
          emptySeats: room.capacity * studentsPerBench - totalStudents,
          sectionsPresent,
        });
      }
    }
  } else {
    // ─── Case 2: studentsPerBench === 2 (Double Bench) ─────
    // Keep students in section/branch chronology with numeric roll order ascending within each section
    const numericRollSort = (a: string, b: string) => {
      const aT = a.replace(/^0+/, '') || '0';
      const bT = b.replace(/^0+/, '') || '0';
      if (aT.length !== bT.length) return aT.length - bT.length;
      return aT < bT ? -1 : aT > bT ? 1 : 0;
    };

    const cStudents: StudentEntry[] = [];
    for (const sec of circuitalSections) {
      const sorted = [...sec.students].sort(numericRollSort);
      for (const roll of sorted) {
        cStudents.push({
          rollNumber: roll,
          sectionId: sec.sectionId,
          branchName: sec.branchName,
          category: 'circuital',
        });
      }
    }

    const nStudents: StudentEntry[] = [];
    for (const sec of nonCircuitalSections) {
      const sorted = [...sec.students].sort(numericRollSort);
      for (const roll of sorted) {
        nStudents.push({
          rollNumber: roll,
          sectionId: sec.sectionId,
          branchName: sec.branchName,
          category: 'non-circuital',
        });
      }
    }

    const totalPairs = Math.min(cStudents.length, nStudents.length);
    let pairIdx = 0;
    let leftoverIdx = 0;

    const leftovers: StudentEntry[] =
      cStudents.length >= nStudents.length
        ? cStudents.slice(totalPairs)
        : nStudents.slice(totalPairs);

    for (const room of sortedRooms) {
      const roomBenches: Bench[] = [];

      // Column-wise chronology: fill Column 1 front-to-back (Row 1..rows), then Column 2, etc.
      for (let col = 1; col <= room.columns; col++) {
        for (let row = 1; row <= room.rows; row++) {
          if (pairIdx >= totalPairs && leftoverIdx >= leftovers.length) {
            break;
          }

          if (pairIdx < totalPairs) {
            // Paired bench
            const cStud = cStudents[pairIdx];
            const nStud = nStudents[pairIdx];
            pairIdx++;

            const isEven = (col + row) % 2 === 0;
            const leftStud = isEven ? cStud : nStud;
            const rightStud = isEven ? nStud : cStud;

            roomBenches.push({
              roomName: room.name,
              column: col,
              row: row,
              seats: [
                {
                  rollNumber: leftStud.rollNumber,
                  sectionId: leftStud.sectionId,
                  branchName: leftStud.branchName,
                  category: leftStud.category,
                  side: 'left',
                },
                {
                  rollNumber: rightStud.rollNumber,
                  sectionId: rightStud.sectionId,
                  branchName: rightStud.branchName,
                  category: rightStud.category,
                  side: 'right',
                },
              ],
              phase: 'paired',
            });
          } else if (leftoverIdx < leftovers.length) {
            // Leftover bench: 1 student per bench
            const stud = leftovers[leftoverIdx++];
            roomBenches.push({
              roomName: room.name,
              column: col,
              row: row,
              seats: [
                {
                  rollNumber: stud.rollNumber,
                  sectionId: stud.sectionId,
                  branchName: stud.branchName,
                  category: stud.category,
                  side: 'single',
                },
              ],
              phase: 'leftover',
            });
          }
        }
        if (pairIdx >= totalPairs && leftoverIdx >= leftovers.length) {
          break;
        }
      }

      if (roomBenches.length > 0) {
        const totalStudents = roomBenches.reduce((s, b) => s + b.seats.length, 0);
        const sectionsPresent = [
          ...new Set(roomBenches.flatMap((b) => b.seats.map((s) => s.sectionId))),
        ];

        layouts.push({
          room,
          benches: roomBenches,
          totalStudents,
          totalBenchesUsed: roomBenches.length,
          emptySeats: room.capacity * studentsPerBench - totalStudents,
          sectionsPresent,
        });
      }
    }
  }

  // Compute summary
  const totalStudents = [...circuitalSections, ...nonCircuitalSections].reduce(
    (s, sec) => s + sec.students.length,
    0
  );
  const totalPlaced = layouts.reduce((s, l) => s + l.totalStudents, 0);

  const summary: EngineSummary = {
    totalStudents,
    totalPlaced,
    roomsUsed: layouts.length,
    unplaced: totalStudents - totalPlaced,
  };

  // ── Invariant assertions ──
  const invariantErrors = assertInvariants(
    form,
    circuitalSections,
    nonCircuitalSections,
    layouts,
    summary,
    studentsPerBench
  );

  if (invariantErrors.length > 0) {
    return { ok: false, errors: invariantErrors };
  }

  return { ok: true, layouts, summary };
}

// ─── Invariant checks ───────────────────────────────────

function assertInvariants(
  _form: FormState,
  circuitalSections: ResolvedSection[],
  nonCircuitalSections: ResolvedSection[],
  layouts: RoomLayout[],
  summary: EngineSummary,
  studentsPerBench: number
): import('./types').ValidationError[] {
  const errors: import('./types').ValidationError[] = [];

  // 1. Every student appears exactly once. Count in == count out.
  const allInputRolls = new Set<string>();
  for (const sec of [...circuitalSections, ...nonCircuitalSections]) {
    for (const r of sec.students) {
      allInputRolls.add(r);
    }
  }

  const allOutputRolls = new Map<string, number>();
  for (const layout of layouts) {
    for (const bench of layout.benches) {
      for (const seat of bench.seats) {
        allOutputRolls.set(
          seat.rollNumber,
          (allOutputRolls.get(seat.rollNumber) || 0) + 1
        );
      }
    }
  }

  if (allInputRolls.size !== allOutputRolls.size) {
    errors.push({
      type: 'error',
      message: `Invariant violation: input has ${allInputRolls.size} students but output has ${allOutputRolls.size}.`,
    });
  }

  for (const [roll, count] of allOutputRolls) {
    if (count > 1) {
      errors.push({
        type: 'error',
        message: `Invariant violation: roll ${roll} appears ${count} times in output.`,
      });
    }
    if (!allInputRolls.has(roll)) {
      errors.push({
        type: 'error',
        message: `Invariant violation: roll ${roll} in output but not in input.`,
      });
    }
  }

  for (const roll of allInputRolls) {
    if (!allOutputRolls.has(roll)) {
      errors.push({
        type: 'error',
        message: `Invariant violation: roll ${roll} in input but not in output (dropped).`,
      });
    }
  }

  // 2. No bench exceeds studentsPerBench
  for (const layout of layouts) {
    for (const bench of layout.benches) {
      if (bench.seats.length > studentsPerBench) {
        errors.push({
          type: 'error',
          message: `Invariant violation: bench at ${bench.roomName} col ${bench.column} row ${bench.row} has ${bench.seats.length} seats (max ${studentsPerBench}).`,
        });
      }
    }
  }

  // 3. Unplaced count
  if (summary.unplaced !== 0) {
    errors.push({
      type: 'error',
      message: `Invariant violation: ${summary.unplaced} students are unplaced.`,
    });
  }

  return errors;
}
