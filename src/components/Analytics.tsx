import { useState, useEffect } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
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
} from "chart.js";
import { supabase } from "./supabaseClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface MonthlyData {
  month: string;
  applied: number;
  accepted: number;
  rejected: number;
  pending: number;
}

interface OverviewStats {
  totalApplications: number;
  acceptanceRate: number;
  activeJobOrders: number;
}

interface StatusCounts {
  applied: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
}

export default function Analytics({
  darkMode = false,
}: {
  darkMode?: boolean;
}) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    applied: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
  });
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalApplications: 0,
    acceptanceRate: 0,
    activeJobOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchMonthlyData(),
      fetchStatusCounts(),
      fetchOverviewStats(),
    ]);
    setLoading(false);
  };

  const fetchMonthlyData = async () => {
    const { data, error } = await supabase
      .from("t_applications")
      .select(
        `
        application_current_status,
        t_date!t_applications_applied_date_id_fkey(full_date, month_name, month_short, month_num, year)
      `,
      )
      .order("applied_date_id", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const grouped: Record<string, MonthlyData> = {};

    (data || []).forEach((row: any) => {
      // Access via t_date directly, not via the alias
      const dateRow =
        row["t_date!t_applications_applied_date_id_fkey"] || row.t_date;
      const monthShort =
        dateRow?.month_short || dateRow?.month_name?.slice(0, 3) || "?";
      const year = dateRow?.year || "";
      const key = `${monthShort} ${year}`;

      if (!grouped[key]) {
        grouped[key] = {
          month: `${monthShort} ${year}`,
          applied: 0,
          accepted: 0,
          rejected: 0,
          pending: 0,
        };
      }

      grouped[key].applied += 1;

      const status = row.application_current_status;
      if (status === "Accepted") grouped[key].accepted += 1;
      else if (status === "Rejected") grouped[key].rejected += 1;
      else grouped[key].pending += 1;
    });

    const sorted = Object.values(grouped).slice(-6);
    setMonthlyData(sorted);
  };

  const fetchStatusCounts = async () => {
    const [
      { count: applied },
      { count: shortlisted },
      { count: accepted },
      { count: rejected },
    ] = await Promise.all([
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Applied"),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Shortlist"),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Accepted"),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Rejected"),
    ]);

    setStatusCounts({
      applied: applied || 0,
      shortlisted: shortlisted || 0,
      accepted: accepted || 0,
      rejected: rejected || 0,
    });
  };

  const fetchOverviewStats = async () => {
    const [
      { count: totalApplications },
      { count: totalAccepted },
      { count: activeJobOrders },
    ] = await Promise.all([
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Accepted"),
      supabase
        .from("t_job_orders")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("is_posted", true),
    ]);

    const total = totalApplications || 0;
    const accepted = totalAccepted || 0;
    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;

    setOverviewStats({
      totalApplications: total,
      acceptanceRate,
      activeJobOrders: activeJobOrders || 0,
    });
  };

  const COLORS = ["#3B82F6", "#EAB308", "#22C55E", "#EF4444"];

  const barChartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Applied",
        data: monthlyData.map((d) => d.applied),
        backgroundColor: "#3B82F6",
      },
      {
        label: "Accepted",
        data: monthlyData.map((d) => d.accepted),
        backgroundColor: "#22C55E",
      },
      {
        label: "Rejected",
        data: monthlyData.map((d) => d.rejected),
        backgroundColor: "#EF4444",
      },
      {
        label: "Pending",
        data: monthlyData.map((d) => d.pending),
        backgroundColor: "#EAB308",
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Applied", "Shortlisted", "Accepted", "Rejected"],
    datasets: [
      {
        data: [
          statusCounts.applied,
          statusCounts.shortlisted,
          statusCounts.accepted,
          statusCounts.rejected,
        ],
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: darkMode ? "#1f2937" : "#fff",
      },
    ],
  };

  const lineChartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Accepted",
        data: monthlyData.map((d) => d.accepted),
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: darkMode ? "#fff" : "#000" } },
      tooltip: {
        backgroundColor: darkMode ? "#1F2937" : "#fff",
        titleColor: darkMode ? "#fff" : "#000",
        bodyColor: darkMode ? "#fff" : "#000",
        borderColor: darkMode ? "#374151" : "#ccc",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? "#9CA3AF" : "#000" },
        grid: { color: darkMode ? "#374151" : "#f0f0f0" },
      },
      y: {
        ticks: { color: darkMode ? "#9CA3AF" : "#000" },
        grid: { color: darkMode ? "#374151" : "#f0f0f0" },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: darkMode ? "#fff" : "#000", padding: 15 },
      },
      tooltip: {
        backgroundColor: darkMode ? "#1F2937" : "#fff",
        titleColor: darkMode ? "#fff" : "#000",
        bodyColor: darkMode ? "#fff" : "#000",
        borderColor: darkMode ? "#374151" : "#ccc",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(0) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`rounded-xl shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h3
            className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Total Applications
          </h3>
          <p
            className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {overviewStats.totalApplications.toLocaleString()}
          </p>
        </div>
        <div
          className={`rounded-xl shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h3
            className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Acceptance Rate
          </h3>
          <p
            className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {overviewStats.acceptanceRate.toFixed(1)}%
          </p>
        </div>
        <div
          className={`rounded-xl shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h3
            className={`text-sm mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Active Job Orders
          </h3>
          <p
            className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {overviewStats.activeJobOrders.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Applicant Trends */}
      <div
        className={`rounded-xl shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <h2
          className={`text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Applicant Trends
        </h2>
        {monthlyData.length === 0 ? (
          <p
            className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            No data available.
          </p>
        ) : (
          <div style={{ height: "350px" }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div
          className={`rounded-xl shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h2
            className={`text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Status Distribution
          </h2>
          {statusCounts.applied +
            statusCounts.shortlisted +
            statusCounts.accepted +
            statusCounts.rejected ===
          0 ? (
            <p
              className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              No data available.
            </p>
          ) : (
            <div style={{ height: "300px" }}>
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            </div>
          )}
        </div>

        {/* Acceptance Rate Trend */}
        <div
          className={`rounded-xl shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h2
            className={`text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Acceptance Rate Trend
          </h2>
          {monthlyData.length === 0 ? (
            <p
              className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              No data available.
            </p>
          ) : (
            <div style={{ height: "300px" }}>
              <Line data={lineChartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
