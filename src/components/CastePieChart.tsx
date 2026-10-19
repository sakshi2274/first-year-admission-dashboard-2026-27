import React, { useState } from 'react';
import { PieChart as PieIcon, BarChartHorizontal, Filter, Users2 } from 'lucide-react';

interface CasteDataPoint {
  caste: string;
  count: number;
  percentage: number;
}

interface CastePieChartProps {
  data: CasteDataPoint[];
  totalStudents: number;
  selectedCastes: string[];
  onToggleCaste: (caste: string) => void;
}

// Power BI Professional Palette for Caste Categories
const CASTE_PALETTE: Record<string, string> = {
  SEBC: '#0F2042', // Deep Navy
  Open: '#0284C7', // Sky Blue
  OBC: '#1E3A8A', // Royal Navy
  TFWS: '#0D9488', // Teal
  'NT-C': '#D97706', // Amber
  SC: '#7C3AED', // Violet
  SBC: '#E11D48', // Rose
  VJ: '#EA580C', // Orange
  VJNT: '#EA580C', // Orange
  'NT-B': '#475569', // Slate
  'NT-D': '#B45309', // Dark Amber
  ACAP: '#059669', // Emerald
};

const FALLBACK_COLORS = [
  '#0F2042',
  '#0284C7',
  '#1E3A8A',
  '#38BDF8',
  '#D97706',
  '#7C3AED',
  '#E11D48',
  '#0D9488',
  '#64748B',
  '#EA580C',
  '#059669',
];

