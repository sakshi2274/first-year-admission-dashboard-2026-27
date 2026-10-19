export interface StudentAdmission {
  srNo: number | string;
  studentName: string;
  branch: string;
  caste: string;
  village: string;
  taluka: string;
  district: string;
  [key: string]: any;
}

export interface FilterState {
  districts: string[];
  talukas: string[];
  branches: string[];
  castes: string[];
  searchQuery: string;
}

export interface DataCleaningReport {
  fileName: string;
  sheetName: string;
  totalRawRows: number;
  totalCleanRows: number;
  headerRowIndex: number;
  blankRowsRemoved: number;
  blankNamesRemoved: number;
  duplicateRecordsCount: number;
  trimmedFieldsCount: number;
  detectedColumns: string[];
  mappedColumns: {
    srNo: string;
    studentName: string;
    branch: string;
    caste: string;
    village: string;
    taluka: string;
    district: string;
  };
  inconsistencies: {
    column: string;
    value: string;
    suggested: string;
    count: number;
  }[];
}

export interface MatrixRow {
  taluka: string;
  isSubtotal?: boolean;
  isGrandTotal?: boolean;
  branch?: string;
  studentCount: number;
  percentage: number;
}


export function getRegionFromDistrict(district: string): string {
  const regions: Record<string, string> = {
    Pune: 'Pune',
    Sangli: 'Pune',
    Satara: 'Pune',
    Kolhapur: 'Pune',
    Solapur: 'Pune',
    Mumbai: 'Konkan',
    Thane: 'Konkan',
    Nashik: 'Nashik',
    Nagpur: 'Nagpur',
    Amravati: 'Amravati',
  };

  const key = district.trim().toLowerCase();

  const match = Object.entries(regions).find(
    ([name]) => name.toLowerCase() === key
  );

  return match ? match[1] : 'Other';
}

