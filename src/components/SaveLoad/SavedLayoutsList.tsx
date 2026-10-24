import React, { useState, useRef } from 'react';
import type { SavedLayout } from '../../state/useSavedLayouts';
import type { FormState } from '../../engine/types';
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
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  layouts: SavedLayout[];
  onLoadLayout: (state: FormState) => void;
  onDeleteLayout: (id: string) => void;
  onRenameLayout: (id: string, newName: string) => void;
  onExportAll: () => void;
  onImportJson: (json: string) => { ok: boolean; error?: string } | Promise<{ ok: boolean; error?: string }>;
}

export const SavedLayoutsList: React.FC<Props> = ({
  isOpen,
  onClose,
  layouts,
  onLoadLayout,
  onDeleteLayout,
  onRenameLayout,
  onExportAll,
  onImportJson,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-2xl p-5 sm:p-6 rounded-lg bg-white dark:bg-[#151d2c] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Saved Layouts & Plans</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse, reload, export or import past exam arrangements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global JSON Actions */}
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {layouts.length} saved arrangement{layouts.length !== 1 ? 's' : ''} in storage
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportAll}
              disabled={layouts.length === 0}
              className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
            >
              <Download className="w-3 h-3" />
              Backup All JSON
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
          <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {importError}
          </div>
        )}

        {/* Layouts List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {layouts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No saved arrangements found. Generate a seating plan and click &quot;Save Plan&quot; to preserve it here.
            </div>
          ) : (
            layouts.map((item) => {
              const roomsCount = item.inputState.rooms.length;
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
                  className="p-3 rounded-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
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

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {roomsCount} room{roomsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadLayout(item.inputState);
                        onClose();
                      }}
                      className="btn-secondary py-1 px-2.5 text-xs font-medium flex items-center gap-1 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"
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
