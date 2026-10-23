// ── Input Types ──────────────────────────────────────────

export type StudentsPerBench = 1 | 2;

export interface RollRange {
  start: string; // numeric string, e.g. "2402041126"
  end: string;
}

export interface SectionInput {
  id: string; // UUID for React keys
  name: string; // e.g. "A"
  rollRanges: RollRange[];
  additionalRolls: string; // raw textarea content
  excludedRolls: string; // raw textarea content
}

export interface BranchInput {
  id: string;
  name: string; // e.g. "CSE"
  sections: SectionInput[];
}

export interface CategoryInput {
  type: 'circuital' | 'non-circuital';
  branches: BranchInput[];
}

export interface RoomInput {
  id: string;
  name: string;
  columns: number;
  rows: number;
}

export interface FormState {
  studentsPerBench: StudentsPerBench;
  rooms: RoomInput[];
  circuital: CategoryInput;
  nonCircuital: CategoryInput;
}

// ── Resolved (after validation) ─────────────────────────

export interface ResolvedSection {
  sectionId: string; // "CSE-A"
  branchName: string;
  category: 'circuital' | 'non-circuital';
  students: string[]; // sorted ascending numeric strings
}

export interface ResolvedRoom {
  name: string;
  columns: number;
  rows: number;
  capacity: number; // columns * rows (in benches)
}

// ── Engine Output ───────────────────────────────────────

export type Side = 'left' | 'right' | 'single';

export interface Seat {
  rollNumber: string;
  sectionId: string; // "CSE-A"
  branchName: string;
  category: 'circuital' | 'non-circuital';
  side: Side;
}

export interface Bench {
  roomName: string;
  column: number; // 1-indexed
  row: number; // 1-indexed
  seats: Seat[]; // length 0..2
  phase: 'paired' | 'leftover';
}

export interface RoomLayout {
  room: ResolvedRoom;
  benches: Bench[]; // only benches with ≥1 student
  totalStudents: number;
  totalBenchesUsed: number;
  emptySeats: number;
  sectionsPresent: string[]; // unique section IDs
}

export interface EngineSummary {
  totalStudents: number;
  totalPlaced: number;
  roomsUsed: number;
  unplaced: number;
}

// Result type — never throws on bad user input
export type EngineResult =
  | { ok: true; layouts: RoomLayout[]; summary: EngineSummary }
  | { ok: false; errors: ValidationError[] };

export interface ValidationError {
  type: 'error' | 'warning';
  field?: string; // path like "rooms[0].name"
  message: string;
}

// ── Internal helpers ────────────────────────────────────

export interface StudentEntry {
  rollNumber: string;
  sectionId: string;
  branchName: string;
  category: 'circuital' | 'non-circuital';
}

export interface Pair {
  circuitalSection: ResolvedSection;
  nonCircuitalSection: ResolvedSection;
  pairedCount: number; // min of the two section lengths
}

// Global bench address in the flattened bench list
export interface BenchAddress {
  gIdx: number;
  roomIndex: number;
  roomName: string;
  column: number; // 1-indexed
  row: number; // 1-indexed
}
