import React from 'react';
import { X, CheckCircle, AlertTriangle, Sparkles, Download, Layers, ShieldCheck } from 'lucide-react';
import { DataCleaningReport, StudentAdmission } from '../types';
import { exportToExcel } from '../utils/excelParser';

interface DataCleaningModalProps {
  report: DataCleaningReport | null;
  isOpen: boolean;
  onClose: () => void;
  students: StudentAdmission[];
}

export const DataCleaningModal: React.FC<DataCleaningModalProps> = ({
  report,
  isOpen,
  onClose,
  students,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Power Query & Data Cleaning Audit
              </h2>
              <p className="text-xs text-slate-500">
                Automated audit of header promotion, whitespace trimming, and spelling consistency
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Header Row
              </span>
              <span className="text-xl font-bold text-blue-950 mt-1 block tabular-nums">
                Row #{report.headerRowIndex}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3" /> Promoted successfully
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Clean Records
              </span>
              <span className="text-xl font-bold text-blue-950 mt-1 block tabular-nums">
                {report.totalCleanRows} / {report.totalRawRows}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {report.blankRowsRemoved + report.blankNamesRemoved} empty skipped
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Spaces Trimmed
              </span>
              <span className="text-xl font-bold text-blue-950 mt-1 block tabular-nums">
                {report.trimmedFieldsCount}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3" /> Extra spaces stripped
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Duplicates Flagged
              </span>
              <span className="text-xl font-bold text-blue-950 mt-1 block tabular-nums">
                {report.duplicateRecordsCount}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Original data preserved
              </span>
            </div>
          </div>

          {/* Column Mapping Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-900" />
              <span>Verified Column Promotion & Mapping</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Sr.No.</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {report.mappedColumns.srNo}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Name of Student</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {report.mappedColumns.studentName}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Branch</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {report.mappedColumns.branch}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Caste</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {report.mappedColumns.caste}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Village</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {report.mappedColumns.village}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Taluka</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {report.mappedColumns.taluka}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">District</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {report.mappedColumns.district}
                </span>
              </div>
              <div className="bg-sky-50 p-2 rounded-lg border border-sky-200 flex items-center justify-center">
                <span className="text-sky-900 font-semibold text-center text-[10px]">
                  All 7 Required Schema Columns Verified
                </span>
              </div>
            </div>
          </div>

          {/* Spelling Consistency Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Spelling & Case Consistency Inspection</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Requirement 8: No automatic merging without verification
              </span>
            </div>

            {report.inconsistencies.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  No case or spelling anomalies detected. All District, Taluka, Branch, and Caste values are consistent.
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Column</th>
                      <th className="py-2 px-3">Encountered Value</th>
                      <th className="py-2 px-3">Dominant Standard Value</th>
                      <th className="py-2 px-3 text-right">Occurrences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.inconsistencies.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.column}</td>
                        <td className="py-2 px-3 text-amber-700 font-mono text-[11px] bg-amber-50/50">{item.value}</td>
                        <td className="py-2 px-3 text-emerald-700 font-semibold">{item.suggested}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Source Workbook: <strong className="text-slate-800">{report.fileName}</strong> ({report.sheetName})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(students, 'Cleaned_Admissions_2026-27.xlsx')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Cleaned Excel (.xlsx)
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
