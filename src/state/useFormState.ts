import { useState, useEffect, useCallback, useRef } from 'react';
import type { FormState, RoomInput, BranchInput, SectionInput, RollRange } from '../engine/types';

const DRAFT_KEY = 'seat-planner-draft';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function createDefaultSection(): SectionInput {
  return {
    id: generateId(),
    name: '',
    rollRanges: [{ start: '', end: '' }],
    additionalRolls: '',
    excludedRolls: '',
  };
}

function createDefaultBranch(): BranchInput {
  return {
    id: generateId(),
    name: '',
    sections: [createDefaultSection()],
  };
}

function createDefaultRoom(): RoomInput {
  return {
    id: generateId(),
    name: '',
    columns: 1,
    rows: 1,
  };
}

function createDefaultForm(): FormState {
  return {
    studentsPerBench: 2,
    rooms: [createDefaultRoom()],
    circuital: {
      type: 'circuital',
      branches: [createDefaultBranch()],
    },
    nonCircuital: {
      type: 'non-circuital',
      branches: [createDefaultBranch()],
    },
  };
}

function loadDraft(): FormState {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return createDefaultForm();
}

export function useFormState() {
  const [form, setForm] = useState<FormState>(loadDraft);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-save draft (debounced)
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }, 500);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [form]);

  // ── Room operations ──
  const addRoom = useCallback(() => {
    setForm((f) => ({ ...f, rooms: [...f.rooms, createDefaultRoom()] }));
  }, []);

  const removeRoom = useCallback((id: string) => {
    setForm((f) => ({
      ...f,
      rooms: f.rooms.filter((r) => r.id !== id),
    }));
  }, []);

  const updateRoom = useCallback(
    (id: string, updates: Partial<RoomInput>) => {
      setForm((f) => ({
        ...f,
        rooms: f.rooms.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
      }));
    },
    []
  );

  // ── Branch operations ──
  const addBranch = useCallback(
    (category: 'circuital' | 'non-circuital') => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: [...f[key].branches, createDefaultBranch()],
          },
        };
      });
    },
    []
  );

  const removeBranch = useCallback(
    (category: 'circuital' | 'non-circuital', branchId: string) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.filter((b) => b.id !== branchId),
          },
        };
      });
    },
    []
  );

  const updateBranch = useCallback(
    (
      category: 'circuital' | 'non-circuital',
      branchId: string,
      updates: Partial<BranchInput>
    ) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.map((b) =>
              b.id === branchId ? { ...b, ...updates } : b
            ),
          },
        };
      });
    },
    []
  );

  // ── Section operations ──
  const addSection = useCallback(
    (category: 'circuital' | 'non-circuital', branchId: string) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.map((b) =>
              b.id === branchId
                ? { ...b, sections: [...b.sections, createDefaultSection()] }
                : b
            ),
          },
        };
      });
    },
    []
  );

  const removeSection = useCallback(
    (
      category: 'circuital' | 'non-circuital',
      branchId: string,
      sectionId: string
    ) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.map((b) =>
              b.id === branchId
                ? { ...b, sections: b.sections.filter((s) => s.id !== sectionId) }
                : b
            ),
          },
        };
      });
    },
    []
  );

  const updateSection = useCallback(
    (
      category: 'circuital' | 'non-circuital',
      branchId: string,
      sectionId: string,
      updates: Partial<SectionInput>
    ) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.map((b) =>
              b.id === branchId
                ? {
                    ...b,
                    sections: b.sections.map((s) =>
                      s.id === sectionId ? { ...s, ...updates } : s
                    ),
                  }
                : b
            ),
          },
        };
      });
    },
    []
  );

  // ── Roll range operations ──
  const addRollRange = useCallback(
    (
      category: 'circuital' | 'non-circuital',
      branchId: string,
      sectionId: string
    ) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.map((b) =>
              b.id === branchId
                ? {
                    ...b,
                    sections: b.sections.map((s) =>
                      s.id === sectionId
                        ? {
                            ...s,
                            rollRanges: [
                              ...s.rollRanges,
                              { start: '', end: '' } as RollRange,
                            ],
                          }
                        : s
                    ),
                  }
                : b
            ),
          },
        };
      });
    },
    []
  );

  const updateRollRange = useCallback(
    (
      category: 'circuital' | 'non-circuital',
      branchId: string,
      sectionId: string,
      rangeIndex: number,
      updates: Partial<RollRange>
    ) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.map((b) =>
              b.id === branchId
                ? {
                    ...b,
                    sections: b.sections.map((s) =>
                      s.id === sectionId
                        ? {
                            ...s,
                            rollRanges: s.rollRanges.map((r, i) =>
                              i === rangeIndex ? { ...r, ...updates } : r
                            ),
                          }
                        : s
                    ),
                  }
                : b
            ),
          },
        };
      });
    },
    []
  );

  const removeRollRange = useCallback(
    (
      category: 'circuital' | 'non-circuital',
      branchId: string,
      sectionId: string,
      rangeIndex: number
    ) => {
      setForm((f) => {
        const key = category === 'circuital' ? 'circuital' : 'nonCircuital';
        return {
          ...f,
          [key]: {
            ...f[key],
            branches: f[key].branches.map((b) =>
              b.id === branchId
                ? {
                    ...b,
                    sections: b.sections.map((s) =>
                      s.id === sectionId
                        ? {
                            ...s,
                            rollRanges: s.rollRanges.filter(
                              (_, i) => i !== rangeIndex
                            ),
                          }
                        : s
                    ),
                  }
                : b
            ),
          },
        };
      });
    },
    []
  );

  const setStudentsPerBench = useCallback((v: 1 | 2) => {
    setForm((f) => ({ ...f, studentsPerBench: v }));
  }, []);

  const resetForm = useCallback(() => {
    const def = createDefaultForm();
    setForm(def);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(def));
  }, []);

  const loadForm = useCallback((state: FormState) => {
    setForm(state);
  }, []);

  return {
    form,
    setForm,
    addRoom,
    removeRoom,
    updateRoom,
    addBranch,
    removeBranch,
    updateBranch,
    addSection,
    removeSection,
    updateSection,
    addRollRange,
    updateRollRange,
    removeRollRange,
    setStudentsPerBench,
    resetForm,
    loadForm,
  };
}
