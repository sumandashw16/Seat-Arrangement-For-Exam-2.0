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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Rooms */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40">
            <School className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Exam Halls
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {stats.totalRooms}
            </div>
          </div>
        </div>

        {/* Total Benches */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Armchair className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Total Benches
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {stats.totalBenches}
            </div>
          </div>
        </div>

        {/* Max Capacity */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Total Capacity
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {stats.totalSeats}
            </div>
          </div>
        </div>

        {/* Students Count & Balance */}
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            isDeficit
              ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
              : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40'
          }`}
        >
          <div
            className={`w-9 h-9 rounded flex items-center justify-center border ${
              isDeficit
                ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
            }`}
          >
            {isDeficit ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Students : Capacity
            </div>
            <div className="text-sm font-bold font-mono flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
              <span className={isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                {stats.totalStudents}
              </span>
              <span className="text-slate-400">/</span>
              <span>{stats.totalSeats}</span>
            </div>
            <span
              className={`text-[10px] font-medium block ${
                isDeficit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
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
