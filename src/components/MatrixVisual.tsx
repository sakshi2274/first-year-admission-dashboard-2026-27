import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Table as TableIcon, Download, Search, ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { StudentAdmission } from '../types';

interface MatrixVisualProps {
  students: StudentAdmission[];
  totalCohortCount: number;
}

interface TalukaGroup {
  taluka: string;
  district: string;
  totalStudents: number;
  branches: { branch: string; count: number }[];
}

export const MatrixVisual: React.FC<MatrixVisualProps> = ({ students, totalCohortCount }) => {
  const [expandedTalukas, setExpandedTalukas] = useState<Record<string, boolean>>({});
  const [matrixSearch, setMatrixSearch] = useState('');

  // Group students by Taluka, then by Branch
  const talukaGroups = useMemo(() => {
    const map = new Map<string, { district: string; branchMap: Map<string, number>; total: number }>();

    students.forEach((s) => {
      const taluka = s.taluka || 'Unknown Taluka';
      const branch = s.branch || 'Unknown Branch';
      const district = s.district || 'Unknown District';

      if (!map.has(taluka)) {
        map.set(taluka, {
          district,
          branchMap: new Map<string, number>(),
          total: 0,
        });
      }

      const entry = map.get(taluka)!;
      entry.total++;
      entry.branchMap.set(branch, (entry.branchMap.get(branch) || 0) + 1);
    });

    const groups: TalukaGroup[] = [];
    map.forEach((value, taluka) => {
      const branches = Array.from(value.branchMap.entries())
        .map(([branch, count]) => ({ branch, count }))
        .sort((a, b) => b.count - a.count);

      groups.push({
        taluka,
        district: value.district,
        totalStudents: value.total,
        branches,
      });
    });

    // Sort talukas descending by total student count
    return groups.sort((a, b) => b.totalStudents - a.totalStudents);
  }, [students]);

  // Filter groups by matrix search
  const filteredGroups = useMemo(() => {
    if (!matrixSearch.trim()) return talukaGroups;
    const query = matrixSearch.toLowerCase();
    return talukaGroups.filter((g) => {
      return (
        g.taluka.toLowerCase().includes(query) ||
        g.district.toLowerCase().includes(query) ||
        g.branches.some((b) => b.branch.toLowerCase().includes(query))
      );
    });
  }, [talukaGroups, matrixSearch]);

  const toggleTaluka = (taluka: string) => {
    setExpandedTalukas((prev) => ({
      ...prev,
      [taluka]: !prev[taluka],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    talukaGroups.forEach((g) => {
      next[g.taluka] = true;
    });
    setExpandedTalukas(next);
  };

  const collapseAll = () => {
    setExpandedTalukas({});
  };

  const totalFilteredStudents = students.length;

  // Export Matrix Data to CSV
  const handleExportCSV = () => {
    const rows: string[] = ['"Taluka","District","Branch","Count of Student","% of Taluka","% of Total"'];
    talukaGroups.forEach((g) => {
      // Subtotal row
      const talukaPercent = ((g.totalStudents / (totalFilteredStudents || 1)) * 100).toFixed(1);
      rows.push(`"${g.taluka}","${g.district}","[SUBTOTAL]","${g.totalStudents}","100.0%","${talukaPercent}%"`);
      g.branches.forEach((b) => {
        const branchTalukaPct = ((b.count / g.totalStudents) * 100).toFixed(1);
        const branchTotalPct = ((b.count / (totalFilteredStudents || 1)) * 100).toFixed(1);
        rows.push(`"${g.taluka}","${g.district}","${b.branch}","${b.count}","${branchTalukaPct}%","${branchTotalPct}%"`);
      });
    });
    rows.push(`"[GRAND TOTAL]","","","${totalFilteredStudents}","","100.0%"`);

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Matrix_Branch_Taluka_Details.csv';
    link.click();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shrink-0">
            <TableIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight uppercase">
              Branch-wise and Taluka-wise Details (Matrix Visual)
            </h3>
            <p className="text-xs text-slate-500">
              Hierarchical view: Taluka &gt; Branch breakdown with dynamic subtotals
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search taluka or branch..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-44 sm:w-52"
            />
          </div>

          {/* Expand/Collapse All */}
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
            title="Expand all talukas"
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
            title="Collapse all talukas"
          >
            <ChevronsDownUp className="w-3.5 h-3.5 text-slate-500" />
            Collapse All
          </button>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 border border-blue-200/60 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            title="Export Matrix as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 w-72">Taluka / Branch Hierarchy</th>
              <th className="py-3 px-4 w-32">District</th>
              <th className="py-3 px-4 text-right w-36">Count of Students</th>
              <th className="py-3 px-4 text-right w-32">% of Taluka</th>
              <th className="py-3 px-4 text-right w-32">% of Total Cohort</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No records match your search or active filters.
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => {
                const isExpanded = !!expandedTalukas[group.taluka];
                const talukaTotalPct = ((group.totalStudents / (totalFilteredStudents || 1)) * 100);

                return (
                  <React.Fragment key={group.taluka}>
                    {/* Primary Taluka Row / Subtotal Row Header */}
                    <tr
                      onClick={() => toggleTaluka(group.taluka)}
                      className="bg-slate-50/70 hover:bg-blue-50/60 cursor-pointer transition-colors font-semibold group"
                    >
                      <td className="py-3 px-4 text-slate-900 flex items-center gap-2">
                        <button
                          type="button"
                          className="w-5 h-5 rounded flex items-center justify-center bg-white border border-slate-200 text-slate-600 group-hover:border-blue-400 group-hover:text-blue-900 transition-colors shadow-2xs"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="text-blue-950 font-bold">{group.taluka}</span>
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          ({group.branches.length} branches)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-semibold">
                        {group.district}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-blue-950 tabular-nums">
                        {group.totalStudents}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 tabular-nums">
                        100.0%
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-sky-800 tabular-nums">
                        {talukaTotalPct.toFixed(1)}%
                      </td>
                    </tr>

                    {/* Sub-rows: Branches within this Taluka */}
                    {isExpanded &&
                      group.branches.map((b) => {
                        const branchTalukaPct = (b.count / group.totalStudents) * 100;
                        const branchTotalPct = (b.count / (totalFilteredStudents || 1)) * 100;

                        return (
                          <tr
                            key={`${group.taluka}-${b.branch}`}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-2.5 px-4 pl-12 text-slate-700 flex items-center gap-2 border-l-2 border-sky-400/80 ml-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block shrink-0" />
                              <span className="font-medium">{b.branch}</span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 text-xs font-medium">
                              {group.district}
                            </td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-800 tabular-nums">
                              {b.count}
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-600 tabular-nums">
                              {branchTalukaPct.toFixed(1)}%
                            </td>
                            <td className="py-2.5 px-4 text-right text-slate-500 tabular-nums">
                              {branchTotalPct.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}

                    {/* Explicit Subtotal Summary Row when expanded */}
                    {isExpanded && (
                      <tr className="bg-sky-50/40 text-[11px] font-semibold text-blue-900 border-b border-slate-200">
                        <td className="py-2 px-4 pl-12 italic text-slate-600">
                          ↳ Subtotal for {group.taluka}
                        </td>
                        <td className="py-2 px-4 text-slate-400"></td>
                        <td className="py-2 px-4 text-right font-extrabold text-blue-900 tabular-nums">
                          {group.totalStudents} students
                        </td>
                        <td className="py-2 px-4 text-right text-blue-800 tabular-nums">
                          100.0%
                        </td>
                        <td className="py-2 px-4 text-right text-blue-800 tabular-nums">
                          {talukaTotalPct.toFixed(1)}%
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>

          {/* Grand Total Footer */}
          <tfoot>
            <tr className="bg-blue-950 text-white font-bold text-xs border-t-2 border-blue-900">
              <td className="py-3 px-4 uppercase tracking-wider flex items-center gap-2">
                <span>Grand Total</span>
                <span className="text-[10px] font-normal text-sky-200">
                  (All Selected Talukas & Branches)
                </span>
              </td>
              <td className="py-3 px-4 text-sky-200 font-normal">
                {new Set(students.map((s) => s.district)).size} Districts
              </td>
              <td className="py-3 px-4 text-right text-sm font-extrabold text-white tabular-nums">
                {totalFilteredStudents}
              </td>
              <td className="py-3 px-4 text-right text-sky-200 tabular-nums">
                —
              </td>
              <td className="py-3 px-4 text-right font-bold text-sky-200 tabular-nums">
                100.0%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Bottom informational note */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span>
          Click on any Taluka row to expand/collapse individual branch student counts.
        </span>
        <span className="tabular-nums font-medium text-slate-600">
          Showing {filteredGroups.length} talukas, {totalFilteredStudents} total students
        </span>
      </div>
    </div>
  );
};
