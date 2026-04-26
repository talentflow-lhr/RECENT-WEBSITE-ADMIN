import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  X,
  Briefcase,
  Award,
  BookOpen,
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
  job_order_ref: string;
  skills: string[];
  certifications: string[];
  experience: string[];
}

export default function Applicants({ darkMode }: { darkMode: boolean }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const statuses = [
    "Applied",
    "AI-screened",
    "Shortlist",
    "Scheduled",
    "Accepted",
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
        t_applicant(
          applicant_id,
          app_first_name,
          app_middle_name,
          app_last_name,
          app_email
        ),
        t_job_positions(
          job_title,
          t_job_orders(jo_reference_number)
        ),
        t_resume(
          resume_id,
          t_resume_skills(rs_skill_name, rs_proficiency_level),
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
      job_order_ref:
        row.t_job_positions?.t_job_orders?.jo_reference_number || "",
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
  };

  const filteredApplicants = applicants.filter((a) => {
    const fullName = `${a.app_first_name} ${a.app_last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      a.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.job_order_ref.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || a.application_current_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-gray-100 text-gray-800";
      case "AI-screened":
        return "bg-blue-100 text-blue-800";
      case "Shortlist":
        return "bg-purple-100 text-purple-800";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, position, or job order..."
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
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Applicants Table */}
      <div
        className={`rounded-xl shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? "bg-gray-700" : "bg-green-50"}>
              <tr>
                {[
                  "Name",
                  "Job Order",
                  "Position",
                  "Resume Score",
                  "Job Fit Score",
                  "Status",
                  "Applied Date",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}
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
                    colSpan={7}
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
                    onClick={() => setSelectedApplicant(applicant)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
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
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {applicant.job_order_ref}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {applicant.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm ${getScoreColor(applicant.resume_score)}`}
                      >
                        {applicant.resume_score?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm ${getScoreColor(applicant.job_fit_score)}`}
                      >
                        {applicant.job_fit_score?.toFixed(1)}%
                      </span>
                    </td>
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
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {applicant.applied_date}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            {/* Modal Header */}
            <div
              className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
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
                onClick={() => setSelectedApplicant(null)}
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
                    label: "Job Order",
                    value: selectedApplicant.job_order_ref,
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
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      className={`text-sm font-medium mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {label}
                    </p>
                    <p
                      className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
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
            </div>

            {/* Modal Footer */}
            <div
              className={`sticky bottom-0 border-t px-6 py-4 flex justify-end space-x-3 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}
            >
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                Edit Applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
