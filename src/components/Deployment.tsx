import { useState, useEffect } from "react";
import { Search, Download, Filter } from "lucide-react";
import React from "react";
import { supabase } from "./supabaseClient";

interface EmployerRow {
  name: string;
  country: string;
  jo_id: number;
  jobOrders: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  ytd: number;
}

interface OfficerGroup {
  projectOfficer: string;
  employee_id: number;
  employers: EmployerRow[];
}

interface CountrySummary {
  country: string;
  ytd: number;
}

export default function Deployment({
  darkMode = false, hasPermission
}: {
  darkMode?: boolean; hasPermission: boolean
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProjectOfficer, setFilterProjectOfficer] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [deploymentData, setDeploymentData] = useState<OfficerGroup[]>([]);
  const [countrySummary, setCountrySummary] = useState<CountrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDeploymentData();
  }, []);

  const fetchDeploymentData = async () => {
    setLoading(true);
    setError("");

    // Fetch all processing records joined up through the chain
    const { data, error: dbError } = await supabase.from("t_processing")
      .select(`
        processing_id,
        process_deploy_date,
        process_status,
        t_applications(
          application_id,
          t_job_positions(
            position_id,
            jo_id,
            t_job_orders(
              jo_id,
              jo_country,
              job_order_slots:t_job_positions(count),
              t_companies(company_name, company_country),
              t_jo_employees(
                t_employee(
                  employee_id,
                  employee_first_name,
                  employee_middle_name,
                  employee_last_name
                )
              )
            )
          )
        )
      `);

    if (dbError) {
      console.error(dbError);
      setError("Failed to load deployment data.");
      setLoading(false);
      return;
    }

    // Also fetch total job positions per jo to count job orders slots
    const { data: joData } = await supabase.from("t_job_orders").select(`
        jo_id,
        jo_country,
        t_companies(company_name, company_country),
        t_jo_employees(
          t_employee(
            employee_id,
            employee_first_name,
            employee_middle_name,
            employee_last_name
          )
        ),
        t_job_positions(position_id, job_number_needed)
      `);

    // Build a map of jo_id -> total slots needed
    const joSlotsMap: Record<number, number> = {};
    (joData || []).forEach((jo: any) => {
      joSlotsMap[jo.jo_id] = (jo.t_job_positions || []).reduce(
        (sum: number, p: any) => sum + (p.job_number_needed || 0),
        0,
      );
    });

    // Group processing records by employee (project officer) and company/jo
    // Structure: officer -> jo_id -> months deployed
    const officerMap: Record<
      number,
      {
        name: string;
        joMap: Record<
          number,
          {
            companyName: string;
            country: string;
            slots: number;
            months: number[]; // 0-11 counts per month
          }
        >;
      }
    > = {};

    (data || []).forEach((proc: any) => {
      const app = proc.t_applications;
      if (!app) return;
      const pos = app.t_job_positions;
      if (!pos) return;
      const jo = pos.t_job_orders;
      if (!jo) return;

      const joId: number = jo.jo_id;
      const companyName: string =
        jo.t_companies?.company_name || `Job Order #${joId}`;
      const country: string =
        jo.t_companies?.company_country || jo.jo_country || "";
      const slots: number = joSlotsMap[joId] || 0;

      // Determine deployed month from process_deploy_date
      let monthIndex = -1;
      if (proc.process_deploy_date) {
        const d = new Date(proc.process_deploy_date);
        if (!isNaN(d.getTime())) {
          monthIndex = d.getMonth(); // 0 = Jan
        }
      }

      const employees = jo.t_jo_employees || [];
      const officerList =
        employees.length > 0
          ? employees.map((e: any) => e.t_employee).filter(Boolean)
          : [null]; // unassigned group

      officerList.forEach((emp: any) => {
        const empId: number = emp?.employee_id ?? -1;
        const empName: string = emp
          ? `${emp.employee_last_name || ""}, ${emp.employee_first_name || ""}${emp.employee_middle_name ? " " + emp.employee_middle_name[0] + "." : ""}`.trim()
          : "Unassigned";

        if (!officerMap[empId]) {
          officerMap[empId] = { name: empName, joMap: {} };
        }
        if (!officerMap[empId].joMap[joId]) {
          officerMap[empId].joMap[joId] = {
            companyName,
            country,
            slots,
            months: Array(12).fill(0),
          };
        }
        if (monthIndex >= 0) {
          officerMap[empId].joMap[joId].months[monthIndex]++;
        }
      });
    });

    // Convert map to OfficerGroup[]
    const groups: OfficerGroup[] = Object.entries(officerMap).map(
      ([empId, officer]) => {
        const employers: EmployerRow[] = Object.entries(officer.joMap).map(
          ([joId, info]) => {
            const m = info.months;
            const q1 = m[0] + m[1] + m[2];
            const q2 = m[3] + m[4] + m[5];
            const q3 = m[6] + m[7] + m[8];
            const q4 = m[9] + m[10] + m[11];
            const ytd = q1 + q2 + q3 + q4;
            return {
              name: `${info.companyName}${info.country ? ` (${info.country})` : ""}`,
              country: info.country,
              jo_id: Number(joId),
              jobOrders: info.slots,
              jan: m[0],
              feb: m[1],
              mar: m[2],
              apr: m[3],
              may: m[4],
              jun: m[5],
              jul: m[6],
              aug: m[7],
              sep: m[8],
              oct: m[9],
              nov: m[10],
              dec: m[11],
              q1,
              q2,
              q3,
              q4,
              ytd,
            };
          },
        );
        return {
          projectOfficer: officer.name,
          employee_id: Number(empId),
          employers,
        };
      },
    );

    // Sort officers alphabetically
    groups.sort((a, b) => a.projectOfficer.localeCompare(b.projectOfficer));

    setDeploymentData(groups);

    // Build country summary
    const countryMap: Record<string, number> = {};
    groups.forEach((g) => {
      g.employers.forEach((e) => {
        const c = e.country.toUpperCase() || "UNKNOWN";
        countryMap[c] = (countryMap[c] || 0) + e.ytd;
      });
    });
    const summary: CountrySummary[] = Object.entries(countryMap)
      .map(([country, ytd]) => ({ country, ytd }))
      .sort((a, b) => a.country.localeCompare(b.country));
    setCountrySummary(summary);

    setLoading(false);
  };

  const totalYTD = countrySummary.reduce((s, c) => s + c.ytd, 0);

  const projectOfficers = [
    "All",
    ...deploymentData.map((d) => d.projectOfficer),
  ];

  const uniqueCountries = [
    "All",
    ...Array.from(new Set(countrySummary.map((c) => c.country))).sort(),
  ];

  const filteredData = deploymentData.filter((item) => {
    if (
      filterProjectOfficer !== "All" &&
      item.projectOfficer !== filterProjectOfficer
    )
      return false;
    if (
      searchTerm &&
      !item.projectOfficer.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !item.employers.some((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    )
      return false;
    if (filterCountry !== "All") {
      const hasCountry = item.employers.some((e) =>
        e.country.toUpperCase().includes(filterCountry.toUpperCase()),
      );
      if (!hasCountry) return false;
    }
    return true;
  });

  // Quarter subtotals per officer
  const getOfficerTotals = (employers: EmployerRow[]) => ({
    jobOrders: employers.reduce((s, e) => s + e.jobOrders, 0),
    jan: employers.reduce((s, e) => s + e.jan, 0),
    feb: employers.reduce((s, e) => s + e.feb, 0),
    mar: employers.reduce((s, e) => s + e.mar, 0),
    q1: employers.reduce((s, e) => s + e.q1, 0),
    q2: employers.reduce((s, e) => s + e.q2, 0),
    q3: employers.reduce((s, e) => s + e.q3, 0),
    q4: employers.reduce((s, e) => s + e.q4, 0),
    ytd: employers.reduce((s, e) => s + e.ytd, 0),
  });

  const exportToCSV = () => {
    const headers = [
      "Project Officer",
      "Employer/Company",
      "Country",
      "Job Order Slots",
      "January",
      "February",
      "March",
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "Year-to-Date",
    ];

    const rows: string[][] = [];
    filteredData.forEach((officer) => {
      officer.employers.forEach((employer, index) => {
        rows.push([
          index === 0 ? officer.projectOfficer : "",
          employer.name,
          employer.country,
          employer.jobOrders.toString(),
          employer.jan.toString(),
          employer.feb.toString(),
          employer.mar.toString(),
          employer.q1.toString(),
          employer.q2.toString(),
          employer.q3.toString(),
          employer.q4.toString(),
          employer.ytd.toString(),
        ]);
      });
      rows.push([]);
    });

    rows.push(["COUNTRY DEPLOYMENT SUMMARY"]);
    rows.push(["Country", "", "YTD"]);
    countrySummary.forEach((item) => {
      rows.push([item.country, "", item.ytd.toString()]);
    });
    rows.push(["TOTAL", "", totalYTD.toString()]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute(
      "download",
      `Deployment_Summary_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading deployment data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2
              className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              Deployment Summary
            </h2>
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
            >
              Employers per Project Officer
            </p>
          </div>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-semibold">Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <input
              type="text"
              placeholder="Search by project officer or employer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter
              className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            />
            <select
              value={filterProjectOfficer}
              onChange={(e) => setFilterProjectOfficer(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {projectOfficers.map((po) => (
                <option key={po} value={po}>
                  {po === "All" ? "All Project Officers" : po}
                </option>
              ))}
            </select>
          </div>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className={`px-4 py-2 border rounded-lg ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Countries" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm overflow-hidden border`}
      >
        {filteredData.length === 0 ? (
          <p
            className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            No deployment data found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th
                    className="px-3 py-3 text-left text-xs font-bold uppercase sticky left-0 bg-green-600 z-10"
                    rowSpan={2}
                  >
                    Employers per Project Officer
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-bold uppercase"
                    rowSpan={2}
                  >
                    Slots
                  </th>
                  <th
                    className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500"
                    colSpan={3}
                  >
                    1st Quarter
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">
                    Q1
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">
                    Q2
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">
                    Q3
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">
                    Q4
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold uppercase border-l border-green-500">
                    YTD
                  </th>
                </tr>
                <tr className="bg-green-600 text-white">
                  <th className="px-3 py-2 text-center text-xs font-semibold border-l border-green-500">
                    Jan
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Feb
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold">
                    Mar
                  </th>
                  <th className="px-3 py-2 border-l border-green-500"></th>
                  <th className="px-3 py-2 border-l border-green-500"></th>
                  <th className="px-3 py-2 border-l border-green-500"></th>
                  <th className="px-3 py-2 border-l border-green-500"></th>
                  <th className="px-3 py-2 border-l border-green-500"></th>
                </tr>
              </thead>
              <tbody>
                {filteredData.flatMap((officer, idx) => {
                  const totals = getOfficerTotals(officer.employers);
                  const rows = [];

                  // Officer header row
                  rows.push(
                    <tr
                      key={`officer-${officer.employee_id}`}
                      className={`${darkMode ? "bg-yellow-900/30" : "bg-yellow-50"} border-t-2 ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                    >
                      <td
                        className={`px-3 py-2 font-bold text-sm ${darkMode ? "text-white" : "text-gray-900"} sticky left-0 ${darkMode ? "bg-yellow-900/30" : "bg-yellow-50"} z-10`}
                        colSpan={10}
                      >
                        {officer.projectOfficer}
                      </td>
                    </tr>,
                  );

                  // Employer rows
                  officer.employers.forEach((employer, empIdx) => {
                    const rowBg =
                      empIdx % 2 === 0
                        ? darkMode
                          ? "bg-gray-800"
                          : "bg-white"
                        : darkMode
                          ? "bg-gray-750"
                          : "bg-gray-50";
                    rows.push(
                      <tr
                        key={`emp-${officer.employee_id}-${employer.jo_id}`}
                        className={`${rowBg} ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                      >
                        <td
                          className={`px-3 py-2 text-xs ${darkMode ? "text-gray-200" : "text-gray-900"} sticky left-0 ${rowBg} z-10`}
                        >
                          {employer.name}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                        >
                          {employer.jobOrders || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs ${darkMode ? "text-gray-200" : "text-gray-900"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {employer.jan || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                        >
                          {employer.feb || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                        >
                          {employer.mar || "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? "text-yellow-400" : "text-yellow-600"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {employer.q1}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? "text-yellow-400" : "text-yellow-600"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {employer.q2}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? "text-yellow-400" : "text-yellow-600"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {employer.q3}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs font-semibold ${darkMode ? "text-yellow-400" : "text-yellow-600"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {employer.q4}
                        </td>
                        <td
                          className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-400" : "text-green-600"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                        >
                          {employer.ytd}
                        </td>
                      </tr>,
                    );
                  });

                  // Officer subtotal row
                  rows.push(
                    <tr
                      key={`total-${officer.employee_id}`}
                      className={`${darkMode ? "bg-green-900/40" : "bg-green-50"} border-t ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                    >
                      <td
                        className={`px-3 py-2 text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"} sticky left-0 ${darkMode ? "bg-green-900/40" : "bg-green-50"} z-10`}
                      >
                        Subtotal — {officer.projectOfficer}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}
                      >
                        {totals.jobOrders}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                      >
                        {totals.jan}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}
                      >
                        {totals.feb}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"}`}
                      >
                        {totals.mar}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                      >
                        {totals.q1}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                      >
                        {totals.q2}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                      >
                        {totals.q3}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-300" : "text-green-700"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                      >
                        {totals.q4}
                      </td>
                      <td
                        className={`px-3 py-2 text-center text-xs font-bold ${darkMode ? "text-green-400" : "text-green-700"} border-l ${darkMode ? "border-gray-600" : "border-gray-300"}`}
                      >
                        {totals.ytd}
                      </td>
                    </tr>,
                  );

                  return rows;
                })}

                {/* Grand Total Row */}
                <tr className="bg-green-600 text-white font-bold">
                  <td className="px-3 py-3 text-sm sticky left-0 bg-green-600 z-10">
                    GRAND TOTAL
                  </td>
                  <td className="px-3 py-3 text-center text-sm">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).jobOrders,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm border-l border-green-500">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).jan,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).feb,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).mar,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm border-l border-green-500">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).q1,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm border-l border-green-500">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).q2,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm border-l border-green-500">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).q3,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm border-l border-green-500">
                    {filteredData.reduce(
                      (s, o) => s + getOfficerTotals(o.employers).q4,
                      0,
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-sm border-l border-green-500">
                    {totalYTD}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Country Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Countries Deployed To
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Country
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    YTD Deployed
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
              >
                {countrySummary.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className={`px-4 py-6 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      No country data available.
                    </td>
                  </tr>
                ) : (
                  countrySummary.map((item) => (
                    <tr
                      key={item.country}
                      className={
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                      }
                    >
                      <td
                        className={`px-4 py-3 text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}
                      >
                        {item.country}
                      </td>
                      <td
                        className={`px-4 py-3 text-center text-sm font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}
                      >
                        {item.ytd}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-green-600 text-white font-bold">
                  <td className="px-4 py-3 text-sm">TOTAL</td>
                  <td className="px-4 py-3 text-center text-sm">{totalYTD}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quarterly Stats */}
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-2xl shadow-sm p-6 border`}
        >
          <h3
            className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}
          >
            Quarterly Totals
          </h3>
          <div className="space-y-4">
            {[
              { label: "Q1 (Jan–Mar)", color: "green", key: "q1" as const },
              { label: "Q2 (Apr–Jun)", color: "yellow", key: "q2" as const },
              { label: "Q3 (Jul–Sep)", color: "blue", key: "q3" as const },
              { label: "Q4 (Oct–Dec)", color: "purple", key: "q4" as const },
            ].map(({ label, color, key }) => {
              const total = deploymentData.reduce(
                (s, o) => s + o.employers.reduce((es, e) => es + e[key], 0),
                0,
              );
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : `bg-${color}-50`}`}
                >
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mb-1`}
                  >
                    {label}
                  </p>
                  <p
                    className={`text-3xl font-bold ${darkMode ? `text-${color}-400` : `text-${color}-600`}`}
                  >
                    {total}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
