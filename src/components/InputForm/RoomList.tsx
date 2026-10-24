import React from 'react';
import type { RoomInput, StudentsPerBench, ValidationError } from '../../engine/types';
import { RoomCard } from './RoomCard';
import { Plus, LayoutGrid } from 'lucide-react';

interface Props {
  rooms: RoomInput[];
  studentsPerBench: StudentsPerBench;
  onAddRoom: () => void;
  onRemoveRoom: (id: string) => void;
  onUpdateRoom: (id: string, updates: Partial<RoomInput>) => void;
  errors: ValidationError[];
}

export const RoomList: React.FC<Props> = ({
  rooms,
  studentsPerBench,
  onAddRoom,
  onRemoveRoom,
  onUpdateRoom,
  errors,
}) => {
  const totalBenches = rooms.reduce(
    (acc, r) => acc + (r.columns > 0 && r.rows > 0 ? r.columns * r.rows : 0),
    0
  );
  const totalCapacity = totalBenches * studentsPerBench;

  return (
    <div className="glass-card p-5 mb-6" id="rooms-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Examination Rooms / Halls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure exam halls with columns (aisles) and rows (depth) to calculate total bench capacity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{rooms.length}</span> rooms •{' '}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{totalBenches}</span> benches •{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalCapacity}</span> capacity
          </div>

          <button
            type="button"
            id="add-room-button"
            onClick={onAddRoom}
            className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Room
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {rooms.map((room, idx) => (
          <RoomCard
            key={room.id}
            room={room}
            index={idx}
            studentsPerBench={studentsPerBench}
            canRemove={rooms.length > 1}
            onUpdate={(updates) => onUpdateRoom(room.id, updates)}
            onRemove={() => onRemoveRoom(room.id)}
            errors={errors}
          />
        ))}
      </div>
    </div>
  );
};
