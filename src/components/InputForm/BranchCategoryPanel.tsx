import React, { useState } from 'react';
import type { CategoryInput, ValidationError, BranchInput, SectionInput, RollRange } from '../../engine/types';
import { BranchCard } from './BranchCard';
import { Cpu, Cog, Plus } from 'lucide-react';

interface Props {
  circuital: CategoryInput;
  nonCircuital: CategoryInput;
  onAddBranch: (category: 'circuital' | 'non-circuital') => void;
  onRemoveBranch: (category: 'circuital' | 'non-circuital', branchId: string) => void;
  onUpdateBranch: (
    category: 'circuital' | 'non-circuital',
    branchId: string,
    updates: Partial<BranchInput>
  ) => void;
  onAddSection: (category: 'circuital' | 'non-circuital', branchId: string) => void;
  onRemoveSection: (
    category: 'circuital' | 'non-circuital',
    branchId: string,
    sectionId: string
  ) => void;
  onUpdateSection: (
    category: 'circuital' | 'non-circuital',
    branchId: string,
    sectionId: string,
    updates: Partial<SectionInput>
  ) => void;
  onAddRollRange: (
    category: 'circuital' | 'non-circuital',
    branchId: string,
    sectionId: string
  ) => void;
  onUpdateRollRange: (
    category: 'circuital' | 'non-circuital',
    branchId: string,
    sectionId: string,
    rangeIndex: number,
    updates: Partial<RollRange>
  ) => void;
  onRemoveRollRange: (
    category: 'circuital' | 'non-circuital',
    branchId: string,
    sectionId: string,
    rangeIndex: number
  ) => void;
  errors: ValidationError[];
}

export const BranchCategoryPanel: React.FC<Props> = ({
  circuital,
  nonCircuital,
  onAddBranch,
  onRemoveBranch,
  onUpdateBranch,
  onAddSection,
  onRemoveSection,
  onUpdateSection,
  onAddRollRange,
  onUpdateRollRange,
  onRemoveRollRange,
  errors,
}) => {
  const [activeTab, setActiveTab] = useState<'circuital' | 'non-circuital'>('circuital');

  const currentCat = activeTab === 'circuital' ? circuital : nonCircuital;
  const currentPrefix = activeTab === 'circuital' ? 'circuital' : 'nonCircuital';

  const hasCircuitalErrors = errors.some((e) => e.field?.startsWith('circuital'));
  const hasNonCircuitalErrors = errors.some((e) => e.field?.startsWith('nonCircuital'));

  return (
    <div className="glass-card p-5 mb-6" id="branches-section">
      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Academic Branches & Sections
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organized into Circuital & Non-Circuital streams for anti-collusion bench pair placement.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            id="tab-circuital"
            onClick={() => setActiveTab('circuital')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-all duration-150 relative ${
              activeTab === 'circuital'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Circuital Stream</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-900/60 font-mono text-slate-700 dark:text-slate-300">
              {circuital.branches.length}
            </span>
            {hasCircuitalErrors && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          <button
            type="button"
            id="tab-non-circuital"
            onClick={() => setActiveTab('non-circuital')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-all duration-150 relative ${
              activeTab === 'non-circuital'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200 dark:border-slate-600 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Cog className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Non-Circuital Stream</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-900/60 font-mono text-slate-700 dark:text-slate-300">
              {nonCircuital.branches.length}
            </span>
            {hasNonCircuitalErrors && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>
      </div>

      {/* Stream Description & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span>
            {activeTab === 'circuital'
              ? 'Circuital branches (e.g. CSE, ECE, EEE, IT) paired side-by-side with Non-Circuital branches.'
              : 'Non-Circuital branches (e.g. MECH, CIVIL, CHEM) paired side-by-side with Circuital branches.'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddBranch(activeTab)}
          className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium hover:text-blue-600 dark:hover:text-blue-400 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add {activeTab === 'circuital' ? 'Circuital' : 'Non-Circuital'} Branch
        </button>
      </div>

      {/* Branch Cards */}
      <div className="space-y-4">
        {currentCat.branches.map((branch, bIdx) => (
          <BranchCard
            key={branch.id}
            branch={branch}
            branchIndex={bIdx}
            category={activeTab}
            canRemove={currentCat.branches.length > 1}
            onUpdateBranch={(updates) =>
              onUpdateBranch(activeTab, branch.id, updates)
            }
            onRemoveBranch={() => onRemoveBranch(activeTab, branch.id)}
            onAddSection={() => onAddSection(activeTab, branch.id)}
            onRemoveSection={(secId) =>
              onRemoveSection(activeTab, branch.id, secId)
            }
            onUpdateSection={(secId, updates) =>
              onUpdateSection(activeTab, branch.id, secId, updates)
            }
            onAddRollRange={(secId) =>
              onAddRollRange(activeTab, branch.id, secId)
            }
            onUpdateRollRange={(secId, rIdx, updates) =>
              onUpdateRollRange(activeTab, branch.id, secId, rIdx, updates)
            }
            onRemoveRollRange={(secId, rIdx) =>
              onRemoveRollRange(activeTab, branch.id, secId, rIdx)
            }
            fieldPrefix={`${currentPrefix}.branches[${bIdx}]`}
            errors={errors}
          />
        ))}
      </div>
    </div>
  );
};
