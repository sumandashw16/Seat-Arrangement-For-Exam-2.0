import type {
  SectionInput,
  BranchInput,
  CategoryInput,
  ResolvedSection,
  ValidationError,
} from './types';
import { ENGINE_CONFIG } from './config';

/**
 * Parse a raw text input (comma, space, or newline separated) into
 * an array of trimmed non-empty strings.
 */
export function parseRollList(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Check if a string is a valid numeric roll number (digits only, non-empty).
 */
export function isValidRollNumber(s: string): boolean {
  return /^\d+$/.test(s);
}

/**
 * Compare two numeric strings numerically.
 * Uses string length first (shorter = smaller), then lexicographic for same-length.
 * This is correct for non-negative integers without leading zeros.
 * For leading zeros, we compare as BigInt.
 */
export function compareRollNumbers(a: string, b: string): number {
  // Remove leading zeros for comparison
  const aTrimmed = a.replace(/^0+/, '') || '0';
  const bTrimmed = b.replace(/^0+/, '') || '0';
  if (aTrimmed.length !== bTrimmed.length) {
    return aTrimmed.length - bTrimmed.length;
  }
  return aTrimmed < bTrimmed ? -1 : aTrimmed > bTrimmed ? 1 : 0;
}

/**
 * Expand a roll range [start, end] into an array of numeric strings.
 * Returns { rolls, errors } where errors are validation issues.
 */
export function expandRange(
  start: string,
  end: string,
  sectionLabel: string,
  _rangeIndex: number
): { rolls: string[]; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!isValidRollNumber(start)) {
    errors.push({
      type: 'error',
      field: sectionLabel,
      message: `Range start "${start}" is not a valid number in ${sectionLabel}.`,
    });
  }
  if (!isValidRollNumber(end)) {
    errors.push({
      type: 'error',
      field: sectionLabel,
      message: `Range end "${end}" is not a valid number in ${sectionLabel}.`,
    });
  }

  if (errors.length > 0) return { rolls: [], errors };

  const startBig = BigInt(start);
  const endBig = BigInt(end);

  if (startBig > endBig) {
    errors.push({
      type: 'error',
      field: sectionLabel,
      message: `Range start (${start}) > end (${end}) in ${sectionLabel}.`,
    });
    return { rolls: [], errors };
  }

  const count = Number(endBig - startBig) + 1;
  if (count > ENGINE_CONFIG.maxRangeSize) {
    errors.push({
      type: 'error',
      field: sectionLabel,
      message: `Range ${start}–${end} in ${sectionLabel} contains ${count} numbers, exceeding the limit of ${ENGINE_CONFIG.maxRangeSize}.`,
    });
    return { rolls: [], errors };
  }

  // Pad to the length of the longer string to preserve leading zeros
  const padLen = Math.max(start.length, end.length);
  const rolls: string[] = [];
  for (let i = startBig; i <= endBig; i++) {
    rolls.push(i.toString().padStart(padLen, '0'));
  }

  return { rolls, errors };
}

/**
 * Resolve a single section's student list:
 *   (all ranges expanded + additional) minus excluded, deduplicated, sorted ascending.
 *
 * Returns the resolved section plus any validation errors/warnings.
 */
export function resolveSection(
  section: SectionInput,
  branchName: string,
  category: 'circuital' | 'non-circuital'
): {
  resolved: ResolvedSection;
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const sectionLabel = `${branchName}-${section.name}`;
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 1. Expand all ranges
  const allRolls: string[] = [];
  for (let i = 0; i < section.rollRanges.length; i++) {
    const range = section.rollRanges[i];
    if (!range.start.trim() && !range.end.trim()) continue; // skip empty ranges
    const { rolls, errors: rangeErrors } = expandRange(
      range.start.trim(),
      range.end.trim(),
      sectionLabel,
      i
    );
    errors.push(...rangeErrors);
    allRolls.push(...rolls);
  }

  // 2. Parse additional rolls
  const additionalRaw = parseRollList(section.additionalRolls);
  for (const r of additionalRaw) {
    if (!isValidRollNumber(r)) {
      errors.push({
        type: 'error',
        field: sectionLabel,
        message: `Additional roll "${r}" is not a valid number in ${sectionLabel}.`,
      });
    } else {
      allRolls.push(r);
    }
  }

  // 3. Parse excluded rolls
  const excludedRaw = parseRollList(section.excludedRolls);
  const excludedSet = new Set<string>();
  for (const r of excludedRaw) {
    if (!isValidRollNumber(r)) {
      errors.push({
        type: 'error',
        field: sectionLabel,
        message: `Excluded roll "${r}" is not a valid number in ${sectionLabel}.`,
      });
    } else {
      excludedSet.add(r);
    }
  }

  // 4. Deduplicate
  const uniqueRolls = [...new Set(allRolls)];

  // 5. Remove excluded
  const finalRolls = uniqueRolls.filter((r) => !excludedSet.has(r));

  // 6. Check for excluded rolls not in the section
  for (const exc of excludedSet) {
    if (!allRolls.includes(exc)) {
      warnings.push({
        type: 'warning',
        field: sectionLabel,
        message: `Excluded roll "${exc}" is not in section ${sectionLabel}.`,
      });
    }
  }

  // 7. Sort ascending
  finalRolls.sort(compareRollNumbers);

  // 8. Check at least 1 student
  if (finalRolls.length === 0 && errors.length === 0) {
    warnings.push({
      type: 'warning',
      field: sectionLabel,
      message: `Section ${sectionLabel} resolves to 0 students.`,
    });
  }

  return {
    resolved: {
      sectionId: sectionLabel,
      branchName,
      category,
      students: finalRolls,
    },
    errors,
    warnings,
  };
}

/**
 * Resolve all sections from a category.
 * Flattened in branch order, then section order.
 */
export function resolveCategory(category: CategoryInput): {
  sections: ResolvedSection[];
  errors: ValidationError[];
  warnings: ValidationError[];
} {
  const sections: ResolvedSection[] = [];
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  for (const branch of category.branches) {
    for (const section of branch.sections) {
      const { resolved, errors, warnings } = resolveSection(
        section,
        branch.name,
        category.type
      );
      sections.push(resolved);
      allErrors.push(...errors);
      allWarnings.push(...warnings);
    }
  }

  return { sections, errors: allErrors, warnings: allWarnings };
}

/**
 * Flatten branches from a category input into an ordered list.
 */
export function flattenBranches(category: CategoryInput): BranchInput[] {
  return category.branches;
}
