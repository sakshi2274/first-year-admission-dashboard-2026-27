import React, { useState } from 'react';
import { ArrowUpDown, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface TalukaBarChartProps {
  data: { taluka: string; count: number; percentage: number; district?: string }[];
  totalStudents: number;
  selectedTalukas: string[];
  onToggleTaluka: (taluka: string) => void;
}

export const TalukaBarChart: React.FC<TalukaBarChartProps> = ({
  data,
  totalStudents,
  selectedTalukas,
  onToggleTaluka,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 8;
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const displayedData = showAll ? data : data.slice(0, displayLimit);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase">
            Taluka-wise Student Count
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sorted Descending
          </span>
          {selectedTalukas.length > 0 && (
            <span className="bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {selectedTalukas.length} Selected
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
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
          {displayedData.map((item) => {
            const isSelected = selectedTalukas.includes(item.taluka);
            const isDimmed = selectedTalukas.length > 0 && !isSelected;
            const barWidthPercent = (item.count / maxCount) * 100;

            return (
              <div
                key={item.taluka}
                onClick={() => onToggleTaluka(item.taluka)}
                className={`group cursor-pointer transition-all p-1.5 rounded-lg -mx-1.5 ${
                  isSelected
                    ? 'bg-sky-50/90 ring-1 ring-sky-300'
                    : isDimmed
                    ? 'opacity-40 hover:opacity-80'
                    : 'hover:bg-slate-50'
                }`}
                title={`Click to filter by ${item.taluka}`}
              >
                <div className="flex items-center justify-between text-xs mb-1 gap-2">
                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <span
                      className={`font-semibold truncate ${
                        isSelected ? 'text-sky-900' : 'text-slate-800'
                      }`}
                    >
                      {item.taluka}
                    </span>
                    {item.district && (
                      <span className="text-[10px] text-slate-400 truncate">
                        ({item.district})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 tabular-nums shrink-0">
                    <span className="font-bold text-sky-950 text-sm">
                      {item.count}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-5 rounded-md overflow-hidden flex items-center p-0.5 relative">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[10px] font-semibold text-white ${
                      isSelected
                        ? 'bg-sky-700 shadow-sm'
                        : 'bg-gradient-to-r from-sky-600 to-sky-400 group-hover:from-sky-700 group-hover:to-sky-500'
                    }`}
                    style={{ width: `${Math.max(barWidthPercent, 4)}%` }}
                  >
                    {barWidthPercent > 20 && (
                      <span className="drop-shadow-xs">{item.count}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show more/less toggle button if more than displayLimit talukas */}
      {data.length > displayLimit && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 py-1 px-3 rounded-md hover:bg-sky-50 transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show Top {displayLimit} Only
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show All {data.length} Talukas
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any bar to filter</span>
        <span className="tabular-nums font-medium text-slate-500">
          Showing {displayedData.length} of {data.length} Talukas
        </span>
      </div>
    </div>
  );
};
