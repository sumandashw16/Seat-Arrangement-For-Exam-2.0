import { useState, useCallback } from 'react';
import type { FormState, EngineResult } from '../engine/types';

interface SavedLayout {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  inputState: FormState;
  result: EngineResult | null;
}

const LAYOUTS_KEY = 'seat-planner-layouts';

function loadLayouts(): SavedLayout[] {
  try {
    const raw = localStorage.getItem(LAYOUTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function persistLayouts(layouts: SavedLayout[]) {
  localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
}

export function useSavedLayouts() {
  const [layouts, setLayouts] = useState<SavedLayout[]>(loadLayouts);

  const saveLayout = useCallback(
    (name: string, inputState: FormState, result: EngineResult | null) => {
      const now = new Date().toISOString();
      const newLayout: SavedLayout = {
        id: Math.random().toString(36).substring(2, 11),
        name,
        createdAt: now,
        updatedAt: now,
        inputState,
        result,
      };
      setLayouts((prev) => {
        const next = [newLayout, ...prev];
        persistLayouts(next);
        return next;
      });
      return newLayout;
    },
    []
  );

  const deleteLayout = useCallback((id: string) => {
    setLayouts((prev) => {
      const next = prev.filter((l) => l.id !== id);
      persistLayouts(next);
      return next;
    });
  }, []);

  const renameLayout = useCallback((id: string, newName: string) => {
    setLayouts((prev) => {
      const next = prev.map((l) =>
        l.id === id
          ? { ...l, name: newName, updatedAt: new Date().toISOString() }
          : l
      );
      persistLayouts(next);
      return next;
    });
  }, []);

  const exportAllJson = useCallback(() => {
    const data = JSON.stringify(layouts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seat-layouts-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layouts]);

  const importJson = useCallback((jsonStr: string) => {
    try {
      const imported = JSON.parse(jsonStr) as SavedLayout[];
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      setLayouts((prev) => {
        const next = [...imported, ...prev];
        persistLayouts(next);
        return next;
      });
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: String(e) };
    }
  }, []);

  return {
    layouts,
    saveLayout,
    deleteLayout,
    renameLayout,
    exportAllJson,
    importJson,
  };
}

export type { SavedLayout };
