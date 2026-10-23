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
  onImportJson: (json: string) => { ok: boolean; error?: string };
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
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImportJson(content);
      if (!res.ok) {
        setImportError(res.error || 'Failed to parse JSON file');
      } else {
        setImportError(null);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#161628] border border-[#2e2e4a] shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#232338]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Saved Layouts & Plans</h3>
              <p className="text-xs text-gray-400">
                Browse, reload, export or import past exam arrangements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global JSON Actions */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#12121e] border border-[#232338]">
          <span className="text-xs text-gray-400 font-medium">
            {layouts.length} saved arrangement{layouts.length !== 1 ? 's' : ''} in storage
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportAll}
              disabled={layouts.length === 0}
              className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Backup All JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
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
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {importError}
          </div>
        )}

        {/* Layouts List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {layouts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
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
                  className="p-3.5 rounded-xl bg-[#141424] border border-[#232338] hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                          className="p-1.5 text-emerald-400 hover:text-white"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => startRename(item)}
                          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-gray-500" />
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
                      className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteLayout(item.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
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
