{ /*Initial implementation of the Job Orders Analytics Dashboard.

Includes UI layout, charts, KPI cards, and partial Supabase integration (stats + at-risk job orders). Other sections currently use mock data and will be replaced with real queries in future updates.

TODO: complete backend integration, improve filtering logic, and add error handling. */}

import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import { supabase } from "./supabaseClient";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface DashboardStats {
  totalJobOrders: number;
  activeJobOrders: number;
  openPositions: number;
  totalApplicants: number;
  shortlistedApplicants: number;
  acceptedApplicants: number;
  currentApplicants: number;
}

interface OpenPositionCategory {
  category: string;
  value: number;
}

interface AgeRangeBucket {
  range: string;
  value: number;
}

interface ApplicantsPositionsPoint {
  name: string;
  applicants: number;
  positions: number;
}

interface CompanyRow {
  company: string;
  unfilled: number;
  percentage: number;
}

interface AtRiskJobOrder {
  jo_id: number;
  company: string;
  job_position: string;
  project_officer: string;
  days_open: number;
  days_until_deadline: number | null;
  applicants: number;
  target_applicants: number;
  completion_rate: number;
  status: string;
}

interface ApplicantsHiredPerDay {
  date: string;
  applicants: number;
  hired: number;
  applicantsPerDay: number;
  hiredPerDay: number;
}

interface MainAnalyticsRow {
  period: string;
  open_positions: number;
  closed_positions: number;
  hired_applicants: number;
}

interface BreakdownRow {
  segment_name:     string;
  closed_positions: number;
  hired_applicants: number;
  open_positions:   number;
  success_rate:     number;
}

interface ProjectOfficerRow {
  employee_id:         number;
  name:                string;
  total_jobs:          number;
  in_progress:         number;
  total_applicants:    number;
  accepted_applicants: number;
  total_needed:        number;
  completion_rate:     number;   // 0–100, already rounded to 1dp by SQL
  avg_applicants_day:  number;   // rounded to 2dp by SQL
  at_risk_jobs:        number;
}