export const CastePieChart: React.FC<CastePieChartProps> = ({
  data,
  totalStudents,
  selectedCastes,
  onToggleCaste,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'pie' | 'bars'>('donut');
  const [hoveredCaste, setHoveredCaste] = useState<string | null>(null);

  const total = totalStudents || 1;

  // Prepare Pie Slices
  let cumulativeAngle = 0;
  const slices = data.map((item, index) => {
    const sliceAngle = (item.count / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += sliceAngle;
    const endAngle = cumulativeAngle;
    const color =
      CASTE_PALETTE[item.caste] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

    return {
      ...item,
      startAngle,
      endAngle,
      sliceAngle,
      color,
    };
  });

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    centerX: number,
    centerY: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const cappedEndAngle = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;
    const startOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const endOuter = polarToCartesian(centerX, centerY, outerRadius, cappedEndAngle);
    const startInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);
    const endInner = polarToCartesian(centerX, centerY, innerRadius, cappedEndAngle);

    const largeArcFlag = cappedEndAngle - startAngle <= 180 ? '0' : '1';

    if (innerRadius === 0) {
      return [
        `M ${centerX} ${centerY}`,
        `L ${startOuter.x} ${startOuter.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
        'Z',
      ].join(' ');
    }

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');
  };

  const center = 110;
  const outerRadius = 88;
  const innerRadius = chartType === 'donut' ? 52 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />
          <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase flex items-center gap-1.5">
            <span>Caste-wise Distribution</span>
            <span className="text-[10px] font-normal text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
              Pie Chart
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart View Toggles */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-slate-600">
            <button
              type="button"
              onClick={() => setChartType('donut')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                chartType === 'donut'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="Donut Chart View"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Donut</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('pie')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                chartType === 'pie'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="Full Pie Chart View"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="text-[11px]">Pie</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bars')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                chartType === 'bars'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'hover:text-slate-900 text-slate-500'
              }`}
              title="Horizontal Bar View"
            >
              <BarChartHorizontal className="w-3.5 h-3.5" />
              <span className="text-[11px]">Bars</span>
            </button>
          </div>

          {selectedCastes.length > 0 && (
            <span className="bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {selectedCastes.length} Selected
            </span>
          )}
        </div>
      </div>

      {/* Main Visual Display */}
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-8">
          No data matches the selected filters.
        </div>
      ) : chartType === 'bars' ? (
        /* ======================================================== */
        /* BAR CHART VIEW                                           */
        /* ======================================================== */
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px] pr-1">
          {data.map((item, idx) => {
            const isSelected = selectedCastes.includes(item.caste);
            const isDimmed = selectedCastes.length > 0 && !isSelected;
            const maxVal = Math.max(...data.map((d) => d.count), 1);
            const barWidth = (item.count / maxVal) * 100;
            const color =
              CASTE_PALETTE[item.caste] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

            return (
              <div
                key={item.caste}
                onClick={() => onToggleCaste(item.caste)}
                className={`group cursor-pointer transition-all p-2 rounded-lg ${
                  isSelected
                    ? 'bg-blue-50/90 ring-1 ring-blue-400 shadow-2xs'
                    : isDimmed
                    ? 'opacity-40 hover:opacity-80'
                    : 'hover:bg-slate-50'
                }`}
                title={`Click to filter by Caste: ${item.caste}`}
              >
                <div className="flex items-center justify-between text-xs mb-1 gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className={`font-bold text-sm tracking-tight truncate ${
                        isSelected ? 'text-blue-950 font-black' : 'text-slate-900'
                      }`}
                    >
                      {item.caste}
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

                <div className="w-full bg-slate-100 h-4 rounded-md overflow-hidden flex items-center p-0.5">
                  <div
                    className="h-full rounded-sm transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(barWidth, 4)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================================================== */
        /* PIE / DONUT CHART VIEW                                   */
        /* ======================================================== */
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          {/* SVG Pie Chart */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              className="drop-shadow-xs overflow-visible"
            >
              {slices.map((slice) => {
                const isSelected = selectedCastes.includes(slice.caste);
                const isHovered = hoveredCaste === slice.caste;
                const isDimmed =
                  (selectedCastes.length > 0 && !isSelected) ||
                  (hoveredCaste !== null && !isHovered);

                const currentOuterRadius = isHovered || isSelected ? outerRadius + 4 : outerRadius;

                const pathData = describeArc(
                  center,
                  center,
                  currentOuterRadius,
                  innerRadius,
                  slice.startAngle,
                  slice.endAngle
                );

                return (
                  <path
                    key={slice.caste}
                    d={pathData}
                    fill={slice.color}
                    onClick={() => onToggleCaste(slice.caste)}
                    onMouseEnter={() => setHoveredCaste(slice.caste)}
                    onMouseLeave={() => setHoveredCaste(null)}
                    className="cursor-pointer transition-all duration-200 focus:outline-hidden"
                    opacity={isDimmed ? 0.35 : 1}
                    stroke="#ffffff"
                    strokeWidth={slices.length > 1 ? 2 : 0}
                  >
                    <title>{`Caste ${slice.caste}: ${slice.count} students (${slice.percentage.toFixed(1)}%)`}</title>
                  </path>
                );
              })}
            </svg>

            {/* Donut Center Display */}
            {chartType === 'donut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-extrabold text-blue-950 tabular-nums">
                  {totalStudents}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Students</span>
              </div>
            )}
          </div>

          {/* Interactive Legend with Live Counts and Percentages */}
          <div className="flex-1 grid grid-cols-2 gap-1.5 max-h-[240px] overflow-y-auto w-full pr-1">
            {slices.map((item) => {
              const isSelected = selectedCastes.includes(item.caste);
              const isHovered = hoveredCaste === item.caste;
              const isDimmed =
                (selectedCastes.length > 0 && !isSelected) ||
                (hoveredCaste !== null && !isHovered);

              return (
                <div
                  key={item.caste}
                  onClick={() => onToggleCaste(item.caste)}
                  onMouseEnter={() => setHoveredCaste(item.caste)}
                  onMouseLeave={() => setHoveredCaste(null)}
                  className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 ring-1 ring-blue-400 font-bold'
                      : isHovered
                      ? 'bg-slate-100 font-medium'
                      : isDimmed
                      ? 'opacity-40 hover:opacity-80'
                      : 'hover:bg-slate-50'
                  }`}
                  title={`Filter by ${item.caste}`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-slate-900 truncate text-[11px]">
                      {item.caste}
                    </span>
                  </div>

                  <div className="text-right shrink-0 tabular-nums">
                    <span className="font-extrabold text-blue-950 text-xs">
                      {item.count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium ml-1">
                      ({item.percentage.toFixed(0)}%)
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
        <span>Click any pie slice to filter by Caste</span>
        <span className="tabular-nums font-bold text-slate-700">
          {data.length} Caste Categories ({totalStudents} Students)
        </span>
      </div>
    </div>
  );
};
