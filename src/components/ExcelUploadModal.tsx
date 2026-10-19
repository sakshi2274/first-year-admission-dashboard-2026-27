import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { parseExcelFile, exportToExcel } from '../utils/excelParser';
import { StudentAdmission, DataCleaningReport } from '../types';
import { sampleAdmissionsData } from '../data/sampleAdmissions';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (students: StudentAdmission[], report: DataCleaningReport) => void;
  onRestoreSampleData: () => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onRestoreSampleData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer, file.name, 0);

      if (result.students.length === 0) {
        throw new Error('No valid student admission records were found in the selected sheet.');
      }

      onDataLoaded(result.students, result.report);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to read Excel file. Please ensure it is a valid .xlsx or .xls file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDownloadSample = () => {
    exportToExcel(sampleAdmissionsData, 'Adarsh_ITRC_Vita_First_Year_Admissions_2026-27.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upload Admission Excel Dataset
              </h2>
              <p className="text-xs text-slate-500">
                Upload your .xlsx, .xls, or .csv file for First Year Admission 2026–27
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
        <div className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Unable to process file</span>
                <p className="text-[11px] text-rose-700">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-blue-900 bg-blue-50/70 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-800 hover:bg-slate-50/80 bg-slate-50/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-900 shadow-2xs">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isLoading ? 'Processing and cleaning dataset...' : 'Click or drag Excel file here'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports Excel (.xlsx, .xls) and CSV files
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium text-xs shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-blue-900" />
              Browse Computer
            </div>
          </div>

          {/* Required columns specification */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-700 text-xs block">
              Required Excel Columns:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Sr.No.',
                'Name of Student',
                'Branch',
                'Caste',
                'Village',
                'Taluka',
                'District',
              ].map((col) => (
                <span
                  key={col}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono text-blue-950 font-medium"
                >
                  {col}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              * Headers are promoted automatically. Title rows and blank rows will be cleaned safely.
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel Template (.xlsx)
            </button>

            <button
              type="button"
              onClick={() => {
                onRestoreSampleData();
                onClose();
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Reset to 2026–27 Demo Cohort
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