export default function DashboardJobOrders({ darkMode = false }) {
  const [timePeriod, setTimePeriod] = useState("month");
  const [segmentBy, setSegmentBy] = useState("all");
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [stats, setStats] = useState<DashboardStats>({
    totalJobOrders: 0,
    activeJobOrders: 0,
    openPositions: 0,
    totalApplicants: 0,
    shortlistedApplicants: 0,
    acceptedApplicants: 0,
  });
  const [atRiskJobOrders, setAtRiskJobOrders] = useState<AtRiskJobOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPositionsData, setOpenPositionsData] = useState<OpenPositionCategory[]>([]);
  const [ageRangeData, setAgeRangeData] = useState<AgeRangeBucket[]>([]);
  const [applicantAgeData, setApplicantAgeData] = useState<AgeRangeBucket[]>([]);
  const [applicantsPositionsData, setApplicantsPositionsData] = useState<ApplicantsPositionsPoint[]>([]);
  const [companyData, setCompanyData] = useState<CompanyRow[]>([]);
  const [applicantsHiredPerDayData, setApplicantsHiredPerDayData] = useState<ApplicantsHiredPerDay[]>([]);

  const [analyticsData, setAnalyticsData] = useState<MainAnalyticsRow[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsFilters, setAnalyticsFilters] = useState({
    company_id:  null as number | null,
    category:    null as string | null,
    country:     null as string | null,
    employee_id: null as number | null,
  });
  const [companyOptions, setCompanyOptions] = useState<{ id: number; name: string }[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ id: number; name: string }[]>([]);
  const [breakdownData, setBreakdownData] = useState<BreakdownRow[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  type SegmentOption = { value: string; label: string };
  type SegmentOptionsMap = Record<string, SegmentOption[]>;

  const [officerData, setOfficerData] = useState<ProjectOfficerRow[]>([]);
  const [officerLoading, setOfficerLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAtRiskJobOrders();
    fetchOpenPositionsData();
    fetchJobOrderAgeRangeData();
    fetchApplicantAgeData();
    fetchApplicantsPositionsData();
    fetchCompanyData();
    fetchApplicantsHiredPerDayData();
    fetchFilterOptions();
    fetchMainAnalytics();
    fetchOfficerPerformance();
  }, []);

  // Re-fetch main chart when period or filters change
  useEffect(() => {
    fetchMainAnalytics();
  }, [timePeriod, analyticsFilters]);

  // Re-fetch breakdown when segment or filters change
  useEffect(() => {
    console.log('fetching breakdown for:', segmentBy, analyticsFilters);
    if (segmentBy !== "all") fetchBreakdown();
  }, [segmentBy, analyticsFilters]);

  // Re-fetch breakdown when segmentBy changes away from "all"
  // useEffect(() => {
  //   if (segmentBy !== "all") fetchBreakdown();
  // }, [segmentBy]);

  useEffect(() => {
  // Reset all filters to "All" when the segmentation type changes
  setAnalyticsFilters({
    company_id: null,
    category: null,
    country: null,
    employee_id: null,
  });
}, [segmentBy]);

  const fetchStats = async () => {
    const [
      { count: totalJobOrders },
      { count: activeJobOrders },
      { count: openPositions },
      { count: totalApplicants },
      { count: shortlistedApplicants },
      { count: acceptedApplicants },
      { data: currentApplicants },
    ] = await Promise.all([
      supabase.from("t_job_orders").select("*", { count: "exact", head: true }),
      supabase
        .from("t_job_orders")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("is_posted", true),
      supabase
        .from("t_job_positions")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Shortlist"),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Accepted"),
      supabase.rpc("get_current_applicants_count"),
    ]);

    setStats({
      totalJobOrders: totalJobOrders || 0,
      activeJobOrders: activeJobOrders || 0,
      openPositions: openPositions || 0,
      totalApplicants: totalApplicants || 0,
      shortlistedApplicants: shortlistedApplicants || 0,
      acceptedApplicants: acceptedApplicants || 0,
      currentApplicants: currentApplicants ?? 0,
    });
  };

  const fetchAtRiskJobOrders = async () => {
    const { data, error } = await supabase.rpc("get_at_risk_job_orders");
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }
    setAtRiskJobOrders(data || []);
    setLoading(false);
  };

  const applicantToPositionRatio = stats.openPositions > 0
    ? `${(stats.currentApplicants / stats.openPositions).toFixed(1)}:1`
    : "N/A";

  // Top Stats from real data
  const statCards = [
    {
      label: "Total Job Orders",
      value: stats.totalJobOrders.toLocaleString(),
      color: "border-purple-500",
    },
    {
      label: "Active Job Orders",
      value: stats.activeJobOrders.toLocaleString(),
      color: "border-green-500",
    },
    {
      label: "Open Positions",
      value: stats.openPositions.toLocaleString(),
      color: "border-blue-500",
    },
    {
      label: "Total Applicants",
      value: stats.totalApplicants.toLocaleString(),
      color: "border-yellow-500",
    },
    {
      label: "Shortlisted Applicants",
      value: stats.shortlistedApplicants.toLocaleString(),
      color: "border-purple-400",
    },
    {
      label: "Accepted Applicants",
      value: stats.acceptedApplicants.toLocaleString(),
      color: "border-green-400",
    },
    // Hardcoded for now
    { label: "Active Deployees", value: "67.42%", color: "border-gray-300" },
    {
      label: "Current Applicants to Pending Ratio",
      value: applicantToPositionRatio,
      color: "border-gray-300",
    },
  ];

  const segmentOptions: SegmentOptionsMap = {
    all:     [{ value: "All", label: "All" }],
    pm:      [
      { value: "All", label: "All" },
      ...employeeOptions.map(e => ({
        value: e.id.toString(),   // employee_id as string (for select value)
        label: e.name,            // display name
      })),
    ],
    company: [
      { value: "All", label: "All" },
      ...companyOptions.map(c => ({
        value: c.id.toString(),   // company_id as string
        label: c.name,
      })),
    ],
    country: [
      { value: "All", label: "All" },
      ...countryOptions.map(country => ({
        value: country,
        label: country,
      })),
    ],
    category:   [
      { value: "All", label: "All" },
      ...categoryOptions.map(cat => ({
        value: cat,
        label: cat,
      })),
    ],
  };

  const getCurrentFilterValue = (): string => {
    switch (segmentBy) {
      case "pm":
        return analyticsFilters.employee_id?.toString() ?? "All";
      case "company":
        return analyticsFilters.company_id?.toString() ?? "All";
      case "country":
        return analyticsFilters.country ?? "All";
      case "category":
        return analyticsFilters.category ?? "All";
      default:
        return "All";
    }
  };

  const handleFilterChange = (value: string) => {
    setAnalyticsFilters(prev => {
      const next = { ...prev };
      switch (segmentBy) {
        case "pm":
          next.employee_id = value === "All" ? null : Number(value);
          break;
        case "company":
          next.company_id = value === "All" ? null : Number(value);
          break;
        case "country":
          next.country = value === "All" ? null : value;
          break;
        case "category":
          next.category = value === "All" ? null : value;
          break;
      }
      console.log('new filters:', next);
      return next;
    });
  };

  const getSegmentedData = () => breakdownData.map(row => ({
    name:            row.segment_name,
    closed:          row.closed_positions,
    hired:           row.hired_applicants,
    open:            row.open_positions,
    rate:            `${row.success_rate}%`,
    projectOfficer:  undefined,
  }));

  const topPerformers  = [...officerData].sort((a, b) => b.completion_rate - a.completion_rate).slice(0, 10);
  const atRiskOfficers = [...officerData].sort((a, b) => a.completion_rate - b.completion_rate).slice(0, 10);

  const fetchOpenPositionsData = async () => {
    const { data, error } = await supabase.rpc("get_open_positions_by_category");
    if (error || !data) return;
    setOpenPositionsData(data);
  };

  const fetchJobOrderAgeRangeData = async () => {
    const { data, error } = await supabase.rpc("get_job_order_age_range_data");
    if (error || !data) return;
    setAgeRangeData(data);
  };

  const fetchApplicantAgeData = async () => {
    const { data, error } = await supabase.rpc("get_applicant_age_data");
    if (error || !data) return;
    setApplicantAgeData(data);
  };

  const fetchApplicantsPositionsData = async () => {
    const { data, error } = await supabase.rpc("get_applicants_positions_data");
    if (error || !data) return;
    setApplicantsPositionsData(data);
  };

  const fetchCompanyData = async () => {
    const { data, error } = await supabase.rpc("get_company_data");
    if (error || !data) return;
    setCompanyData(data);
  };

  const fetchApplicantsHiredPerDayData = async () => {
    const { data, error } = await supabase.rpc("get_applicants_hired_per_day", { days_back: 14 });
    if (error) {
      console.error(error);
      return;
    }
    setApplicantsHiredPerDayData(data || []);
  };

  const fetchFilterOptions = async () => {
    const [
      { data: companies },
      { data: categories },
      { data: countries },
      { data: employees },
    ] = await Promise.all([
      supabase.from("t_companies").select("company_id, company_name").order("company_name"),
      supabase.from("t_job_positions").select("job_category").not("job_category", "is", null),
      supabase.from("t_job_orders").select("jo_country").not("jo_country", "is", null),
      supabase
        .from("t_employee")
        .select("employee_id, employee_first_name, employee_last_name")
        .eq("employee_is_active", true),
    ]);

    if (companies) {
      setCompanyOptions(companies.map(c => ({ id: c.company_id, name: c.company_name ?? "" })));
    }
    if (categories) {
      const unique = Array.from(new Set(categories.map(c => c.job_category).filter(Boolean))) as string[];
      setCategoryOptions(unique.sort());
    }
    if (countries) {
      const unique = Array.from(new Set(countries.map(c => c.jo_country).filter(Boolean))) as string[];
      setCountryOptions(unique.sort());
    }
    if (employees) {
      setEmployeeOptions(
        employees.map(e => ({
          id: e.employee_id,
          name: `${e.employee_last_name ?? ""}, ${e.employee_first_name ?? ""}`.trim(),
        }))
      );
    }
  };

  const fetchMainAnalytics = async () => {
    setAnalyticsLoading(true);
    const { data, error } = await supabase.rpc("get_rolling_jo_counts", {
      p_period:      timePeriod,
      p_company_id:  analyticsFilters.company_id,
      p_category:    analyticsFilters.category,
      p_country:     analyticsFilters.country,
      p_employee_id: analyticsFilters.employee_id,
    });
    if (error) {
      console.error("get_rolling_jo_counts error:", JSON.stringify(error, null, 2));
    } else {
      setAnalyticsData(data ?? []);
    }
    setAnalyticsLoading(false);
  };

  const fetchBreakdown = async () => {
    if (segmentBy === "all") return;
    setBreakdownLoading(true);
    const { data, error } = await supabase.rpc("get_analytics_breakdown", {
      p_segment_by:  segmentBy,
      p_company_id:  analyticsFilters.company_id,
      p_category:    analyticsFilters.category,
      p_country:     analyticsFilters.country,
      p_employee_id: analyticsFilters.employee_id,
    });
    if (error) {
      console.error("get_analytics_breakdown error:", JSON.stringify(error, null, 2));
    } else {
      setBreakdownData(data ?? []);
    }
    setBreakdownLoading(false);
  };

  const fetchOfficerPerformance = async () => {
    setOfficerLoading(true);
    const { data, error } = await supabase.rpc("get_project_officer_performance");
    if (error) {
      console.error("get_project_officer_performance error:", JSON.stringify(error, null, 2));
    } else {
      setOfficerData(data ?? []);
    }
    setOfficerLoading(false);
  };

  const totalApplicants = applicantsHiredPerDayData.reduce((sum, d) => sum + d.applicants, 0);
  const totalHired = applicantsHiredPerDayData.reduce((sum, d) => sum + d.hired, 0);
  const avgApplicantsPerDay = applicantsHiredPerDayData.at(-1)?.applicantsPerDay ?? 0;
  const avgHiredPerDay = applicantsHiredPerDayData.at(-1)?.hiredPerDay ?? 0;
  const conversionRate = totalApplicants > 0
    ? Math.round((totalHired / totalApplicants) * 100 * 10) / 10
    : 0;

  const mainLineChartData = {
    labels: analyticsData.map((d) => d.period),
    datasets: [
      {
        label: "Closed Positions",
        data: analyticsData.map((d) => d.closed_positions),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#16a34a",
      },
      {
        label: "Hired Applicants",
        data: analyticsData.map((d) => d.hired_applicants),
        borderColor: "#eab308",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#eab308",
      },
      {
        label: "Open Positions",
        data: analyticsData.map((d) => d.open_positions),
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#f97316",
      },
    ],
  };

  const applicantsBarChartData = {
    labels: applicantsPositionsData.map((d) => d.name),
    datasets: [
      {
        label: "Applicants",
        data: applicantsPositionsData.map((d) => d.applicants),
        backgroundColor: "#FFA500",
        borderRadius: 8,
      },
      {
        label: "Open Positions",
        data: applicantsPositionsData.map((d) => d.positions),
        backgroundColor: "#FFD700",
        borderRadius: 8,
      },
    ],
  };

  const dailyChartData = {
    labels: applicantsHiredPerDayData.map((d) => d.date),
    datasets: [
      {
        type: "bar" as const,
        label: "Daily Applicants",
        data: applicantsHiredPerDayData.map((d) => d.applicants),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
      {
        type: "bar" as const,
        label: "Daily Hired",
        data: applicantsHiredPerDayData.map((d) => d.hired),
        backgroundColor: "#16a34a",
        borderRadius: 4,
      },
      {
        type: "line" as const,
        label: "Applicants/Day Avg",
        data: applicantsHiredPerDayData.map((d) => d.applicantsPerDay),
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#a855f7",
      },
      {
        type: "line" as const,
        label: "Hired/Day Avg",
        data: applicantsHiredPerDayData.map((d) => d.hiredPerDay),
        borderColor: "#eab308",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#eab308",
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
        borderColor: darkMode ? "#374151" : "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? "#9CA3AF" : "#374151", font: { size: 12 } },
        grid: { color: darkMode ? "#374151" : "#e5e7eb" },
      },
      y: {
        ticks: { color: darkMode ? "#9CA3AF" : "#374151", font: { size: 12 } },
        grid: { color: darkMode ? "#374151" : "#e5e7eb" },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
        ticks: { color: darkMode ? "#9CA3AF" : "#000", font: { size: 12 } },
        grid: { color: darkMode ? "#374151" : "#f0f0f0" },
      },
      y: {
        ticks: { color: darkMode ? "#9CA3AF" : "#000", font: { size: 12 } },
        grid: { color: darkMode ? "#374151" : "#f0f0f0" },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Main Business Analytics Section */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
      >
        <div className="mb-6">
          <h2
            className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Main Business Analytics
          </h2>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <label
                className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Period:
              </label>
              <div className={`flex space-x-1 rounded-lg p-1 ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                {["month", "quarter", "ytd", "year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      timePeriod === period
                        ? "bg-green-600 text-white"
                        : darkMode
                          ? "text-gray-300 hover:bg-gray-600"
                          : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {period === "ytd"
                      ? "YTD"
                      : period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label
                className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Segment By:
              </label>
              <select
                value={segmentBy}
                onChange={(e) => {
                  setSegmentBy(e.target.value);
                  setSelectedSegment("All");
                }}
                className={`px-3 py-1.5 text-sm border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                <option value="all">All Data</option>
                <option value="pm">Project Manager</option>
                <option value="company">Company/Employer</option>
                <option value="country">Country</option>
                <option value="category">Related Jobs/Skill</option>
              </select>
            </div>
            {segmentBy !== "all" && (
              <div className="flex items-center space-x-2">
                <label className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Filter:
                </label>
                <select
                  value={getCurrentFilterValue()}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  {segmentOptions[segmentBy].map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Job Orders: Closed/Hired vs Open
          </h3>
          <div className="flex items-center space-x-6 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Closed Job Orders
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Hired Applicants
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Open Job Orders
              </span>
            </div>
          </div>
          <div style={{ height: "350px" }}>
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-full">
                <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Loading…
                </span>
              </div>
            ) : (
              <Line data={mainLineChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {segmentBy !== "all" && (
          <div className="mt-6">
            <h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}>
              Breakdown by{" "}
              {segmentBy === "pm" ? "Project Manager"
                : segmentBy === "company" ? "Company"
                : segmentBy === "country" ? "Country"
                : "Category"}
            </h3>
            {breakdownLoading ? (
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        {segmentBy === "pm" ? "Project Manager"
                          : segmentBy === "company" ? "Company"
                          : segmentBy === "country" ? "Country"
                          : "Category"}
                      </th>
                      {segmentBy === "company" && (
                        <th className="px-4 py-3 text-left text-sm font-semibold">Project Officer</th>
                      )}
                      <th className="px-4 py-3 text-left text-sm font-semibold">Closed</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Hired</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Open</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    {getSegmentedData().map((item, index) => (
                      <tr key={index} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                        <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                          {item.name}
                        </td>
                        {segmentBy === "company" && (
                          <td className={`px-4 py-3 text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {item.projectOfficer || "—"}
                          </td>
                        )}
                        <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                          {item.closed.toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                          {item.hired.toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                          {item.open.toLocaleString()}
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                          {item.rate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm p-6 border-2 ${stat.color}`}
          >
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}
            >
              {stat.label}
            </p>
            <p
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {loading ? "..." : stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Applicants and Available Positions
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  Applicants
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  Open Positions
                </span>
              </div>
            </div>
          </div>
          <div style={{ height: "280px" }}>
            <Bar data={applicantsBarChartData} options={barChartOptions} />
          </div>
        </div>

        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Company
            </h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded font-semibold">
                Unfilled Positions
              </button>
              <button
                className={`px-3 py-1 text-xs ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"} rounded font-semibold`}
              >
                % Unfilled Positions
              </button>
            </div>
          </div>
          <div className="overflow-auto max-h-[280px]">
            <table className="w-full">
              <thead
                className={`sticky top-0 ${darkMode ? "bg-gray-800" : "bg-white"}`}
              >
                <tr
                  className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <th
                    className={`px-3 py-2 text-left text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Company
                  </th>
                  <th
                    className={`px-3 py-2 text-left text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Unfilled Positions
                  </th>
                  <th
                    className={`px-3 py-2 text-left text-xs font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    % Unfilled
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-100"}`}
              >
                {companyData.map((item, index) => (
                  <tr
                    key={index}
                    className={
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td
                      className={`px-3 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {item.company}
                    </td>
                    <td
                      className={`px-3 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {item.unfilled > 0 ? item.unfilled.toLocaleString() : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Three Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Distribution of Open Positions
          </h3>
          <div className="space-y-3">
            {openPositionsData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {item.category}
                  </span>
                  <span
                    className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {item.value}
                  </span>
                </div>
                <div
                  className={`h-8 ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Job Orders per Age Range
          </h3>
          <div className="space-y-3">
            {ageRangeData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {item.range}
                  </span>
                  <span
                    className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {item.value}
                  </span>
                </div>
                <div
                  className={`h-8 ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Binned Age of Applicants
          </h3>
          <div className="space-y-3">
            {applicantAgeData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {item.range}
                  </span>
                  <span
                    className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {item.value}
                  </span>
                </div>
                <div
                  className={`h-8 ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Officer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm border`}
        >
          <div className="p-6 border-b border-green-500">
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              🏆 Top 10 Best Performing Project Officers
            </h3>
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
            >
              Ranked by completion rate
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">
                    Rank
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">
                    Project Officer
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Total Jobs
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Completed
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Completion %
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Avg App/Day
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {
                  officerLoading ? (
                    <tr>
                      <td colSpan={6} className={`px-6 py-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Loading...
                      </td>
                    </tr>
                  ) : (
                  topPerformers.map((officer, index) => (
                  <tr
                    key={index}
                    className={
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td
                      className={`px-3 py-3 text-sm font-bold ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                    >
                      #{index + 1}
                    </td>
                    <td
                      className={`px-3 py-3 text-xs ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {officer.name}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {officer.total_jobs}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-green-400" : "text-green-600"} font-semibold`}
                    >
                      {officer.total_jobs - officer.in_progress}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm font-bold ${officer.completion_rate >= 90 ? (darkMode ? "text-green-400" : "text-green-600") : darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                    >
                      {officer.completion_rate.toFixed(1)}%
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {officer.avg_applicants_day}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm border`}
        >
          <div className="p-6 border-b border-red-500">
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              ⚠️ Top 10 At-Risk Project Officers
            </h3>
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
            >
              Ranked by lowest completion rate
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold">
                    Rank
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">
                    Project Officer
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    In Progress
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    At-Risk Jobs
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Completion %
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Avg App/Day
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {
                  officerLoading ? (
                    <tr>
                      <td colSpan={6} className={`px-6 py-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Loading...
                      </td>
                    </tr>
                  ) : (
                  atRiskOfficers.map((officer, index) => (
                  <tr
                    key={index}
                    className={
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td
                      className={`px-3 py-3 text-sm font-bold ${darkMode ? "text-red-400" : "text-red-600"}`}
                    >
                      #{index + 1}
                    </td>
                    <td
                      className={`px-3 py-3 text-xs ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {officer.name}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-orange-400" : "text-orange-600"} font-semibold`}
                    >
                      {officer.in_progress}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-red-400" : "text-red-600"} font-bold`}
                    >
                      {officer.at_risk_jobs}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm font-bold ${officer.completion_rate < 75 ? (darkMode ? "text-red-400" : "text-red-600") : darkMode ? "text-orange-400" : "text-orange-600"}`}
                    >
                      {officer.completion_rate.toFixed(1)}%
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {officer.avg_applicants_day}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* At-Risk Job Orders - NOW FROM SUPABASE */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
      >
        <div className="mb-4">
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            At-Risk Job Orders (Based on Time Open)
          </h3>
          <p
            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
          >
            Job orders with extended open duration and low completion rates
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold">
                  Job Order ID
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold">
                  Company
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold">
                  Position
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold">
                  Point Person
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  Days Open
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  Applicants
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  Target
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold">
                  Completion %
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
            >
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`px-6 py-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Loading...
                  </td>
                </tr>
              ) : atRiskJobOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`px-6 py-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No at-risk job orders found.
                  </td>
                </tr>
              ) : (
                atRiskJobOrders.map((job, index) => (
                  <tr
                    key={index}
                    className={
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          job.status === "Critical"
                            ? "bg-red-100 text-red-800"
                            : job.status === "High Risk"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-3 text-xs font-mono ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {job.jo_id}
                    </td>
                    <td
                      className={`px-3 py-3 text-xs ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {job.company}
                    </td>
                    <td
                      className={`px-3 py-3 text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {job.job_position}
                    </td>
                    <td
                      className={`px-3 py-3 text-xs ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {job.project_officer}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm font-bold ${job.days_open  > 130 ? (darkMode ? "text-red-400" : "text-red-600") : job.days_open > 115 ? (darkMode ? "text-orange-400" : "text-orange-600") : darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                    >
                      {job.days_open}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {job.applicants}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {job.target_applicants}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm font-bold ${job.completion_rate < 20 ? (darkMode ? "text-red-400" : "text-red-600") : job.completion_rate < 30 ? (darkMode ? "text-orange-400" : "text-orange-600") : darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                    >
                      {job.completion_rate}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicants and Hired per Day */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
      >
        <div className="mb-6">
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Applicants/Day and Hired/Day Ratio
          </h3>
          <p
            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
          >
            Daily tracking of applicant intake and hiring velocity
          </p>
        </div>
        <div className="mb-6">
          <div className="flex items-center space-x-6 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Daily Applicants
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-600"></div>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Daily Hired
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Applicants/Day (Rolling Avg)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Hired/Day (Rolling Avg)
              </span>
            </div>
          </div>
          <div style={{ height: "350px" }}>
            <Bar data={dailyChartData} options={chartOptions} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Avg Applicants/Day",
              value: avgApplicantsPerDay.toFixed(1),
              color: darkMode ? "bg-blue-900/30" : "bg-blue-50",
              textColor: darkMode ? "text-blue-400" : "text-blue-600",
            },
            {
              label: "Avg Hired/Day",
              value: avgHiredPerDay.toFixed(1),
              color: darkMode ? "bg-green-900/30" : "bg-green-50",
              textColor: darkMode ? "text-green-400" : "text-green-600",
            },
            {
              label: "Conversion Rate",
              value: `${conversionRate}%`,
              color: darkMode ? "bg-purple-900/30" : "bg-purple-50",
              textColor: darkMode ? "text-purple-400" : "text-purple-600",
            },
            {
              label: `Total Period (${applicantsHiredPerDayData.length} days)`,
              value: `${totalApplicants} / ${totalHired}`,
              color: darkMode ? "bg-yellow-900/30" : "bg-yellow-50",
              textColor: darkMode ? "text-yellow-400" : "text-yellow-600",
            },
          ].map(({ label, value, color, textColor }) => (
            <div key={label} className={`p-4 rounded-lg ${color}`}>
              <p
                className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}
              >
                {label}
              </p>
              <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
              {label === "Total Period (14 days)" && (
                <p className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mt-1`}>
                  Applicants / Hired
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
