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

  // Check if either tab has validation errors to show a warning dot
  const hasCircuitalErrors = errors.some((e) => e.field?.startsWith('circuital'));
  const hasNonCircuitalErrors = errors.some((e) => e.field?.startsWith('nonCircuital'));

  return (
    <div className="glass-card p-5 mb-6" id="branches-section">
      {/* Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232338]">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            Student Branches & Sections
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Grouped into Circuital & Non-Circuital streams for pair placement.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 bg-[#12121a] p-1.5 rounded-xl border border-[#2a2a4a]">
          <button
            type="button"
            id="tab-circuital"
            onClick={() => setActiveTab('circuital')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
              activeTab === 'circuital'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Circuital Stream</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono">
              {circuital.branches.length}
            </span>
            {hasCircuitalErrors && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 ring-2 ring-[#12121a]" />
            )}
          </button>

          <button
            type="button"
            id="tab-non-circuital"
            onClick={() => setActiveTab('non-circuital')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
              activeTab === 'non-circuital'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cog className="w-4 h-4" />
            <span>Non-Circuital Stream</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono">
              {nonCircuital.branches.length}
            </span>
            {hasNonCircuitalErrors && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 ring-2 ring-[#12121a]" />
            )}
          </button>
        </div>
      </div>

      {/* Stream Description & Actions */}
      <div className="flex items-center justify-between gap-3 my-4">
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
          <span>
            {activeTab === 'circuital'
              ? 'Circuital branches (e.g. CSE, ECE, EEE, IT) paired with Non-Circuital branches.'
              : 'Non-Circuital branches (e.g. MECH, CIVIL, CHEM) paired with Circuital branches.'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddBranch(activeTab)}
          className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold"
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
