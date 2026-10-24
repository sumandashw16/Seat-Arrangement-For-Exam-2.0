import React from 'react';
import type { RoomLayout, FormState, EngineResult } from '../../engine/types';
import { generateCSV, downloadFile } from '../../lib/utils';
import { Printer, Download, BookmarkPlus, FolderOpen, FileJson } from 'lucide-react';

interface Props {
  layouts: RoomLayout[];
  form: FormState;
  result: EngineResult;
  onOpenSaveDialog: () => void;
  onOpenSavedLayouts: () => void;
}

export const ExportButtons: React.FC<Props> = ({
  layouts,
  form,
  result,
  onOpenSaveDialog,
  onOpenSavedLayouts,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = generateCSV(layouts);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadFile(csvContent, `seating-chart-${dateStr}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportSingleJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      formState: form,
      result: result,
    };
    downloadFile(
      JSON.stringify(data, null, 2),
      `seating-plan-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-white dark:bg-[#151d2c] border border-slate-200 dark:border-slate-800 shadow-sm mb-6 no-print">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Export & Storage:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Print Chart */}
        <button
          type="button"
          id="print-seating-button"
          onClick={handlePrint}
          className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium"
          title="Print layout or save as PDF (page break per room)"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Print / PDF</span>
        </button>

        {/* CSV Export */}
        <button
          type="button"
          id="export-csv-button"
          onClick={handleExportCSV}
          className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium"
          title="Export bench-by-bench seat allocations to CSV"
        >
          <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Export CSV</span>
        </button>

        {/* Export JSON */}
        <button
          type="button"
          id="export-json-button"
          onClick={handleExportSingleJSON}
          className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium"
          title="Export complete plan data as JSON"
        >
          <FileJson className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Export JSON</span>
        </button>

        {/* Save Configuration */}
        <button
          type="button"
          id="save-layout-button"
          onClick={onOpenSaveDialog}
          className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50"
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Save Configuration</span>
        </button>

        {/* Open Saved Plans */}
        <button
          type="button"
          id="view-saved-layouts-button"
          onClick={onOpenSavedLayouts}
          className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>Saved Plans</span>
        </button>
      </div>
    </div>
  );
};
