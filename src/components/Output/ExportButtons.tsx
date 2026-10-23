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
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#141424] border border-[#232338] mb-6 no-print">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Actions & Exports:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Print Chart */}
        <button
          type="button"
          id="print-seating-button"
          onClick={handlePrint}
          className="btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold"
          title="Print layout or save as PDF (page break per room)"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          Print / PDF
        </button>

        {/* CSV Export */}
        <button
          type="button"
          id="export-csv-button"
          onClick={handleExportCSV}
          className="btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold"
          title="Export bench-by-bench seat allocations to CSV"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export CSV
        </button>

        {/* Export JSON */}
        <button
          type="button"
          id="export-json-button"
          onClick={handleExportSingleJSON}
          className="btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold"
          title="Export complete plan data as JSON"
        >
          <FileJson className="w-4 h-4 text-purple-400" />
          Export JSON
        </button>

        {/* Save to LocalStorage */}
        <button
          type="button"
          id="save-layout-button"
          onClick={onOpenSaveDialog}
          className="btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold border-indigo-500/40"
        >
          <BookmarkPlus className="w-4 h-4 text-cyan-400" />
          Save Plan
        </button>

        {/* Open Saved Plans */}
        <button
          type="button"
          id="view-saved-layouts-button"
          onClick={onOpenSavedLayouts}
          className="btn-ghost flex items-center gap-1.5 py-2 px-3.5 text-xs font-semibold"
        >
          <FolderOpen className="w-4 h-4" />
          Saved Plans
        </button>
      </div>
    </div>
  );
};
