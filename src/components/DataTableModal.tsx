import React, { useState, useMemo } from 'react';
import { X, Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { StudentAdmission, getRegionFromDistrict } from '../types';
import { exportToExcel, exportToCSV } from '../utils/excelParser';

interface DataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentAdmission[];
}

export const DataTableModal: React.FC<DataTableModalProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof StudentAdmission>('srNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleSort = (field: keyof StudentAdmission) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredStudents = useMemo(() => {
    let result = [...students];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          String(s.studentName).toLowerCase().includes(q) ||
          String(s.branch).toLowerCase().includes(q) ||
          String(s.caste).toLowerCase().includes(q) ||
          String(s.village).toLowerCase().includes(q) ||
          String(s.taluka).toLowerCase().includes(q) ||
          String(s.district).toLowerCase().includes(q) ||
          String(s.region || getRegionFromDistrict(s.district)).toLowerCase().includes(q) ||
          String(s.srNo).toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [students, search, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Admission Student Roster (Data View)
              </h2>
              <p className="text-xs text-slate-500">
                Tabular view of all {students.length} student records for First Year Admission 2026–27
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, branch, caste, taluka, district..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(students, 'Admission_Roster_2026-27.xlsx')}
              className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel (.xlsx)
            </button>
            <button
              onClick={() => exportToCSV(students, 'Admission_Roster_2026-27.csv')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider shadow-2xs z-10">
              <tr>
                <th
                  onClick={() => handleSort('srNo')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors w-16"
                >
                  <div className="flex items-center gap-1">
                    <span>Sr.No.</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('studentName')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Name of Student</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('branch')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Branch</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('caste')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors w-24"
                >
                  <div className="flex items-center gap-1">
                    <span>Caste</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('village')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Village</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('taluka')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Taluka</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('district')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>District</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('region')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/70 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Region</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No student records found matching "{search}"
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono text-slate-400 tabular-nums">
                      {student.srNo}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">
                      {student.studentName}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-blue-900">
                      {student.branch}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {student.caste}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-600">
                      {student.village}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-sky-800">
                      {student.taluka}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-700 font-medium">
                      {student.district}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-indigo-900 text-[11px]">
                      {student.region || getRegionFromDistrict(student.district)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500 tabular-nums">
            Showing <strong className="text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> of{' '}
            <strong className="text-slate-800">{filteredStudents.length}</strong> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-600 font-medium px-2 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
