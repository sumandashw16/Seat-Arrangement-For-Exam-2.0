import React, { useState, useRef } from 'react';
import type { SavedLayout } from '../../state/useCloudLayouts';
import type { FormState, EngineResult } from '../../engine/types';
import {
  X,
  FolderOpen,
  Trash2,
  Edit2,
  Check,
  Download,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Copy,
  CloudCheck,
  HardDrive,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  layouts: SavedLayout[];
  onLoadLayout: (state: FormState, result?: EngineResult | null) => void;
  onDeleteLayout: (id: string) => void;
  onRenameLayout: (id: string, newName: string) => void;
  onExportAll: () => void;
  onImportJson: (json: string) => { ok: boolean; error?: string } | Promise<{ ok: boolean; error?: string }>;
  onRefresh?: () => void;
  isLoading?: boolean;
  cloudError?: string | null;
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

export const SavedLayoutsList: React.FC<Props> = ({
  isOpen,
  onClose,
  layouts,
  onLoadLayout,
  onDeleteLayout,
  onRenameLayout,
  onExportAll,
  onImportJson,
  onRefresh,
  isLoading = false,
  cloudError = null,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_FIX_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const startRename = (layout: SavedLayout) => {
    setEditingId(layout.id);
    setEditingName(layout.name);
  };

  const commitRename = (id: string) => {
    if (editingName.trim()) {
      onRenameLayout(id, editingName.trim());
    }
    setEditingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await onImportJson(content);
      if (!res.ok) {
        setImportError(res.error || 'Failed to parse JSON file');
      } else {
        setImportError(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isPermissionOrTableError =
    cloudError &&
    (cloudError.toLowerCase().includes('permission denied') ||
      cloudError.toLowerCase().includes('does not exist') ||
      cloudError.toLowerCase().includes('pgrst') ||
      cloudError.toLowerCase().includes('schema'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl p-5 sm:p-6 rounded-xl bg-white dark:bg-[#151d2c] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Saved Configurations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse, reload, export or import your saved exam configurations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cloud Error / Setup Notice */}
        {cloudError && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Local Storage Active</p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  Configurations are safely stored on this computer. Cloud sync notice: {cloudError}
                </p>
              </div>
            </div>

            {isPermissionOrTableError && (
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60">
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mb-1.5">
                  To sync across all devices, run this SQL in your Supabase SQL Editor:
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

        {/* Global JSON Actions & Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {layouts.length} saved configuration{layouts.length !== 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
                title="Sync and refresh from account"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isLoading ? 'Syncing…' : 'Sync / Refresh'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExportAll}
              disabled={layouts.length === 0}
              className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
            >
              <Download className="w-3 h-3" />
              Backup JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
            >
              <Upload className="w-3 h-3" />
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {importError && (
          <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            {importError}
          </div>
        )}

        {/* Layouts List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {layouts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs space-y-1">
              <p className="font-medium text-slate-600 dark:text-slate-400 text-sm">
                No saved configurations found
              </p>
              <p>
                Set up your exam rooms and branches, then click &quot;Save Configuration&quot; to preserve it here.
              </p>
            </div>
          ) : (
            layouts.map((item) => {
              const roomsCount = item.inputState?.rooms?.length || 0;
              const perBench = item.inputState?.studentsPerBench || 2;
              const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="input-field py-1 text-xs font-semibold"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => commitRename(item.id)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => startRename(item)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {roomsCount} room{roomsCount !== 1 ? 's' : ''} ({perBench}/bench)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[10px]">
                        {item.isSyncedToCloud ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium flex items-center gap-1">
                            <CloudCheck className="w-3.5 h-3.5" />
                            Account Synced
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-sans font-medium flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5" />
                            Local Storage
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadLayout(item.inputState, item.result);
                        onClose();
                      }}
                      className="btn-secondary py-1 px-3 text-xs font-semibold flex items-center gap-1 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 transition-colors"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteLayout(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
                      title="Delete"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
