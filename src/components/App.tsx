import { useState, useMemo, useCallback, useEffect } from 'react';
import { useFormState } from '../state/useFormState';
import { useSavedLayouts } from '../state/useSavedLayouts';
import { generateSeating } from '../engine/seating';
import { validateInput } from '../engine/validate';
import type { EngineResult, FormState, ValidationError } from '../engine/types';
import { generateSectionColors } from '../lib/utils';

// UI Components
import { GlobalSettings } from './InputForm/GlobalSettings';
import { RoomList } from './InputForm/RoomList';
import { BranchCategoryPanel } from './InputForm/BranchCategoryPanel';
import { LiveStats } from './InputForm/LiveStats';
import { ValidationErrors } from './InputForm/ValidationErrors';
import { SummaryPanel } from './Output/SummaryPanel';
import { RoomGrid } from './Output/RoomGrid';
import { ExcelRoomGrid } from './Output/ExcelRoomGrid';
import { StrengthTable } from './Output/StrengthTable';
import { SearchBar } from './Output/SearchBar';
import { Legend } from './Output/Legend';
import { ExportButtons } from './Output/ExportButtons';
import { SaveLayoutDialog } from './SaveLoad/SaveLayoutDialog';
import { SavedLayoutsList } from './SaveLoad/SavedLayoutsList';

import {
  Sparkles,
  RotateCcw,
  FolderOpen,
  Wand2,
  GraduationCap,
  Sun,
  Moon,
  FileSpreadsheet,
  Table,
  LayoutGrid,
} from 'lucide-react';

