import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, Download, ExternalLink, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

interface PowerBIGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PowerBIGuideModal: React.FC<PowerBIGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'dax' | 'theme'>('steps');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const daxFormulas = [
    {
      name: 'Total Students',
      purpose: 'Counts the total student records dynamically in the current filtered context.',
      code: `Total Students = COUNTROWS('Admissions')`,
    },
    {
      name: 'Total Branches',
      purpose: 'Calculates the number of distinct engineering branches.',
      code: `Total Branches = DISTINCTCOUNT('Admissions'[Branch])`,
    },
    {
      name: 'Total Talukas',
      purpose: 'Calculates the number of distinct administrative talukas represented.',
      code: `Total Talukas = DISTINCTCOUNT('Admissions'[Taluka])`,
    },
    {
      name: 'Total Districts',
      purpose: 'Calculates the number of distinct districts represented in admissions.',
      code: `Total Districts = DISTINCTCOUNT('Admissions'[District])`,
    },
    {
      name: 'Total Regions',
      purpose: 'Calculates the number of distinct geographic zones represented.',
      code: `Total Regions = DISTINCTCOUNT('Admissions'[Region])`,
    },
    {
      name: 'Total Castes',
      purpose: 'Calculates the number of distinct caste / category classifications represented.',
      code: `Total Castes = DISTINCTCOUNT('Admissions'[Caste])`,
    },
    {
      name: 'Region (Calculated Column)',
      purpose: 'Creates the geographic administrative zone from the District column.',
      code: `Region = \nSWITCH(\n    TRIM('Admissions'[District]),\n    "Sangli", "Western Maharashtra",\n    "Satara", "Western Maharashtra",\n    "Solapur", "Western Maharashtra",\n    "Pune", "Western Maharashtra",\n    "Kolhapur", "Western Maharashtra",\n    "Nanded", "Marathwada",\n    "Beed", "Marathwada",\n    "Ahilyanagar", "North Maharashtra",\n    "Jalgaon", "North Maharashtra",\n    "Thane", "Konkan",\n    "Vijayapura", "Other State (Karnataka)",\n    "Other Region"\n)`,
    },
    {
      name: 'Student Percentage Share',
      purpose: 'Calculates the percentage of students in each branch/taluka against the full cohort.',
      code: `Student % Share = \nDIVIDE(\n    [Total Students],\n    CALCULATE([Total Students], ALLSELECTED('Admissions')),\n    0\n)`,
    },
  ];

  const powerBIThemeJson = `{
  "name": "First Year Admission Navy Light Blue",
  "dataColors": [
    "#0F2042",
    "#1E3A8A",
    "#0284C7",
    "#38BDF8",
    "#0369A1",
    "#7DD3FC",
    "#1E293B",
    "#64748B"
  ],
  "background": "#FFFFFF",
  "foreground": "#0F172A",
  "tableAccent": "#0284C7",
  "visualStyles": {
    "*": {
      "*": {
        "outspace": [{ "color": { "solid": { "color": "#F8FAFC" } } }],
        "background": [{ "color": { "solid": { "color": "#FFFFFF" } } }],
        "border": [{ "show": true, "color": { "solid": { "color": "#E2E8F0" } }, "radius": 8 }]
      }
    }
  }
}`;

  const downloadThemeJson = () => {
    const blob = new Blob([powerBIThemeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admission_2026_theme.json';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Step-by-Step Power BI Desktop Tutorial & DAX Code
              </h2>
              <p className="text-xs text-slate-500">
                Beginner-friendly guide to building FIRST YEAR ADMISSION DASHBOARD 2026–27 in Power BI Desktop
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('steps')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'steps'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            1. Step-by-Step Dashboard Setup
          </button>
          <button
            onClick={() => setActiveTab('dax')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'dax'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            2. Working DAX Measures (Code)
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'theme'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            3. Navy & Light Blue Theme File
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'steps' && (
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Import Excel File into Power BI Desktop
                  </h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-8 leading-relaxed">
                  <li>Open <strong>Power BI Desktop</strong> on your computer.</li>
                  <li>Click on the <strong>Home</strong> tab ribbon &gt; <strong>Get Data</strong> &gt; <strong>Excel workbook</strong>.</li>
                  <li>Select your uploaded or downloaded Excel file (e.g. <code>First_Year_Admission_2026-27.xlsx</code>).</li>
                  <li>In the <strong>Navigator</strong> window, select your sheet name (e.g. <em>Admissions 2026-27</em>).</li>
                  <li><strong>Crucial:</strong> Click <strong className="text-blue-900">Transform Data</strong> (do not click Load yet) to open the Power Query Editor.</li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Clean the Data in Power Query Editor (Requirement 8)
                  </h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-8 leading-relaxed">
                  <li><strong>Promote Header Row:</strong> If your sheet has title rows at the top, click <em>Home &gt; Remove Rows &gt; Remove Top Rows</em> to remove the banner, then click <strong>Use First Row as Headers</strong>.</li>
                  <li><strong>Remove Blank Rows:</strong> Click <em>Home &gt; Remove Rows &gt; Remove Blank Rows</em>.</li>
                  <li><strong>Trim Extra Spaces:</strong> Select columns <em>Branch, Caste, Village, Taluka, District</em>, right-click &gt; <em>Transform &gt; Trim</em>.</li>
                  <li><strong>Handle Missing Student Names:</strong> Click the filter dropdown arrow on <em>Name of Student</em> &gt; uncheck <code>(null)</code> and blank entries.</li>
                  <li><strong>Set Data Types:</strong> Click the type icon next to <em>Sr.No.</em> and choose <em>Whole Number</em>. Set all remaining 6 columns as <em>Text</em>.</li>
                  <li>Click <strong>Close &amp; Apply</strong> in the top left corner.</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Create the 4 Dynamic KPI Cards (Requirement 1)
                  </h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-8 leading-relaxed">
                  <li>In the <strong>Visualizations</strong> pane on the right, click the <strong>Card</strong> icon.</li>
                  <li>Drag the measure <code>[Total Students]</code> (or drag <em>Name of Student</em> and select <em>Count</em>) into the <strong>Fields</strong> well.</li>
                  <li>Duplicate the card 3 times to create cards for:
                    <ul className="list-circle list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                      <li><code>[Total Branches]</code> (Distinct count of Branch)</li>
                      <li><code>[Total Talukas]</code> (Distinct count of Taluka)</li>
                      <li><code>[Total Districts]</code> (Distinct count of District)</li>
                    </ul>
                  </li>
                  <li>Under <em>Format visual &gt; Callout value</em>, set the color to Navy Blue (<code>#0F2042</code>) and font size to 32.</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    4
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Create Branch-wise &amp; Taluka-wise Horizontal Bar Charts (Requirements 2 &amp; 3)
                  </h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-8 leading-relaxed">
                  <li><strong>Branch Chart:</strong> Click <strong>Clustered bar chart</strong> (horizontal).
                    <ul className="list-circle list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                      <li><strong>Y-axis:</strong> <code>Branch</code></li>
                      <li><strong>X-axis:</strong> <code>Count of Name of Student</code></li>
                      <li>Click the 3 dots (...) in the top right of the visual &gt; <em>Sort axis &gt; Count of Name of Student</em> &gt; <em>Sort descending</em>.</li>
                      <li>Under <em>Format visual &gt; Bars</em>, choose color <code>#1E3A8A</code> (Navy Blue). Turn <strong>Data labels</strong> On.</li>
                    </ul>
                  </li>
                  <li><strong>Taluka Chart:</strong> Click <strong>Clustered bar chart</strong>.
                    <ul className="list-circle list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                      <li><strong>Y-axis:</strong> <code>Taluka</code></li>
                      <li><strong>X-axis:</strong> <code>Count of Name of Student</code></li>
                      <li>Sort descending by count. Choose color <code>#0284C7</code> (Light Blue). Turn Data labels On.</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    5
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Create District-wise Distribution &amp; Hierarchical Matrix (Requirements 4 &amp; 5)
                  </h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-8 leading-relaxed">
                  <li><strong>District Visual:</strong> Click <strong>Clustered column chart</strong> (vertical bars).
                    <ul className="list-circle list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                      <li><strong>X-axis:</strong> <code>District</code></li>
                      <li><strong>Y-axis:</strong> <code>Count of Name of Student</code></li>
                    </ul>
                  </li>
                  <li><strong>Matrix Visual (Branch &amp; Taluka Details):</strong> Click <strong>Matrix</strong> icon.
                    <ul className="list-circle list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                      <li><strong>Rows well:</strong> Drag <code>Taluka</code> first, then drag <code>Branch</code> directly underneath it.</li>
                      <li><strong>Values well:</strong> Drag <code>Count of Name of Student</code>.</li>
                      <li>Under <em>Format visual &gt; Row subtotals</em>, ensure <strong>Row subtotals is turned ON</strong>.</li>
                      <li>In the matrix, right-click any Taluka row &gt; <strong>Expand &gt; All</strong> to show the hierarchical breakdown.</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                    6
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Add Interactive Slicers (Requirement 6)
                  </h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-8 leading-relaxed">
                  <li>Click <strong>Slicer</strong> icon to add slicers for:
                    <ul className="list-circle list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                      <li><code>Region</code> (from calculated column)</li>
                      <li><code>District</code></li>
                      <li><code>Taluka</code></li>
                      <li><code>Branch</code></li>
                      <li><code>Caste</code></li>
                    </ul>
                  </li>
                  <li>Under <em>Format visual &gt; Slicer settings &gt; Style</em>, choose <strong>Dropdown</strong> or <strong>Vertical list</strong>.</li>
                  <li>All KPI cards, charts, and matrix will now filter dynamically when you click any slicer option!</li>
                </ul>
              </div>

              {/* Step 7 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-700 text-white font-bold flex items-center justify-center text-xs">
                    7
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Create Caste-wise Pie Chart (Demographic Breakdown)
                  </h3>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-8 leading-relaxed">
                  <li>Click <strong>Pie chart</strong> (or <strong>Donut chart</strong>) in the Visualizations pane.</li>
                  <li><strong>Legend:</strong> Drag <code>Caste</code> from the Admissions fields.</li>
                  <li><strong>Values:</strong> Drag <code>Count of Name of Student</code> (or measure <code>[Total Students]</code>).</li>
                  <li>Under <em>Format visual &gt; Detail labels</em>, choose <strong>Category, percent of total</strong> (or <strong>All detail labels</strong> to show count + percentage).</li>
                  <li>Under <em>Format visual &gt; Legend</em>, position at <strong>Right</strong> or <strong>Bottom</strong> for clear category reading (SEBC, Open, OBC, NT-C, SC, etc.).</li>
                  <li>Clicking any slice dynamically filters all other visuals (Branch, District, Taluka, and Matrix)!</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'dax' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
                <Code2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <strong>How to create a Measure in Power BI:</strong>
                  <p className="mt-0.5 text-slate-600">
                    Go to <strong>Home</strong> ribbon &gt; Click <strong>New Measure</strong> &gt; Paste any of the DAX formulas below into the formula bar and press Enter.
                  </p>
                </div>
              </div>

              {daxFormulas.map((dax, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{dax.name}</h4>
                      <p className="text-slate-500 text-[11px]">{dax.purpose}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(dax.code, dax.name)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
                    >
                      {copiedKey === dax.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy DAX</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-sky-300 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed">
                    {dax.code}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  Navy Blue &amp; Light Blue Color Palette (Requirement 7)
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Power BI allows importing JSON theme files to automatically configure brand colors across all charts, cards, and matrix visuals in a single click.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#0F2042] border border-slate-300" />
                    <span className="font-mono text-[11px]">#0F2042 (Navy Dark)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#1E3A8A] border border-slate-300" />
                    <span className="font-mono text-[11px]">#1E3A8A (Navy Royal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#0284C7] border border-slate-300" />
                    <span className="font-mono text-[11px]">#0284C7 (Light Blue)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#38BDF8] border border-slate-300" />
                    <span className="font-mono text-[11px]">#38BDF8 (Sky Accent)</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">admission_theme.json</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(powerBIThemeJson, 'theme')}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors"
                    >
                      {copiedKey === 'theme' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={downloadThemeJson}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-900 text-white hover:bg-blue-950 flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Theme File
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 text-[11px]">
                  In Power BI Desktop, click <strong>View</strong> tab ribbon &gt; <strong>Themes</strong> dropdown &gt; <strong>Browse for themes</strong> &gt; select this <code>admission_2026_theme.json</code> file.
                </p>
                <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-lg overflow-x-auto max-h-60 leading-relaxed">
                  {powerBIThemeJson}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Suitable for college admission committee presentations &amp; compliance reporting
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition-colors"
          >
            Close Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};
