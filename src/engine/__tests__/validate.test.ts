import { describe, it, expect } from 'vitest';
import { validateInput } from '../validate';
import type { FormState } from '../types';

function makeFormState(overrides: Partial<FormState> = {}): FormState {
  return {
    studentsPerBench: 2,
    rooms: [{ id: '1', name: 'Room 1', columns: 5, rows: 4 }],
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

describe('validateInput', () => {
  it('passes valid input', () => {
    const { errors } = validateInput(makeFormState());
    expect(errors).toHaveLength(0);
  });

  it('errors on no rooms', () => {
    const { errors } = validateInput(makeFormState({ rooms: [] }));
    expect(errors.some((e) => e.message.includes('room'))).toBe(true);
  });

  it('errors on duplicate room names', () => {
    const { errors } = validateInput(
      makeFormState({
        rooms: [
          { id: '1', name: 'Room 1', columns: 5, rows: 4 },
          { id: '2', name: 'Room 1', columns: 3, rows: 3 },
        ],
      })
    );
    expect(errors.some((e) => e.message.includes('Duplicate room'))).toBe(true);
  });

  it('errors on room with invalid columns/rows', () => {
    const { errors } = validateInput(
      makeFormState({
        rooms: [{ id: '1', name: 'R1', columns: 0, rows: 4 }],
      })
    );
    expect(errors.some((e) => e.message.includes('columns'))).toBe(true);
  });

  it('errors on duplicate branch names within category', () => {
    const { errors } = validateInput(
      makeFormState({
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
            {
              id: 'b2',
              name: 'CSE',
              sections: [
                {
                  id: 's2',
                  name: 'B',
                  rollRanges: [{ start: '300', end: '309' }],
                  additionalRolls: '',
                  excludedRolls: '',
                },
              ],
            },
          ],
        },
      })
    );
    expect(errors.some((e) => e.message.includes('Duplicate branch'))).toBe(
      true
    );
  });

  it('errors on cross-section duplicate roll numbers (test 8)', () => {
    const { errors } = validateInput(
      makeFormState({
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
                  rollRanges: [{ start: '100', end: '110' }],
                  additionalRolls: '',
                  excludedRolls: '',
                },
                {
                  id: 's2',
                  name: 'B',
                  rollRanges: [{ start: '105', end: '115' }],
                  additionalRolls: '',
                  excludedRolls: '',
                },
              ],
            },
          ],
        },
      })
    );
    expect(errors.some((e) => e.message.includes('appears in both'))).toBe(
      true
    );
  });

  it('errors when total students > total seats', () => {
    const { errors } = validateInput(
      makeFormState({
        rooms: [{ id: '1', name: 'R1', columns: 1, rows: 1 }], // capacity = 1 bench = 2 seats
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
      })
    );
    expect(errors.some((e) => e.message.includes('exceeds') || e.message.includes('Shortfall'))).toBe(
      true
    );
  });
});
