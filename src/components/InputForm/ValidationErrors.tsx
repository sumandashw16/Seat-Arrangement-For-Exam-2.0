import React from 'react';
import type { ValidationError } from '../../engine/types';
import { AlertCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface Props {
  errors: ValidationError[];
}

export const ValidationErrors: React.FC<Props> = ({ errors }) => {
  if (errors.length === 0) return null;

  const blockingErrors = errors.filter((e) => e.type === 'error');
  const warnings = errors.filter((e) => e.type === 'warning');

  const scrollToField = (field?: string) => {
    if (!field) return;

    let targetId: string | null = null;
    const roomMatch = field.match(/^rooms\[(\d+)\]\.(.+)$/);
    if (roomMatch) {
      targetId = `room-${roomMatch[1]}-${roomMatch[2]}`;
    } else if (field.startsWith('rooms')) {
      targetId = 'rooms-section';
    } else if (field.startsWith('circuital') || field.startsWith('nonCircuital')) {
      targetId = 'branches-section';
    }

    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 mb-6 animate-fadeIn" id="validation-errors-banner">
      {/* Blocking Errors */}
      {blockingErrors.length > 0 && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-semibold text-red-700 dark:text-red-400 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Please resolve {blockingErrors.length} configuration error{blockingErrors.length > 1 ? 's' : ''} to generate arrangement:</span>
          </div>
          <ul className="space-y-1 ml-6 text-xs list-disc text-red-800 dark:text-red-300">
            {blockingErrors.map((err, idx) => (
              <li key={idx} className="leading-relaxed">
                <span>{err.message}</span>
                {err.field && (
                  <button
                    type="button"
                    onClick={() => scrollToField(err.field)}
                    className="ml-2 inline-flex items-center gap-0.5 text-blue-700 dark:text-blue-400 hover:underline font-mono text-[11px]"
                  >
                    Go to field
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2 font-semibold text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Notices ({warnings.length}):</span>
          </div>
          <ul className="space-y-1 ml-6 text-xs list-disc text-amber-800 dark:text-amber-300">
            {warnings.map((warn, idx) => (
              <li key={idx} className="leading-relaxed">
                {warn.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
