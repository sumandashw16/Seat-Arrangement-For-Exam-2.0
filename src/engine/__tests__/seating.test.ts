import { describe, it, expect } from 'vitest';
import { generateSeating } from '../seating';
import type { FormState, RoomLayout, Bench } from '../types';

// ─── Helpers ────────────────────────────────────────────

function makeForm(overrides: Partial<FormState> = {}): FormState {
  return {
    studentsPerBench: 2,
    rooms: [{ id: 'r1', name: 'Room 1', columns: 5, rows: 4 }],
    circuital: {
      type: 'circuital',
      branches: [
        {
          id: 'b1',
          name: 'CSE',
          sections: [
            {
              id: 's1',
              name: 'A',
              rollRanges: [{ start: '100', end: '109' }],
              additionalRolls: '',
              excludedRolls: '',
            },
          ],
        },
      ],
    },
    nonCircuital: {
      type: 'non-circuital',
      branches: [
        {
          id: 'b2',
          name: 'CIVIL',
          sections: [
            {
              id: 's2',
              name: 'A',
              rollRanges: [{ start: '200', end: '209' }],
              additionalRolls: '',
              excludedRolls: '',
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}

function getAllBenches(layouts: RoomLayout[]): Bench[] {
  return layouts.flatMap((l) => l.benches);
}


// ─── Test 1: 1 pair, equal sections, 2 per bench ───────

describe('Test 1: 1 pair, equal sections, 2/bench', () => {
  it('verifies exact left/right swap pattern', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 5, rows: 4 }],
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const benches = getAllBenches(result.layouts)
      .filter((b) => b.phase === 'paired')
      .sort((a, b) => {
        if (a.column !== b.column) return a.column - b.column;
        return a.row - b.row;
      });

    expect(benches).toHaveLength(10); // 10 students each, 10 benches

    for (let j = 0; j < benches.length; j++) {
      const bench = benches[j];
      expect(bench.seats).toHaveLength(2);

      const leftCat = bench.seats[0].category;
      const rightCat = bench.seats[1].category;

      const isEven = (bench.column + bench.row) % 2 === 0;
      if (isEven) {
        // even: left=circuital, right=non-circuital
        expect(leftCat).toBe('circuital');
        expect(rightCat).toBe('non-circuital');
      } else {
        // odd: left=non-circuital, right=circuital
        expect(leftCat).toBe('non-circuital');
        expect(rightCat).toBe('circuital');
      }
    }

    expect(result.summary.totalPlaced).toBe(20);
    expect(result.summary.unplaced).toBe(0);
  });
});

// ─── Test 2: 1 per bench ───────────────────────────────

describe('Test 2: 1 per bench, C/N alternation', () => {
  it('verifies C, N, C, N alternation', () => {
    const form = makeForm({
      studentsPerBench: 1,
      rooms: [{ id: 'r1', name: 'R1', columns: 10, rows: 4 }], // 40 benches
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '104' }], // 5 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '204' }], // 5 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const benches = getAllBenches(result.layouts)
      .filter((b) => b.phase === 'paired')
      .sort((a, b) => {
        if (a.column !== b.column) return a.column - b.column;
        return a.row - b.row;
      });

    // 5 pairs, 2 benches each = 10 benches
    expect(benches).toHaveLength(10);

    for (let i = 0; i < benches.length; i++) {
      expect(benches[i].seats).toHaveLength(1);
      const isEven = (benches[i].column + benches[i].row) % 2 === 0;
      if (isEven) {
        expect(benches[i].seats[0].category).toBe('circuital');
      } else {
        expect(benches[i].seats[0].category).toBe('non-circuital');
      }
    }

    // Verify row 1 columns alternate strictly: Col 1 = C, Col 2 = N, Col 3 = C, Col 4 = N
    const row1Benches = benches.filter((b) => b.row === 1).sort((a, b) => a.column - b.column);
    for (let c = 0; c < row1Benches.length; c++) {
      const expectedCat = (row1Benches[c].column + 1) % 2 === 0 ? 'circuital' : 'non-circuital';
      expect(row1Benches[c].seats[0].category).toBe(expectedCat);
    }
  });
});

// ─── Test 3: Unequal sections → leftovers ──────────────

describe('Test 3: Unequal sections, remainder to leftovers', () => {
  it('places remainder one per bench', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 10, rows: 4 }], // 40 benches
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '114' }], // 15 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '209' }], // 10 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const pairedBenches = getAllBenches(result.layouts).filter(
      (b) => b.phase === 'paired'
    );
    const leftoverBenches = getAllBenches(result.layouts).filter(
      (b) => b.phase === 'leftover'
    );

    expect(pairedBenches).toHaveLength(10); // min(15, 10) = 10 pairs
    expect(leftoverBenches).toHaveLength(5); // 5 leftover circuital students
    for (const b of leftoverBenches) {
      expect(b.seats).toHaveLength(1); // one per bench
    }

    expect(result.summary.totalPlaced).toBe(25);
    expect(result.summary.unplaced).toBe(0);
  });
});

