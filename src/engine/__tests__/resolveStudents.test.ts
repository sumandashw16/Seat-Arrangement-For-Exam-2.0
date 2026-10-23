import { describe, it, expect } from 'vitest';
import {
  parseRollList,
  isValidRollNumber,
  expandRange,
  resolveSection,
  compareRollNumbers,
} from '../resolveStudents';
import type { SectionInput } from '../types';

describe('parseRollList', () => {
  it('splits by comma, space, newline', () => {
    expect(parseRollList('100, 200 300\n400')).toEqual([
      '100',
      '200',
      '300',
      '400',
    ]);
  });

  it('trims whitespace and ignores empty', () => {
    expect(parseRollList('  100 ,  , 200  ')).toEqual(['100', '200']);
  });

  it('returns empty for empty string', () => {
    expect(parseRollList('')).toEqual([]);
  });
});

describe('isValidRollNumber', () => {
  it('accepts digits', () => {
    expect(isValidRollNumber('2402041126')).toBe(true);
    expect(isValidRollNumber('0')).toBe(true);
  });

  it('rejects non-digits', () => {
    expect(isValidRollNumber('abc')).toBe(false);
    expect(isValidRollNumber('12a3')).toBe(false);
    expect(isValidRollNumber('')).toBe(false);
    expect(isValidRollNumber(' 123')).toBe(false);
  });
});

describe('compareRollNumbers', () => {
  it('compares numerically', () => {
    expect(compareRollNumbers('100', '200')).toBeLessThan(0);
    expect(compareRollNumbers('200', '100')).toBeGreaterThan(0);
    expect(compareRollNumbers('100', '100')).toBe(0);
  });

  it('handles different lengths', () => {
    expect(compareRollNumbers('9', '10')).toBeLessThan(0);
    expect(compareRollNumbers('99', '100')).toBeLessThan(0);
  });

  it('handles leading zeros', () => {
    expect(compareRollNumbers('007', '7')).toBe(0);
  });
});

describe('expandRange', () => {
  it('expands a simple range', () => {
    const { rolls, errors } = expandRange('100', '105', 'TEST-A', 0);
    expect(errors).toHaveLength(0);
    expect(rolls).toEqual(['100', '101', '102', '103', '104', '105']);
  });

  it('handles a single-number range', () => {
    const { rolls, errors } = expandRange('42', '42', 'TEST-A', 0);
    expect(errors).toHaveLength(0);
    expect(rolls).toEqual(['42']);
  });

  it('errors when start > end', () => {
    const { errors } = expandRange('200', '100', 'TEST-A', 0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('start');
  });

  it('errors on non-numeric', () => {
    const { errors } = expandRange('abc', '100', 'TEST-A', 0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('errors on range exceeding cap', () => {
    const { errors } = expandRange('1', '20000', 'TEST-A', 0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('limit');
  });

  it('preserves leading zeros via padding', () => {
    const { rolls } = expandRange('008', '012', 'TEST-A', 0);
    expect(rolls).toEqual(['008', '009', '010', '011', '012']);
  });
});

describe('resolveSection', () => {
  const makeSection = (
    overrides: Partial<SectionInput> = {}
  ): SectionInput => ({
    id: 'test',
    name: 'A',
    rollRanges: [{ start: '100', end: '105' }],
    additionalRolls: '',
    excludedRolls: '',
    ...overrides,
  });

  it('expands ranges and sorts', () => {
    const { resolved, errors } = resolveSection(
      makeSection(),
      'CSE',
      'circuital'
    );
    expect(errors).toHaveLength(0);
    expect(resolved.sectionId).toBe('CSE-A');
    expect(resolved.students).toEqual([
      '100',
      '101',
      '102',
      '103',
      '104',
      '105',
    ]);
  });

  it('adds additional rolls', () => {
    const { resolved, errors } = resolveSection(
      makeSection({ additionalRolls: '200, 201' }),
      'CSE',
      'circuital'
    );
    expect(errors).toHaveLength(0);
    expect(resolved.students).toContain('200');
    expect(resolved.students).toContain('201');
  });

  it('removes excluded rolls', () => {
    const { resolved } = resolveSection(
      makeSection({ excludedRolls: '102, 103' }),
      'CSE',
      'circuital'
    );
    expect(resolved.students).not.toContain('102');
    expect(resolved.students).not.toContain('103');
    expect(resolved.students).toHaveLength(4);
  });

  it('deduplicates', () => {
    const { resolved } = resolveSection(
      makeSection({
        rollRanges: [
          { start: '100', end: '105' },
          { start: '103', end: '108' },
        ],
      }),
      'CSE',
      'circuital'
    );
    expect(resolved.students).toHaveLength(9); // 100-108
    expect(new Set(resolved.students).size).toBe(9);
  });

  it('warns on excluded roll not in section', () => {
    const { warnings } = resolveSection(
      makeSection({ excludedRolls: '999' }),
      'CSE',
      'circuital'
    );
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].message).toContain('999');
  });

  it('warns on 0-student section', () => {
    const { warnings } = resolveSection(
      makeSection({
        rollRanges: [{ start: '100', end: '100' }],
        excludedRolls: '100',
      }),
      'CSE',
      'circuital'
    );
    expect(warnings.some((w) => w.message.includes('0 students'))).toBe(true);
  });

  it('handles ranges + additions + exclusions + dedup correctly (test 7)', () => {
    const { resolved, errors } = resolveSection(
      makeSection({
        rollRanges: [
          { start: '100', end: '110' },
          { start: '108', end: '115' }, // overlap with above
        ],
        additionalRolls: '200, 100', // 100 is a dup
        excludedRolls: '105, 200',
      }),
      'CSE',
      'circuital'
    );
    expect(errors).toHaveLength(0);
    // 100-115 is 16 unique, minus 105, minus 200 (was added then removed) = 15
    const expected = [];
    for (let i = 100; i <= 115; i++) {
      if (i !== 105) expected.push(String(i));
    }
    expect(resolved.students).toEqual(expected);
  });
});
