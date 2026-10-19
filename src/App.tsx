/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Building2,
  MapPin,
  BookOpen,
  Download,
  Tag,
} from 'lucide-react';
import { StudentAdmission, FilterState, getRegionFromDistrict } from './types';
import { sampleAdmissionsData } from './data/sampleAdmissions';
import { KPICard } from './components/KPICard';
import { BranchBarChart } from './components/BranchBarChart';
import { TalukaBarChart } from './components/TalukaBarChart';
import { DistrictBarChart } from './components/DistrictBarChart';
import { CastePieChart } from './components/CastePieChart';
import { MatrixVisual } from './components/MatrixVisual';
import { SlicersPanel } from './components/SlicersPanel';
import { exportToExcel } from './utils/excelParser';

export default function App() {
  // Main Admission Dataset (258 student records from Adarsh Institute of Technology & Research Centre, Vita)
  const [admissions] = useState<StudentAdmission[]>(sampleAdmissionsData);
  const [classificationMode] = useState<'administrative' | 'homeDistrict' | 'university'>('administrative');

  // Slicer Filters
  const [filterState, setFilterState] = useState<FilterState>({
    regions: [],
    districts: [],
    talukas: [],
    branches: [],
    castes: [],
    searchQuery: '',
  });

  // Dynamic Filter Calculation
  const filteredStudents = useMemo(() => {
    return admissions.filter((student) => {
      // Region Slicer
      const studentRegion = getRegionFromDistrict(student.district, classificationMode);
      if (
        filterState.regions.length > 0 &&
        !filterState.regions.includes(studentRegion)
      ) {
        return false;
      }

      // District Slicer
      if (
        filterState.districts.length > 0 &&
        !filterState.districts.includes(student.district)
      ) {
        return false;
      }

      // Taluka Slicer
      if (
        filterState.talukas.length > 0 &&
        !filterState.talukas.includes(student.taluka)
      ) {
        return false;
      }

      // Branch Slicer
      if (
        filterState.branches.length > 0 &&
        !filterState.branches.includes(student.branch)
      ) {
        return false;
      }

      // Caste Slicer
      if (
        filterState.castes.length > 0 &&
        !filterState.castes.includes(student.caste)
      ) {
        return false;
      }

      // Free Search Query
      if (filterState.searchQuery.trim()) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesName = student.studentName.toLowerCase().includes(query);
        const matchesVillage = student.village.toLowerCase().includes(query);
        if (!matchesName && !matchesVillage) {
          return false;
        }
      }

      return true;
    });
  }, [admissions, filterState, classificationMode]);

  // Dynamic Calculation of Slicer Available Options
  const availableOptions = useMemo(() => {
    const regionCounts = new Map<string, number>();
    const distCounts = new Map<string, number>();
    const talukaCounts = new Map<string, number>();
    const branchCounts = new Map<string, number>();
    const casteCounts = new Map<string, number>();

    admissions.forEach((s) => {
      const reg = getRegionFromDistrict(s.district, classificationMode);
      if (reg) regionCounts.set(reg, (regionCounts.get(reg) || 0) + 1);
      if (s.district) distCounts.set(s.district, (distCounts.get(s.district) || 0) + 1);
      if (s.taluka) talukaCounts.set(s.taluka, (talukaCounts.get(s.taluka) || 0) + 1);
      if (s.branch) branchCounts.set(s.branch, (branchCounts.get(s.branch) || 0) + 1);
      if (s.caste) casteCounts.set(s.caste, (casteCounts.get(s.caste) || 0) + 1);
    });

    return {
      regions: Array.from(regionCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      districts: Array.from(distCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      talukas: Array.from(talukaCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      branches: Array.from(branchCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      castes: Array.from(casteCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [admissions, classificationMode]);

  // Dynamic KPI Card Values (Requirement 1: calculated dynamically from data)
  const totalStudentsKPI = filteredStudents.length;
  const totalBranchesKPI = useMemo(
    () => new Set(filteredStudents.map((s) => s.branch)).size,
    [filteredStudents]
  );
  const totalTalukasKPI = useMemo(
    () => new Set(filteredStudents.map((s) => s.taluka)).size,
    [filteredStudents]
  );
  const totalDistrictsKPI = useMemo(
    () => new Set(filteredStudents.map((s) => s.district)).size,
    [filteredStudents]
  );
  const totalRegionsKPI = useMemo(
    () => new Set(filteredStudents.map((s) => getRegionFromDistrict(s.district, classificationMode))).size,
    [filteredStudents, classificationMode]
  );
  const totalCastesKPI = useMemo(
    () => new Set(filteredStudents.map((s) => s.caste)).size,
    [filteredStudents]
  );

  const isFiltered = filteredStudents.length !== admissions.length;

  // Branch Bar Chart Data (Requirement 2: Horizontal, sorted descending)
  const branchChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredStudents.forEach((s) => {
      const b = s.branch || 'Unassigned';
      map.set(b, (map.get(b) || 0) + 1);
    });

    const total = filteredStudents.length || 1;
    return Array.from(map.entries())
      .map(([branch, count]) => ({
        branch,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStudents]);

  // Caste Pie Chart Data (User requirement: Pie chart according to caste in provided file)
  const casteChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredStudents.forEach((s) => {
      const c = s.caste || 'Unassigned';
      map.set(c, (map.get(c) || 0) + 1);
    });

    const total = filteredStudents.length || 1;
    return Array.from(map.entries())
      .map(([caste, count]) => ({
        caste,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStudents]);

  // Taluka Bar Chart Data (Requirement 3: Horizontal, sorted descending)
  const talukaChartData = useMemo(() => {
    const map = new Map<string, { count: number; district: string }>();
    filteredStudents.forEach((s) => {
      const t = s.taluka || 'Unassigned';
      if (!map.has(t)) {
        map.set(t, { count: 0, district: s.district || '' });
      }
      map.get(t)!.count++;
    });

    const total = filteredStudents.length || 1;
    return Array.from(map.entries())
      .map(([taluka, info]) => ({
        taluka,
        count: info.count,
        percentage: (info.count / total) * 100,
        district: info.district,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStudents]);

  // District Bar Chart Data (Requirement 4 & User requirement: Clear name of district)
  const districtChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredStudents.forEach((s) => {
      const d = s.district || 'Unassigned';
      map.set(d, (map.get(d) || 0) + 1);
    });

    const total = filteredStudents.length || 1;
    return Array.from(map.entries())
      .map(([district, count]) => ({
        district,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStudents]);

  // Region Pie/Bar Chart Data (User requirement: Region-wise according to provided file)
  const regionChartData = useMemo(() => {
    const map = new Map<string, { count: number; districts: Set<string> }>();
    filteredStudents.forEach((s) => {
      const r = getRegionFromDistrict(s.district, classificationMode) || 'Unassigned';
      if (!map.has(r)) {
        map.set(r, { count: 0, districts: new Set() });
      }
      const entry = map.get(r)!;
      entry.count++;
      if (s.district) entry.districts.add(s.district);
    });

    const total = filteredStudents.length || 1;
    return Array.from(map.entries())
      .map(([region, info]) => ({
        region,
        count: info.count,
        percentage: (info.count / total) * 100,
        districts: Array.from(info.districts),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredStudents, classificationMode]);

  // Cross-filtering Handlers from visual clicks
  const handleToggleBranch = (branch: string) => {
    setFilterState((prev) => {
      const exists = prev.branches.includes(branch);
      return {
        ...prev,
        branches: exists ? prev.branches.filter((b) => b !== branch) : [...prev.branches, branch],
      };
    });
  };

  const handleToggleCaste = (caste: string) => {
    setFilterState((prev) => {
      const exists = prev.castes.includes(caste);
      return {
        ...prev,
        castes: exists ? prev.castes.filter((c) => c !== caste) : [...prev.castes, caste],
      };
    });
  };

  const handleToggleTaluka = (taluka: string) => {
    setFilterState((prev) => {
      const exists = prev.talukas.includes(taluka);
      return {
        ...prev,
        talukas: exists ? prev.talukas.filter((t) => t !== taluka) : [...prev.talukas, taluka],
      };
    });
  };

  const handleToggleDistrict = (district: string) => {
    setFilterState((prev) => {
      const exists = prev.districts.includes(district);
      return {
        ...prev,
        districts: exists ? prev.districts.filter((d) => d !== district) : [...prev.districts, district],
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-3 sm:p-5">
      <div className="max-w-[1520px] mx-auto space-y-4 sm:space-y-5">
        
        {/* ========================================================= */}
        {/* TOP BAR / FIRST YEAR ADMISSION DASHBOARD 2026-27 HEADER */}
        {/* ========================================================= */}
        <header className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Centered Brand & Dashboard Title Ribbon */}
          <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-sky-800 px-6 sm:px-10 py-6 sm:py-8 text-white text-center flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded bg-sky-400 text-blue-950 font-extrabold text-[11px] sm:text-xs tracking-wider uppercase shadow-2xs">
                Adarsh Institute of Technology &amp; Research Centre, Vita
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm text-center">
              FIRST YEAR ADMISSION DASHBOARD 2026-27
            </h1>
          </div>
        </header>

        {/* ========================================================= */}
        {/* INTERACTIVE SLICERS PANEL */}
        {/* ========================================================= */}
        <section aria-label="Interactive Slicers">
          <SlicersPanel
            filterState={filterState}
            onFilterChange={setFilterState}
            availableOptions={availableOptions}
            totalCount={admissions.length}
            filteredCount={filteredStudents.length}
          />
        </section>

        {/* ========================================================= */}
        {/* 1. KPI CARDS (Requirement 1: Top of dashboard) */}
        {/* ========================================================= */}
        <section aria-label="KPI Metrics">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* KPI 1: Total Students */}
            <KPICard
              title="Total Students"
              value={totalStudentsKPI}
              subtitle={
                isFiltered
                  ? `${((totalStudentsKPI / (admissions.length || 1)) * 100).toFixed(1)}% of total cohort`
                  : 'Total confirmed admissions'
              }
              badge={isFiltered ? 'Filtered' : 'Full Cohort'}
              icon={Users}
              isFiltered={isFiltered}
            />

            {/* KPI 2: Total Branches */}
            <KPICard
              title="Total Branches"
              value={totalBranchesKPI}
              subtitle={
                branchChartData[0]
                  ? `Top: ${branchChartData[0].branch} (${branchChartData[0].count})`
                  : 'Engineering programs'
              }
              badge="Programs"
              icon={BookOpen}
              isFiltered={isFiltered}
            />

            {/* KPI 3: Total Talukas */}
            <KPICard
              title="Total Talukas"
              value={totalTalukasKPI}
              subtitle={
                talukaChartData[0]
                  ? `Top: ${talukaChartData[0].taluka} (${talukaChartData[0].count})`
                  : 'Administrative blocks'
              }
              badge="Talukas"
              icon={MapPin}
              isFiltered={isFiltered}
            />

            {/* KPI 4: Total Districts */}
            <KPICard
              title="Total Districts"
              value={totalDistrictsKPI}
              subtitle={
                districtChartData[0]
                  ? `Top: ${districtChartData[0].district} (${districtChartData[0].count})`
                  : 'Origin districts'
              }
              badge="Districts"
              icon={Building2}
              isFiltered={isFiltered}
            />

            {/* KPI 5: Total Castes / Categories */}
            <KPICard
              title="Total Castes"
              value={totalCastesKPI}
              subtitle={
                casteChartData[0]
                  ? `Top: ${casteChartData[0].caste} (${casteChartData[0].count})`
                  : 'Categories'
              }
              badge="Categories"
              icon={Tag}
              isFiltered={isFiltered}
            />
          </div>
        </section>

        {/* ========================================================= */}
        {/* CHARTS SECTION (Middle of dashboard) */}
        {/* ========================================================= */}
        <section aria-label="Visual Analytics" className="space-y-4 sm:space-y-5">
          {/* Row 1: Academic & Demographic Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* 1. Branch-wise Student Count (Horizontal Bar Chart) */}
            <div className="lg:col-span-6 min-h-[390px]">
              <BranchBarChart
                data={branchChartData}
                totalStudents={filteredStudents.length}
                selectedBranches={filterState.branches}
                onToggleBranch={handleToggleBranch}
              />
            </div>

            {/* 2. Caste-wise Student Distribution (PIE CHART according to uploaded file) */}
            <div className="lg:col-span-6 min-h-[390px]">
              <CastePieChart
                data={casteChartData}
                totalStudents={filteredStudents.length}
                selectedCastes={filterState.castes}
                onToggleCaste={handleToggleCaste}
              />
            </div>
          </div>

          {/* Row 2: Geographic Breakdown (Districts & Talukas) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
            {/* 3. District-wise Student Distribution (Bar/Column Chart with clear names) */}
            <div className="lg:col-span-6 min-h-[390px]">
              <DistrictBarChart
                data={districtChartData}
                totalStudents={filteredStudents.length}
                selectedDistricts={filterState.districts}
                onToggleDistrict={handleToggleDistrict}
              />
            </div>

            {/* 4. Taluka-wise Student Count (Horizontal Bar Chart) */}
            <div className="lg:col-span-6 min-h-[390px]">
              <TalukaBarChart
                data={talukaChartData}
                totalStudents={filteredStudents.length}
                selectedTalukas={filterState.talukas}
                onToggleTaluka={handleToggleTaluka}
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. MATRIX VISUAL (Requirement 5: Bottom of dashboard) */}
        {/* ========================================================= */}
        <section aria-label="Branch and Taluka Details Matrix">
          <MatrixVisual
            students={filteredStudents}
            totalCohortCount={admissions.length}
          />
        </section>

        {/* ========================================================= */}
        {/* DASHBOARD FOOTER */}
        {/* ========================================================= */}
        <footer className="pt-4 pb-8 border-t border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700">FIRST YEAR ADMISSION DASHBOARD 2026-27</span>
            <span className="text-slate-400 ml-2">· Adarsh Institute of Technology &amp; Research Centre, Vita</span>
          </div>
          <div>
            <button
              type="button"
              onClick={() => exportToExcel(filteredStudents, 'First_Year_Admission_2026-27_Export.xlsx')}
              className="text-blue-900 hover:text-blue-950 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Filtered Data (.xlsx)
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