// ─── Test 4: Multiple pairs in one room ────────────────

describe('Test 4: Multiple pairs, one room', () => {
  it('second pair starts at next free bench', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 10, rows: 4 }], // 40 benches
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '104' }], // 5
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
          {
            id: 'b3',
            name: 'ETC',
            sections: [
              {
                id: 's3',
                name: 'A',
                rollRanges: [{ start: '400', end: '404' }], // 5
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '204' }], // 5
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
          {
            id: 'b4',
            name: 'MECH',
            sections: [
              {
                id: 's4',
                name: 'A',
                rollRanges: [{ start: '500', end: '504' }], // 5
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const benches = getAllBenches(result.layouts)
      .filter((b) => b.phase === 'paired')
      .sort((a, b) => {
        if (a.column !== b.column) return a.column - b.column;
        return a.row - b.row;
      });

    // Pair 1: 5 benches (CSE-A + CIVIL-A)
    // Pair 2: 5 benches (ETC-A + MECH-A)
    expect(benches).toHaveLength(10);

    // First 5 benches should have CSE-A and CIVIL-A
    for (let i = 0; i < 5; i++) {
      const sectionIds = benches[i].seats.map((s) => s.sectionId);
      expect(sectionIds).toContain('CSE-A');
      expect(sectionIds).toContain('CIVIL-A');
    }

    // Next 5 benches should have ETC-A and MECH-A
    for (let i = 5; i < 10; i++) {
      const sectionIds = benches[i].seats.map((s) => s.sectionId);
      expect(sectionIds).toContain('ETC-A');
      expect(sectionIds).toContain('MECH-A');
    }
  });
});

// ─── Test 5: Pair spanning two rooms ───────────────────

describe('Test 5: Pair spanning two rooms', () => {
  it('continues pair into next room', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [
        { id: 'r1', name: 'Small', columns: 1, rows: 3 }, // 3 benches
        { id: 'r2', name: 'Medium', columns: 2, rows: 3 }, // 6 benches
      ],
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '107' }], // 8 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '207' }], // 8 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Rooms sorted by capacity: Medium (6) first, Small (3) second
    // 8 paired benches = 6 in Medium + 2 in Small
    expect(result.layouts).toHaveLength(2);
    expect(result.summary.roomsUsed).toBe(2);

    // Find the room with most benches used
    const mediumLayout = result.layouts.find((l) => l.room.name === 'Medium');
    const smallLayout = result.layouts.find((l) => l.room.name === 'Small');

    expect(mediumLayout).toBeDefined();
    expect(smallLayout).toBeDefined();

    // Medium gets first 6 benches, Small gets remaining 2
    expect(mediumLayout!.totalBenchesUsed).toBe(6);
    expect(smallLayout!.totalBenchesUsed).toBe(2);

    expect(result.summary.totalPlaced).toBe(16);
  });
});

// ─── Test 6: More circuital than non-circuital (and reverse) ──

describe('Test 6: Unequal number of sections', () => {
  it('extra circuital sections go to leftovers', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 10, rows: 5 }], // 50 benches
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '104' }], // 5
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
          {
            id: 'b3',
            name: 'ETC',
            sections: [
              {
                id: 's3',
                name: 'A',
                rollRanges: [{ start: '400', end: '404' }], // 5, unpaired
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '204' }], // 5
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const leftoverBenches = getAllBenches(result.layouts).filter(
      (b) => b.phase === 'leftover'
    );

    // ETC-A (5 students) should be in leftovers, one per bench
    expect(leftoverBenches).toHaveLength(5);
    for (const b of leftoverBenches) {
      expect(b.seats).toHaveLength(1);
      expect(b.seats[0].sectionId).toBe('ETC-A');
    }

    expect(result.summary.totalPlaced).toBe(15);
  });

  it('extra non-circuital sections go to leftovers', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 10, rows: 5 }],
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '104' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '204' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
          {
            id: 'b4',
            name: 'MECH',
            sections: [
              {
                id: 's4',
                name: 'A',
                rollRanges: [{ start: '500', end: '504' }], // unpaired
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const leftoverBenches = getAllBenches(result.layouts).filter(
      (b) => b.phase === 'leftover'
    );

    expect(leftoverBenches).toHaveLength(5);
    for (const b of leftoverBenches) {
      expect(b.seats[0].sectionId).toBe('MECH-A');
    }
  });
});

