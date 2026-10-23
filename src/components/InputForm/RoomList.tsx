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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-400" />
            Examination Rooms / Halls
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Define halls and their bench grid matrix (columns × rows).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-300 font-mono bg-[#11111d] px-3 py-1.5 rounded-lg border border-[#232338]">
            <span className="text-indigo-400 font-semibold">{rooms.length}</span> rooms |{' '}
            <span className="text-indigo-400 font-semibold">{totalBenches}</span> benches |{' '}
            <span className="text-green-400 font-bold">{totalCapacity}</span> max seats
          </div>

          <button
            type="button"
            id="add-room-button"
            onClick={onAddRoom}
            className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
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
