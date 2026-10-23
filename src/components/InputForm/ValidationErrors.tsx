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

    // Convert field path like rooms[0].name to element id
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

    // Fallback: scroll to error banner itself
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-3 mb-6 animate-fadeIn" id="validation-errors-banner">
      {/* Blocking Errors */}
      {blockingErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
          <div className="flex items-center gap-2 mb-2 font-semibold text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>Please resolve {blockingErrors.length} configuration error{blockingErrors.length > 1 ? 's' : ''} to generate arrangement:</span>
          </div>
          <ul className="space-y-1.5 ml-7 text-xs list-disc">
            {blockingErrors.map((err, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="text-gray-200">{err.message}</span>
                {err.field && (
                  <button
                    type="button"
                    onClick={() => scrollToField(err.field)}
                    className="ml-2 inline-flex items-center gap-0.5 text-red-300 hover:text-white underline font-mono text-[11px]"
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
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-center gap-2 mb-2 font-semibold text-amber-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>Notices ({warnings.length}):</span>
          </div>
          <ul className="space-y-1.5 ml-7 text-xs list-disc">
            {warnings.map((warn, idx) => (
              <li key={idx} className="leading-relaxed text-gray-200">
                {warn.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
