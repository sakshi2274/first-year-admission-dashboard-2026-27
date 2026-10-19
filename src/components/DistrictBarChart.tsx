import React, { useState, useMemo } from 'react';
import {
  Building2,
  ArrowUpDown,
  Filter,
  BarChart2,
  BarChartHorizontal,
  LayoutGrid,
  Search,
  Check,
  MapPin,
} from 'lucide-react';

interface DistrictBarChartProps {
  data: { district: string; count: number; percentage: number }[];
  totalStudents: number;
  selectedDistricts: string[];
  onToggleDistrict: (district: string) => void;
}

export const DistrictBarChart: React.FC<DistrictBarChartProps> = ({
  data,
  totalStudents,
  selectedDistricts,
  onToggleDistrict,
}) => {
  const [viewMode, setViewMode] = useState<'horizontal' | 'cards' | 'column'>('horizontal');
  const [searchQuery, setSearchQuery] = useState('');

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Filtered by local search if user wants to quickly find a district
  const displayedDistricts = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((d) => d.district.toLowerCase().includes(q));
  }, [data, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase flex items-center gap-1.5">
              <span>District-wise Student Distribution</span>
              <span className="text-[10px] font-normal text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                Clear District Names
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode('horizontal')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'horizontal'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="Horizontal Bar View (Clear, full district names)"
            >
              <BarChartHorizontal className="w-3.5 h-3.5" />
              <span className="text-[11px]">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="District Cards Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px]">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('column')}
              className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                viewMode === 'column'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="Column Chart View"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Columns</span>
            </button>
          </div>

          {selectedDistricts.length > 0 && (
            <span className="bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {selectedDistricts.length} Selected
            </span>
          )}
        </div>
      </div>

      {/* Quick Clickable District Chips for Complete Visibility */}
      <div className="mb-3 pb-2.5 border-b border-slate-100 flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
          Quick Filter:
        </span>
        {data.map((item) => {
          const isSelected = selectedDistricts.includes(item.district);
          return (
            <button
              key={item.district}
              type="button"
              onClick={() => onToggleDistrict(item.district)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-semibold flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-900 text-white shadow-2xs ring-1 ring-blue-900'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={`Click to filter by District ${item.district}`}
            >
              <span className="font-bold">{item.district}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                  isSelected ? 'bg-sky-800 text-sky-100' : 'bg-white text-slate-600'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Canvas */}
      {displayedDistricts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-8">
          No districts match the selected filters or search query.
        </div>
      ) : viewMode === 'horizontal' ? (
        /* ======================================================== */
        /* HORIZONTAL BAR VIEW - 100% CLEAR DISTRICT NAMES          */
        /* ======================================================== */
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
          {displayedDistricts.map((item, index) => {
            const isSelected = selectedDistricts.includes(item.district);
            const isDimmed = selectedDistricts.length > 0 && !isSelected;
            const barWidthPercent = (item.count / maxCount) * 100;

            return (
              <div
                key={item.district}
                onClick={() => onToggleDistrict(item.district)}
                className={`group cursor-pointer transition-all p-2.5 rounded-lg border ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400 shadow-2xs'
                    : isDimmed
                    ? 'border-transparent opacity-40 hover:opacity-80'
                    : 'border-slate-100 bg-white hover:bg-slate-50/80 hover:border-slate-200'
                }`}
                title={`Click to filter by District: ${item.district}`}
              >
                {/* Clear, Bold District Name & Count */}
                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <span
                      className={`font-black text-sm tracking-tight text-slate-900 ${
                        isSelected ? 'text-blue-950 font-black' : ''
                      }`}
                    >
                      {item.district}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 tabular-nums shrink-0">
                    <span className="font-black text-blue-950 text-sm">
                      {item.count}{' '}
                      <span className="font-normal text-slate-400 text-xs">students</span>
                    </span>
                    <span className="text-sky-800 font-bold text-xs bg-sky-100/80 px-2 py-0.5 rounded">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-4.5 rounded-md overflow-hidden flex items-center p-0.5 relative">
                  <div
                    className={`h-full rounded-sm transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[10px] font-bold text-white ${
                    isSelected
                      ? 'bg-blue-900 shadow-sm'
                      : 'bg-gradient-to-r from-blue-950 via-blue-900 to-sky-600 group-hover:from-blue-950 group-hover:to-sky-500'
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
      ) : viewMode === 'cards' ? (
        /* ======================================================== */
        /* DISTRICT CARDS GRID VIEW - COMPACT CLEAR INFORMATION     */
        /* ======================================================== */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 flex-1 overflow-y-auto max-h-[360px] pr-1">
          {displayedDistricts.map((item, index) => {
            const isSelected = selectedDistricts.includes(item.district);
            const isDimmed = selectedDistricts.length > 0 && !isSelected;

            return (
              <div
                key={item.district}
                onClick={() => onToggleDistrict(item.district)}
                className={`cursor-pointer transition-all p-3 rounded-xl border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-400 ring-1 ring-blue-400 shadow-2xs'
                    : isDimmed
                    ? 'border-slate-100 opacity-40 hover:opacity-80'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      #{index + 1}
                    </span>
                    <span className="text-sky-700 font-bold text-xs bg-sky-50 px-1.5 py-0.5 rounded">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-2">
                    {item.district}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Students</span>
                  <span className="text-base font-black text-blue-950 tabular-nums">
                    {item.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================================================== */
        /* COLUMN CHART VIEW - CLEAN VERTICAL WITH CLEAR LABELS     */
        /* ======================================================== */
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-end justify-between gap-3 h-[240px] pt-4 pb-2 overflow-x-auto">
            {displayedDistricts.map((item) => {
              const isSelected = selectedDistricts.includes(item.district);
              const isDimmed = selectedDistricts.length > 0 && !isSelected;
              const barHeightPercent = (item.count / maxCount) * 100;

              return (
                <div
                  key={item.district}
                  onClick={() => onToggleDistrict(item.district)}
                  className={`flex flex-col items-center justify-end h-full cursor-pointer group transition-all p-1.5 rounded-lg shrink-0 w-20 sm:w-24 ${
                    isSelected
                      ? 'bg-blue-50 ring-1 ring-blue-400'
                      : isDimmed
                      ? 'opacity-40 hover:opacity-80'
                      : 'hover:bg-slate-50'
                  }`}
                  title={`Click to filter by ${item.district}: ${item.count} students (${item.percentage.toFixed(1)}%)`}
                >
                  {/* Top value badge */}
                  <div className="text-center mb-1.5 tabular-nums">
                    <span className="text-xs font-black text-blue-950 block">
                      {item.count}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Column Bar */}
                  <div className="w-full max-w-[36px] bg-slate-100 h-full max-h-[120px] rounded-t-md overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                        isSelected
                          ? 'bg-blue-900 shadow-sm'
                          : 'bg-gradient-to-t from-blue-950 via-blue-900 to-sky-500 group-hover:from-blue-900 group-hover:to-sky-400'
                      }`}
                      style={{ height: `${Math.max(barHeightPercent, 8)}%` }}
                    />
                  </div>

                  {/* Clear District Label */}
                  <div className="h-16 mt-2 flex items-start justify-center text-center">
                    <span
                      className={`text-xs font-bold text-center block leading-tight ${
                        isSelected ? 'text-blue-900 font-black' : 'text-slate-900'
                      }`}
                    >
                      {item.district}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          Sorted Descending by Student Count
        </span>
        <span className="tabular-nums font-bold text-slate-700">
          {data.length} Districts Total ({totalStudents} Students)
        </span>
      </div>
    </div>
  );
};
