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
  isSyncedToCloud?: boolean;
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

function getCacheKey(userId: string | null): string {
  return `seat-layouts-cache-${userId || 'guest'}`;
}

function readLocalCache(userId: string | null): SavedLayout[] {
  try {
    const raw = localStorage.getItem(getCacheKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore parse error
  }
  return [];
}

function writeLocalCache(userId: string | null, items: SavedLayout[]): void {
  try {
    localStorage.setItem(getCacheKey(userId), JSON.stringify(items));
  } catch {
    // ignore storage quota error
  }
}

function dbToLayout(row: DbLayout): SavedLayout {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    inputState: row.input_state,
    result: row.result,
    isSyncedToCloud: true,
  };
}

export function useCloudLayouts(userId: string | null) {
  const [layouts, setLayouts] = useState<SavedLayout[]>(() => readLocalCache(userId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever userId changes
  useEffect(() => {
    setLayouts(readLocalCache(userId));
  }, [userId]);

  // Load layouts from Supabase cloud whenever the user changes or on refetch
  const fetchLayouts = useCallback(async () => {
    if (!userId) {
      setLayouts(readLocalCache(null));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('layouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        console.warn('[Cloud Layouts] Error fetching from cloud:', err.message);
        setError(err.message);
        // Fallback to local cache so user still sees saved plans
        const local = readLocalCache(userId);
        setLayouts(local);
      } else if (data) {
        const cloudItems = (data as DbLayout[]).map(dbToLayout);
        // Merge cloud items with any unsynced local items
        const localItems = readLocalCache(userId);
        const unsynced = localItems.filter(
          (l) => !cloudItems.some((c) => c.id === l.id || c.name === l.name)
        );
        const combined = [...cloudItems, ...unsynced];
        setLayouts(combined);
        writeLocalCache(userId, combined);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  // Save a new configuration
  const saveLayout = useCallback(
    async (
      name: string,
      inputState: FormState,
      result: EngineResult | null
    ): Promise<{ ok: boolean; error?: string; layout?: SavedLayout }> => {
      const now = new Date().toISOString();
      const localId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newLayout: SavedLayout = {
        id: localId,
        name: name.trim(),
        createdAt: now,
        updatedAt: now,
        inputState,
        result: result ?? null,
        isSyncedToCloud: false,
      };

      // 1. Immediately persist locally so work is never lost
      setLayouts((prev) => {
        const updated = [newLayout, ...prev.filter((l) => l.name !== name.trim())];
        writeLocalCache(userId, updated);
        return updated;
      });

      // 2. If not authenticated, keep local only
      if (!userId) {
        return { ok: true, layout: newLayout };
      }

      // 3. Attempt cloud persistence in Supabase
      try {
        const { data, error: err } = await supabase
          .from('layouts')
          .insert({
            user_id: userId,
            name: name.trim(),
            input_state: inputState,
            result: result ?? null,
          })
          .select();

        if (err) {
          console.warn('[Cloud Layouts] Error saving to Supabase:', err.message);
          setError(err.message);
          return {
            ok: false,
            error: err.message,
            layout: newLayout,
          };
        }

        if (data && data.length > 0) {
          const saved = dbToLayout(data[0] as DbLayout);
          setLayouts((prev) => {
            const updated = [
              saved,
              ...prev.filter((l) => l.id !== localId && l.id !== saved.id),
            ];
            writeLocalCache(userId, updated);
            return updated;
          });
          setError(null);
          return { ok: true, layout: saved };
        }

        return { ok: true, layout: newLayout };
      } catch (e: any) {
        const msg = e?.message || 'Database connection error';
        setError(msg);
        return {
          ok: false,
          error: msg,
          layout: newLayout,
        };
      }
    },
    [userId]
  );

  // Delete a layout
  const deleteLayout = useCallback(
    async (id: string) => {
      // Remove locally first
      setLayouts((prev) => {
        const updated = prev.filter((l) => l.id !== id);
        writeLocalCache(userId, updated);
        return updated;
      });

      if (!userId) return;

      try {
        const { error: err } = await supabase.from('layouts').delete().eq('id', id);
        if (err) {
          console.warn('[Cloud Layouts] Delete error:', err.message);
          setError(err.message);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to delete');
      }
    },
    [userId]
  );

  // Rename a layout
  const renameLayout = useCallback(
    async (id: string, newName: string) => {
      const now = new Date().toISOString();
      setLayouts((prev) => {
        const updated = prev.map((l) =>
          l.id === id ? { ...l, name: newName, updatedAt: now } : l
        );
        writeLocalCache(userId, updated);
        return updated;
      });

      if (!userId) return;

      try {
        const { error: err } = await supabase
          .from('layouts')
          .update({ name: newName, updated_at: now })
          .eq('id', id);

        if (err) {
          console.warn('[Cloud Layouts] Rename error:', err.message);
          setError(err.message);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to rename');
      }
    },
    [userId]
  );

  // Export all as JSON file
  const exportAllJson = useCallback(() => {
    const data = JSON.stringify(layouts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seat-configurations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layouts]);

  // Import layouts from a JSON backup — inserts into Supabase + local cache
  const importJson = useCallback(
    async (jsonStr: string) => {
      try {
        const imported = JSON.parse(jsonStr) as SavedLayout[];
        if (!Array.isArray(imported)) throw new Error('Invalid format: expected array');

        const now = new Date().toISOString();
        const formatted: SavedLayout[] = imported.map((l) => ({
          id:
            l.id ||
            (typeof crypto !== 'undefined' && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
          name: l.name || 'Imported Configuration',
          createdAt: l.createdAt || now,
          updatedAt: l.updatedAt || now,
          inputState: l.inputState,
          result: l.result ?? null,
          isSyncedToCloud: false,
        }));

        setLayouts((prev) => {
          const updated = [...formatted, ...prev];
          writeLocalCache(userId, updated);
          return updated;
        });

        if (userId) {
          const rows = formatted.map((l) => ({
            user_id: userId,
            name: l.name,
            input_state: l.inputState,
            result: l.result ?? null,
          }));

          const { data, error: err } = await supabase
            .from('layouts')
            .insert(rows)
            .select();

          if (err) {
            console.warn('[Cloud Layouts] Import cloud sync error:', err.message);
            return {
              ok: true as const,
              warning: `Imported locally. Cloud sync warning: ${err.message}`,
            };
          }

          if (data) {
            const inserted = (data as DbLayout[]).map(dbToLayout);
            setLayouts((prev) => {
              const updated = [
                ...inserted,
                ...prev.filter((p) => !inserted.some((i) => i.id === p.id)),
              ];
              writeLocalCache(userId, updated);
              return updated;
            });
          }
        }

        return { ok: true as const };
      } catch (e: any) {
        return { ok: false as const, error: e?.message || String(e) };
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
    clearError: () => setError(null),
  };
}
