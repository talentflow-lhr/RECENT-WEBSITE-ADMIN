import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
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
  totalUsers: number;
  usersWithResume: number;
  totalApplicants: number;
  acceptedApplicants: number;
}

interface GenderData {
  male: number;
  female: number;
  other: number;
}

interface AgeData {
  range: string;
  count: number;
}

interface MonthlyRegistration {
  month: string;
  users: number;
}

interface IndustryData {
  industry: string;
  users: number;
  slots: number;
}

interface LocationData {
  location: string;
  users: number;
}

interface RecentApplicant {
  applicant_id: number;
  app_last_name: string;
  app_first_name: string;
  app_email: string;
  app_present_tele_mobile: string;
  app_gender: string;
  app_nationality: string;
  is_active: boolean;
  applied_date: string;
}

export default function Dashboard({
  darkMode = false,
}: {
  darkMode?: boolean;
}) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    usersWithResume: 0,
    totalApplicants: 0,
    acceptedApplicants: 0,
  });
  const [genderData, setGenderData] = useState<GenderData>({
    male: 0,
    female: 0,
    other: 0,
  });
  const [ageData, setAgeData] = useState<AgeData[]>([]);
  const [monthlyRegistrations, setMonthlyRegistrations] = useState<
    MonthlyRegistration[]
  >([]);
  const [industryData, setIndustryData] = useState<IndustryData[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchGenderData(),
      fetchAgeData(),
      fetchMonthlyRegistrations(),
      fetchIndustryData(),
      fetchLocationData(),
      fetchRecentApplicants(),
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [
      { count: totalUsers },
      { count: usersWithResume },
      { count: totalApplicants },
      { count: acceptedApplicants },
    ] = await Promise.all([
      supabase.from("t_account").select("*", { count: "exact", head: true }),
      supabase.from("t_resume").select("*", { count: "exact", head: true }),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("t_applications")
        .select("*", { count: "exact", head: true })
        .eq("application_current_status", "Accepted"),
    ]);

    setStats({
      totalUsers: totalUsers || 0,
      usersWithResume: usersWithResume || 0,
      totalApplicants: totalApplicants || 0,
      acceptedApplicants: acceptedApplicants || 0,
    });
  };

  const fetchGenderData = async () => {
    const { data, error } = await supabase
      .from("t_applicant")
      .select("app_gender");

    if (error || !data) return;

    const counts = { male: 0, female: 0, other: 0 };
    data.forEach((row: any) => {
      const g = (row.app_gender || "").toLowerCase();
      if (g === "male") counts.male++;
      else if (g === "female") counts.female++;
      else counts.other++;
    });

    setGenderData(counts);
  };

  const fetchAgeData = async () => {
    const { data, error } = await supabase
      .from("t_applicant")
      .select("app_dob_year");

    if (error || !data) return;

    const currentYear = new Date().getFullYear();
    const bins: Record<string, number> = {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45-54": 0,
      "55+": 0,
    };

    data.forEach((row: any) => {
      if (!row.app_dob_year) return;
      const age = currentYear - row.app_dob_year;
      if (age >= 18 && age <= 24) bins["18-24"]++;
      else if (age >= 25 && age <= 34) bins["25-34"]++;
      else if (age >= 35 && age <= 44) bins["35-44"]++;
      else if (age >= 45 && age <= 54) bins["45-54"]++;
      else if (age >= 55) bins["55+"]++;
    });

    setAgeData(
      Object.entries(bins).map(([range, count]) => ({ range, count })),
    );
  };

  const fetchMonthlyRegistrations = async () => {
    const { data, error } = await supabase.from("t_account").select(`
        account_id,
        t_applicant!t_account_applicant_id_fkey(applicant_id)
      `);

    // Since t_account doesn't have a created_at date in your schema,
    // we'll count registrations from t_applications applied_date as a proxy
    const { data: appData, error: appError } = await supabase
      .from("t_applications")
      .select(
        `
        application_id,
        applied_date:t_date!t_applications_applied_date_id_fkey(month_short, year)
      `,
      )
      .order("applied_date_id", { ascending: true });

    if (appError || !appData) return;

    const grouped: Record<string, number> = {};
    appData.forEach((row: any) => {
      const dateRow =
        row["applied_date"] ||
        row["t_date!t_applications_applied_date_id_fkey"];
      const month = dateRow?.month_short || "?";
      const year = dateRow?.year || "";
      const key = `${month} ${year}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const result = Object.entries(grouped)
      .slice(-6)
      .map(([month, users]) => ({ month, users }));

    setMonthlyRegistrations(result);
  };

  const fetchIndustryData = async () => {
    const { data, error } = await supabase.from("t_job_positions").select(`
        job_category,
        job_number_needed,
        t_applications(application_id)
      `);

    if (error || !data) return;

    const grouped: Record<string, { users: number; slots: number }> = {};
    data.forEach((row: any) => {
      const category = row.job_category || "Other";
      if (!grouped[category]) grouped[category] = { users: 0, slots: 0 };
      grouped[category].users += (row.t_applications || []).length;
      grouped[category].slots += row.job_number_needed || 0;
    });

    const result = Object.entries(grouped)
      .map(([industry, { users, slots }]) => ({ industry, users, slots }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 6);

    setIndustryData(result);
  };

  const fetchLocationData = async () => {
    const { data, error } = await supabase
      .from("t_applicant")
      .select("app_present_address_city, app_present_address_province");

    if (error || !data) return;

    const grouped: Record<string, number> = {};
    data.forEach((row: any) => {
      const location =
        row.app_present_address_city ||
        row.app_present_address_province ||
        "Unknown";
      grouped[location] = (grouped[location] || 0) + 1;
    });

    const result = Object.entries(grouped)
      .map(([location, users]) => ({ location, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);

    setLocationData(result);
  };

  const fetchRecentApplicants = async () => {
    const { data, error } = await supabase
      .from("t_applications")
      .select(
        `
        application_id,
        application_current_status,
        applied_date:t_date!t_applications_applied_date_id_fkey(full_date),
        t_applicant(
          applicant_id,
          app_first_name,
          app_last_name,
          app_email,
          app_present_tele_mobile,
          app_gender,
          app_nationality
        ),
        t_account:t_applicant!t_applications_applicant_id_fkey(
          t_account(is_active)
        )
      `,
      )
      .order("applied_date_id", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      return;
    }

    const mapped: RecentApplicant[] = (data || []).map((row: any) => ({
      applicant_id: row.t_applicant?.applicant_id,
      app_last_name: row.t_applicant?.app_last_name || "",
      app_first_name: row.t_applicant?.app_first_name || "",
      app_email: row.t_applicant?.app_email || "",
      app_present_tele_mobile: row.t_applicant?.app_present_tele_mobile || "",
      app_gender: row.t_applicant?.app_gender || "",
      app_nationality: row.t_applicant?.app_nationality || "",
      is_active: true,
      applied_date: row.applied_date?.full_date || "",
    }));

    // Keep only the first (most recent) occurrence of each applicant_id
    const seen = new Set<number>();
    const deduped = mapped.filter((row) => {
      if (!row.applicant_id || seen.has(row.applicant_id)) return false;
      seen.add(row.applicant_id);
      return true;
    });

    setRecentApplicants(deduped.slice(0, 10));
  };

  const totalGender = genderData.male + genderData.female + genderData.other;
  const maxAge = Math.max(...ageData.map((a) => a.count), 1);

  const statCards = [
    {
      label: "Total Registered Users",
      value: stats.totalUsers.toLocaleString(),
    },
    {
      label: "% Users who Applied",
      value:
        stats.totalUsers > 0
          ? `${((stats.totalApplicants / stats.totalUsers) * 100).toFixed(1)}%`
          : "0%",
    },
    {
      label: "% Users Hired",
      value:
        stats.totalUsers > 0
          ? `${((stats.acceptedApplicants / stats.totalUsers) * 100).toFixed(1)}%`
          : "0%",
    },
    {
      label: "Total Applications",
      value: stats.totalApplicants.toLocaleString(),
    },
    {
      label: "% Users with Resume",
      value:
        stats.totalUsers > 0
          ? `${((stats.usersWithResume / stats.totalUsers) * 100).toFixed(1)}%`
          : "0%",
    },
    {
      label: "Accepted Applicants",
      value: stats.acceptedApplicants.toLocaleString(),
    },
  ];

  const lineChartData = {
    labels: monthlyRegistrations.map((d) => d.month),
    datasets: [
      {
        label: "Applications",
        data: monthlyRegistrations.map((d) => d.users),
        borderColor: "#FFA500",
        backgroundColor: "rgba(255, 165, 0, 0.1)",
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#FFA500",
      },
    ],
  };

  const barChartData = {
    labels: industryData.map((d) => d.industry),
    datasets: [
      {
        label: "Applicants",
        data: industryData.map((d) => d.users),
        backgroundColor: "#FFA500",
        borderRadius: 8,
      },
      {
        label: "Slots",
        data: industryData.map((d) => d.slots),
        backgroundColor: "#FFD700",
        borderRadius: 8,
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
        ticks: { color: darkMode ? "#9CA3AF" : "#000", font: { size: 12 } },
        grid: { color: darkMode ? "#374151" : "#f0f0f0" },
      },
      y: {
        ticks: { color: darkMode ? "#9CA3AF" : "#000", font: { size: 12 } },
        grid: { color: darkMode ? "#374151" : "#f0f0f0" },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-green-200"} rounded-2xl shadow-sm p-6 border-2`}
          >
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-2`}
            >
              {stat.label}
            </p>
            <p
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Line Chart */}
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Monthly Applications
            </h3>
            <div className={`flex items-center space-x-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <span>By:</span>
              <select className={`text-sm border rounded px-2 py-1 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}>
                <option>Last 6 Months</option>
              </select>
            </div>
          </div>
          {monthlyRegistrations.length === 0 ? (
            <p
              className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              No data available.
            </p>
          ) : (
            <div style={{ height: "250px" }}>
              <Line data={lineChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Gender and Age */}
        <div className="space-y-6">
          {/* Users by Gender */}
          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
          >
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
            >
              Applicants by Gender
            </h3>
            <div className="space-y-3">
              {[
                {
                  label: "Male",
                  count: genderData.male,
                  color: "bg-green-500",
                },
                {
                  label: "Female",
                  count: genderData.female,
                  color: "bg-yellow-400",
                },
                {
                  label: "Other",
                  count: genderData.other,
                  color: "bg-blue-400",
                },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {label}
                    </span>
                    <span
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    className={`h-6 ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-full overflow-hidden`}
                  >
                    <div
                      className={`h-full ${color}`}
                      style={{
                        width:
                          totalGender > 0
                            ? `${(count / totalGender) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users by Age */}
          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
          >
            <h3
              className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
            >
              Applicants by Age
            </h3>
            <div className="space-y-2">
              {ageData.map((item) => (
                <div key={item.range}>
                  <div className="flex justify-between text-sm mb-1">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {item.range}
                    </span>
                    <span
                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <div
                    className={`h-5 ${darkMode ? "bg-gray-700" : "bg-gray-100"} rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-green-400"
                      style={{ width: `${(item.count / maxAge) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Industry Chart and Location Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users By Industry */}
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Applicants By Job Category
          </h3>
          {industryData.length === 0 ? (
            <p
              className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              No data available.
            </p>
          ) : (
            <div style={{ height: "280px" }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Location Table */}
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Applicants by Location
          </h3>
          {locationData.length === 0 ? (
            <p
              className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              No data available.
            </p>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="px-4 py-2 text-left text-sm font-semibold rounded-tl-lg">
                      Location
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold rounded-tr-lg">
                      Applicants
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                >
                  {locationData.map((item, index) => (
                    <tr
                      key={index}
                      className={
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }
                    >
                      <td
                        className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                      >
                        {item.location}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                      >
                        {item.users}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Applicants Table */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm overflow-hidden border`}
      >
        <div
          className={`px-6 py-4 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-green-50 border-gray-200"} border-b`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Recent Applicants
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Date Applied
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Last Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  First Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Nationality
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                  Active
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
            >
              {recentApplicants.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className={`px-6 py-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No applicants found.
                  </td>
                </tr>
              ) : (
                recentApplicants.map((row) => (
                  <tr
                    key={row.applicant_id}
                    className={
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td
                      className={`px-4 py-3 text-sm whitespace-nowrap ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {row.applied_date}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {row.app_last_name}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {row.app_first_name}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} max-w-xs truncate`}
                    >
                      {row.app_email}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {row.app_present_tele_mobile}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {row.app_gender}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                    >
                      {row.app_nationality}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.is_active ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
