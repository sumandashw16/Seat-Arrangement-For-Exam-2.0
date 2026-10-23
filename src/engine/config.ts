/**
 * Algorithm configuration — Assumptions A1-A6.
 * Change these values to alter the seating algorithm behaviour.
 */
export const ENGINE_CONFIG = {
  /**
   * A1. Pairing is automatic by entry order: the k-th circuital section
   *     is paired with the k-th non-circuital section. Sections are
   *     flattened in the order entered (branch order, then section order).
   */
  pairingMode: 'entry-order' as const,

  /**
   * A2. Within a pair, the left/right sides swap on EVERY bench.
   */
  swapOnEveryBench: true,

  /**
   * A3. Benches fill column by column: all rows of column 1 from top to
   *     bottom, then column 2, etc. Row 1 is nearest the "FACE THIS SIDE" board.
   */
  fillOrder: 'column-major' as const,

  /**
   * A4. Leftover students sit ONE per bench with the other seat empty.
   */
  leftoversOnePerBench: true,

  /**
   * A5. Rooms are chosen largest-capacity-first to use the fewest rooms.
   *     A pair may continue from one room into the next room.
   */
  roomSortOrder: 'largest-first' as const,

  /**
   * A6. Duplicate roll numbers across sections block generation.
   */
  blockOnDuplicateRolls: true,

  /**
   * Maximum numbers a single roll range can expand to, to prevent browser freeze.
   */
  maxRangeSize: 10_000,
} as const;

export type EngineConfig = typeof ENGINE_CONFIG;
