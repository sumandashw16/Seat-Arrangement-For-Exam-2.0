import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { FormState, EngineResult } from '../engine/types';

export interface SavedLayout {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  inputState: FormState;
  result: EngineResult | null;
}

// Shape coming from Supabase (snake_case columns)
interface DbLayout {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  input_state: FormState;
  result: EngineResult | null;
}

function dbToLayout(row: DbLayout): SavedLayout {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    inputState: row.input_state,
    result: row.result,
  };
}

export function useCloudLayouts(userId: string | null) {
  const [layouts, setLayouts] = useState<SavedLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load layouts whenever the user changes
  const fetchLayouts = useCallback(async () => {
    if (!userId) {
      setLayouts([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('layouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setLayouts((data as DbLayout[]).map(dbToLayout));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  // Save a new layout
  const saveLayout = useCallback(
    async (name: string, inputState: FormState, result: EngineResult | null) => {
      if (!userId) return null;
      const { data, error: err } = await supabase
        .from('layouts')
        .insert({
          user_id: userId,
          name,
          input_state: inputState,
          result,
        })
        .select()
        .single();

      if (err) {
        setError(err.message);
        return null;
      }
      const saved = dbToLayout(data as DbLayout);
      setLayouts((prev) => [saved, ...prev]);
      return saved;
    },
    [userId]
  );

  // Delete a layout
  const deleteLayout = useCallback(
    async (id: string) => {
      if (!userId) return;
      const { error: err } = await supabase.from('layouts').delete().eq('id', id);
      if (err) {
        setError(err.message);
        return;
      }
      setLayouts((prev) => prev.filter((l) => l.id !== id));
    },
    [userId]
  );

  // Rename a layout
  const renameLayout = useCallback(
    async (id: string, newName: string) => {
      if (!userId) return;
      const now = new Date().toISOString();
      const { error: err } = await supabase
        .from('layouts')
        .update({ name: newName, updated_at: now })
        .eq('id', id);

      if (err) {
        setError(err.message);
        return;
      }
      setLayouts((prev) =>
        prev.map((l) => (l.id === id ? { ...l, name: newName, updatedAt: now } : l))
      );
    },
    [userId]
  );

  // Export all as JSON file (local blob — no server needed)
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

  // Import layouts from a JSON backup — inserts into Supabase
  const importJson = useCallback(
    async (jsonStr: string) => {
      if (!userId) return { ok: false as const, error: 'Not signed in' };
      try {
        const imported = JSON.parse(jsonStr) as SavedLayout[];
        if (!Array.isArray(imported)) throw new Error('Invalid format');

        const rows = imported.map((l) => ({
          user_id: userId,
          name: l.name,
          input_state: l.inputState,
          result: l.result ?? null,
        }));

        const { data, error: err } = await supabase
          .from('layouts')
          .insert(rows)
          .select();

        if (err) return { ok: false as const, error: err.message };
        const inserted = (data as DbLayout[]).map(dbToLayout);
        setLayouts((prev) => [...inserted, ...prev]);
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, error: String(e) };
      }
    },
    [userId]
  );

  return {
    layouts,
    loading,
    error,
    saveLayout,
    deleteLayout,
    renameLayout,
    exportAllJson,
    importJson,
    refetch: fetchLayouts,
  };
}