export default function App() {
  const {
    form,
    addRoom,
    removeRoom,
    updateRoom,
    addBranch,
    removeBranch,
    updateBranch,
    addSection,
    removeSection,
    updateSection,
    addRollRange,
    updateRollRange,
    removeRollRange,
    setStudentsPerBench,
    resetForm,
    loadForm,
  } = useFormState();

  const {
    layouts: savedLayouts,
    saveLayout,
    deleteLayout,
    renameLayout,
    exportAllJson,
    importJson,
  } = useSavedLayouts();

  const [result, setResult] = useState<EngineResult | null>(null);
  const [activeErrors, setActiveErrors] = useState<ValidationError[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSavedLayoutsOpen, setIsSavedLayoutsOpen] = useState(false);
  const [outputView, setOutputView] = useState<'excel' | 'strength' | 'visual'>('excel');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('seat-planner-theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('seat-planner-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Compute distinguishable colors for all sections
  const sectionColors = useMemo(() => {
    const sectionIds: string[] = [];
    const collectIds = (branches: typeof form.circuital.branches) => {
      for (const b of branches) {
        for (const s of b.sections) {
          if (b.name && s.name) {
            sectionIds.push(`${b.name.trim()}-${s.name.trim()}`);
          }
        }
      }
    };
    collectIds(form.circuital.branches);
    collectIds(form.nonCircuital.branches);
    return generateSectionColors(Array.from(new Set(sectionIds)));
  }, [form]);

  // Handle Generate Arrangement
  const handleGenerate = useCallback(() => {
    const val = validateInput(form);
    if (val.errors.length > 0) {
      setActiveErrors([...val.errors, ...val.warnings]);
      setResult(null);
      // Scroll to errors
      const errBanner = document.getElementById('validation-errors-banner');
      if (errBanner) {
        errBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Run engine
    const res = generateSeating(form);
    if (!res.ok) {
      setActiveErrors(res.errors);
      setResult(null);
    } else {
      setActiveErrors([]);
      setResult(res);
      // Smooth scroll to output
      setTimeout(() => {
        const out = document.getElementById('arrangement-results');
        if (out) {
          out.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [form]);

  // Load a rich sample demo scenario for evaluation
  const handleLoadDemo = useCallback(() => {
    const demoState: FormState = {
      studentsPerBench: 2,
      rooms: [
        { id: 'r1', name: 'Hall 101 (Main Auditorium)', columns: 3, rows: 6 },
        { id: 'r2', name: 'Hall 102 (Science Wing)', columns: 4, rows: 5 },
        { id: 'r3', name: 'Hall 103 (Annex Hall)', columns: 3, rows: 4 },
      ],
      circuital: {
        type: 'circuital',
        branches: [
          {
            id: 'b-cse',
            name: 'CSE',
            sections: [
              {
                id: 's-cse-a',
                name: 'A',
                rollRanges: [{ start: '2402041101', end: '2402041118' }],
                additionalRolls: '2402041190',
                excludedRolls: '2402041105',
              },
              {
                id: 's-cse-b',
                name: 'B',
                rollRanges: [{ start: '2402041121', end: '2402041134' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
          {
            id: 'b-ece',
            name: 'ECE',
            sections: [
              {
                id: 's-ece-a',
                name: 'A',
                rollRanges: [{ start: '2402042101', end: '2402042114' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
      nonCircuital: {
        type: 'non-circuital',
        branches: [
          {
            id: 'b-mech',
            name: 'MECH',
            sections: [
              {
                id: 's-mech-a',
                name: 'A',
                rollRanges: [{ start: '2402043101', end: '2402043118' }],
                additionalRolls: '',
                excludedRolls: '',
              },
              {
                id: 's-mech-b',
                name: 'B',
                rollRanges: [{ start: '2402043121', end: '2402043130' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
          {
            id: 'b-civil',
            name: 'CIVIL',
            sections: [
              {
                id: 's-civil-a',
                name: 'A',
                rollRanges: [{ start: '2402044101', end: '2402044110' }],
                additionalRolls: '',
                excludedRolls: '',
              },
            ],
          },
        ],
      },
    };
    loadForm(demoState);
    setActiveErrors([]);
    setResult(null);
  }, [loadForm]);

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'light bg-[#f8fafc] text-slate-800' : 'bg-[#0a0a0f] text-gray-100'
      } flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-200`}
    >
      {/* Top Navigation Bar */}
      <header className="border-b border-[#1f1f35] bg-[#0d0d17]/80 backdrop-blur-md sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Seat Arrangement Planner
              </h1>
              <p className="text-[11px] text-gray-400 font-medium">
                Deterministic Exam Hall Allocation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              type="button"
              id="theme-toggle-button"
              onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
              className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline font-medium">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline font-medium">Light Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLoadDemo}
              className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10"
              title="Populate complete university exam test scenario"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Load Demo Data</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSavedLayoutsOpen(true)}
              className="btn-ghost flex items-center gap-1.5 py-1.5 px-3 text-xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">Saved Plans</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all fields to default state?')) {
                  resetForm();
                  setResult(null);
                  setActiveErrors([]);
                }
              }}
              className="btn-ghost p-2 text-gray-400 hover:text-red-400"
              title="Reset Planner"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Form Inputs (hidden when printing) */}
        <section className="no-print">
          {/* Global Setting: 1 or 2 per bench */}
          <GlobalSettings
            value={form.studentsPerBench}
            onChange={setStudentsPerBench}
          />

          {/* Real-time stats bar */}
          <LiveStats form={form} />

          {/* Validation Errors banner */}
          <ValidationErrors errors={activeErrors} />

          {/* Rooms List */}
          <RoomList
            rooms={form.rooms}
            studentsPerBench={form.studentsPerBench}
            onAddRoom={addRoom}
            onRemoveRoom={removeRoom}
            onUpdateRoom={updateRoom}
            errors={activeErrors}
          />

          {/* Circuital & Non-Circuital Categories */}
          <BranchCategoryPanel
            circuital={form.circuital}
            nonCircuital={form.nonCircuital}
            onAddBranch={addBranch}
            onRemoveBranch={removeBranch}
            onUpdateBranch={updateBranch}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onUpdateSection={updateSection}
            onAddRollRange={addRollRange}
            onUpdateRollRange={updateRollRange}
            onRemoveRollRange={removeRollRange}
            errors={activeErrors}
          />

          {/* Generate Button Container */}
          <div className="flex flex-col items-center justify-center pt-2 pb-10">
            <button
              type="button"
              id="generate-arrangement-button"
              onClick={handleGenerate}
              className="btn-primary text-base font-bold py-3.5 px-10 flex items-center gap-3 shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-transform"
            >
              <Wand2 className="w-5 h-5 text-indigo-200" />
              <span>Generate Seating Arrangement</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Strict deterministic algorithm • Leftover handling • Room-capacity sorted
            </p>
          </div>
        </section>

        {/* Output Section */}
        {result && result.ok && (
          <section id="arrangement-results" className="pt-4 animate-fadeIn">
            {/* Summary Metrics */}
            <SummaryPanel
              summary={result.summary}
              layouts={result.layouts}
              sectionColors={sectionColors}
              selectedFilter={selectedFilter}
              onSelectFilter={setSelectedFilter}
            />

            {/* Action & Export buttons */}
            <ExportButtons
              layouts={result.layouts}
              form={form}
              result={result}
              onOpenSaveDialog={() => setIsSaveDialogOpen(true)}
              onOpenSavedLayouts={() => setIsSavedLayoutsOpen(true)}
            />

            {/* View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 no-print">
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#141424] border border-[#232338]">
                <button
                  type="button"
                  id="view-excel-grid"
                  onClick={() => setOutputView('excel')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    outputView === 'excel'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel Box Grid (Landscape Fit)</span>
                </button>

                <button
                  type="button"
                  id="view-strength-sheet"
                  onClick={() => setOutputView('strength')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    outputView === 'strength'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Room Strength Sheet (Allotment)</span>
                </button>

                <button
                  type="button"
                  id="view-visual-grid"
                  onClick={() => setOutputView('visual')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    outputView === 'visual'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Interactive Board</span>
                </button>
              </div>

              <div className="text-xs text-gray-400 font-mono">
                {outputView === 'excel' && '📄 Clean Excel box grid • A4 Landscape fit • No colors'}
                {outputView === 'strength' && '📋 Room-wise strengths & registration roll lists'}
                {outputView === 'visual' && '🎨 Live search & interactive stream colors'}
              </div>
            </div>

            {/* View 1: Excel Box Grid (User requested format) */}
            {outputView === 'excel' && (
              <div className="space-y-6">
                {result.layouts.map((layout) => (
                  <ExcelRoomGrid
                    key={layout.room.name}
                    layout={layout}
                    studentsPerBench={form.studentsPerBench}
                  />
                ))}
              </div>
            )}

            {/* View 2: Room Strength Sheet (Photo match) */}
            {outputView === 'strength' && (
              <StrengthTable layouts={result.layouts} />
            )}

            {/* View 3: Visual Board View */}
            {outputView === 'visual' && (
              <div>
                <div className="no-print">
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    layouts={result.layouts}
                  />
                </div>
                <Legend sectionColors={sectionColors} />
                <div className="space-y-8">
                  {result.layouts.map((layout) => (
                    <RoomGrid
                      key={layout.room.name}
                      layout={layout}
                      studentsPerBench={form.studentsPerBench}
                      sectionColors={sectionColors}
                      searchQuery={searchQuery}
                      selectedFilter={selectedFilter}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modals & Dialogs */}
      <SaveLayoutDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={(name) => {
          saveLayout(name, form, result);
        }}
      />

      <SavedLayoutsList
        isOpen={isSavedLayoutsOpen}
        onClose={() => setIsSavedLayoutsOpen(false)}
        layouts={savedLayouts}
        onLoadLayout={(loaded) => {
          loadForm(loaded);
          setResult(null);
          setActiveErrors([]);
        }}
        onDeleteLayout={deleteLayout}
        onRenameLayout={renameLayout}
        onExportAll={exportAllJson}
        onImportJson={importJson}
      />
    </div>
  );
}
