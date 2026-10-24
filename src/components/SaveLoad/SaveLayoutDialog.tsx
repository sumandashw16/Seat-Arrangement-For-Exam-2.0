import React, { useState } from 'react';
import { X, BookmarkPlus, Loader2, AlertCircle, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<{ ok: boolean; error?: string }> | void;
  defaultName?: string;
}

const SUPABASE_FIX_SQL = `-- Run in Supabase SQL Editor to enable cross-device sync:
create table if not exists public.layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  input_state jsonb not null,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.layouts enable row level security;
grant usage on schema public to anon, authenticated;
grant all on table public.layouts to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

drop policy if exists "Users manage own layouts" on public.layouts;
create policy "Users manage own layouts"
  on public.layouts for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;

export const SaveLayoutDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
}) => {
  const [name, setName] = useState(
    defaultName || `Exam Configuration - ${new Date().toLocaleDateString()}`
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_FIX_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await onSave(name.trim());
      if (res && !res.ok) {
        setErrorMsg(res.error || 'Failed to sync configuration to your account.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const isPermissionOrTableError =
    errorMsg &&
    (errorMsg.toLowerCase().includes('permission denied') ||
      errorMsg.toLowerCase().includes('does not exist') ||
      errorMsg.toLowerCase().includes('pgrst') ||
      errorMsg.toLowerCase().includes('schema'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-xl bg-white dark:bg-[#151d2c] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Save Configuration
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Save your current room setup, branches, sections, and roll ranges to your account.
          You can reload this exact configuration from any computer when logged in.
        </p>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Saved locally on this computer!</p>
                <p className="mt-0.5 text-[11px] opacity-90">{errorMsg}</p>
              </div>
            </div>

            {isPermissionOrTableError && (
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60">
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mb-1.5">
                  To sync across other computers, run this quick SQL in your Supabase SQL Editor:
                </p>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>SQL Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Database Setup SQL</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Configuration Name
            </label>
            <input
              type="text"
              id="save-plan-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midterm Exams - Semester 4 (2026)"
              className="input-field text-sm font-medium"
              disabled={isSaving}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary py-1.5 px-3.5 text-xs font-medium"
            >
              {errorMsg ? 'Close' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSaving}
              className="btn-primary py-1.5 px-4 text-xs font-semibold flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Configuration…</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
