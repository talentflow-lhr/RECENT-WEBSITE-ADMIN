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

  useEffect(() => {
    fetchStats();
    fetchAtRiskJobOrders();
    fetchOpenPositionsData();
    fetchJobOrderAgeRangeData();
    fetchApplicantAgeData();
    fetchApplicantsPositionsData();
    fetchCompanyData();
    fetchApplicantsHiredPerDayData();
  }, []);

  const fetchStats = async () => {
    const [
      { count: totalJobOrders },
      { count: activeJobOrders },
      { count: openPositions },
      { count: totalApplicants },
      { count: shortlistedApplicants },
      { count: acceptedApplicants },
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
    ]);

    setStats({
      totalJobOrders: totalJobOrders || 0,
      activeJobOrders: activeJobOrders || 0,
      openPositions: openPositions || 0,
      totalApplicants: totalApplicants || 0,
      shortlistedApplicants: shortlistedApplicants || 0,
      acceptedApplicants: acceptedApplicants || 0,
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
      value: "4:1",
      color: "border-gray-300",
    },
  ];

  // Hardcoded chart data
  const getAnalyticsData = () => {
    switch (timePeriod) {
      case "month":
        return [
          { period: "Jan", closed: 45, hired: 38, open: 25 },
          { period: "Feb", closed: 52, hired: 44, open: 22 },
          { period: "Mar", closed: 48, hired: 40, open: 28 },
          { period: "Apr", closed: 55, hired: 47, open: 20 },
          { period: "May", closed: 60, hired: 52, open: 18 },
          { period: "Jun", closed: 58, hired: 50, open: 24 },
          { period: "Jul", closed: 62, hired: 54, open: 19 },
          { period: "Aug", closed: 65, hired: 58, open: 17 },
          { period: "Sep", closed: 59, hired: 51, open: 23 },
          { period: "Oct", closed: 68, hired: 60, open: 15 },
          { period: "Nov", closed: 72, hired: 64, open: 14 },
          { period: "Dec", closed: 70, hired: 62, open: 16 },
        ];
      case "quarter":
        return [
          { period: "Q1 2025", closed: 145, hired: 122, open: 75 },
          { period: "Q2 2025", closed: 173, hired: 149, open: 62 },
          { period: "Q3 2025", closed: 186, hired: 163, open: 59 },
          { period: "Q4 2025", closed: 210, hired: 186, open: 45 },
        ];
      case "ytd":
        return [
          { period: "Jan-Mar", closed: 145, hired: 122, open: 75 },
          { period: "Jan-Jun", closed: 318, hired: 271, open: 137 },
          { period: "Jan-Sep", closed: 504, hired: 434, open: 196 },
          { period: "Jan-Dec", closed: 714, hired: 620, open: 241 },
        ];
      case "year":
        return [
          { period: "2021", closed: 420, hired: 358, open: 180 },
          { period: "2022", closed: 495, hired: 425, open: 165 },
          { period: "2023", closed: 580, hired: 502, open: 148 },
          { period: "2024", closed: 658, hired: 572, open: 132 },
          { period: "2025", closed: 714, hired: 620, open: 124 },
        ];
      default:
        return [];
    }
  };

  const segmentOptions: Record<string, string[]> = {
    all: ["All"],
    pm: [
      "All",
      "John Smith",
      "Maria Garcia",
      "Ahmed Hassan",
      "Lisa Chen",
      "Robert Johnson",
    ],
    company: [
      "All",
      "Saudi 1",
      "Qatar 1",
      "Iraq 1",
      "Abu Dhabi",
      "Construction Co.",
      "Nursing Co.",
    ],
    country: [
      "All",
      "Saudi Arabia",
      "Qatar",
      "Iraq",
      "UAE",
      "Kuwait",
      "Bahrain",
    ],
    skill: [
      "All",
      "Construction",
      "Healthcare",
      "Manufacturing",
      "Hospitality",
      "IT Services",
      "Retail",
    ],
  };

  const getSegmentedData = () => {
    if (segmentBy === "all") return [];
    const segments: Record<string, any[]> = {
      pm: [
        { name: "John Smith", closed: 145, hired: 125, open: 42, rate: "89%" },
        {
          name: "Maria Garcia",
          closed: 138,
          hired: 118,
          open: 38,
          rate: "87%",
        },
        {
          name: "Ahmed Hassan",
          closed: 152,
          hired: 132,
          open: 35,
          rate: "91%",
        },
        { name: "Lisa Chen", closed: 128, hired: 110, open: 45, rate: "88%" },
        {
          name: "Robert Johnson",
          closed: 151,
          hired: 135,
          open: 40,
          rate: "92%",
        },
      ],
      company: [
        {
          name: "Saudi 1",
          closed: 156,
          hired: 142,
          open: 48,
          rate: "92%",
          projectOfficer: "MARTINEZ, Jenael S.",
        },
        {
          name: "Qatar 1",
          closed: 148,
          hired: 128,
          open: 52,
          rate: "88%",
          projectOfficer: "PANASANTOS, Emelie Jane",
        },
        {
          name: "Iraq 1",
          closed: 132,
          hired: 115,
          open: 45,
          rate: "90%",
          projectOfficer: "MANING, M. M.",
        },
        {
          name: "Abu Dhabi",
          closed: 125,
          hired: 108,
          open: 38,
          rate: "89%",
          projectOfficer: "SERVANO, Faith Risen",
        },
        {
          name: "Construction Co.",
          closed: 98,
          hired: 85,
          open: 42,
          rate: "87%",
          projectOfficer: "ILLY, Leny",
        },
        {
          name: "Nursing Co.",
          closed: 55,
          hired: 42,
          open: 16,
          rate: "85%",
          projectOfficer: "BALUYOT, Myson F.",
        },
      ],
      country: [
        {
          name: "Saudi Arabia",
          closed: 245,
          hired: 215,
          open: 72,
          rate: "91%",
        },
        { name: "Qatar", closed: 188, hired: 162, open: 58, rate: "89%" },
        { name: "UAE", closed: 165, hired: 142, open: 48, rate: "88%" },
        { name: "Iraq", closed: 78, hired: 68, open: 28, rate: "90%" },
        { name: "Kuwait", closed: 28, hired: 23, open: 12, rate: "85%" },
        { name: "Bahrain", closed: 10, hired: 10, open: 5, rate: "87%" },
      ],
      skill: [
        {
          name: "Construction",
          closed: 215,
          hired: 188,
          open: 65,
          rate: "90%",
        },
        { name: "Healthcare", closed: 182, hired: 158, open: 52, rate: "88%" },
        {
          name: "Manufacturing",
          closed: 145,
          hired: 125,
          open: 48,
          rate: "89%",
        },
        { name: "Hospitality", closed: 98, hired: 82, open: 38, rate: "86%" },
        { name: "IT Services", closed: 52, hired: 45, open: 18, rate: "92%" },
        { name: "Retail", closed: 22, hired: 22, open: 8, rate: "84%" },
      ],
    };
    return segments[segmentBy] || [];
  };

  // const applicantsPositionsData = [
  //   { name: "Jan", applicants: 35, positions: 25 },
  //   { name: "Feb", applicants: 18, positions: 22 },
  //   { name: "Mar", applicants: 28, positions: 18 },
  //   { name: "Apr", applicants: 15, positions: 20 },
  //   { name: "May", applicants: 25, positions: 15 },
  //   { name: "Jun", applicants: 22, positions: 25 },
  //   { name: "Jul", applicants: 18, positions: 12 },
  //   { name: "Aug", applicants: 28, positions: 20 },
  // ];

  // const companyData = [
  //   { company: "Saudi 1", unfilled: "n/a", percentage: "80%" },
  //   { company: "Qatar 1", unfilled: "n/a", percentage: "78%" },
  //   { company: "Iraq 1", unfilled: "n/a", percentage: "75%" },
  //   { company: "Saudi 2", unfilled: "11k", percentage: "62%" },
  //   { company: "Company 3", unfilled: "10k", percentage: "61%" },
  //   { company: "Company 4", unfilled: "n/a", percentage: "58%" },
  //   { company: "Abu Dhabi", unfilled: "7k", percentage: "55%" },
  //   { company: "Construction Co.", unfilled: "5k", percentage: "40%" },
  //   { company: "Nursing Co.", unfilled: "3k", percentage: "25%" },
  // ];

  // const openPositionsData = [
  //   { category: "Electronics", value: 45 },
  //   { category: "Healthcare", value: 35 },
  //   { category: "Prof Services", value: 30 },
  //   { category: "Business", value: 50 },
  // ];

  // const ageRangeData = [
  //   { range: "0-60 days", value: 40 },
  //   { range: "61-90 days", value: 35 },
  //   { range: "91-120 days", value: 25 },
  //   { range: "121+ days", value: 45 },
  // ];

  // const applicantAgeData = [
  //   { range: "18-24", value: 30 },
  //   { range: "25-29", value: 35 },
  //   { range: "30-34", value: 40 },
  //   { range: "35-39", value: 45 },
  //   { range: "40-44", value: 38 },
  //   { range: "45-49", value: 32 },
  //   { range: "50+", value: 50 },
  // ];

  const projectOfficerPerformance = [
    {
      name: "MARTINEZ, Jenael S.",
      totalJobs: 45,
      completed: 42,
      inProgress: 3,
      avgApplicants: 28,
      completionRate: 93.3,
      avgDaysToComplete: 22,
      atRiskJobs: 1,
    },
    {
      name: "PANASANTOS, Emelie Jane",
      totalJobs: 52,
      completed: 47,
      inProgress: 5,
      avgApplicants: 32,
      completionRate: 90.4,
      avgDaysToComplete: 25,
      atRiskJobs: 2,
    },
    {
      name: "MANING, M. M.",
      totalJobs: 38,
      completed: 35,
      inProgress: 3,
      avgApplicants: 26,
      completionRate: 92.1,
      avgDaysToComplete: 20,
      atRiskJobs: 1,
    },
    {
      name: "SERVANO, Faith Risen",
      totalJobs: 41,
      completed: 37,
      inProgress: 4,
      avgApplicants: 30,
      completionRate: 90.2,
      avgDaysToComplete: 24,
      atRiskJobs: 2,
    },
    {
      name: "ILLY, Leny",
      totalJobs: 33,
      completed: 30,
      inProgress: 3,
      avgApplicants: 24,
      completionRate: 90.9,
      avgDaysToComplete: 23,
      atRiskJobs: 1,
    },
    {
      name: "BALUYOT, Myson F.",
      totalJobs: 28,
      completed: 25,
      inProgress: 3,
      avgApplicants: 22,
      completionRate: 89.3,
      avgDaysToComplete: 26,
      atRiskJobs: 2,
    },
    {
      name: "GABAYERON, Princess",
      totalJobs: 35,
      completed: 31,
      inProgress: 4,
      avgApplicants: 25,
      completionRate: 88.6,
      avgDaysToComplete: 28,
      atRiskJobs: 3,
    },
    {
      name: "REYES, Carlos M.",
      totalJobs: 42,
      completed: 35,
      inProgress: 7,
      avgApplicants: 20,
      completionRate: 83.3,
      avgDaysToComplete: 32,
      atRiskJobs: 4,
    },
    {
      name: "SANTOS, Maria L.",
      totalJobs: 30,
      completed: 24,
      inProgress: 6,
      avgApplicants: 18,
      completionRate: 80.0,
      avgDaysToComplete: 35,
      atRiskJobs: 5,
    },
    {
      name: "CRUZ, Antonio R.",
      totalJobs: 25,
      completed: 19,
      inProgress: 6,
      avgApplicants: 16,
      completionRate: 76.0,
      avgDaysToComplete: 38,
      atRiskJobs: 5,
    },
    {
      name: "LOPEZ, Diana S.",
      totalJobs: 22,
      completed: 16,
      inProgress: 6,
      avgApplicants: 14,
      completionRate: 72.7,
      avgDaysToComplete: 42,
      atRiskJobs: 6,
    },
    {
      name: "GARCIA, Ramon P.",
      totalJobs: 20,
      completed: 14,
      inProgress: 6,
      avgApplicants: 12,
      completionRate: 70.0,
      avgDaysToComplete: 45,
      atRiskJobs: 6,
    },
  ];

  // const applicantsHiredPerDayData = [
  //   {
  //     date: "Mar 1",
  //     applicants: 12,
  //     hired: 8,
  //     applicantsPerDay: 12,
  //     hiredPerDay: 8,
  //   },
  //   {
  //     date: "Mar 2",
  //     applicants: 15,
  //     hired: 10,
  //     applicantsPerDay: 13.5,
  //     hiredPerDay: 9,
  //   },
  //   {
  //     date: "Mar 3",
  //     applicants: 8,
  //     hired: 5,
  //     applicantsPerDay: 11.7,
  //     hiredPerDay: 7.7,
  //   },
  //   {
  //     date: "Mar 4",
  //     applicants: 18,
  //     hired: 12,
  //     applicantsPerDay: 13.3,
  //     hiredPerDay: 8.8,
  //   },
  //   {
  //     date: "Mar 5",
  //     applicants: 22,
  //     hired: 15,
  //     applicantsPerDay: 15,
  //     hiredPerDay: 10,
  //   },
  //   {
  //     date: "Mar 6",
  //     applicants: 10,
  //     hired: 7,
  //     applicantsPerDay: 14.2,
  //     hiredPerDay: 9.5,
  //   },
  //   {
  //     date: "Mar 7",
  //     applicants: 14,
  //     hired: 9,
  //     applicantsPerDay: 14.1,
  //     hiredPerDay: 9.4,
  //   },
  //   {
  //     date: "Mar 8",
  //     applicants: 20,
  //     hired: 14,
  //     applicantsPerDay: 14.9,
  //     hiredPerDay: 10,
  //   },
  //   {
  //     date: "Mar 9",
  //     applicants: 16,
  //     hired: 11,
  //     applicantsPerDay: 15,
  //     hiredPerDay: 10.1,
  //   },
  //   {
  //     date: "Mar 10",
  //     applicants: 12,
  //     hired: 8,
  //     applicantsPerDay: 14.7,
  //     hiredPerDay: 9.9,
  //   },
  //   {
  //     date: "Mar 11",
  //     applicants: 18,
  //     hired: 13,
  //     applicantsPerDay: 15.1,
  //     hiredPerDay: 10.2,
  //   },
  //   {
  //     date: "Mar 12",
  //     applicants: 24,
  //     hired: 16,
  //     applicantsPerDay: 15.8,
  //     hiredPerDay: 10.7,
  //   },
  //   {
  //     date: "Mar 13",
  //     applicants: 11,
  //     hired: 7,
  //     applicantsPerDay: 15.4,
  //     hiredPerDay: 10.3,
  //   },
  //   {
  //     date: "Mar 14",
  //     applicants: 19,
  //     hired: 13,
  //     applicantsPerDay: 15.6,
  //     hiredPerDay: 10.5,
  //   },
  // ];

  const topPerformers = [...projectOfficerPerformance]
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 10);
  const atRiskOfficers = [...projectOfficerPerformance]
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 10);

  const analyticsData = getAnalyticsData();

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
        label: "Closed Job Orders",
        data: analyticsData.map((d) => d.closed),
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#16a34a",
      },
      {
        label: "Hired Applicants",
        data: analyticsData.map((d) => d.hired),
        borderColor: "#eab308",
        backgroundColor: "rgba(234, 179, 8, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: "#eab308",
      },
      {
        label: "Open Job Orders",
        data: analyticsData.map((d) => d.open),
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
                <option value="skill">Related Jobs/Skill</option>
              </select>
            </div>
            {segmentBy !== "all" && (
              <div className="flex items-center space-x-2">
                <label
                  className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Filter:
                </label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  {segmentOptions[segmentBy].map((option) => (
                    <option key={option} value={option}>
                      {option}
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
            <Line data={mainLineChartData} options={chartOptions} />
          </div>
        </div>

        {segmentBy !== "all" && (
          <div className="mt-6">
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
            >
              Breakdown by{" "}
              {segmentBy === "pm"
                ? "Project Manager"
                : segmentBy === "company"
                  ? "Company"
                  : segmentBy === "country"
                    ? "Country"
                    : "Skill"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      {segmentBy === "pm"
                        ? "Project Manager"
                        : segmentBy === "company"
                          ? "Company"
                          : segmentBy === "country"
                            ? "Country"
                            : "Skill"}
                    </th>
                    {segmentBy === "company" && (
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Project Officer
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Closed
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Hired
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Open
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                >
                  {getSegmentedData().map((item, index) => (
                    <tr
                      key={index}
                      className={
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }
                    >
                      <td
                        className={`px-4 py-3 text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                      >
                        {item.name}
                      </td>
                      {segmentBy === "company" && (
                        <td
                          className={`px-4 py-3 text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                        >
                          {item.projectOfficer || "—"}
                        </td>
                      )}
                      <td
                        className={`px-4 py-3 text-sm ${darkMode ? "text-green-400" : "text-green-600"} font-semibold`}
                      >
                        {item.closed}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${darkMode ? "text-yellow-400" : "text-yellow-600"} font-semibold`}
                      >
                        {item.hired}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${darkMode ? "text-orange-400" : "text-orange-600"} font-semibold`}
                      >
                        {item.open}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"} font-semibold`}
                      >
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
                    Avg Days
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {topPerformers.map((officer, index) => (
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
                      {officer.totalJobs}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-green-400" : "text-green-600"} font-semibold`}
                    >
                      {officer.completed}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm font-bold ${officer.completionRate >= 90 ? (darkMode ? "text-green-400" : "text-green-600") : darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                    >
                      {officer.completionRate.toFixed(1)}%
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {officer.avgDaysToComplete}
                    </td>
                  </tr>
                ))}
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
                    Avg Applicants
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {atRiskOfficers.map((officer, index) => (
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
                      {officer.inProgress}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-red-400" : "text-red-600"} font-bold`}
                    >
                      {officer.atRiskJobs}
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm font-bold ${officer.completionRate < 75 ? (darkMode ? "text-red-400" : "text-red-600") : darkMode ? "text-orange-400" : "text-orange-600"}`}
                    >
                      {officer.completionRate.toFixed(1)}%
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {officer.avgApplicants}
                    </td>
                  </tr>
                ))}
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
                      className={`px-3 py-3 text-center text-sm font-bold ${job.daysOpen > 130 ? (darkMode ? "text-red-400" : "text-red-600") : job.daysOpen > 115 ? (darkMode ? "text-orange-400" : "text-orange-600") : darkMode ? "text-yellow-400" : "text-yellow-600"}`}
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
                      className={`px-3 py-3 text-center text-sm font-bold ${job.completionRate < 20 ? (darkMode ? "text-red-400" : "text-red-600") : job.completionRate < 30 ? (darkMode ? "text-orange-400" : "text-orange-600") : darkMode ? "text-yellow-400" : "text-yellow-600"}`}
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
