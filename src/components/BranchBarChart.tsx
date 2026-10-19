import React from 'react';
import { Layers, ArrowUpDown, Filter } from 'lucide-react';

interface BranchBarChartProps {
  data: { branch: string; count: number; percentage: number }[];
  totalStudents: number;
  selectedBranches: string[];
  onToggleBranch: (branch: string) => void;
}

export const BranchBarChart: React.FC<BranchBarChartProps> = ({
  data,
  totalStudents,
  selectedBranches,
  onToggleBranch,
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />
          <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase">
            Branch-wise Student Count
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sorted Descending
          </span>
          {selectedBranches.length > 0 && (
            <span className="bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {selectedBranches.length} Selected
            </span>
          )}
        </div>
      </div>

      {/* Visual Canvas */}
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-8">
          No data matches the selected filters.
        </div>
      ) : (
        <div className="space-y-3.5 flex-1 flex flex-col justify-center">
          {data.map((item) => {
            const isSelected = selectedBranches.includes(item.branch);
            const isDimmed = selectedBranches.length > 0 && !isSelected;
            const barWidthPercent = (item.count / maxCount) * 100;

            return (
              <div
                key={item.branch}
                onClick={() => onToggleBranch(item.branch)}
                className={`group cursor-pointer transition-all p-1.5 rounded-lg -mx-1.5 ${
                  isSelected
                    ? 'bg-blue-50/80 ring-1 ring-blue-300'
                    : isDimmed
                    ? 'opacity-40 hover:opacity-80'
                    : 'hover:bg-slate-50'
                }`}
                title={`Click to filter by ${item.branch}`}
              >
                {/* Branch name and values */}
                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                  <span
                    className={`font-semibold truncate max-w-[70%] ${
                      isSelected ? 'text-blue-900' : 'text-slate-800'
                    }`}
                  >
                    {item.branch}
                  </span>
                  <div className="flex items-center gap-2 tabular-nums shrink-0">
                    <span className="font-bold text-blue-950 text-sm">
                      {item.count}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full bg-slate-100 h-6 rounded-md overflow-hidden flex items-center p-0.5 relative">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[10px] font-semibold text-white ${
                      isSelected
                        ? 'bg-blue-900 shadow-sm'
                        : 'bg-gradient-to-r from-blue-900 to-sky-600 group-hover:from-blue-950 group-hover:to-sky-500'
                    }`}
                    style={{ width: `${Math.max(barWidthPercent, 5)}%` }}
                  >
                    {barWidthPercent > 18 && (
                      <span className="drop-shadow-xs">{item.count}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any bar to cross-filter dashboard</span>
        <span className="tabular-nums font-medium text-slate-500">
          Total: {totalStudents} Students
        </span>
      </div>
    </div>
  );
};
