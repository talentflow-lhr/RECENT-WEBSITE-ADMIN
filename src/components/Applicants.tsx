import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  X,
  Briefcase,
  Award,
  BookOpen,
  Send,
  FileText,
  Eye,
} from "lucide-react";
import { supabase } from "./supabaseClient";

interface Applicant {
  application_id: number;
  applicant_id: number;
  app_first_name: string;
  app_last_name: string;
  app_middle_name: string;
  app_email: string;
  application_current_status: string;
  job_fit_score: number;
  resume_score: number;
  applied_date: string;
  position: string;
  jo_id: number;
  company_name: string;
  interviewer: string;
  meeting_link: string;
  interview_date: string;
  salary_range: string;
  resume_url: string;
  declined_reason: string;
  rejected_reason: string;
  skills: string[];
  certifications: string[];
  experience: string[];
  salary_offer: string;
}

export default function Applicants({
  darkMode,
  hasPermission,
}: {
  darkMode: boolean;
  hasPermission: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterPosition, setFilterPosition] = useState("All");
  const [sortBy, setSortBy] = useState("none");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    interviewer: "",
    interviewDate: "",
    meetingLink: "",
    declinedReason: "",
    rejectedReason: "",
    salaryOffer: "",
  });

  const statuses = [
    "Applied",
    "Shortlist",
    "Scheduled",
    "Interviewed",
    "Accepted",
    "Declined",
    "Rejected",
  ];

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase.from("t_applications")
      .select(`
        application_id,
        application_current_status,
        job_fit_score,
        resume_score,
        application_interviewer,
        application_meeting_link,
        application_decline_reason,
        application_rejected_reason,
        application_interview_schedule,
        application_salary_offer,
        t_applicant(
          applicant_id,
          app_first_name,
          app_middle_name,
          app_last_name,
          app_email
        ),
        t_job_positions(
          job_title,
          jo_id,
          job_salary_range,
          t_job_orders(
            jo_id,
            t_companies(company_name)
          )
        ),
        t_resume(
          resume_id,
          t_resume_skills(rs_skill_name, rs_proficiency_level),
          res_pdf_link,
          t_certificate_training(cert_certificate_title),
          t_work_experience(exp_position, exp_company, exp_start_date, exp_end_date)
        ),
        applied_date:t_date!t_applications_applied_date_id_fkey(full_date)
      `);

    if (dbError) {
      console.error(dbError);
      setError("Failed to load applicants.");
      setLoading(false);
      return;
    }

    const mapped: Applicant[] = (data || []).map((row: any) => ({
      application_id: row.application_id,
      applicant_id: row.t_applicant?.applicant_id,
      app_first_name: row.t_applicant?.app_first_name || "",
      app_middle_name: row.t_applicant?.app_middle_name || "",
      app_last_name: row.t_applicant?.app_last_name || "",
      app_email: row.t_applicant?.app_email || "",
      application_current_status: row.application_current_status || "Applied",
      job_fit_score: row.job_fit_score || 0,
      resume_score: row.resume_score || 0,
      applied_date: row.applied_date?.full_date || "",
      position: row.t_job_positions?.job_title || "",
      jo_id: row.t_job_positions?.jo_id || 0,
      company_name:
        row.t_job_positions?.t_job_orders?.t_companies?.company_name || "",
      interviewer: row.application_interviewer || "",
      meeting_link: row.application_meeting_link || "",
      declined_reason: row.application_decline_reason || "",
      rejected_reason: row.application_rejected_reason || "",
      interview_date: row.application_interview_schedule || "",
      salary_range: row.t_job_positions?.job_salary_range || "",
      resume_url: row.t_resume?.res_pdf_link || "",
      salary_offer: row.application_salary_offer || "",
      skills: (row.t_resume?.t_resume_skills || []).map(
        (s: any) => s.rs_skill_name,
      ),
      certifications: (row.t_resume?.t_certificate_training || []).map(
        (c: any) => c.cert_certificate_title,
      ),
      experience: (row.t_resume?.t_work_experience || []).map(
        (w: any) => `${w.exp_position} at ${w.exp_company}`,
      ),
    }));

    setApplicants(mapped);
    setLoading(false);
  };

  const handleStatusChange = async (
    application_id: number,
    newStatus: string,
  ) => {
    const { error: updateError } = await supabase
      .from("t_applications")
      .update({ application_current_status: newStatus })
      .eq("application_id", application_id);

    if (updateError) {
      alert("Failed to update status.");
      return;
    }

    setApplicants((prev) =>
      prev.map((a) =>
        a.application_id === application_id
          ? { ...a, application_current_status: newStatus }
          : a,
      ),
    );

    if (selectedApplicant?.application_id === application_id) {
      setSelectedApplicant((prev) =>
        prev ? { ...prev, application_current_status: newStatus } : prev,
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedApplicant) return;

    const { error: updateError } = await supabase
      .from("t_applications")
      .update({
        application_interviewer: editForm.interviewer,
        application_meeting_link: editForm.meetingLink,
        application_decline_reason: editForm.declinedReason,
        application_rejected_reason: editForm.rejectedReason,
        application_interview_schedule: editForm.interviewDate || null,
        application_salary_offer: editForm.salaryOffer,
      })
      .eq("application_id", selectedApplicant.application_id);

    if (updateError) {
      alert("Failed to save changes.");
      return;
    }

    const updated: Applicant = {
      ...selectedApplicant,
      interviewer: editForm.interviewer,
      meeting_link: editForm.meetingLink,
      interview_date: editForm.interviewDate,
      salary_offer: editForm.salaryOffer,
      declined_reason: editForm.declinedReason,
      rejected_reason: editForm.rejectedReason,
    };

    setSelectedApplicant(updated);
    setApplicants((prev) =>
      prev.map((a) =>
        a.application_id === selectedApplicant.application_id ? updated : a,
      ),
    );
    setIsEditing(false);
  };

  const formatJoId = (joId: number) =>
    joId ? `JO-${String(joId).padStart(5, "0")}` : "—";

  const uniquePositions = Array.from(
    new Set(applicants.map((a) => a.position).filter(Boolean)),
  ).sort();

  const filteredApplicants = (() => {
    let filtered = applicants.filter((a) => {
      const fullName = `${a.app_first_name} ${a.app_last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        a.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(a.jo_id).includes(searchTerm) ||
        a.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "All" || a.application_current_status === filterStatus;
      const matchesPosition =
        filterPosition === "All" || a.position === filterPosition;
      return matchesSearch && matchesFilter && matchesPosition;
    });

    if (sortBy === "resume-high-to-low")
      filtered = [...filtered].sort((a, b) => b.resume_score - a.resume_score);
    else if (sortBy === "resume-low-to-high")
      filtered = [...filtered].sort((a, b) => a.resume_score - b.resume_score);
    else if (sortBy === "jobfit-high-to-low")
      filtered = [...filtered].sort(
        (a, b) => b.job_fit_score - a.job_fit_score,
      );
    else if (sortBy === "jobfit-low-to-high")
      filtered = [...filtered].sort(
        (a, b) => a.job_fit_score - b.job_fit_score,
      );

    return filtered;
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-gray-100 text-gray-800";
      case "Shortlist":
        return "bg-purple-100 text-purple-800";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "Interviewed":
        return "bg-blue-100 text-blue-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Declined":
        return "bg-orange-100 text-orange-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-bold";
    if (score >= 60) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };
  
  function exportApplicantsTableToExcel() {
    const dataType = 'application/vnd.ms-excel';
    const originalTable = document.getElementById('applicants_table');

    // 1. Deep‑clone the table so we don't alter the visible DOM
    const tableClone = originalTable.cloneNode(true) as HTMLTableElement;

    // ----- 2. Split the header: "Company / Job Order" → "Company" + "Job Order" -----
    const headerRow = tableClone.querySelector('thead tr');
    if (headerRow) {
      const allTh = headerRow.querySelectorAll('th');
      // The column to split is at index 1 (second column)
      const oldTh = allTh[1];
      if (oldTh) {
        const companyTh = document.createElement('th');
        companyTh.className = oldTh.className;   // keep existing styling
        companyTh.textContent = 'Company';

        const jobOrderTh = document.createElement('th');
        jobOrderTh.className = oldTh.className;
        jobOrderTh.textContent = 'Job Order';

        oldTh.replaceWith(companyTh, jobOrderTh);
      }
    }

    // 3. Process each body row
    const originalRows = originalTable.querySelectorAll('tbody tr');
    const clonedRows = tableClone.querySelectorAll('tbody tr');

    clonedRows.forEach((row, index) => {
      // Empty‑state row
      const emptyCell = row.querySelector('td[colspan]');
      if (emptyCell) {
        emptyCell.setAttribute('colspan', '10');
        return;
      }

      // a) Name column: remove avatar div
      const nameCell = row.querySelector('td');
      if (nameCell) {
        const avatarDiv = nameCell.querySelector('div div');
        if (avatarDiv) avatarDiv.remove();
      }

      // b) Company / Job Order column: split into two
      const allCells = row.querySelectorAll('td');
      if (allCells.length > 1) {
        const originalCell = allCells[1];
        const paragraphs = originalCell.querySelectorAll('p');
        let companyText = '—';
        let jobOrderText = '—';
        if (paragraphs.length >= 2) {
          companyText = paragraphs[0].textContent?.trim() || '—';
          jobOrderText = paragraphs[1].textContent?.trim() || '—';
        } else if (paragraphs.length === 1) {
          companyText = paragraphs[0].textContent?.trim() || '—';
        }

        const companyCell = document.createElement('td');
        companyCell.className = originalCell.className;
        companyCell.textContent = companyText;

        const jobOrderCell = document.createElement('td');
        jobOrderCell.className = originalCell.className;
        jobOrderCell.textContent = jobOrderText;

        originalCell.replaceWith(companyCell, jobOrderCell);
      }

      // c) Status column: use the ORIGINAL row's select value
      const originalRow = originalRows[index];
      if (originalRow) {
        const originalSelect = originalRow.querySelector('select');
        if (originalSelect) {
          const currentStatus = originalSelect.value; // React‑maintained value
          const clonedSelect = row.querySelector('select');
          if (clonedSelect) {
            clonedSelect.replaceWith(document.createTextNode(currentStatus));
          }
        }
      }
    });

      // ----- 4. Get the final HTML from the cleaned clone -----
      const tableHTML = tableClone.outerHTML;

      // Determine the file name
      const filename = `applicants_table ${new Date().toISOString().slice(0, 19)}.xls`;

      // Legacy IE / old Edge path
      if (navigator.msSaveOrOpenBlob) {
        const blob = new Blob(['\ufeff', tableHTML], { type: dataType });
        navigator.msSaveOrOpenBlob(blob, filename);
        return;
      }

      // Modern browsers
      const blob = new Blob(['\ufeff', tableHTML], { type: dataType });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => URL.revokeObjectURL(url), 100);
    }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading applicants...
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
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {statuses.map((status) => {
          const count = applicants.filter(
            (a) => a.application_current_status === status,
          ).length;
          return (
            <div
              key={status}
              className={`rounded-lg shadow-md p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <p
                className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {status}
              </p>
              <p
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Position Filter */}
      <div
        className={`rounded-lg shadow-md p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <label
          className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          Filter by Position Applied
        </label>
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="All">All Positions</option>
          {uniquePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, position, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "border-gray-300"
            }`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "border-gray-300"
            }`}
          >
            <option>All</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="none">Sort By</option>
          <option value="resume-high-to-low">Resume Score (High to Low)</option>
          <option value="resume-low-to-high">Resume Score (Low to High)</option>
          <option value="jobfit-high-to-low">
            Job Fit Score (High to Low)
          </option>
          <option value="jobfit-low-to-high">
            Job Fit Score (Low to High)
          </option>
        </select>
        <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            onClick={exportApplicantsTableToExcel}
        >
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Applicants Table */}
      <div
        className={`rounded-xl shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full" id="applicants_table">
            <thead className="bg-green-600">
              <tr>
                {[
                  "Name",
                  "Company / Job Order",
                  "Position Applied",
                  "Resume Score",
                  "Job Fit Score",
                  "Status",
                  "Applied Date",
                  "Interviewer",
                  "Salary Offer",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
            >
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className={`px-6 py-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No applicants found.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => (
                  <tr
                    key={applicant.application_id}
                    className={`cursor-pointer transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                    onClick={() => {
                      setSelectedApplicant(applicant);
                      setIsEditing(false);
                      setEditForm({
                        interviewer: applicant.interviewer || "",
                        interviewDate: applicant.interview_date || "",
                        salaryOffer: applicant.salary_offer || "",
                        meetingLink: applicant.meeting_link || "",
                        declinedReason: applicant.declined_reason || "",
                        rejectedReason: applicant.rejected_reason || "",
                      });
                    }}
                  >
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                        >
                          <span className="text-green-600 font-semibold text-sm">
                            {applicant.app_first_name[0]}
                            {applicant.app_last_name[0]}
                          </span>
                        </div>
                        <div
                          className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {applicant.app_first_name} {applicant.app_last_name}
                        </div>
                      </div>
                    </td>

                    {/* Company / Job Order — matches the screenshot style */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p
                        className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {applicant.company_name || "—"}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {formatJoId(applicant.jo_id)}
                      </p>
                    </td>

                    {/* Position */}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {applicant.position}
                    </td>

                    {/* Resume Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm ${getScoreColor(applicant.resume_score)}`}
                      >
                        {applicant.resume_score?.toFixed(1)}%
                      </span>
                    </td>

                    {/* Job Fit Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm ${getScoreColor(applicant.job_fit_score)}`}
                      >
                        {applicant.job_fit_score?.toFixed(1)}%
                      </span>
                    </td>

                    {/* Status */}
                    <td
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={applicant.application_current_status}
                        onChange={(e) =>
                          handleStatusChange(
                            applicant.application_id,
                            e.target.value,
                          )
                        }
                        className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${getStatusColor(applicant.application_current_status)}`}
                        disabled={!hasPermission}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Applied Date */}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {applicant.applied_date}
                    </td>

                    {/* Interviewer */}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {applicant.interviewer || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Salary Offer */}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {applicant.salary_offer || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedApplicant(null);
            setIsEditing(false);
          }}
        >
          <div
            className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                >
                  <span className="text-green-600 font-bold text-xl">
                    {selectedApplicant.app_first_name[0]}
                    {selectedApplicant.app_last_name[0]}
                  </span>
                </div>
                <div>
                  <h2
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {selectedApplicant.app_first_name}{" "}
                    {selectedApplicant.app_last_name}
                  </h2>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {selectedApplicant.position}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedApplicant(null);
                  setIsEditing(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Email", value: selectedApplicant.app_email },
                  {
                    label: "Company",
                    value: selectedApplicant.company_name || "—",
                  },
                  {
                    label: "Job Order ID",
                    value: formatJoId(selectedApplicant.jo_id),
                  },
                  {
                    label: "Resume Score",
                    value: `${selectedApplicant.resume_score?.toFixed(1)}%`,
                  },
                  {
                    label: "Job Fit Score",
                    value: `${selectedApplicant.job_fit_score?.toFixed(1)}%`,
                  },
                  {
                    label: "Applied Date",
                    value: selectedApplicant.applied_date,
                  },
                  {
                    label: "Status",
                    value: selectedApplicant.application_current_status,
                  },
                  {
                    label: "Interviewer",
                    value: selectedApplicant.interviewer || "—",
                  },
                  {
                    label: "Meeting Link",
                    value: selectedApplicant.meeting_link || "—",
                  },
                  {
                    label: "Salary Range",
                    value: selectedApplicant.salary_range || "—",
                  },
                  {
                    label: "Salary Offer",
                    value: selectedApplicant.salary_offer || "—",
                  },
                  {
                    label: "Interview Date",
                    value: selectedApplicant.interview_date || "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {label}
                    </p>
                    {label === "Meeting Link" &&
                    selectedApplicant.meeting_link ? (
                      <a
                        href={selectedApplicant.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline text-sm break-all"
                      >
                        {selectedApplicant.meeting_link}
                      </a>
                    ) : (
                      <p
                        className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {value}
                      </p>
                    )}
                  </div>
                ))}

                {/* Declined Reason */}
                {selectedApplicant.declined_reason && (
                  <div className="col-span-2">
                    <p
                      className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Declined Reason
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-orange-800 text-sm">
                        {selectedApplicant.declined_reason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejected Reason */}
                {selectedApplicant.rejected_reason && (
                  <div className="col-span-2">
                    <p
                      className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Rejected Reason
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">
                        {selectedApplicant.rejected_reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Experience */}
              <div
                className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-green-50"}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <h3
                    className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Experience
                  </h3>
                </div>
                {selectedApplicant.experience.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedApplicant.experience.map((exp, i) => (
                      <li
                        key={i}
                        className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        • {exp}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No experience recorded.
                  </p>
                )}
              </div>

              {/* Skills */}
              <div
                className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h3
                    className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Skills
                  </h3>
                </div>
                {selectedApplicant.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No skills recorded.
                  </p>
                )}
              </div>

              {/* Certifications */}
              <div
                className={`rounded-lg p-4 ${darkMode ? "bg-gray-700" : "bg-yellow-50"}`}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="w-5 h-5 text-yellow-600" />
                  <h3
                    className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Certifications
                  </h3>
                </div>
                {selectedApplicant.certifications.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApplicant.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        <span
                          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {cert}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No certifications recorded.
                  </p>
                )}
              </div>

              {/* Resume View/Download */}
              <div
                className={`border-l-4 border-blue-600 rounded-lg p-4 ${darkMode ? "bg-blue-900" : "bg-blue-50"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3
                      className={`font-bold ${darkMode ? "text-blue-200" : "text-blue-900"}`}
                    >
                      Resume
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={selectedApplicant.resume_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedApplicant.resume_url
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 pointer-events-none cursor-not-allowed"
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </a>
                    <a
                      href={selectedApplicant.resume_url || "#"}
                      download={`${selectedApplicant.app_first_name}-${selectedApplicant.app_last_name}-Resume.pdf`}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedApplicant.resume_url
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-300 text-gray-500 pointer-events-none cursor-not-allowed"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            {isEditing && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Salary Offer
                  </p>
                  <input
                    type="text"
                    value={editForm.salaryOffer}
                    onChange={(e) =>
                      setEditForm({ ...editForm, salaryOffer: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    placeholder="e.g. ₱25,000/month"
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Interviewer
                  </p>
                  <input
                    type="text"
                    value={editForm.interviewer}
                    onChange={(e) =>
                      setEditForm({ ...editForm, interviewer: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    placeholder="Enter interviewer name"
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Interview Date
                  </p>
                  <input
                    type="date"
                    value={editForm.interviewDate}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        interviewDate: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Meeting Link
                  </p>
                  <input
                    type="text"
                    value={editForm.meetingLink}
                    onChange={(e) =>
                      setEditForm({ ...editForm, meetingLink: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    placeholder="https://meet.example.com/..."
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Declined Reason
                  </p>
                  <textarea
                    value={editForm.declinedReason}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        declinedReason: e.target.value,
                      })
                    }
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    placeholder="Enter declined reason (if applicable)"
                  />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Rejected Reason
                  </p>
                  <textarea
                    value={editForm.rejectedReason}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        rejectedReason: e.target.value,
                      })
                    }
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    placeholder="Enter rejected reason (if applicable)"
                  />
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div
              className={`sticky bottom-0 border-t px-6 py-4 flex justify-between items-center ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}
            >
              <div className="relative group">
                <button
                  disabled={
                    selectedApplicant.application_current_status !== "Accepted"
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedApplicant.application_current_status === "Accepted"
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Send Offer</span>
                </button>
                {selectedApplicant.application_current_status !==
                  "Accepted" && (
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                    Applicant must be accepted first
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedApplicant(null);
                    setIsEditing(false);
                  }}
                  className={`px-4 py-2 border rounded-lg transition-colors ${darkMode ? "border-gray-600 hover:bg-gray-700 text-white" : "border-gray-300 hover:bg-gray-100 text-gray-900"}`}
                >
                  Close
                </button>
                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                ) : hasPermission ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Edit Application
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
