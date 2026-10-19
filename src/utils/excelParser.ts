import * as XLSX from 'xlsx';
import { StudentAdmission, DataCleaningReport } from '../types';

// Helper to normalize string for column comparison
function normalizeHeader(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseExcelFile(
  fileData: ArrayBuffer,
  fileName: string,
  selectedSheetIndex: number = 0
): {
  students: StudentAdmission[];
  rawRows: any[][];
  report: DataCleaningReport;
  sheetNames: string[];
} {
  const workbook = XLSX.read(fileData, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const currentSheetName = sheetNames[selectedSheetIndex] || sheetNames[0];
  const worksheet = workbook.Sheets[currentSheetName];

  // Convert worksheet to 2D array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('The uploaded Excel sheet contains no data.');
  }

  // Find the header row by searching for signature keywords
  let headerRowIndex = 0;
  let bestMatchScore = -1;
  let bestColIndices = {
    srNo: -1,
    studentName: -1,
    branch: -1,
    caste: -1,
    village: -1,
    taluka: -1,
    district: -1,
  };

  // Inspect the first 25 rows to identify the actual header row
  const maxSearchRows = Math.min(rawRows.length, 25);
  for (let r = 0; r < maxSearchRows; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    let score = 0;
    const tempIndices = {
      srNo: -1,
      studentName: -1,
      branch: -1,
      caste: -1,
      village: -1,
      taluka: -1,
      district: -1,
    };

    row.forEach((cell, colIdx) => {
      const cellText = String(cell || '').trim();
      const norm = normalizeHeader(cellText);

      if (['srno', 'sr', 'serialno', 'sno', 'no'].includes(norm)) {
        tempIndices.srNo = colIdx;
        score += 2;
      } else if (
        ['nameofstudent', 'studentname', 'student', 'name', 'candidatename'].some((k) =>
          norm.includes(k)
        )
      ) {
        tempIndices.studentName = colIdx;
        score += 4;
      } else if (['branch', 'course', 'discipline', 'department'].some((k) => norm.includes(k))) {
        tempIndices.branch = colIdx;
        score += 3;
      } else if (['caste', 'category', 'socialcategory'].some((k) => norm.includes(k))) {
        tempIndices.caste = colIdx;
        score += 3;
      } else if (['village', 'city', 'town', 'nativeplace'].some((k) => norm.includes(k))) {
        tempIndices.village = colIdx;
        score += 2;
      } else if (['taluka', 'tehsil', 'block'].some((k) => norm.includes(k))) {
        tempIndices.taluka = colIdx;
        score += 3;
      } else if (['district', 'dist', 'zilla'].some((k) => norm.includes(k))) {
        tempIndices.district = colIdx;
        score += 3;
      }
    });

    if (score > bestMatchScore) {
      bestMatchScore = score;
      headerRowIndex = r;
      bestColIndices = { ...tempIndices };
    }
  }

  // If match score is too low or columns missing, fall back to index matching if row has >= 7 columns
  const headerRow = rawRows[headerRowIndex] || [];
  const detectedColumns: string[] = headerRow.map((col: any) => String(col || '').trim());

  // Fill in any unmapped columns by best positional guess if not explicitly matched
  if (bestColIndices.srNo === -1 && detectedColumns.length > 0) bestColIndices.srNo = 0;
  if (bestColIndices.studentName === -1 && detectedColumns.length > 1) bestColIndices.studentName = 1;
  if (bestColIndices.branch === -1 && detectedColumns.length > 2) bestColIndices.branch = 2;
  if (bestColIndices.caste === -1 && detectedColumns.length > 3) bestColIndices.caste = 3;
  if (bestColIndices.village === -1 && detectedColumns.length > 4) bestColIndices.village = 4;
  if (bestColIndices.taluka === -1 && detectedColumns.length > 5) bestColIndices.taluka = 5;
  if (bestColIndices.district === -1 && detectedColumns.length > 6) bestColIndices.district = 6;

  // Process data rows
  const students: StudentAdmission[] = [];
  let blankRowsRemoved = 0;
  let blankNamesRemoved = 0;
  let trimmedFieldsCount = 0;
  const nameOccurrences = new Map<string, number>();

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) {
      blankRowsRemoved++;
      continue;
    }

    // Check if entire row is empty or summary
    const nonBlankCount = row.filter((c) => String(c ?? '').trim() !== '').length;
    if (nonBlankCount === 0) {
      blankRowsRemoved++;
      continue;
    }

    const rawName = String(row[bestColIndices.studentName] ?? '');
    const studentName = rawName.trim();

    // Check if row is a total/summary row (e.g. "Total Students: 120")
    if (studentName.toLowerCase().startsWith('total') || studentName.toLowerCase().startsWith('grand total')) {
      continue;
    }

    if (!studentName) {
      blankNamesRemoved++;
      continue;
    }

    if (rawName !== studentName) {
      trimmedFieldsCount++;
    }

    const rawSrNo = row[bestColIndices.srNo];
    const rawBranch = String(row[bestColIndices.branch] ?? '');
    const rawCaste = String(row[bestColIndices.caste] ?? '');
    const rawVillage = String(row[bestColIndices.village] ?? '');
    const rawTaluka = String(row[bestColIndices.taluka] ?? '');
    const rawDistrict = String(row[bestColIndices.district] ?? '');

    const branch = rawBranch.trim() || 'Unspecified Branch';
    const caste = rawCaste.trim() || 'OPEN';
    const village = rawVillage.trim() || 'Unspecified Village';
    const taluka = rawTaluka.trim() || 'Unspecified Taluka';
    const district = rawDistrict.trim() || 'Unspecified District';

    if (rawBranch !== branch) trimmedFieldsCount++;
    if (rawCaste !== caste) trimmedFieldsCount++;
    if (rawVillage !== village) trimmedFieldsCount++;
    if (rawTaluka !== taluka) trimmedFieldsCount++;
    if (rawDistrict !== district) trimmedFieldsCount++;

    const srNo = rawSrNo !== undefined && String(rawSrNo).trim() !== '' 
      ? rawSrNo 
      : students.length + 1;

    students.push({
      srNo,
      studentName,
      branch,
      caste,
      village,
      taluka,
      district,
    });

    const lowerName = studentName.toLowerCase();
    nameOccurrences.set(lowerName, (nameOccurrences.get(lowerName) || 0) + 1);
  }

  // Count duplicate names
  let duplicateRecordsCount = 0;
  nameOccurrences.forEach((count) => {
    if (count > 1) {
      duplicateRecordsCount += count - 1;
    }
  });

  // Analyze spelling inconsistencies across key categories
  const inconsistencies: { column: string; value: string; suggested: string; count: number }[] = [];

  const checkColumnConsistency = (colName: string, values: string[]) => {
    const valCounts = new Map<string, number>();
    values.forEach((v) => valCounts.set(v, (valCounts.get(v) || 0) + 1));

    // Group by lowercase
    const lowerMap = new Map<string, { original: string; count: number }[]>();
    valCounts.forEach((count, original) => {
      const lower = original.toLowerCase();
      if (!lowerMap.has(lower)) {
        lowerMap.set(lower, []);
      }
      lowerMap.get(lower)!.push({ original, count });
    });

    lowerMap.forEach((variants) => {
      if (variants.length > 1) {
        // Sort by frequency, highest first
        variants.sort((a, b) => b.count - a.count);
        const dominant = variants[0].original;
        for (let i = 1; i < variants.length; i++) {
          inconsistencies.push({
            column: colName,
            value: variants[i].original,
            suggested: dominant,
            count: variants[i].count,
          });
        }
      }
    });
  };

  checkColumnConsistency('District', students.map((s) => s.district));
  checkColumnConsistency('Taluka', students.map((s) => s.taluka));
  checkColumnConsistency('Branch', students.map((s) => s.branch));
  checkColumnConsistency('Caste', students.map((s) => s.caste));

  const report: DataCleaningReport = {
    fileName,
    sheetName: currentSheetName,
    totalRawRows: rawRows.length,
    totalCleanRows: students.length,
    headerRowIndex: headerRowIndex + 1, // 1-indexed for display
    blankRowsRemoved,
    blankNamesRemoved,
    duplicateRecordsCount,
    trimmedFieldsCount,
    detectedColumns,
    mappedColumns: {
      srNo: detectedColumns[bestColIndices.srNo] || 'Column ' + (bestColIndices.srNo + 1),
      studentName: detectedColumns[bestColIndices.studentName] || 'Column ' + (bestColIndices.studentName + 1),
      branch: detectedColumns[bestColIndices.branch] || 'Column ' + (bestColIndices.branch + 1),
      caste: detectedColumns[bestColIndices.caste] || 'Column ' + (bestColIndices.caste + 1),
      village: detectedColumns[bestColIndices.village] || 'Column ' + (bestColIndices.village + 1),
      taluka: detectedColumns[bestColIndices.taluka] || 'Column ' + (bestColIndices.taluka + 1),
      district: detectedColumns[bestColIndices.district] || 'Column ' + (bestColIndices.district + 1),
    },
    inconsistencies,
  };

  return {
    students,
    rawRows,
    report,
    sheetNames,
  };
}

