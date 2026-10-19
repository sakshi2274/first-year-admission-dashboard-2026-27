import React from 'react';
import { Compass, ArrowUpDown, Filter } from 'lucide-react';

interface RegionBarChartProps {
  data: {
    region: string;
    count: number;
    percentage: number;
    districts: string[];
  }[];
  totalStudents: number;
  selectedRegions: string[];
  onToggleRegion: (region: string) => void;
}

export const RegionBarChart: React.FC<RegionBarChartProps> = ({
  data,
  totalStudents,
  selectedRegions,
  onToggleRegion,
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-700" />
          <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase">
            Region-wise Student Distribution
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sorted Descending
          </span>
          {selectedRegions.length > 0 && (
            <span className="bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {selectedRegions.length} Selected
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
        <div className="space-y-2.5 flex-1 flex flex-col justify-center">
          {data.map((item, idx) => {
            const isSelected = selectedRegions.includes(item.region);
            const isDimmed = selectedRegions.length > 0 && !isSelected;
            const barWidthPercent = (item.count / maxCount) * 100;

            return (
              <div
                key={item.region}
                onClick={() => onToggleRegion(item.region)}
                className={`group cursor-pointer transition-all p-2 rounded-lg ${
                  isSelected
                    ? 'bg-sky-50/90 ring-1 ring-sky-400 shadow-2xs'
                    : isDimmed
                    ? 'opacity-40 hover:opacity-80'
                    : 'hover:bg-slate-50'
                }`}
                title={`Click to filter by ${item.region} (${item.districts.join(', ')})`}
              >
                {/* Region name & metrics */}
                <div className="flex items-center justify-between text-xs mb-1 gap-2">
                  <div className="flex items-center gap-2 truncate max-w-[70%]">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      className={`font-bold text-sm tracking-tight truncate ${
                        isSelected ? 'text-sky-950 font-black' : 'text-slate-900'
                      }`}
                    >
                      {item.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 tabular-nums shrink-0">
                    <span className="font-extrabold text-blue-950 text-sm">
                      {item.count} <span className="font-normal text-slate-400 text-xs">students</span>
                    </span>
                    <span className="text-sky-700 font-semibold text-xs bg-sky-50 px-1.5 py-0.5 rounded">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Subtitle showing contributing districts */}
                <div className="text-[11px] text-slate-400 mb-1.5 truncate pl-6">
                  Districts: <span className="text-slate-600">{item.districts.join(', ')}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-5 rounded-md overflow-hidden flex items-center p-0.5 relative">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[10px] font-semibold text-white ${
                      isSelected
                        ? 'bg-sky-800 shadow-sm'
                        : 'bg-gradient-to-r from-blue-900 via-sky-600 to-sky-400 group-hover:from-blue-950 group-hover:to-sky-500'
                    }`}
                    style={{ width: `${Math.max(barWidthPercent, 4)}%` }}
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

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Click any region to cross-filter</span>
        <span className="tabular-nums font-bold text-slate-700">
          {data.length} Geographic Regions Represented
        </span>
      </div>
    </div>
  );
};
