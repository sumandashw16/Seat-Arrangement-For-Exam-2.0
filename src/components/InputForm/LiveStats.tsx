import React from 'react';
import type { FormState } from '../../engine/types';
import { computeLiveStats } from '../../lib/utils';
import { Users, Armchair, School, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  form: FormState;
}

export const LiveStats: React.FC<Props> = ({ form }) => {
  const stats = computeLiveStats(form);
  const seatDiff = stats.totalSeats - stats.totalStudents;
  const isDeficit = seatDiff < 0;

  return (
    <div className="glass-card p-4 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Rooms */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141422] border border-[#232338]">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
              Exam Halls
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.totalRooms}
            </div>
          </div>
        </div>

        {/* Total Benches */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141422] border border-[#232338]">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
              Total Benches
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.totalBenches}
            </div>
          </div>
        </div>

        {/* Max Capacity */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141422] border border-[#232338]">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-gray-400 tracking-wider">
              Total Seats
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {stats.totalSeats}
            </div>
          </div>
        </div>

        {/* Students Count & Balance */}
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border ${
            isDeficit
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDeficit ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {isDeficit ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-300">
              Students : Seats
            </div>
            <div className="text-sm font-bold font-mono flex items-center gap-1.5">
              <span className={isDeficit ? 'text-red-400' : 'text-emerald-400'}>
                {stats.totalStudents}
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-300">{stats.totalSeats}</span>
            </div>
            <span
              className={`text-[10px] font-medium block ${
                isDeficit ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isDeficit ? `Deficit: ${Math.abs(seatDiff)} seats` : `${seatDiff} surplus seats`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
