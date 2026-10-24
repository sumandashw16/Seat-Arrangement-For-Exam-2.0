import { useState, useMemo, useCallback, useEffect } from 'react';
import { useFormState } from '../state/useFormState';
import { useCloudLayouts } from '../state/useCloudLayouts';
import { useAuth } from '../state/useAuth';
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
import { AuthModal } from './Auth/AuthModal';

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
  LogOut,
  User,
  Loader2,
} from 'lucide-react';

export default function App() {
  // ── Auth ──
  const { authState, signIn, signUp, signOut } = useAuth();
  const userId =
    authState.status === 'authenticated' ? authState.user.id : null;
  const userEmail =
    authState.status === 'authenticated' ? authState.user.email ?? '' : '';

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
  } = useCloudLayouts(userId);

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
        theme === 'dark' ? 'dark bg-[#0b0f17] text-slate-100' : 'bg-slate-50 text-slate-900'
      } flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-150`}
    >
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Seat Arrangement Planner
                </h1>
                <span className="text-[10px] uppercase font-semibold font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
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
              className="btn-ghost flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLoadDemo}
              className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"
              title="Populate complete university exam test scenario"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Load Demo Data</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSavedLayoutsOpen(true)}
              className="btn-secondary flex items-center gap-1.5 py-1 px-2.5 text-xs font-medium"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
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
              className="btn-ghost p-1.5 text-slate-400 hover:text-rose-600"
              title="Reset Planner"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* User chip + sign out */}
            {authState.status === 'authenticated' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[140px] truncate" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
                <button
                  type="button"
                  id="sign-out-button"
                  onClick={() => {
                    if (window.confirm('Sign out of your account?')) signOut();
                  }}
                  className="btn-ghost p-1.5 text-slate-400 hover:text-rose-600"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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
          <div className="flex flex-col items-center justify-center pt-2 pb-8">
            <button
              type="button"
              id="generate-arrangement-button"
              onClick={handleGenerate}
              className="btn-primary text-sm font-semibold py-2.5 px-7 flex items-center gap-2 shadow-sm transition-colors"
            >
              <Wand2 className="w-4 h-4 text-white" />
              <span>Generate Seating Arrangement</span>
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
              Deterministic exam engine • Leftover handling • Pair placement
            </p>
          </div>
        </section>

        {/* Output Section */}
        {result && result.ok && (
          <section id="arrangement-results" className="pt-4 scroll-mt-20 animate-fadeIn">
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
              <div className="flex items-center gap-1 p-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  id="view-excel-grid"
                  onClick={() => setOutputView('excel')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    outputView === 'excel'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel Box Grid (Landscape Fit)</span>
                </button>

                <button
                  type="button"
                  id="view-strength-sheet"
                  onClick={() => setOutputView('strength')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    outputView === 'strength'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Room Strength Sheet</span>
                </button>

                <button
                  type="button"
                  id="view-visual-grid"
                  onClick={() => setOutputView('visual')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    outputView === 'visual'
                      ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Interactive Board</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {outputView === 'excel' && 'Clean Excel box grid • A4 Landscape fit'}
                {outputView === 'strength' && 'Room-wise strengths & registration roll lists'}
                {outputView === 'visual' && 'Search & visual stream colors'}
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

      {/* Auth — loading spinner while session initializes */}
      {authState.status === 'loading' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#0b0f17]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Checking session…</span>
          </div>
        </div>
      )}

      {/* Auth modal — blocks app when unauthenticated */}
      {authState.status === 'unauthenticated' && (
        <AuthModal onSignIn={signIn} onSignUp={signUp} />
      )}
    </div>
  );
}
