import { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import React from 'react';

export default function Deployment({ darkMode = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProjectOfficer, setFilterProjectOfficer] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');

  // Deployment data by employer and project officer
  const deploymentData = [
    {
      projectOfficer: 'BALUYOT, Myson F.',
      role: 'Primary Role: ENCODER / Secondary: PROJECT OFFICER',
      employers: [
        { name: 'ARABIAN CONSTRUCTION INDUSTRIAL CORPORATION (QATAR)', jobOrders: 4, jan: 1, feb: 0, mar: 0, q1: 1, q2: 0, q3: 0, q4: 0, ytd: 1, overall: 1, percent: '0.00%' },
        { name: 'VENTURE GULF ENGINEERING WLL (QATAR)', jobOrders: 132, jan: 1, feb: 0, mar: 0, q1: 1, q2: 0, q3: 0, q4: 0, ytd: 1, overall: 1, percent: '0.76%' },
      ]
    },
    {
      projectOfficer: 'GABAYERON, Princess',
      role: 'Primary Role: ENCODER',
      employers: [
        { name: 'ABDULLAH A. AL BARRAK & SONS CO. (KSA - KSA)', jobOrders: 1, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '#DIV/0!' },
      ]
    },
    {
      projectOfficer: 'ILLY, Leny',
      role: 'ENCODER / MANAGER / Driver: Fr. MA / ACHIENOVA, Mariane Joy / JUANICO, Andrea Nicole',
      employers: [
        { name: 'GULF ASIA CONTRACTING COMPANY (KSA)', jobOrders: 33, jan: 0, feb: 0, mar: 0, q1: 33, q2: 0, q3: 0, q4: 0, ytd: 33, overall: 56, percent: '#DIV/0!' },
        { name: 'GULF ASIA CONTRACTING COMPANY (KSA)', jobOrders: 23, jan: 0, feb: 0, mar: 0, q1: 23, q2: 0, q3: 0, q4: 0, ytd: 23, overall: 0, percent: '#DIV/0!' },
      ]
    },
    {
      projectOfficer: 'MANING, M. M.',
      role: 'Project Officer',
      employers: [
        { name: 'AL-ATTAR MOTORS & TRADING COMPANY WLL (KSA)', jobOrders: 8, jan: 1, feb: 0, mar: 0, q1: 1, q2: 0, q3: 0, q4: 0, ytd: 1, overall: 0, percent: '12.50%' },
        { name: 'ARABIAN BUSINESS MACHINES GROUP (KUWAIT)', jobOrders: 2, jan: 1, feb: 0, mar: 0, q1: 1, q2: 0, q3: 0, q4: 0, ytd: 1, overall: 0, percent: '50.00%' },
        { name: 'ATTAR INTERNATIONAL PRIVATE SCHOOLS (KSA)', jobOrders: 1, jan: 1, feb: 0, mar: 0, q1: 1, q2: 0, q3: 0, q4: 0, ytd: 1, overall: 0, percent: '100.00%' },
        { name: 'BRIGHT INTERNATIONAL SCHOOLS (KSA)', jobOrders: 2, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
        { name: 'CAPITAL AIRCONDITIONING INTERNATIONAL PTE LTD (SINGAPORE)', jobOrders: 6, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
        { name: 'EMIRATES PRINTING PRESS LLC (UAE)', jobOrders: 39, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
      ]
    },
    {
      projectOfficer: 'MARTINEZ, Jenael S.',
      role: 'Project Officer',
      employers: [
        { name: 'ADVANCE PROFESSIONAL SERVICES CO. (KSA)', jobOrders: 1, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 1, overall: 0, percent: '#DIV/0!' },
        { name: 'ADVANCED LINES GENERAL CONTRACTING GROUP (AUS) (KSA)', jobOrders: 2, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '#DIV/0!' },
        { name: 'AL NAHDI FOR TRADING INDUSTRIAL & CONTRACTING (KSA)', jobOrders: 2, jan: 0, feb: 0, mar: 0, q1: 2, q2: 0, q3: 0, q4: 0, ytd: 2, overall: 0, percent: '#DIV/0!' },
        { name: 'AL TULIP INDUSTRIAL CONTRACTING CO. (KSA)', jobOrders: 0, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '#DIV/0!' },
        { name: 'ALMANSOUB & DE BOEL LTD. CO. (KSA)', jobOrders: 0, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '#DIV/0!' },
      ]
    },
    {
      projectOfficer: 'PANASANTOS, Emelie Jane',
      role: 'Project Officer',
      employers: [
        { name: 'ARABIAN PIPELINE & SERVICES CO. LTD. (ARAMEER - KSA)', jobOrders: 1, jan: 1, feb: 0, mar: 0, q1: 1, q2: 0, q3: 0, q4: 0, ytd: 1, overall: 0, percent: '0.00%' },
        { name: 'EXCEPTIONAL VILLAGE CO. FOR HOUSING (AL VENTURA VILLAGE - KSA)', jobOrders: 1, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 4, percent: '0.00%' },
        { name: 'MASAFA AL JAZEERA TRADING & CONTRACTING (KSA)', jobOrders: 4, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '3.66%' },
        { name: 'QATAR ENGINEERING & CONSTRUCTION COMPANY (QCON)', jobOrders: 82, jan: 1, feb: 0, mar: 0, q1: 3, q2: 0, q3: 0, q4: 0, ytd: 3, overall: 0, percent: '9.76%' },
      ]
    },
    {
      projectOfficer: 'SERVANO, Faith Risen',
      role: 'Project Officer',
      employers: [
        { name: 'G.R. THE KING\'S PRIVATE AFFAIRS OFFICE (QATAR)', jobOrders: 1, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '#DIV/0!' },
        { name: 'HONAR SCULPTURE & WELDING (BAHRAIN)', jobOrders: 15, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
        { name: 'ROYAL WINGS LOUNGE (QATAR)', jobOrders: 8, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
        { name: 'SUMITOMO CO. LTD. (JAPAN - SIRAJ)', jobOrders: 30, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
        { name: 'TOKUYAMA CO. LTD. (JAPAN - SIRAJ)', jobOrders: 13, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
        { name: 'MITSUI WOOD CO. LTD. (JAPAN - SIRAJ)', jobOrders: 8, jan: 0, feb: 0, mar: 0, q1: 0, q2: 0, q3: 0, q4: 0, ytd: 0, overall: 0, percent: '0.00%' },
      ]
    },
  ];

  // Country deployment summary
  const countrySummary = [
    { country: 'BAHRAIN', count: 4, ytd: 4 },
    { country: 'KUWAIT', count: 6, ytd: 6 },
    { country: 'QATAR', count: 8, ytd: 8 },
    { country: 'KUWAIT', count: 1, ytd: 1 },
    { country: 'QATAR', count: 28, ytd: 28 },
    { country: 'SAUDI ARABIA', count: 40, ytd: 40 },
    { country: 'SINGAPORE', count: 0, ytd: 0 },
    { country: 'UNITED ARAB EMIRATES', count: 0, ytd: 0 },
  ];

  const projectOfficers = ['All', ...Array.from(new Set(deploymentData.map(d => d.projectOfficer)))];
  const countries = ['All', 'Bahrain', 'Kuwait', 'Qatar', 'Saudi Arabia', 'Singapore', 'UAE'];

  const filteredData = deploymentData.filter(item => {
    if (filterProjectOfficer !== 'All' && item.projectOfficer !== filterProjectOfficer) return false;
    if (searchTerm && !item.projectOfficer.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.employers.some(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

  // Export to CSV function
  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      'Project Officer',
      'Role',
      'Employer/Company',
      'Job Orders',
      'January',
      'February',
      'March',
      'Q1 Subtotal',
      'Q2 Subtotal',
      'Q3 Subtotal',
      'Q4 Subtotal',
      'Year-to-Date',
      'Overall',
      '% of Arrivals to Target'
    ];

    // Prepare CSV rows
    const rows: string[][] = [];
    
    filteredData.forEach(officer => {
      officer.employers.forEach((employer, index) => {
        rows.push([
          index === 0 ? officer.projectOfficer : '', // Only show officer name on first row
          index === 0 ? officer.role : '',
          employer.name,
          employer.jobOrders.toString(),
          employer.jan.toString(),
          employer.feb.toString(),
          employer.mar.toString(),
          employer.q1.toString(),
          employer.q2.toString(),
          employer.q3.toString(),
          employer.q4.toString(),
          employer.ytd.toString(),
          employer.overall.toString(),
          employer.percent
        ]);
      });
      // Add empty row between officers for readability
      rows.push([]);
    });

    // Add country summary section
    rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    rows.push(['COUNTRY DEPLOYMENT SUMMARY', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    rows.push(['Country', '', 'Count', '', '', '', '', '', '', '', '', 'YTD', '', '']);
    
    countrySummary.forEach(item => {
      rows.push([item.country, '', item.count.toString(), '', '', '', '', '', '', '', '', item.ytd.toString(), '', '']);
    });
    
    rows.push(['TOTAL', '', '81', '', '', '', '', '', '', '', '', '81', '', '']);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `LHRC_Deployment_Summary_2026_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>2026 LHRC Deployment Summary</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Employers per Project Officer</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" onClick={exportToCSV}>
              <Download className="w-4 h-4" />
              <span className="text-sm font-semibold">Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search by project officer or employer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={filterProjectOfficer}
              onChange={(e) => setFilterProjectOfficer(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {projectOfficers.map(po => (
                <option key={po} value={po}>{po === 'All' ? 'All Project Officers' : po}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {countries.map(country => (
                <option key={country} value={country}>{country === 'All' ? 'All Countries' : country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Deployment Table */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm overflow-hidden border`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-3 py-3 text-left text-xs font-bold uppercase sticky left-0 bg-green-600 z-10" rowSpan={2}>
                  Employers per Project Officer
                </th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase" rowSpan={2}>Job<br/>Orders</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500" colSpan={3}>1st Quarter</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">1st Qtr<br/>Sub-Totals</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">2nd Qtr<br/>Sub-Totals</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">3rd Qtr<br/>Sub-Totals</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">4th Qtr<br/>Sub-Totals</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">YEAR<br/>TO-DATE</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">OVERALL</th>
                <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">% of arrivals<br/>to target</th>
              </tr>
              <tr className="bg-green-600 text-white">
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500">January</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">February</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">March</th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500"></th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500"></th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500"></th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500"></th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500"></th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500"></th>
                <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500"></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.flatMap((officer, idx) => {
                const rows = [];
                
                // Project Officer Header Row
                rows.push(
                  <tr key={`officer-${idx}-${officer.projectOfficer}`} className={`${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border-t-2 border-gray-900`}>
                    <td className={`px-3 py-2 font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'} sticky left-0 ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} z-10`} colSpan={11}>
                      {officer.projectOfficer} {officer.role && `(${officer.role})`}
                    </td>
                  </tr>
                );
                
                // Employer Rows
                officer.employers.forEach((employer, empIdx) => {
                  rows.push(
                    <tr key={`emp-${idx}-${empIdx}-${employer.name}`} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${empIdx % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}`}>
                      <td className={`px-3 py-2 text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'} sticky left-0 ${empIdx % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-white') : (darkMode ? 'bg-gray-750' : 'bg-gray-50')}`}>
                        {employer.name}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{employer.jobOrders}</td>
                      <td className={`px-3 py-2 text-center text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.jan || '—'}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {employer.feb || '—'}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {employer.mar || '—'}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.q1}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.q2}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.q3}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.q4}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.ytd}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.overall}
                      </td>
                      <td className={`px-3 py-2 text-center text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'} border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                        {employer.percent}
                      </td>
                    </tr>
                  );
                });
                
                return rows;
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Country Deployment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Countries Deployed To</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Country</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Count</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">YTD</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {countrySummary.map((item, index) => (
                  <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {item.country}
                    </td>
                    <td className={`px-4 py-3 text-center text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {item.count}
                    </td>
                    <td className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {item.ytd}
                    </td>
                  </tr>
                ))}
                <tr className="bg-green-600 text-white font-bold">
                  <td className="px-4 py-3 text-sm">TOTAL</td>
                  <td className="px-4 py-3 text-center text-sm">81</td>
                  <td className="px-4 py-3 text-center text-sm">81</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Monthly & Quarterly Totals</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>2026 Monthly WTD Totals</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>658</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>2026 Quarterly Totals</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>658</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>2025 Monthly WTD Totals</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>1,421</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Success Rate: 11.39%</p>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>2025 Quarterly Totals</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>161</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Success Rate: 11.60%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}