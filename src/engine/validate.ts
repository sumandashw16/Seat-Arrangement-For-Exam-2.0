import type {
  FormState,
  ResolvedRoom,
  ResolvedSection,
  ValidationError,
} from './types';
import { resolveCategory } from './resolveStudents';

/**
 * Full input validation (Section 3 of the spec).
 * Returns blocking errors and non-blocking warnings.
 * Also returns resolved rooms and sections for downstream use.
 */
export function validateInput(form: FormState): {
  errors: ValidationError[];
  warnings: ValidationError[];
  resolvedRooms: ResolvedRoom[];
  circuitalSections: ResolvedSection[];
  nonCircuitalSections: ResolvedSection[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // ── At least 1 room ──
  if (form.rooms.length === 0) {
    errors.push({
      type: 'error',
      message: 'At least 1 room is required.',
    });
  }

  // ── Room validation ──
  const roomNames = new Set<string>();
  const resolvedRooms: ResolvedRoom[] = [];

  for (let i = 0; i < form.rooms.length; i++) {
    const room = form.rooms[i];
    const prefix = `rooms[${i}]`;

    if (!room.name.trim()) {
      errors.push({
        type: 'error',
        field: `${prefix}.name`,
        message: `Room ${i + 1} must have a name.`,
      });
    } else if (roomNames.has(room.name.trim())) {
      errors.push({
        type: 'error',
        field: `${prefix}.name`,
        message: `Duplicate room name "${room.name.trim()}".`,
      });
    } else {
      roomNames.add(room.name.trim());
    }

    if (!Number.isInteger(room.columns) || room.columns < 1) {
      errors.push({
        type: 'error',
        field: `${prefix}.columns`,
        message: `Room "${room.name}" columns must be an integer >= 1.`,
      });
    }

    if (!Number.isInteger(room.rows) || room.rows < 1) {
      errors.push({
        type: 'error',
        field: `${prefix}.rows`,
        message: `Room "${room.name}" rows must be an integer >= 1.`,
      });
    }

    if (
      Number.isInteger(room.columns) &&
      room.columns >= 1 &&
      Number.isInteger(room.rows) &&
      room.rows >= 1
    ) {
      resolvedRooms.push({
        name: room.name.trim(),
        columns: room.columns,
        rows: room.rows,
        capacity: room.columns * room.rows,
      });
    }
  }

  // ── Branch / section validation ──
  const validateBranches = (
    catInput: FormState['circuital'] | FormState['nonCircuital'],
    catLabel: string
  ) => {
    const branchNames = new Set<string>();
    for (let bi = 0; bi < catInput.branches.length; bi++) {
      const branch = catInput.branches[bi];
      const bPrefix = `${catLabel}.branches[${bi}]`;

      if (!branch.name.trim()) {
        errors.push({
          type: 'error',
          field: `${bPrefix}.name`,
          message: `Branch ${bi + 1} in ${catLabel} must have a name.`,
        });
      } else if (branchNames.has(branch.name.trim())) {
        errors.push({
          type: 'error',
          field: `${bPrefix}.name`,
          message: `Duplicate branch name "${branch.name.trim()}" in ${catLabel}.`,
        });
      } else {
        branchNames.add(branch.name.trim());
      }

      const sectionNames = new Set<string>();
      for (let si = 0; si < branch.sections.length; si++) {
        const section = branch.sections[si];
        const sPrefix = `${bPrefix}.sections[${si}]`;

        if (!section.name.trim()) {
          errors.push({
            type: 'error',
            field: `${sPrefix}.name`,
            message: `Section ${si + 1} in branch "${branch.name}" must have a name.`,
          });
        } else if (sectionNames.has(section.name.trim())) {
          errors.push({
            type: 'error',
            field: `${sPrefix}.name`,
            message: `Duplicate section name "${section.name.trim()}" in branch "${branch.name}".`,
          });
        } else {
          sectionNames.add(section.name.trim());
        }
      }
    }
  };

  validateBranches(form.circuital, 'circuital');
  validateBranches(form.nonCircuital, 'non-circuital');

  // ── Resolve sections ──
  const circRes = resolveCategory(form.circuital);
  const nonCircRes = resolveCategory(form.nonCircuital);

  errors.push(...circRes.errors, ...nonCircRes.errors);
  warnings.push(...circRes.warnings, ...nonCircRes.warnings);

  const circuitalSections = circRes.sections;
  const nonCircuitalSections = nonCircRes.sections;

  // ── At least 1 section ──
  const allSections = [...circuitalSections, ...nonCircuitalSections];
  if (allSections.length === 0) {
    errors.push({
      type: 'error',
      message: 'At least 1 section with students is required.',
    });
  }

  // ── Cross-section duplicate detection ──
  const rollToSection = new Map<string, string>();
  for (const section of allSections) {
    for (const roll of section.students) {
      const existing = rollToSection.get(roll);
      if (existing && existing !== section.sectionId) {
        errors.push({
          type: 'error',
          message: `Roll number ${roll} appears in both "${existing}" and "${section.sectionId}".`,
        });
      } else {
        rollToSection.set(roll, section.sectionId);
      }
    }
  }

  // ── Total students vs total seats ──
  const totalStudents = allSections.reduce((sum, s) => sum + s.students.length, 0);
  const totalBenches = resolvedRooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalSeats = totalBenches * form.studentsPerBench;

  if (totalStudents > totalSeats && errors.length === 0) {
    errors.push({
      type: 'error',
      message: `Total students (${totalStudents}) exceeds total seats (${totalSeats}). Shortfall: ${totalStudents - totalSeats} seats.`,
    });
  }

  return {
    errors,
    warnings,
    resolvedRooms,
    circuitalSections,
    nonCircuitalSections,
  };
}
