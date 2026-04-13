import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const applicantData = [
    { month: 'Jan', applied: 120, accepted: 45, rejected: 30, pending: 45 },
    { month: 'Feb', applied: 150, accepted: 60, rejected: 40, pending: 50 },
    { month: 'Mar', applied: 180, accepted: 70, rejected: 50, pending: 60 },
    { month: 'Apr', applied: 200, accepted: 85, rejected: 55, pending: 60 },
    { month: 'May', applied: 170, accepted: 75, rejected: 45, pending: 50 },
    { month: 'Jun', applied: 190, accepted: 80, rejected: 50, pending: 60 },
  ];

  const statusData = [
    { name: 'Applied', value: 450 },
    { name: 'Shortlisted', value: 280 },
    { name: 'Accepted', value: 180 },
    { name: 'Rejected', value: 120 },
  ];

  const COLORS = ['#3B82F6', '#EAB308', '#22C55E', '#EF4444'];

  // Bar Chart Data
  const barChartData = {
    labels: applicantData.map(d => d.month),
    datasets: [
      {
        label: 'Applied',
        data: applicantData.map(d => d.applied),
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Accepted',
        data: applicantData.map(d => d.accepted),
        backgroundColor: '#22C55E',
      },
      {
        label: 'Rejected',
        data: applicantData.map(d => d.rejected),
        backgroundColor: '#EF4444',
      },
      {
        label: 'Pending',
        data: applicantData.map(d => d.pending),
        backgroundColor: '#EAB308',
      },
    ],
  };

  // Doughnut Chart Data
  const doughnutChartData = {
    labels: statusData.map(d => d.name),
    datasets: [
      {
        data: statusData.map(d => d.value),
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Line Chart Data
  const lineChartData = {
    labels: applicantData.map(d => d.month),
    datasets: [
      {
        label: 'Accepted',
        data: applicantData.map(d => d.accepted),
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#000',
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#000',
        },
        grid: {
          color: '#f0f0f0',
        },
      },
      y: {
        ticks: {
          color: '#000',
        },
        grid: {
          color: '#f0f0f0',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#000',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#000',
        bodyColor: '#000',
        borderColor: '#ccc',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(0);
            return `${label}: ${value} (${percentage}%)`;
          }
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500 text-sm mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-gray-900">1,030</p>
          <p className="text-green-600 text-sm mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500 text-sm mb-2">Acceptance Rate</h3>
          <p className="text-3xl font-bold text-gray-900">17.5%</p>
          <p className="text-green-600 text-sm mt-2">↑ 2.3% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500 text-sm mb-2">Active Job Orders</h3>
          <p className="text-3xl font-bold text-gray-900">45</p>
          <p className="text-red-600 text-sm mt-2">↓ 3 from last month</p>
        </div>
      </div>

      {/* Applicant Trends */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Applicant Trends</h2>
        <div style={{ height: '350px' }}>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Status Distribution</h2>
          <div style={{ height: '300px' }}>
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Acceptance Rate Trend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acceptance Rate Trend</h2>
          <div style={{ height: '300px' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
