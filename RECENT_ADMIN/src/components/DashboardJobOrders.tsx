import { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardJobOrders({ darkMode = false }) {
  const [timePeriod, setTimePeriod] = useState('month');
  const [segmentBy, setSegmentBy] = useState('all');
  const [selectedSegment, setSelectedSegment] = useState('All');

  // Top Stats
  const stats = [
    { label: 'Job Orders', value: '67.42K', color: 'border-purple-500' },
    { label: 'Incomplete Job Orders', value: '67.42%', color: 'border-gray-300' },
    { label: 'Ave Completion Rate of Open Job Orders', value: '67.42%', color: 'border-green-500' },
    { label: 'At-Risk Job Orders', value: '67.42%', color: 'border-gray-300' },
    { label: 'Active Deployees', value: '67.42%', color: 'border-gray-300' },
    { label: 'Open Positions', value: '67.42%', color: 'border-gray-300' },
    { label: 'Positions at Shortlist', value: '67.42%', color: 'border-gray-300' },
    { label: 'Current Applicants to Pending Ratio', value: '4:1', color: 'border-gray-300' },
  ];

  // Main Business Analytics Data - Closed/Hired vs Open Job Orders
  const getAnalyticsData = () => {
    switch (timePeriod) {
      case 'month':
        return [
          { period: 'Jan', closed: 45, hired: 38, open: 25 },
          { period: 'Feb', closed: 52, hired: 44, open: 22 },
          { period: 'Mar', closed: 48, hired: 40, open: 28 },
          { period: 'Apr', closed: 55, hired: 47, open: 20 },
          { period: 'May', closed: 60, hired: 52, open: 18 },
          { period: 'Jun', closed: 58, hired: 50, open: 24 },
          { period: 'Jul', closed: 62, hired: 54, open: 19 },
          { period: 'Aug', closed: 65, hired: 58, open: 17 },
          { period: 'Sep', closed: 59, hired: 51, open: 23 },
          { period: 'Oct', closed: 68, hired: 60, open: 15 },
          { period: 'Nov', closed: 72, hired: 64, open: 14 },
          { period: 'Dec', closed: 70, hired: 62, open: 16 },
        ];
      case 'quarter':
        return [
          { period: 'Q1 2025', closed: 145, hired: 122, open: 75 },
          { period: 'Q2 2025', closed: 173, hired: 149, open: 62 },
          { period: 'Q3 2025', closed: 186, hired: 163, open: 59 },
          { period: 'Q4 2025', closed: 210, hired: 186, open: 45 },
        ];
      case 'ytd':
        return [
          { period: 'Jan-Mar', closed: 145, hired: 122, open: 75 },
          { period: 'Jan-Jun', closed: 318, hired: 271, open: 137 },
          { period: 'Jan-Sep', closed: 504, hired: 434, open: 196 },
          { period: 'Jan-Dec', closed: 714, hired: 620, open: 241 },
        ];
      case 'year':
        return [
          { period: '2021', closed: 420, hired: 358, open: 180 },
          { period: '2022', closed: 495, hired: 425, open: 165 },
          { period: '2023', closed: 580, hired: 502, open: 148 },
          { period: '2024', closed: 658, hired: 572, open: 132 },
          { period: '2025', closed: 714, hired: 620, open: 124 },
        ];
      default:
        return [];
    }
  };

  // Segmentation options
  const segmentOptions = {
    all: ['All'],
    pm: ['All', 'John Smith', 'Maria Garcia', 'Ahmed Hassan', 'Lisa Chen', 'Robert Johnson'],
    company: ['All', 'Saudi 1', 'Qatar 1', 'Iraq 1', 'Abu Dhabi', 'Construction Co.', 'Nursing Co.'],
    country: ['All', 'Saudi Arabia', 'Qatar', 'Iraq', 'UAE', 'Kuwait', 'Bahrain'],
    skill: ['All', 'Construction', 'Healthcare', 'Manufacturing', 'Hospitality', 'IT Services', 'Retail'],
  };

  // Segmented breakdown data
  const getSegmentedData = () => {
    if (segmentBy === 'all') return [];
    
    const segments = {
      pm: [
        { name: 'John Smith', closed: 145, hired: 125, open: 42, rate: '89%' },
        { name: 'Maria Garcia', closed: 138, hired: 118, open: 38, rate: '87%' },
        { name: 'Ahmed Hassan', closed: 152, hired: 132, open: 35, rate: '91%' },
        { name: 'Lisa Chen', closed: 128, hired: 110, open: 45, rate: '88%' },
        { name: 'Robert Johnson', closed: 151, hired: 135, open: 40, rate: '92%' },
      ],
      company: [
        { name: 'Saudi 1', closed: 156, hired: 142, open: 48, rate: '92%', projectOfficer: 'MARTINEZ, Jenael S.' },
        { name: 'Qatar 1', closed: 148, hired: 128, open: 52, rate: '88%', projectOfficer: 'PANASANTOS, Emelie Jane' },
        { name: 'Iraq 1', closed: 132, hired: 115, open: 45, rate: '90%', projectOfficer: 'MANING, M. M.' },
        { name: 'Abu Dhabi', closed: 125, hired: 108, open: 38, rate: '89%', projectOfficer: 'SERVANO, Faith Risen' },
        { name: 'Construction Co.', closed: 98, hired: 85, open: 42, rate: '87%', projectOfficer: 'ILLY, Leny' },
        { name: 'Nursing Co.', closed: 55, hired: 42, open: 16, rate: '85%', projectOfficer: 'BALUYOT, Myson F.' },
      ],
      country: [
        { name: 'Saudi Arabia', closed: 245, hired: 215, open: 72, rate: '91%' },
        { name: 'Qatar', closed: 188, hired: 162, open: 58, rate: '89%' },
        { name: 'UAE', closed: 165, hired: 142, open: 48, rate: '88%' },
        { name: 'Iraq', closed: 78, hired: 68, open: 28, rate: '90%' },
        { name: 'Kuwait', closed: 28, hired: 23, open: 12, rate: '85%' },
        { name: 'Bahrain', closed: 10, hired: 10, open: 5, rate: '87%' },
      ],
      skill: [
        { name: 'Construction', closed: 215, hired: 188, open: 65, rate: '90%' },
        { name: 'Healthcare', closed: 182, hired: 158, open: 52, rate: '88%' },
        { name: 'Manufacturing', closed: 145, hired: 125, open: 48, rate: '89%' },
        { name: 'Hospitality', closed: 98, hired: 82, open: 38, rate: '86%' },
        { name: 'IT Services', closed: 52, hired: 45, open: 18, rate: '92%' },
        { name: 'Retail', closed: 22, hired: 22, open: 8, rate: '84%' },
      ],
    };
    
    return segments[segmentBy] || [];
  };

  // Applicants and Available Positions Data
  const applicantsPositionsData = [
    { name: 'Jan', applicants: 35, positions: 25 },
    { name: 'Feb', applicants: 18, positions: 22 },
    { name: 'Mar', applicants: 28, positions: 18 },
    { name: 'Apr', applicants: 15, positions: 20 },
    { name: 'May', applicants: 25, positions: 15 },
    { name: 'Jun', applicants: 22, positions: 25 },
    { name: 'Jul', applicants: 18, positions: 12 },
    { name: 'Aug', applicants: 28, positions: 20 },
  ];

  // Company Unfilled Positions Data
  const companyData = [
    { company: 'Saudi 1', unfilled: 'n/a', percentage: '80%' },
    { company: 'Qatar 1', unfilled: 'n/a', percentage: '78%' },
    { company: 'Iraq 1', unfilled: 'n/a', percentage: '75%' },
    { company: 'Saudi 2', unfilled: '11k', percentage: '62%' },
    { company: 'Company 3', unfilled: '10k', percentage: '61%' },
    { company: 'Company 4', unfilled: 'n/a', percentage: '58%' },
    { company: 'Abu Dhabi', unfilled: '7k', percentage: '55%' },
    { company: 'Construction Co.', unfilled: '5k', percentage: '40%' },
    { company: 'Nursing Co.', unfilled: '3k', percentage: '25%' },
  ];

  // Distribution of Open Positions
  const openPositionsData = [
    { category: 'Electronics', value: 45 },
    { category: 'Healthcare', value: 35 },
    { category: 'Prof Services', value: 30 },
    { category: 'Business', value: 50 },
  ];

  // Job Orders per Age Range
  const ageRangeData = [
    { range: '0-60 days', value: 40 },
    { range: '61-90 days', value: 35 },
    { range: '91-120 days', value: 25 },
    { range: '121+ days', value: 45 },
  ];

  // Binned Age of Applicants
  const applicantAgeData = [
    { range: '18-24', value: 30 },
    { range: '25-29', value: 35 },
    { range: '30-34', value: 40 },
    { range: '35-39', value: 45 },
    { range: '40-44', value: 38 },
    { range: '45-49', value: 32 },
    { range: '50+', value: 50 },
  ];

  // Project Officer Performance Data
  const projectOfficerPerformance = [
    { name: 'MARTINEZ, Jenael S.', totalJobs: 45, completed: 42, inProgress: 3, avgApplicants: 28, completionRate: 93.3, avgDaysToComplete: 22, atRiskJobs: 1 },
    { name: 'PANASANTOS, Emelie Jane', totalJobs: 52, completed: 47, inProgress: 5, avgApplicants: 32, completionRate: 90.4, avgDaysToComplete: 25, atRiskJobs: 2 },
    { name: 'MANING, M. M.', totalJobs: 38, completed: 35, inProgress: 3, avgApplicants: 26, completionRate: 92.1, avgDaysToComplete: 20, atRiskJobs: 1 },
    { name: 'SERVANO, Faith Risen', totalJobs: 41, completed: 37, inProgress: 4, avgApplicants: 30, completionRate: 90.2, avgDaysToComplete: 24, atRiskJobs: 2 },
    { name: 'ILLY, Leny', totalJobs: 33, completed: 30, inProgress: 3, avgApplicants: 24, completionRate: 90.9, avgDaysToComplete: 23, atRiskJobs: 1 },
    { name: 'BALUYOT, Myson F.', totalJobs: 28, completed: 25, inProgress: 3, avgApplicants: 22, completionRate: 89.3, avgDaysToComplete: 26, atRiskJobs: 2 },
    { name: 'GABAYERON, Princess', totalJobs: 35, completed: 31, inProgress: 4, avgApplicants: 25, completionRate: 88.6, avgDaysToComplete: 28, atRiskJobs: 3 },
    { name: 'REYES, Carlos M.', totalJobs: 42, completed: 35, inProgress: 7, avgApplicants: 20, completionRate: 83.3, avgDaysToComplete: 32, atRiskJobs: 4 },
    { name: 'SANTOS, Maria L.', totalJobs: 30, completed: 24, inProgress: 6, avgApplicants: 18, completionRate: 80.0, avgDaysToComplete: 35, atRiskJobs: 5 },
    { name: 'CRUZ, Antonio R.', totalJobs: 25, completed: 19, inProgress: 6, avgApplicants: 16, completionRate: 76.0, avgDaysToComplete: 38, atRiskJobs: 5 },
    { name: 'LOPEZ, Diana S.', totalJobs: 22, completed: 16, inProgress: 6, avgApplicants: 14, completionRate: 72.7, avgDaysToComplete: 42, atRiskJobs: 6 },
    { name: 'GARCIA, Ramon P.', totalJobs: 20, completed: 14, inProgress: 6, avgApplicants: 12, completionRate: 70.0, avgDaysToComplete: 45, atRiskJobs: 6 },
  ];

  // At-Risk Job Orders based on time
  const atRiskJobOrders = [
    { jobOrderId: 'JO-2025-1234', company: 'ARABIAN CONSTRUCTION INDUSTRIAL', position: 'Welder', projectOfficer: 'SANTOS, Maria L.', daysOpen: 145, applicants: 3, targetApplicants: 25, completionRate: 12, status: 'Critical' },
    { jobOrderId: 'JO-2025-1189', company: 'VENTURE GULF ENGINEERING WLL', position: 'Electrician', projectOfficer: 'CRUZ, Antonio R.', daysOpen: 138, applicants: 5, targetApplicants: 30, completionRate: 17, status: 'Critical' },
    { jobOrderId: 'JO-2025-1456', company: 'GULF ASIA CONTRACTING COMPANY', position: 'Mason', projectOfficer: 'LOPEZ, Diana S.', daysOpen: 132, applicants: 8, targetApplicants: 40, completionRate: 20, status: 'Critical' },
    { jobOrderId: 'JO-2025-0987', company: 'QATAR ENGINEERING & CONSTRUCTION', position: 'Carpenter', projectOfficer: 'GARCIA, Ramon P.', daysOpen: 128, applicants: 6, targetApplicants: 35, completionRate: 17, status: 'Critical' },
    { jobOrderId: 'JO-2025-1567', company: 'AL-ATTAR MOTORS & TRADING', position: 'Mechanic', projectOfficer: 'SANTOS, Maria L.', daysOpen: 125, applicants: 10, targetApplicants: 45, completionRate: 22, status: 'High Risk' },
    { jobOrderId: 'JO-2025-1678', company: 'EMIRATES PRINTING PRESS LLC', position: 'Machine Operator', projectOfficer: 'REYES, Carlos M.', daysOpen: 118, applicants: 12, targetApplicants: 50, completionRate: 24, status: 'High Risk' },
    { jobOrderId: 'JO-2025-1234', company: 'CAPITAL AIRCONDITIONING', position: 'HVAC Technician', projectOfficer: 'CRUZ, Antonio R.', daysOpen: 115, applicants: 9, targetApplicants: 35, completionRate: 26, status: 'High Risk' },
    { jobOrderId: 'JO-2025-1890', company: 'BRIGHT INTERNATIONAL SCHOOLS', position: 'Teacher - English', projectOfficer: 'GABAYERON, Princess', daysOpen: 110, applicants: 15, targetApplicants: 50, completionRate: 30, status: 'Medium Risk' },
    { jobOrderId: 'JO-2025-2001', company: 'MASAFA AL JAZEERA TRADING', position: 'Driver', projectOfficer: 'BALUYOT, Myson F.', daysOpen: 105, applicants: 18, targetApplicants: 55, completionRate: 33, status: 'Medium Risk' },
    { jobOrderId: 'JO-2025-2112', company: 'ROYAL WINGS LOUNGE', position: 'Waiter', projectOfficer: 'SERVANO, Faith Risen', daysOpen: 102, applicants: 20, targetApplicants: 60, completionRate: 33, status: 'Medium Risk' },
  ];

  // Applicants and Hired per Day Data
  const applicantsHiredPerDayData = [
    { date: 'Mar 1', applicants: 12, hired: 8, applicantsPerDay: 12, hiredPerDay: 8 },
    { date: 'Mar 2', applicants: 15, hired: 10, applicantsPerDay: 13.5, hiredPerDay: 9 },
    { date: 'Mar 3', applicants: 8, hired: 5, applicantsPerDay: 11.7, hiredPerDay: 7.7 },
    { date: 'Mar 4', applicants: 18, hired: 12, applicantsPerDay: 13.3, hiredPerDay: 8.8 },
    { date: 'Mar 5', applicants: 22, hired: 15, applicantsPerDay: 15, hiredPerDay: 10 },
    { date: 'Mar 6', applicants: 10, hired: 7, applicantsPerDay: 14.2, hiredPerDay: 9.5 },
    { date: 'Mar 7', applicants: 14, hired: 9, applicantsPerDay: 14.1, hiredPerDay: 9.4 },
    { date: 'Mar 8', applicants: 20, hired: 14, applicantsPerDay: 14.9, hiredPerDay: 10 },
    { date: 'Mar 9', applicants: 16, hired: 11, applicantsPerDay: 15, hiredPerDay: 10.1 },
    { date: 'Mar 10', applicants: 12, hired: 8, applicantsPerDay: 14.7, hiredPerDay: 9.9 },
    { date: 'Mar 11', applicants: 18, hired: 13, applicantsPerDay: 15.1, hiredPerDay: 10.2 },
    { date: 'Mar 12', applicants: 24, hired: 16, applicantsPerDay: 15.8, hiredPerDay: 10.7 },
    { date: 'Mar 13', applicants: 11, hired: 7, applicantsPerDay: 15.4, hiredPerDay: 10.3 },
    { date: 'Mar 14', applicants: 19, hired: 13, applicantsPerDay: 15.6, hiredPerDay: 10.5 },
  ];

  // Get top 10 best and at-risk project officers
  const topPerformers = [...projectOfficerPerformance].sort((a, b) => b.completionRate - a.completionRate).slice(0, 10);
  const atRiskOfficers = [...projectOfficerPerformance].sort((a, b) => a.completionRate - b.completionRate).slice(0, 10);

  // Chart.js configurations for Main Analytics
  const analyticsData = getAnalyticsData();
  const mainLineChartData = {
    labels: analyticsData.map(d => d.period),
    datasets: [
      {
        label: 'Closed Job Orders',
        data: analyticsData.map(d => d.closed),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#16a34a',
      },
      {
        label: 'Hired Applicants',
        data: analyticsData.map(d => d.hired),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#eab308',
      },
      {
        label: 'Open Job Orders',
        data: analyticsData.map(d => d.open),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#f97316',
      },
    ],
  };

  // Bar Chart for Applicants/Positions
  const applicantsBarChartData = {
    labels: applicantsPositionsData.map(d => d.name),
    datasets: [
      {
        label: 'Applicants',
        data: applicantsPositionsData.map(d => d.applicants),
        backgroundColor: '#FFA500',
        borderRadius: 8,
      },
      {
        label: 'Open Positions',
        data: applicantsPositionsData.map(d => d.positions),
        backgroundColor: '#FFD700',
        borderRadius: 8,
      },
    ],
  };

  // Chart for Applicants/Hired per Day (Combined Bar + Line)
  const dailyChartData = {
    labels: applicantsHiredPerDayData.map(d => d.date),
    datasets: [
      {
        type: 'bar',
        label: 'Daily Applicants',
        data: applicantsHiredPerDayData.map(d => d.applicants),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        type: 'bar',
        label: 'Daily Hired',
        data: applicantsHiredPerDayData.map(d => d.hired),
        backgroundColor: '#16a34a',
        borderRadius: 4,
      },
      {
        type: 'line',
        label: 'Applicants/Day Avg',
        data: applicantsHiredPerDayData.map(d => d.applicantsPerDay),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#a855f7',
      },
      {
        type: 'line',
        label: 'Hired/Day Avg',
        data: applicantsHiredPerDayData.map(d => d.hiredPerDay),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#eab308',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#fff' : '#000',
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#fff',
        titleColor: darkMode ? '#fff' : '#000',
        bodyColor: darkMode ? '#fff' : '#000',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#374151',
          font: {
            size: 12,
          },
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#374151',
          font: {
            size: 12,
          },
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb',
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#fff',
        titleColor: darkMode ? '#fff' : '#000',
        bodyColor: darkMode ? '#fff' : '#000',
        borderColor: darkMode ? '#374151' : '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#000',
          font: {
            size: 12,
          },
        },
        grid: {
          color: darkMode ? '#374151' : '#f0f0f0',
        },
      },
      y: {
        ticks: {
          color: darkMode ? '#9CA3AF' : '#000',
          font: {
            size: 12,
          },
        },
        grid: {
          color: darkMode ? '#374151' : '#f0f0f0',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Main Business Analytics Section */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
        <div className="mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Main Business Analytics</h2>
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Time Period Selector */}
            <div className="flex items-center space-x-2">
              <label className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Period:</label>
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {['month', 'quarter', 'ytd', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      timePeriod === period
                        ? 'bg-green-600 text-white'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-600'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period === 'ytd' ? 'YTD' : period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Segment By Selector */}
            <div className="flex items-center space-x-2">
              <label className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Segment By:</label>
              <select
                value={segmentBy}
                onChange={(e) => {
                  setSegmentBy(e.target.value);
                  setSelectedSegment('All');
                }}
                className={`px-3 py-1.5 text-sm border rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Data</option>
                <option value="pm">Project Manager</option>
                <option value="company">Company/Employer</option>
                <option value="country">Country</option>
                <option value="skill">Related Jobs/Skill</option>
              </select>
            </div>

            {/* Specific Segment Selector (only show if not 'all') */}
            {segmentBy !== 'all' && (
              <div className="flex items-center space-x-2">
                <label className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter:</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {segmentOptions[segmentBy].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Main Chart - Job Orders Closed/Hired vs Open */}
        <div className="mb-6">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Job Orders: Closed/Hired vs Open
          </h3>
          <div className="flex items-center space-x-6 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Closed Job Orders</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Hired Applicants</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Open Job Orders</span>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <Line data={mainLineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Segmented Breakdown Table */}
        {segmentBy !== 'all' && (
          <div className="mt-6">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Breakdown by {segmentBy === 'pm' ? 'Project Manager' : segmentBy === 'company' ? 'Company' : segmentBy === 'country' ? 'Country' : 'Skill'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      {segmentBy === 'pm' ? 'Project Manager' : segmentBy === 'company' ? 'Company' : segmentBy === 'country' ? 'Country' : 'Skill'}
                    </th>
                    {segmentBy === 'company' && (
                      <th className="px-4 py-3 text-left text-sm font-semibold">Project Officer</th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-semibold">Closed</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Hired</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Open</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Success Rate</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {getSegmentedData().map((item, index) => (
                    <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {item.name}
                      </td>
                      {segmentBy === 'company' && (
                        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {item.projectOfficer || '—'}
                        </td>
                      )}
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>
                        {item.closed}
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'} font-semibold`}>
                        {item.hired}
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'} font-semibold`}>
                        {item.open}
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'} font-semibold`}>
                        {item.rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Top Stats Cards - 8 cards in 2 rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm p-6 border-2 ${stat.color}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{stat.label}</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Middle Section - Chart and Company Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Applicants and Available Positions Chart */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Applicants and Available Positions</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Applicants</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Open Positions</span>
              </div>
            </div>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={applicantsBarChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Right - Company Table */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded font-semibold">
                Unfilled Positions
              </button>
              <button className={`px-3 py-1 text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded font-semibold`}>
                % Unfilled Positions
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-[280px]">
            <table className="w-full">
              <thead className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`px-3 py-2 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Company</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unfilled Positions</th>
                  <th className={`px-3 py-2 text-left text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>% Unfilled</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {companyData.map((item, index) => (
                  <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-3 py-3 text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.company}</td>
                    <td className={`px-3 py-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.unfilled}</td>
                    <td className={`px-3 py-3 text-sm ${darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>{item.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section - Three Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution of Open Positions */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Distribution of Open Positions</h3>
          <div className="space-y-3">
            {openPositionsData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{item.category}</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                </div>
                <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                  <div className="h-full bg-green-500" style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Orders per Age Range of Job Orders */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Job Orders per Age Range of Job Orders</h3>
          <div className="space-y-3">
            {ageRangeData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{item.range}</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                </div>
                <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                  <div className="h-full bg-green-500" style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Binned Age of Applicants */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Binned Age of Applicants</h3>
          <div className="space-y-3">
            {applicantAgeData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{item.range}</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</span>
                </div>
                <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                  <div className="h-full bg-green-500" style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Officer Performance Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Best Performing */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border`}>
          <div className="p-6 border-b border-green-500">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🏆 Top 10 Best Performing Project Officers
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Ranked by completion rate</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Rank</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Project Officer</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">Total Jobs</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">Completed</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">Completion %</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">Avg Days</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {topPerformers.map((officer, index) => (
                  <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-3 py-3 text-sm font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      #{index + 1}
                    </td>
                    <td className={`px-3 py-3 text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {officer.name}
                    </td>
                    <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {officer.totalJobs}
                    </td>
                    <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>
                      {officer.completed}
                    </td>
                    <td className={`px-3 py-3 text-center text-sm font-bold ${
                      officer.completionRate >= 90 
                        ? darkMode ? 'text-green-400' : 'text-green-600'
                        : darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      {officer.completionRate.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {officer.avgDaysToComplete}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 At-Risk */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm border`}>
          <div className="p-6 border-b border-red-500">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ⚠️ Top 10 At-Risk Project Officers
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Ranked by lowest completion rate</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Rank</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Project Officer</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">In Progress</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">At-Risk Jobs</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">Completion %</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">Avg Applicants</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {atRiskOfficers.map((officer, index) => (
                  <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-3 py-3 text-sm font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      #{index + 1}
                    </td>
                    <td className={`px-3 py-3 text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {officer.name}
                    </td>
                    <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-orange-400' : 'text-orange-600'} font-semibold`}>
                      {officer.inProgress}
                    </td>
                    <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-red-400' : 'text-red-600'} font-bold`}>
                      {officer.atRiskJobs}
                    </td>
                    <td className={`px-3 py-3 text-center text-sm font-bold ${
                      officer.completionRate < 75
                        ? darkMode ? 'text-red-400' : 'text-red-600'
                        : darkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      {officer.completionRate.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {officer.avgApplicants}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* At-Risk Job Orders by Time */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
        <div className="mb-4">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🚨 At-Risk Job Orders (Based on Time Open)
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Job orders with extended open duration and low completion rates
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">Job Order ID</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">Company</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">Position</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">Project Officer</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">Days Open</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">Applicants</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">Target</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">Completion %</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {atRiskJobOrders.map((job, index) => (
                <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      job.status === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : job.status === 'High Risk'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-xs font-mono ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {job.jobOrderId}
                  </td>
                  <td className={`px-3 py-3 text-xs ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {job.company}
                  </td>
                  <td className={`px-3 py-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {job.position}
                  </td>
                  <td className={`px-3 py-3 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {job.projectOfficer}
                  </td>
                  <td className={`px-3 py-3 text-center text-sm font-bold ${
                    job.daysOpen > 130
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : job.daysOpen > 115
                      ? darkMode ? 'text-orange-400' : 'text-orange-600'
                      : darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    {job.daysOpen}
                  </td>
                  <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {job.applicants}
                  </td>
                  <td className={`px-3 py-3 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {job.targetApplicants}
                  </td>
                  <td className={`px-3 py-3 text-center text-sm font-bold ${
                    job.completionRate < 20
                      ? darkMode ? 'text-red-400' : 'text-red-600'
                      : job.completionRate < 30
                      ? darkMode ? 'text-orange-400' : 'text-orange-600'
                      : darkMode ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    {job.completionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicants and Hired per Day Analysis */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-sm p-6 border`}>
        <div className="mb-6">
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📊 Applicants/Day and Hired/Day Ratio
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Daily tracking of applicant intake and hiring velocity
          </p>
        </div>
        
        {/* Chart */}
        <div className="mb-6">
          <div className="flex items-center space-x-6 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Daily Applicants</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Daily Hired</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Applicants/Day (Rolling Avg)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Hired/Day (Rolling Avg)</span>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <Bar data={dailyChartData} options={chartOptions} />
          </div>
        </div>

        {/* Summary Stats Table */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Avg Applicants/Day</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>15.6</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Avg Hired/Day</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>10.5</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Conversion Rate</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>67.3%</p>
          </div>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Period (14 days)</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>218 / 147</p>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Applicants / Hired</p>
          </div>
        </div>
      </div>
    </div>
  );
}
