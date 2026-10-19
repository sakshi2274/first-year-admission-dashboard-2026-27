import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  Search,
  CheckSquare,
  Building2,
  MapPin,
  BookOpen,
  Tag,
  SlidersHorizontal,
  LayoutGrid,
  CheckCheck,
  LucideIcon,
} from 'lucide-react';
import { FilterState } from '../types';

interface SlicersPanelProps {
  filterState: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  availableOptions: {
    regions: { name: string; count: number }[];
    districts: { name: string; count: number }[];
    talukas: { name: string; count: number }[];
    branches: { name: string; count: number }[];
    castes: { name: string; count: number }[];
  };
  totalCount: number;
  filteredCount: number;
}

interface SlicerDropdownProps {
  label: string;
  icon: LucideIcon;
  options: { name: string; count: number }[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  accentColor?: string;
}

const SlicerDropdown: React.FC<SlicerDropdownProps> = ({
  label,
  icon: Icon,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSingleSelect, setIsSingleSelect] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((opt) => opt.name.toLowerCase().includes(q));
  }, [options, search]);

  const allOptionNames = useMemo(() => options.map((o) => o.name), [options]);

  const isAllSelected =
    options.length > 0 &&
    (selectedValues.length === options.length ||
      (selectedValues.length === 0 && false)); // Explicit select-all state

  const isPartiallySelected =
    selectedValues.length > 0 && selectedValues.length < options.length;

  // Toggle individual option
  const toggleOption = (name: string) => {
    if (isSingleSelect) {
      if (selectedValues.length === 1 && selectedValues[0] === name) {
        onChange([]);
      } else {
        onChange([name]);
      }
      return;
    }

    if (selectedValues.includes(name)) {
      onChange(selectedValues.filter((v) => v !== name));
    } else {
      onChange([...selectedValues, name]);
    }
  };

  // Select only this item
  const selectOnly = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    onChange([name]);
  };

  // Select all options
  const handleSelectAllToggle = () => {
    if (selectedValues.length === options.length) {
      onChange([]); // Deselect all / clear
    } else {
      onChange(allOptionNames); // Select all
    }
  };

  // Select all currently filtered by search
  const handleSelectMatching = () => {
    const matchingNames = filteredOptions.map((o) => o.name);
    const combined = Array.from(new Set([...selectedValues, ...matchingNames]));
    onChange(combined);
  };

  const clearSelection = () => {
    onChange([]);
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Slicer Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
          selectedValues.length > 0
            ? 'bg-blue-900 text-white border-blue-900 shadow-xs ring-1 ring-blue-900'
            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
        title={`Filter by ${label}`}
      >
        <Icon
          className={`w-3.5 h-3.5 ${
            selectedValues.length > 0 ? 'text-sky-300' : 'text-blue-900'
          }`}
        />
        <span>{label}:</span>
        <span className="font-normal truncate max-w-[110px]">
          {selectedValues.length === 0
            ? 'All'
            : selectedValues.length === 1
            ? selectedValues[0]
            : `${selectedValues.length} selected`}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            selectedValues.length > 0 ? 'text-blue-200' : 'text-slate-400'
          }`}
        />
      </button>

      {/* Slicer Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-40 mt-1.5 left-0 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-100">
          {/* Header & Mode Controls */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-blue-900" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {label} Slicer
              </span>
            </div>

            {/* Single vs Multi-Select Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-[10px]">
              <button
                type="button"
                onClick={() => setIsSingleSelect(false)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  !isSingleSelect
                    ? 'bg-white text-blue-950 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Multi-select with checkboxes"
              >
                Multi
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSingleSelect(true);
                  if (selectedValues.length > 1) {
                    onChange([selectedValues[0]]);
                  }
                }}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  isSingleSelect
                    ? 'bg-white text-blue-950 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Single-select radio mode"
              >
                Single
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <button
              type="button"
              onClick={() => onChange(allOptionNames)}
              className="px-2 py-0.5 rounded text-[11px] font-semibold text-blue-900 hover:bg-blue-100/70 transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3 text-blue-700" />
              Select All
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={clearSelection}
              className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Clear Filter
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                const inverted = allOptionNames.filter(
                  (name) => !selectedValues.includes(name)
                );
                onChange(inverted);
              }}
              className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Invert
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* If searching, allow selecting all matching */}
          {search.trim() && filteredOptions.length > 0 && (
            <button
              type="button"
              onClick={handleSelectMatching}
              className="w-full py-1 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-semibold rounded-md border border-sky-200 flex items-center justify-between transition-colors"
            >
              <span>Select all matching ({filteredOptions.length})</span>
              <Check className="w-3 h-3 text-sky-700" />
            </button>
          )}

          {/* Options list with Master '(Select All)' item */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
            {/* Master '(Select All)' Row (Power BI Standard) */}
            {!search && !isSingleSelect && (
              <div
                onClick={handleSelectAllToggle}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-blue-50/70 border border-slate-100 text-xs cursor-pointer select-none font-bold text-slate-800 group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      isAllSelected
                        ? 'bg-blue-900 border-blue-900 text-white'
                        : isPartiallySelected
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'border-slate-300 group-hover:border-slate-400'
                    }`}
                  >
                    {isAllSelected ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : isPartiallySelected ? (
                      <div className="w-2 h-0.5 bg-white rounded-xs" />
                    ) : null}
                  </div>
                  <span>(Select All)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  {options.length} items
                </span>
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                No matching {label.toLowerCase()} found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const checked = selectedValues.includes(opt.name);
                return (
                  <div
                    key={opt.name}
                    onClick={() => toggleOption(opt.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none group transition-all ${
                      checked
                        ? 'bg-blue-50/90 text-blue-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2 min-w-0">
                      {isSingleSelect ? (
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                            checked
                              ? 'border-blue-900'
                              : 'border-slate-300 group-hover:border-slate-400'
                          }`}
                        >
                          {checked && (
                            <div className="w-2 h-2 rounded-full bg-blue-900" />
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            checked
                              ? 'bg-blue-900 border-blue-900 text-white'
                              : 'border-slate-300 group-hover:border-slate-400'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      )}
                      <span className="truncate">{opt.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                      {/* Shortcut to select only this */}
                      <button
                        type="button"
                        onClick={(e) => selectOnly(e, opt.name)}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-sky-700 hover:text-sky-900 hover:underline px-1 transition-opacity"
                        title={`Select ONLY ${opt.name}`}
                      >
                        Only
                      </button>
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded font-normal ${
                          checked
                            ? 'bg-sky-200 text-sky-900 font-semibold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {opt.count}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Slicer Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="tabular-nums">
              {selectedValues.length === 0
                ? 'Showing all (unfiltered)'
                : `${selectedValues.length} of ${options.length} selected`}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-0.5 bg-blue-900 text-white rounded text-xs font-semibold hover:bg-blue-950 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const SlicersPanel: React.FC<SlicersPanelProps> = ({
  filterState,
  onFilterChange,
  availableOptions,
  totalCount,
  filteredCount,
}) => {
  const [slicerViewMode, setSlicerViewMode] = useState<'dropdowns' | 'tiles'>('dropdowns');

  const hasActiveFilters =
    filterState.districts.length > 0 ||
    filterState.talukas.length > 0 ||
    filterState.branches.length > 0 ||
    filterState.castes.length > 0;

  const handleResetAll = () => {
    onFilterChange({
      regions: [],
      districts: [],
      talukas: [],
      branches: [],
      castes: [],
      searchQuery: '',
    });
  };

  const removeFilterItem = (type: keyof FilterState, value: string) => {
    if (type === 'searchQuery') {
      onFilterChange({ ...filterState, searchQuery: '' });
      return;
    }
    const current = filterState[type] as string[];
    onFilterChange({
      ...filterState,
      [type]: current.filter((item) => item !== value),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      {/* Top Header Row of Slicers Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Interactive Slicers Label & Slicer View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-900" />
            <span>Interactive Slicers:</span>
          </div>

          {/* Slicer Display Mode Toggle (Dropdowns vs Expanded Tiles) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setSlicerViewMode('dropdowns')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                slicerViewMode === 'dropdowns'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compact Dropdown Slicers"
            >
              <SlidersHorizontal className="w-3 h-3 text-blue-900" />
              <span>Dropdowns</span>
            </button>
            <button
              type="button"
              onClick={() => setSlicerViewMode('tiles')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                slicerViewMode === 'tiles'
                  ? 'bg-white text-blue-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Expanded Tile / Button Slicers"
            >
              <LayoutGrid className="w-3 h-3 text-sky-700" />
              <span>Expanded Tiles</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Free Search & Cohort Counter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Student Cohort Counter */}
          <div className="text-xs text-slate-500 tabular-nums px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
            Showing <strong className="text-blue-950 font-bold">{filteredCount}</strong> of{' '}
            <strong className="text-slate-700">{totalCount}</strong> students
          </div>

          {/* Reset All Slicers Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg hover:bg-rose-100 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DROPDOWN SLICERS VIEW (Compact Toolbar)               */}
      {/* ========================================================= */}
      {slicerViewMode === 'dropdowns' && (
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Slicer 1: District */}
          <SlicerDropdown
            label="District"
            icon={Building2}
            options={availableOptions.districts}
            selectedValues={filterState.districts}
            onChange={(selected) =>
              onFilterChange({ ...filterState, districts: selected })
            }
          />

          {/* Slicer 2: Taluka */}
          <SlicerDropdown
            label="Taluka"
            icon={MapPin}
            options={availableOptions.talukas}
            selectedValues={filterState.talukas}
            onChange={(selected) =>
              onFilterChange({ ...filterState, talukas: selected })
            }
          />

          {/* Slicer 3: Branch */}
          <SlicerDropdown
            label="Branch"
            icon={BookOpen}
            options={availableOptions.branches}
            selectedValues={filterState.branches}
            onChange={(selected) =>
              onFilterChange({ ...filterState, branches: selected })
            }
          />

          {/* Slicer 4: Caste */}
          <SlicerDropdown
            label="Caste"
            icon={Tag}
            options={availableOptions.castes}
            selectedValues={filterState.castes}
            onChange={(selected) =>
              onFilterChange({ ...filterState, castes: selected })
            }
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EXPANDED TILE / BUTTON SLICERS VIEW (Power BI Matrix)  */}
      {/* ========================================================= */}
      {slicerViewMode === 'tiles' && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Row 1: District Slicer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-900" />
                District Slicer ({availableOptions.districts.length} Districts)
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filterState,
                      districts: availableOptions.districts.map((d) => d.name),
                    })
                  }
                  className="text-blue-900 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filterState, districts: [] })}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filterState, districts: [] })}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filterState.districts.length === 0
                    ? 'bg-blue-950 text-white shadow-2xs ring-1 ring-blue-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Districts
              </button>
              {availableOptions.districts.map((d) => {
                const isSelected = filterState.districts.includes(d.name);
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => {
                      const exists = filterState.districts.includes(d.name);
                      onFilterChange({
                        ...filterState,
                        districts: exists
                          ? filterState.districts.filter((item) => item !== d.name)
                          : [...filterState.districts, d.name],
                      });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-2xs ring-1 ring-blue-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{d.name}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                        isSelected ? 'bg-sky-800 text-sky-100' : 'bg-white text-slate-600'
                      }`}
                    >
                      {d.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Taluka Slicer */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-900" />
                Taluka Slicer ({availableOptions.talukas.length} Talukas)
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filterState,
                      talukas: availableOptions.talukas.map((t) => t.name),
                    })
                  }
                  className="text-blue-900 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filterState, talukas: [] })}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filterState, talukas: [] })}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filterState.talukas.length === 0
                    ? 'bg-blue-950 text-white shadow-2xs ring-1 ring-blue-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Talukas
              </button>
              {availableOptions.talukas.map((t) => {
                const isSelected = filterState.talukas.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      const exists = filterState.talukas.includes(t.name);
                      onFilterChange({
                        ...filterState,
                        talukas: exists
                          ? filterState.talukas.filter((item) => item !== t.name)
                          : [...filterState.talukas, t.name],
                      });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-2xs ring-1 ring-blue-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                        isSelected ? 'bg-sky-800 text-sky-100' : 'bg-white text-slate-600'
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Branch Slicer */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-900" />
                Branch Slicer ({availableOptions.branches.length} Programs)
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filterState,
                      branches: availableOptions.branches.map((b) => b.name),
                    })
                  }
                  className="text-blue-900 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filterState, branches: [] })}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filterState, branches: [] })}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filterState.branches.length === 0
                    ? 'bg-blue-950 text-white shadow-2xs ring-1 ring-blue-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Branches
              </button>
              {availableOptions.branches.map((b) => {
                const isSelected = filterState.branches.includes(b.name);
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => {
                      const exists = filterState.branches.includes(b.name);
                      onFilterChange({
                        ...filterState,
                        branches: exists
                          ? filterState.branches.filter((item) => item !== b.name)
                          : [...filterState.branches, b.name],
                      });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-2xs ring-1 ring-blue-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                        isSelected ? 'bg-sky-800 text-sky-100' : 'bg-white text-slate-600'
                      }`}
                    >
                      {b.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Caste Slicer */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-900" />
                Caste Slicer ({availableOptions.castes.length} Categories)
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filterState,
                      castes: availableOptions.castes.map((c) => c.name),
                    })
                  }
                  className="text-blue-900 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filterState, castes: [] })}
                  className="text-slate-500 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onFilterChange({ ...filterState, castes: [] })}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filterState.castes.length === 0
                    ? 'bg-blue-950 text-white shadow-2xs ring-1 ring-blue-950'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Castes
              </button>
              {availableOptions.castes.map((c) => {
                const isSelected = filterState.castes.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      const exists = filterState.castes.includes(c.name);
                      onFilterChange({
                        ...filterState,
                        castes: exists
                          ? filterState.castes.filter((item) => item !== c.name)
                          : [...filterState.castes, c.name],
                      });
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-900 text-white shadow-2xs ring-1 ring-blue-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-normal ${
                        isSelected ? 'bg-sky-800 text-sky-100' : 'bg-white text-slate-600'
                      }`}
                    >
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIVE FILTER CHIPS ROW                                   */}
      {/* ========================================================= */}
      {hasActiveFilters && (
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1 flex items-center gap-1">
            <CheckSquare className="w-3 h-3 text-blue-900" />
            Active Filters ({filteredCount} matched):
          </span>

          {filterState.districts.map((d) => (
            <span
              key={`dist-${d}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold"
            >
              Dist: {d}
              <button
                type="button"
                onClick={() => removeFilterItem('districts', d)}
                className="hover:text-sky-950 ml-0.5"
                title={`Remove ${d}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filterState.talukas.map((t) => (
            <span
              key={`tal-${t}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold"
            >
              Taluka: {t}
              <button
                type="button"
                onClick={() => removeFilterItem('talukas', t)}
                className="hover:text-sky-950 ml-0.5"
                title={`Remove ${t}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filterState.branches.map((b) => (
            <span
              key={`br-${b}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold"
            >
              Branch: {b}
              <button
                type="button"
                onClick={() => removeFilterItem('branches', b)}
                className="hover:text-blue-950 ml-0.5"
                title={`Remove ${b}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {filterState.castes.map((c) => (
            <span
              key={`caste-${c}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold"
            >
              Caste: {c}
              <button
                type="button"
                onClick={() => removeFilterItem('castes', c)}
                className="hover:text-slate-950 ml-0.5"
                title={`Remove ${c}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
