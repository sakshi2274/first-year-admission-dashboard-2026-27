import React, { useState } from 'react';
import { PieChart as PieIcon, BarChartHorizontal, Filter, Info, Compass } from 'lucide-react';

interface RegionDataPoint {
  region: string;
  count: number;
  percentage: number;
  districts: string[];
}

interface RegionPieChartProps {
  data: RegionDataPoint[];
  totalStudents: number;
  selectedRegions: string[];
  onToggleRegion: (region: string) => void;
  classificationMode: 'administrative' | 'homeDistrict' | 'university';
  onClassificationChange: (mode: 'administrative' | 'homeDistrict' | 'university') => void;
}

// Power BI Navy & Light Blue theme palette for Pie Slices
const PALETTE = [
  '#0F2042', // Deep Navy
  '#0284C7', // Sky Blue
  '#1E3A8A', // Royal Navy
  '#38BDF8', // Light Sky
  '#F59E0B', // Amber Accent
  '#64748B', // Slate
  '#10B981', // Emerald
];

export const RegionPieChart: React.FC<RegionPieChartProps> = ({
  data,
  totalStudents,
  selectedRegions,
  onToggleRegion,
  classificationMode,
  onClassificationChange,
}) => {
  const [chartType, setChartType] = useState<'donut' | 'pie' | 'bars'>('donut');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const total = totalStudents || 1;

  // Prepare Pie Slices
  let cumulativeAngle = 0;
  const slices = data.map((item, index) => {
    const sliceAngle = (item.count / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += sliceAngle;
    const endAngle = cumulativeAngle;
    const color = PALETTE[index % PALETTE.length];

    return {
      ...item,
      startAngle,
      endAngle,
      sliceAngle,
      color,
    };
  });

  // Helper to convert polar coordinates to Cartesian
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Helper to generate SVG path for donut/pie arc
  const describeArc = (
    centerX: number,
    centerY: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    // When slice is 360 or almost 360 (e.g. single item), cap angle to 359.99 to avoid SVG arc collapse
    const cappedEndAngle = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;

    const startOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const endOuter = polarToCartesian(centerX, centerY, outerRadius, cappedEndAngle);
    const startInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);
    const endInner = polarToCartesian(centerX, centerY, innerRadius, cappedEndAngle);

    const largeArcFlag = cappedEndAngle - startAngle <= 180 ? '0' : '1';

    if (innerRadius === 0) {
      // Standard Pie
      return [
        `M ${centerX} ${centerY}`,
        `L ${startOuter.x} ${startOuter.y}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
        'Z',
      ].join(' ');
    }

    // Donut
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase flex items-center gap-1.5">
              <span>Region-wise Distribution</span>
              <span className="text-[10px] font-normal text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                Pie Chart
              </span>
            </h3>
          </div>
        </div>

        {/* Chart View Toggles */}
        <div className="flex items-center gap-2">
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

          {selectedRegions.length > 0 && (
            <span className="bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {selectedRegions.length} Selected
            </span>
          )}
        </div>
      </div>

      {/* Region Model Selector: Administrative vs Home District vs University */}
      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-100 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-semibold uppercase tracking-wider shrink-0 text-[10px]">
          Classification:
        </span>
        <button
          type="button"
          onClick={() => onClassificationChange('administrative')}
          className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            classificationMode === 'administrative'
              ? 'bg-blue-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="State Administrative Divisions: Western Maharashtra, Marathwada, North Maharashtra, Konkan, Other State"
        >
          Administrative Divisions
        </button>
        <button
          type="button"
          onClick={() => onClassificationChange('homeDistrict')}
          className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            classificationMode === 'homeDistrict'
              ? 'bg-blue-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="College Home District (Sangli) vs Other Maharashtra Districts vs Other State"
        >
          Home vs Other District
        </button>
        <button
          type="button"
          onClick={() => onClassificationChange('university')}
          className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            classificationMode === 'university'
              ? 'bg-blue-900 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Affiliated University: Shivaji University Kolhapur (SUK) vs Other University (OHU)"
        >
          University Jurisdiction
        </button>
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
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
          {data.map((item, idx) => {
            const isSelected = selectedRegions.includes(item.region);
            const isDimmed = selectedRegions.length > 0 && !isSelected;
            const maxVal = Math.max(...data.map((d) => d.count), 1);
            const barWidth = (item.count / maxVal) * 100;
            const color = PALETTE[idx % PALETTE.length];

            return (
              <div
                key={item.region}
                onClick={() => onToggleRegion(item.region)}
                className={`group cursor-pointer transition-all p-2 rounded-lg ${
                  isSelected
                    ? 'bg-blue-50/90 ring-1 ring-blue-400 shadow-2xs'
                    : isDimmed
                    ? 'opacity-40 hover:opacity-80'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1 gap-2">
                  <div className="flex items-center gap-2 truncate max-w-[70%]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className={`font-bold text-sm tracking-tight truncate ${
                        isSelected ? 'text-blue-950 font-black' : 'text-slate-900'
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

                <div className="text-[11px] text-slate-400 mb-1 pl-4 truncate">
                  Districts: <span className="text-slate-600">{item.districts.join(', ')}</span>
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
                const isSelected = selectedRegions.includes(slice.region);
                const isHovered = hoveredRegion === slice.region;
                const isDimmed =
                  (selectedRegions.length > 0 && !isSelected) ||
                  (hoveredRegion !== null && !isHovered);

                // Add slight radius expansion on hover or selection
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
                    key={slice.region}
                    d={pathData}
                    fill={slice.color}
                    onClick={() => onToggleRegion(slice.region)}
                    onMouseEnter={() => setHoveredRegion(slice.region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className="cursor-pointer transition-all duration-200 focus:outline-hidden"
                    opacity={isDimmed ? 0.35 : 1}
                    stroke="#ffffff"
                    strokeWidth={slices.length > 1 ? 2 : 0}
                  >
                    <title>{`${slice.region}: ${slice.count} students (${slice.percentage.toFixed(1)}%)\nDistricts: ${slice.districts.join(', ')}`}</title>
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
          <div className="flex-1 space-y-1.5 max-h-[230px] overflow-y-auto w-full pr-1">
            {slices.map((item) => {
              const isSelected = selectedRegions.includes(item.region);
              const isHovered = hoveredRegion === item.region;
              const isDimmed =
                (selectedRegions.length > 0 && !isSelected) ||
                (hoveredRegion !== null && !isHovered);

              return (
                <div
                  key={item.region}
                  onClick={() => onToggleRegion(item.region)}
                  onMouseEnter={() => setHoveredRegion(item.region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className={`flex items-start justify-between gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 ring-1 ring-blue-400 font-bold'
                      : isHovered
                      ? 'bg-slate-100 font-medium'
                      : isDimmed
                      ? 'opacity-40 hover:opacity-80'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2 truncate pr-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">
                        {item.region}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {item.districts.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 tabular-nums">
                    <span className="font-bold text-blue-950 block">
                      {item.count}
                    </span>
                    <span className="text-[10px] text-sky-700 font-semibold">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer / Context Note */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Click any pie slice to cross-filter</span>
        <span className="tabular-nums font-bold text-slate-700">
          {data.length} Regions ({totalStudents} Students)
        </span>
      </div>
    </div>
  );
};
