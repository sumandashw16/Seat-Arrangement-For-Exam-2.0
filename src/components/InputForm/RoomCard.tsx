import React from 'react';
import type { RoomInput, StudentsPerBench, ValidationError } from '../../engine/types';
import { Trash2, Columns, Rows, School } from 'lucide-react';

interface Props {
  room: RoomInput;
  index: number;
  studentsPerBench: StudentsPerBench;
  canRemove: boolean;
  onUpdate: (updates: Partial<RoomInput>) => void;
  onRemove: () => void;
  errors: ValidationError[];
}

export const RoomCard: React.FC<Props> = ({
  room,
  index,
  studentsPerBench,
  canRemove,
  onUpdate,
  onRemove,
  errors,
}) => {
  const benchCount = Math.max(0, (room.columns || 0) * (room.rows || 0));
  const studentCapacity = benchCount * studentsPerBench;

  const prefix = `rooms[${index}]`;
  const nameError = errors.find((e) => e.field === `${prefix}.name`);
  const columnsError = errors.find((e) => e.field === `${prefix}.columns`);
  const rowsError = errors.find((e) => e.field === `${prefix}.rows`);

  return (
    <div
      id={`room-card-${room.id}`}
      className="p-4 rounded-xl bg-[#141422] border border-[#232338] hover:border-indigo-500/40 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono text-xs font-bold border border-indigo-500/20">
            {index + 1}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Room #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-300 bg-[#1c1c30] px-2.5 py-1 rounded-md border border-[#2a2a44]">
            <span className="text-indigo-400 font-bold font-mono">{benchCount}</span> benches ({studentCapacity} seats)
          </span>

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete room"
              aria-label={`Delete room ${room.name || index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Room Name */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-indigo-400" />
            Room Name / Hall No.
          </label>
          <input
            type="text"
            id={`room-${index}-name`}
            value={room.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Hall 101, LH-1"
            className={`input-field ${nameError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
          />
          {nameError && (
            <p className="text-[11px] text-red-400 mt-1 font-medium">{nameError.message}</p>
          )}
        </div>

        {/* Columns */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-purple-400" />
            Columns (Aisle Count)
          </label>
          <input
            type="number"
            min={1}
            id={`room-${index}-columns`}
            value={room.columns || ''}
            onChange={(e) => onUpdate({ columns: parseInt(e.target.value, 10) || 0 })}
            className={`input-field font-mono ${columnsError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
          />
          {columnsError && (
            <p className="text-[11px] text-red-400 mt-1 font-medium">{columnsError.message}</p>
          )}
        </div>

        {/* Rows */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1.5">
            <Rows className="w-3.5 h-3.5 text-pink-400" />
            Rows (Depth)
          </label>
          <input
            type="number"
            min={1}
            id={`room-${index}-rows`}
            value={room.rows || ''}
            onChange={(e) => onUpdate({ rows: parseInt(e.target.value, 10) || 0 })}
            className={`input-field font-mono ${rowsError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
          />
          {rowsError && (
            <p className="text-[11px] text-red-400 mt-1 font-medium">{rowsError.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