// Function to export dataset as clean Excel file (.xlsx)
export function exportToExcel(
  students: StudentAdmission[],
  fileName: string = 'First_Year_Admission_2026-27_Cleaned.xlsx'
) {
  const exportData = students.map((s, idx) => ({
    'Sr.No.': s.srNo || idx + 1,
    'Name of Student': s.studentName,
    'Branch': s.branch,
    'Caste': s.caste,
    'Village': s.village,
    'Taluka': s.taluka,
    'District': s.district,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Admissions 2026-27');

  // Format header row widths
  worksheet['!cols'] = [
    { wch: 8 },  // Sr.No.
    { wch: 28 }, // Name of Student
    { wch: 32 }, // Branch
    { wch: 12 }, // Caste
    { wch: 20 }, // Village
    { wch: 18 }, // Taluka
    { wch: 18 }, // District
  ];

  XLSX.writeFile(workbook, fileName);
}

// Function to export as CSV
export function exportToCSV(students: StudentAdmission[], fileName: string = 'Admissions_2026-27.csv') {
  const headers = ['Sr.No.', 'Name of Student', 'Branch', 'Caste', 'Village', 'Taluka', 'District'];
  const rows = students.map((s, idx) => [
    s.srNo || idx + 1,
    `"${(s.studentName || '').replace(/"/g, '""')}"`,
    `"${(s.branch || '').replace(/"/g, '""')}"`,
    `"${(s.caste || '').replace(/"/g, '""')}"`,
    `"${(s.village || '').replace(/"/g, '""')}"`,
    `"${(s.taluka || '').replace(/"/g, '""')}"`,
    `"${(s.district || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