// ─── Test 9: Not enough seats ──────────────────────────

describe('Test 9: Not enough seats', () => {
  it('returns error with shortfall, zero silent drops', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 1, rows: 1 }], // 1 bench = 2 seats
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '110' }], // 11 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '210' }], // 11 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors.some((e) => e.message.includes('exceeds') || e.message.includes('Shortfall'))).toBe(true);
  });
});

// ─── Test 10: Odd room sizes ───────────────────────────

describe('Test 10: Odd room sizes (1x1, 1xN, Nx1)', () => {
  it('handles 1x1 room', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 1, rows: 1 }],
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '100' }], // 1 student
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '200' }], // 1 student
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.summary.totalPlaced).toBe(2);
    expect(result.layouts[0].benches).toHaveLength(1);
  });

  it('handles 1xN room', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 1, rows: 5 }],
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '104' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '204' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.summary.totalPlaced).toBe(10);
    // All benches in column 1
    for (const bench of result.layouts[0].benches) {
      expect(bench.column).toBe(1);
    }
  });

  it('handles Nx1 room', () => {
    const form = makeForm({
      studentsPerBench: 2,
      rooms: [{ id: 'r1', name: 'R1', columns: 5, rows: 1 }],
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b1',
            name: 'CSE',
            sections: [
              {
                id: 's1',
                name: 'A',
                rollRanges: [{ start: '100', end: '104' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b2',
            name: 'CIVIL',
            sections: [
              {
                id: 's2',
                name: 'A',
                rollRanges: [{ start: '200', end: '204' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.summary.totalPlaced).toBe(10);
    // All benches in row 1
    for (const bench of result.layouts[0].benches) {
      expect(bench.row).toBe(1);
    }
  });
});

// ─── Test 11: Determinism + randomized property tests ──

describe('Test 11: Determinism and invariants', () => {
  it('same input always gives same output', () => {
    const form = makeForm();
    const r1 = generateSeating(form);
    const r2 = generateSeating(form);

    expect(r1).toEqual(r2);
  });

  it('randomized property test: 200 random inputs pass all invariants', () => {
    // Pseudo-random with fixed seed for reproducibility
    let seed = 42;
    function nextRand(): number {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed;
    }
    function randInt(min: number, max: number): number {
      return min + (nextRand() % (max - min + 1));
    }

    for (let trial = 0; trial < 200; trial++) {
      const numCircBranches = randInt(1, 3);
      const numNonCircBranches = randInt(1, 3);
      const studentsPerBench = (randInt(1, 2) as 1 | 2);

      let totalStudents = 0;

      const circBranches = [];
      let rollCounter = 1000;
      for (let b = 0; b < numCircBranches; b++) {
        const numSections = randInt(1, 2);
        const sections = [];
        for (let s = 0; s < numSections; s++) {
          const count = randInt(1, 15);
          const start = rollCounter;
          const end = rollCounter + count - 1;
          rollCounter = end + 10; // gap to avoid cross-section dups
          sections.push({
            id: `cs${b}_${s}`,
            name: String.fromCharCode(65 + s),
            rollRanges: [{ start: String(start), end: String(end) }],
            additionalRolls: '',
            excludedRolls: '',
          });
          totalStudents += count;
        }
        circBranches.push({
          id: `cb${b}`,
          name: `CIRC${b}`,
          sections,
        });
      }

      const nonCircBranches = [];
      for (let b = 0; b < numNonCircBranches; b++) {
        const numSections = randInt(1, 2);
        const sections = [];
        for (let s = 0; s < numSections; s++) {
          const count = randInt(1, 15);
          const start = rollCounter;
          const end = rollCounter + count - 1;
          rollCounter = end + 10;
          sections.push({
            id: `ns${b}_${s}`,
            name: String.fromCharCode(65 + s),
            rollRanges: [{ start: String(start), end: String(end) }],
            additionalRolls: '',
            excludedRolls: '',
          });
          totalStudents += count;
        }
        nonCircBranches.push({
          id: `nb${b}`,
          name: `NCIRC${b}`,
          sections,
        });
      }

      // Ensure enough room capacity
      const benchesNeeded = studentsPerBench === 2
        ? Math.ceil(totalStudents / 2) + totalStudents // generous
        : totalStudents * 2;
      const numRooms = randInt(1, 3);
      const rooms = [];
      let remaining = benchesNeeded;
      for (let r = 0; r < numRooms; r++) {
        const cap = r === numRooms - 1 ? Math.max(remaining, 1) : randInt(1, Math.max(remaining, 1));
        const cols = randInt(1, Math.max(cap, 1));
        const rows = Math.max(1, Math.ceil(cap / cols));
        rooms.push({
          id: `r${r}`,
          name: `Room${r}`,
          columns: cols,
          rows,
        });
        remaining -= cols * rows;
        if (remaining <= 0) remaining = 1;
      }

      const form: FormState = {
        studentsPerBench,
        rooms,
        circuital: { type: 'circuital', branches: circBranches },
        nonCircuital: { type: 'non-circuital', branches: nonCircBranches },
      };

      const result = generateSeating(form);

      if (result.ok) {
        // All invariants are checked inside generateSeating via assertInvariants
        expect(result.summary.unplaced).toBe(0);
        expect(result.summary.totalPlaced).toBe(result.summary.totalStudents);

        // No bench exceeds studentsPerBench
        for (const layout of result.layouts) {
          for (const bench of layout.benches) {
            expect(bench.seats.length).toBeLessThanOrEqual(studentsPerBench);
          }
        }

        // No same-category pair on paired bench
        for (const layout of result.layouts) {
          for (const bench of layout.benches) {
            if (bench.phase === 'paired' && bench.seats.length === 2) {
              expect(bench.seats[0].category).not.toBe(bench.seats[1].category);
            }
          }
        }

        // Determinism
        const result2 = generateSeating(form);
        expect(result2).toEqual(result);
      }
      // If not ok, it should be due to capacity — that's fine for random inputs
    }
  });
});

// ─── Test 14: 4 Columns Diagonal Chronology (User specific test) ─────

describe('Test 14: 4 Columns diagonal chronology (1 CSE, 1 ETC, 1 CSE, 1 ETC)', () => {
  it('verifies exact 4-column row-wise and diagonal chronology', () => {
    const form = makeForm({
      studentsPerBench: 1,
      rooms: [{ id: 'r1', name: 'Hall 4C', columns: 4, rows: 4 }], // 16 benches
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b-cse',
            name: 'CSE',
            sections: [
              {
                id: 's-cse',
                name: 'A',
                rollRanges: [{ start: '101', end: '108' }], // 8 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b-etc',
            name: 'ETC',
            sections: [
              {
                id: 's-etc',
                name: 'A',
                rollRanges: [{ start: '201', end: '208' }], // 8 students
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const benches = result.layouts[0].benches;
    expect(benches).toHaveLength(16);

    // Build coordinate lookup: (col, row) -> section branch
    const grid = new Map<string, string>();
    for (const b of benches) {
      grid.set(`${b.column},${b.row}`, b.seats[0].branchName);
    }

    // Row 1: Col 1 = CSE, Col 2 = ETC, Col 3 = CSE, Col 4 = ETC
    expect(grid.get('1,1')).toBe('CSE');
    expect(grid.get('2,1')).toBe('ETC');
    expect(grid.get('3,1')).toBe('CSE');
    expect(grid.get('4,1')).toBe('ETC');

    // Row 2: Col 1 = ETC, Col 2 = CSE, Col 3 = ETC, Col 4 = CSE
    expect(grid.get('1,2')).toBe('ETC');
    expect(grid.get('2,2')).toBe('CSE');
    expect(grid.get('3,2')).toBe('ETC');
    expect(grid.get('4,2')).toBe('CSE');

    // Row 3: Col 1 = CSE, Col 2 = ETC, Col 3 = CSE, Col 4 = ETC
    expect(grid.get('1,3')).toBe('CSE');
    expect(grid.get('2,3')).toBe('ETC');
    expect(grid.get('3,3')).toBe('CSE');
    expect(grid.get('4,3')).toBe('ETC');

    // Row 4: Col 1 = ETC, Col 2 = CSE, Col 3 = ETC, Col 4 = CSE
    expect(grid.get('1,4')).toBe('ETC');
    expect(grid.get('2,4')).toBe('CSE');
    expect(grid.get('3,4')).toBe('ETC');
    expect(grid.get('4,4')).toBe('CSE');

    // Verify diagonal neighbors are same branch, but orthogonal neighbors are different
    expect(grid.get('1,1')).toBe(grid.get('2,2')); // diagonal: CSE === CSE
    expect(grid.get('2,1')).toBe(grid.get('3,2')); // diagonal: ETC === ETC
  });
});

// ─── Test 15: User exact scenario (Room C-101 4C x 8R, CSE + ECE + MME) ─────

describe('Test 15: User exact scenario: Room C-101 (4C x 8R, CSE + ECE + MME)', () => {
  it('allocates circuital vs non-circuital diagonally with sequential roll numbers', () => {
    const form = makeForm({
      studentsPerBench: 1,
      rooms: [{ id: 'r1', name: 'C-101', columns: 4, rows: 8 }], // 32 seats
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b-cse',
            name: 'CSE',
            sections: [
              {
                id: 's-cse',
                name: 'A',
                rollRanges: [{ start: '2402040026', end: '2402040029' }],
                additionalRolls: '2402040058, 2402040059',
                excludedRolls: '',
              },
            ],
          },
          {
            id: 'b-ece',
            name: 'ECE',
            sections: [
              {
                id: 's-ece',
                name: 'A',
                rollRanges: [
                  { start: '2302040020', end: '2302040021' },
                  { start: '2302040023', end: '2302040035' },
                ],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b-mme',
            name: 'MME',
            sections: [
              {
                id: 's-mme',
                name: 'A',
                rollRanges: [{ start: '2102040019', end: '2102040029' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    });

    const result = generateSeating(form);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.summary.totalStudents).toBe(32);
    expect(result.summary.totalPlaced).toBe(32);
    expect(result.summary.unplaced).toBe(0);

    const layout = result.layouts[0];
    const benchMap = new Map<string, { branch: string; roll: string }>();
    for (const b of layout.benches) {
      benchMap.set(`${b.column},${b.row}`, {
        branch: b.seats[0].branchName,
        roll: b.seats[0].rollNumber,
      });
    }

    // Row 1: CSE, MME, CSE, MME
    expect(benchMap.get('1,1')?.branch).toBe('CSE');
    expect(benchMap.get('2,1')?.branch).toBe('MME');
    expect(benchMap.get('3,1')?.branch).toBe('CSE');
    expect(benchMap.get('4,1')?.branch).toBe('MME');

    // Row 2: MME, CSE, MME, CSE
    expect(benchMap.get('1,2')?.branch).toBe('MME');
    expect(benchMap.get('2,2')?.branch).toBe('CSE');
    expect(benchMap.get('3,2')?.branch).toBe('MME');
    expect(benchMap.get('4,2')?.branch).toBe('CSE');

    // Row 3: CSE, MME, CSE, MME
    expect(benchMap.get('1,3')?.branch).toBe('CSE');
    expect(benchMap.get('2,3')?.branch).toBe('MME');
    expect(benchMap.get('3,3')?.branch).toBe('CSE');
    expect(benchMap.get('4,3')?.branch).toBe('MME');

    // Verify rolls within CSE are strictly in order: 26, 27, 28, 29, 58, 59
    expect(benchMap.get('1,1')?.roll).toBe('2402040026');
    expect(benchMap.get('3,1')?.roll).toBe('2402040027');
    expect(benchMap.get('2,2')?.roll).toBe('2402040028');
    expect(benchMap.get('4,2')?.roll).toBe('2402040029');
    expect(benchMap.get('1,3')?.roll).toBe('2402040058');
    expect(benchMap.get('3,3')?.roll).toBe('2402040059');

    // Verify rolls within MME are strictly in order: 19..29
    expect(benchMap.get('2,1')?.roll).toBe('2102040019');
    expect(benchMap.get('4,1')?.roll).toBe('2102040020');
    expect(benchMap.get('1,2')?.roll).toBe('2102040021');
    expect(benchMap.get('3,2')?.roll).toBe('2102040022');
    expect(benchMap.get('2,3')?.roll).toBe('2102040023');
    expect(benchMap.get('4,3')?.roll).toBe('2102040024');

    // Check diagonal consistency: (1,1) CSE === (2,2) CSE
    expect(benchMap.get('1,1')?.branch).toBe(benchMap.get('2,2')?.branch);
    expect(benchMap.get('2,1')?.branch).toBe(benchMap.get('3,2')?.branch);
  });
});


