import React, { useState } from 'react';
import { X, BookmarkPlus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

export const SaveLayoutDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
}) => {
  const [name, setName] = useState(
    defaultName || `Seating Plan - ${new Date().toLocaleDateString()}`
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#161628] border border-[#2e2e4a] shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Save Seating Plan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Save the current configuration and generated seating arrangement to your local browser storage.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Plan Title
            </label>
            <input
              type="text"
              id="save-plan-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Midterm Exams - Semester 4 (2026)"
              className="input-field text-sm font-medium"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary py-2 px-5 text-xs font-semibold"
            >
              Save to Storage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
