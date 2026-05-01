import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Users,
  X,
  Trash2,
  ArrowLeft,
  Send,
  Eye,
  FileText,
} from "lucide-react";
import { supabase } from "./supabaseClient";

interface Applicant {
  application_id: number;
  app_first_name: string;
  app_last_name: string;
  resume_score: number;
  job_fit_score: number;
  application_current_status: string;
  applied_date: string;
  interviewer?: string;
  meeting_link?: string;
  declined_reason?: string;
  rejected_reason?: string;
  resume_url?: string;
}

interface Position {
  position_id: number;
  job_title: string;
  job_description: string;
  job_requirements: string[];
  job_contract_length: string;
  job_number_needed: number;
  job_salary_range: string;
  job_category: string;
  is_active: boolean;
  applicants: Applicant[];
}

interface JobOrder {
  jo_id: number;
  is_active: boolean;
  is_posted: boolean;
  jo_posted_date: string;
  jo_deadline: string;
  jo_country: string;
  company_id: number;
  company_name: string;
  company_contact: string;
  company_representative: string;
  created_by_name: string;
  positions: Position[];
}

interface Company {
  company_id: number;
  company_name: string;
  company_country: string;
  company_contact: string;
  company_representative: string;
}

interface Employee {
  employee_id: number;
  employee_first_name: string;
  employee_last_name: string;
  employee_is_active: boolean;
}

export default function JobOrders({
  darkMode = false, hasPermission
}: {
  darkMode?: boolean; hasPermission: boolean
}) {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(
    null,
  );
  const [selectedPosition, setSelectedPosition] = useState<{
    jobOrder: JobOrder;
    position: Position;
  } | null>(null);
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [applicantFilterStatus, setApplicantFilterStatus] = useState("All");
  const [applicantScoreSort, setApplicantScoreSort] = useState("none");
  const [viewMode, setViewMode] = useState<"list" | "positions" | "form">(
    "list",
  );
  const [showAddPositionModal, setShowAddPositionModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isEditingApplicant, setIsEditingApplicant] = useState(false);
  const [applicantEditForm, setApplicantEditForm] = useState({
    interviewer: "",
    meetingLink: "",
    interviewDate: "",
    declinedReason: "",
    rejectedReason: "",
    salaryRange:"",
  });

  const [jobOrderForm, setJobOrderForm] = useState({
    company_id: "",
    jo_country: "",
    jo_deadline: "",
    jo_created_by: "",
    is_active: true,
    is_posted: false,
  });

  const [positions, setPositions] = useState<any[]>([]);
  const [currentPosition, setCurrentPosition] = useState({
    job_title: "",
    job_description: "",
    job_requirements: "",
    job_number_needed: 1,
    job_contract_length: "",
    job_salary_range: "",
    job_category: "",
  });

  const [newPosition, setNewPosition] = useState({
    job_title: "",
    job_description: "",
    job_requirements: "",
    job_number_needed: 1,
    job_contract_length: "",
    job_salary_range: "",
    job_category: "",
  });

  useEffect(() => {
    fetchJobOrders();
    fetchCompanies();
    fetchEmployees();
  }, []);

  const fetchJobOrders = async () => {
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase.from("t_job_orders")
      .select(`
        jo_id,
        is_active,
        is_posted,
        jo_country,
        company_id,
        t_companies(company_name, company_contact, company_representative),
        jo_created_by,
        t_employee!t_job_orders_jo_created_by_fkey(employee_first_name, employee_last_name),
        posted_date:t_date!t_job_orders_jo_posted_date_id_fkey(full_date),
        deadline:t_date!t_job_orders_jo_deadline_id_fkey(full_date),
        t_job_positions(
          position_id,
          job_title,
          job_description,
          job_requirements,
          job_contract_length,
          job_number_needed,
          job_salary_range,
          job_category,
          is_active,
          t_applications(
            application_id,
            application_current_status,
            job_fit_score,
            resume_score,
            application_interviewer,
            application_meeting_link,
            application_decline_reason,
            application_rejected_reason,
            application_interview_schedule,
            t_applicant(app_first_name, app_last_name),
            t_resume(res_pdf_link),
            applied_date:t_date!t_applications_applied_date_id_fkey(full_date)
          )
        )
      `);

    if (dbError) {
      console.error(dbError);
      setError("Failed to load job orders.");
      setLoading(false);
      return;
    }

    const mapped: JobOrder[] = (data || []).map((row: any) => ({
      jo_id: row.jo_id,
      is_active: row.is_active ?? false,
      is_posted: row.is_posted ?? false,
      jo_country: row.jo_country || "",
      company_id: row.company_id,
      company_name: row.t_companies?.company_name || "",
      company_contact: row.t_companies?.company_contact || "",
      company_representative: row.t_companies?.company_representative || "",
      created_by_name: row.t_employee
        ? `${row.t_employee.employee_first_name} ${row.t_employee.employee_last_name}`
        : "",
      jo_posted_date: row.posted_date?.full_date || "",
      jo_deadline: row.deadline?.full_date || "",
      positions: (row.t_job_positions || []).map((pos: any) => ({
        position_id: pos.position_id,
        job_title: pos.job_title || "",
        job_description: pos.job_description || "",
        job_requirements: pos.job_requirements || [],
        job_contract_length: pos.job_contract_length || "",
        job_number_needed: pos.job_number_needed || 0,
        job_salary_range: pos.job_salary_range || "",
        job_category: pos.job_category || "",
        is_active: pos.is_active ?? true,
        applicants: (pos.t_applications || []).map((app: any) => ({
          application_id: app.application_id,
          app_first_name: app.t_applicant?.app_first_name || "",
          app_last_name: app.t_applicant?.app_last_name || "",
          resume_score: app.resume_score || 0,
          job_fit_score: app.job_fit_score || 0,
          application_current_status:
            app.application_current_status || "Applied",
          applied_date: app.applied_date?.full_date || "",
          interviewer: app.application_interviewer || "",
          meeting_link: app.application_meeting_link || "",
          declined_reason: app.application_decline_reason || "",
          rejected_reason: app.application_rejected_reason || "",
          interview_date: app.application_interview_schedule || "",
          resume_url: app.t_resume?.res_pdf_link || "",
        })),
      })),
    }));

    setJobOrders(mapped);
    setLoading(false);
  };

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("t_companies")
      .select(
        "company_id, company_name, company_country, company_contact, company_representative",
      );
    if (data) setCompanies(data);
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("t_employee")
      .select(
        "employee_id, employee_first_name, employee_last_name, employee_is_active",
      )
      .eq("employee_is_active", true);
    if (data) setEmployees(data);
  };
// added this for the label
  const getStatusLabel = (is_active: boolean, is_posted: boolean) => {
    if (!is_posted) return "On Hold";
    if (is_active) return "Active";
    return "Closed";
  };

  const getStatusColor = (is_active: boolean, is_posted: boolean) => {
    if (!is_posted) return darkMode
      ? "bg-yellow-900 text-yellow-200"
      : "bg-yellow-100 text-yellow-800";
    if (is_active) return darkMode
      ? "bg-green-900 text-green-200"
      : "bg-green-100 text-green-800";
  return darkMode
    ? "bg-red-900 text-red-200"
    : "bg-red-100 text-red-800";
};

  const getApplicantStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      case "Shortlist":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "Scheduled":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "Interviewed":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "Accepted":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Rejected":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "Declined":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-bold";
    if (score >= 60) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };

  const handleApplicantStatusChange = async (
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

    if (!selectedPosition) return;
    const updatedApplicants = selectedPosition.position.applicants.map((a) =>
      a.application_id === application_id
        ? { ...a, application_current_status: newStatus }
        : a,
    );
    const updatedPosition = {
      ...selectedPosition.position,
      applicants: updatedApplicants,
    };
    setSelectedPosition({ ...selectedPosition, position: updatedPosition });

    setJobOrders((prev) =>
      prev.map((jo) => ({
        ...jo,
        positions: jo.positions.map((pos) =>
          pos.position_id === selectedPosition.position.position_id
            ? updatedPosition
            : pos,
        ),
      })),
    );
  };
// TODO: wire up to a status toggle button in the positions view header
  const handleToggleJobOrderStatus = async (
    jo_id: number,
    is_active: boolean,
    is_posted: boolean,
  ) => {
    const { error: updateError } = await supabase
      .from("t_job_orders")
      .update({ is_active, is_posted })
      .eq("jo_id", jo_id);

    if (updateError) {
      alert("Failed to update status.");
      return;
    }

    setJobOrders((prev) =>
      prev.map((jo) =>
        jo.jo_id === jo_id ? { ...jo, is_active, is_posted } : jo,
      ),
    );
    if (selectedJobOrder?.jo_id === jo_id) {
      setSelectedJobOrder((prev) =>
        prev ? { ...prev, is_active, is_posted } : prev,
      );
    }
  };

  const handleAddPosition = async () => {
    if (
      !newPosition.job_title ||
      !newPosition.job_requirements ||
      !newPosition.job_contract_length ||
      !newPosition.job_salary_range ||
      !newPosition.job_category ||
      !newPosition.job_number_needed
    ) {
      alert("Please fill in all required fields");
      return;
    }
    if (!selectedJobOrder) return;
    setSaving(true);

    const { data, error: insertError } = await supabase
      .from("t_job_positions")
      .insert({
        jo_id: selectedJobOrder.jo_id,
        job_title: newPosition.job_title,
        job_description: newPosition.job_description,
        job_requirements: [newPosition.job_requirements],
        job_contract_length: newPosition.job_contract_length,
        job_number_needed: newPosition.job_number_needed,
        job_salary_range: newPosition.job_salary_range,
        job_category: newPosition.job_category,
        is_active: true,
        job_filled_count: 0,
      })
      .select()
      .single();

    if (insertError || !data) {
      alert("Failed to add position.");
      setSaving(false);
      return;
    }

    const newPos: Position = {
      position_id: data.position_id,
      job_title: data.job_title,
      job_description: data.job_description || "",
      job_requirements: data.job_requirements || [],
      job_contract_length: data.job_contract_length || "",
      job_number_needed: data.job_number_needed || 0,
      job_salary_range: data.job_salary_range || "",
      job_category: data.job_category || "",
      is_active: true,
      applicants: [],
    };

    const updatedJO = {
      ...selectedJobOrder,
      positions: [...selectedJobOrder.positions, newPos],
    };
    setSelectedJobOrder(updatedJO);
    setJobOrders((prev) =>
      prev.map((jo) => (jo.jo_id === selectedJobOrder.jo_id ? updatedJO : jo)),
    );

    setNewPosition({
      job_title: "",
      job_description: "",
      job_requirements: "",
      job_number_needed: 1,
      job_contract_length: "",
      job_salary_range: "",
      job_category: "",
    });
    setShowAddPositionModal(false);
    setSaving(false);
  };

  const handlePostJobOrder = async () => {
    if (
      !jobOrderForm.company_id ||
      !jobOrderForm.jo_deadline ||
      !jobOrderForm.jo_created_by
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (positions.length === 0) {
      alert("Please add at least one position.");
      return;
    }
    setSaving(true);

    const { data: dateData } = await supabase
      .from("t_date")
      .select("date_id")
      .eq("full_date", jobOrderForm.jo_deadline)
      .single();

    if (!dateData) {
      alert(
        "Deadline date not found in the date table. Please choose a valid date.",
      );
      setSaving(false);
      return;
    }

    const { data: newJO, error: joError } = await supabase
      .from("t_job_orders")
      .insert({
        company_id: Number(jobOrderForm.company_id),
        jo_country: jobOrderForm.jo_country,
        jo_deadline_id: dateData.date_id,
        jo_created_by: Number(jobOrderForm.jo_created_by),
        is_active: jobOrderForm.is_active,
        is_posted: jobOrderForm.is_posted,
      })
      .select()
      .single();

    if (joError || !newJO) {
      alert("Failed to create job order.");
      setSaving(false);
      return;
    }

    for (const pos of positions) {
      await supabase.from("t_job_positions").insert({
        jo_id: newJO.jo_id,
        job_title: pos.job_title,
        job_description: pos.job_description,
        job_requirements: [pos.job_requirements],
        job_contract_length: pos.job_contract_length,
        job_number_needed: pos.job_number_needed,
        job_salary_range: pos.job_salary_range,
        job_category: pos.job_category,
        is_active: true,
        job_filled_count: 0,
      });
    }

    await fetchJobOrders();
    setSaving(false);
    setViewMode("list");
    resetForm();
    alert(
      `Job Order created successfully with ${positions.length} position${positions.length !== 1 ? "s" : ""}!`,
    );
  };

  const resetForm = () => {
    setJobOrderForm({
      company_id: "",
      jo_country: "",
      jo_deadline: "",
      jo_created_by: "",
      is_active: true,
      is_posted: false,
    });
    setPositions([]);
    setCurrentPosition({
      job_title: "",
      job_description: "",
      job_requirements: "",
      job_number_needed: 1,
      job_contract_length: "",
      job_salary_range: "",
      job_category: "",
    });
  };

  const filteredJobOrders = jobOrders.filter((jo) => {
    const matchesSearch =
      jo.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jo.positions.some((pos) =>
        pos.job_title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const status = getStatusLabel(jo.is_active, jo.is_posted);
    const matchesFilter = filterStatus === "All" || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalJobOrders = jobOrders.length;
  const activeJobs = jobOrders.filter(
    (jo) => jo.is_active && jo.is_posted,
  ).length;
  const totalPositions = jobOrders.reduce(
    (sum, jo) => sum + jo.positions.length,
    0,
  );
  const totalApplicants = jobOrders.reduce(
    (sum, jo) =>
      sum + jo.positions.reduce((pSum, pos) => pSum + pos.applicants.length, 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading job orders...
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

  // Positions View
  if (viewMode === "positions" && selectedJobOrder) {
    const totalJobApplicants = selectedJobOrder.positions.reduce(
      (sum, pos) => sum + pos.applicants.length,
      0,
    );
    const totalOpenPositions = selectedJobOrder.positions.reduce(
      (sum, pos) => sum + pos.job_number_needed,
      0,
    );

    return (
      <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`border-b px-6 py-5 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => {
                  setViewMode("list");
                  setSelectedJobOrder(null);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Job Orders</span>
              </button>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg text-gray-700 mt-1">
                  {selectedJobOrder.company_name}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  {selectedJobOrder.company_representative && (
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Representative:</span>{" "}
                      {selectedJobOrder.company_representative}
                    </span>
                  )}
                  {selectedJobOrder.company_contact && (
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Contact:</span>{" "}
                      {selectedJobOrder.company_contact}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <span
                    className={`text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(selectedJobOrder.is_active, selectedJobOrder.is_posted)}`}
                  >
                    {getStatusLabel(
                      selectedJobOrder.is_active,
                      selectedJobOrder.is_posted,
                    )}
                  </span>
                  {selectedJobOrder.jo_deadline && (
                    <span className="text-sm text-gray-600">
                      Deadline: {selectedJobOrder.jo_deadline}
                    </span>
                  )}
                  {selectedJobOrder.created_by_name && (
                    <span className="text-sm text-gray-600">
                      Point Person: {selectedJobOrder.created_by_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 border-l-4 border-green-600 ${darkMode ? 'bg-green-900' : 'bg-green-50'}`}>
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Positions</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedJobOrder.positions.length}
              </p>
            </div>
            <div className={`rounded-lg p-4 border-l-4 border-blue-600 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Slots Needed</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalOpenPositions}
              </p>
            </div>
            <div className={`rounded-lg p-4 border-l-4 border-purple-600 ${darkMode ? 'bg-purple-900' : 'bg-purple-50'}`}>
              <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Applicants</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalJobApplicants}
              </p>
            </div>
          </div>
        </div>

        {/* Positions List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
             <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Positions</h2>
              <button
                onClick={() => setShowAddPositionModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                disabled={!hasPermission}
              >
                <Plus className="w-5 h-5" />
                <span>Add Position</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedJobOrder.positions.map((position) => (
                <div
                  key={position.position_id}
                  onClick={() =>
                    setSelectedPosition({
                      jobOrder: selectedJobOrder,
                      position,
                    })
                  }
                 className={`rounded-2xl border-2 border-green-500 shadow-lg hover:shadow-xl hover:border-green-600 transition-all cursor-pointer p-5 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-blue-600" />
                    </div>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                      {position.job_number_needed} Needed
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {position.job_title}
                  </h3>
                  {position.job_description && (
                    <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {position.job_description}
                    </p>
                  )}
                  <div className="space-y-1 mb-4">
                    {position.job_contract_length && (
                      <p className="text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Contract:</span>{" "}
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {position.job_contract_length}
                        </span>
                      </p>
                    )}
                    {position.job_salary_range && (
                      <p className="text-sm">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Salary:</span>{" "}
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {position.job_salary_range}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Applicants</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {position.applicants.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shortlisted</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {
                          position.applicants.filter(
                            (a) => a.application_current_status === "Shortlist",
                          ).length
                        }
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applicants Modal */}
        {selectedPosition && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                  <div className="flex items-center space-x-3">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPosition.position.job_title}
                    </h2>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {selectedPosition.position.job_number_needed} Needed
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Company:</span>{" "}
                      {selectedPosition.jobOrder.company_name}
                    </p>
                    {selectedPosition.jobOrder.jo_deadline && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Deadline:</span>{" "}
                        {selectedPosition.jobOrder.jo_deadline}
                      </p>
                    )}
                    {selectedPosition.position.job_contract_length && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Contract:</span>{" "}
                        {selectedPosition.position.job_contract_length}
                      </p>
                    )}
                    {selectedPosition.position.job_salary_range && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Salary:</span>{" "}
                        {selectedPosition.position.job_salary_range}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

               {/* Search and filter */}
              <div className={`px-6 py-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search applicants by name..."
                      value={applicantSearchTerm}
                      onChange={(e) => setApplicantSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                    />
                  </div>
                  <select
                    value={applicantFilterStatus}
                    onChange={(e) => setApplicantFilterStatus(e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  >
                    <option value="All">All Status</option>
                    {[
                      "Applied",
                      "Shortlist",
                      "Scheduled",
                      "Interviewed",
                      "Accepted",
                      "Declined",
                      "Rejected",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <select
                    value={applicantScoreSort}
                    onChange={(e) => setApplicantScoreSort(e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                  >
                    <option value="none">Resume Score (Default)</option>
                    <option value="high-to-low">
                      Resume Score (High to Low)
                    </option>
                    <option value="low-to-high">
                      Resume Score (Low to High)
                    </option>
                  </select>
                </div>
              </div>

              {/* Position details */}
            <div className={`px-6 py-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedPosition.position.job_description && (
            <div className={`border-l-4 border-blue-600 rounded-lg p-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                Position Description
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedPosition.position.job_description}
              </p>
            </div>
          )}
                  {selectedPosition.position.job_requirements?.length > 0 && (
                    <div className={`border-l-4 border-purple-600 rounded-lg p-4 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                      <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-900'}`}>
                        Position Requirements
                      </h3>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {Array.isArray(
                          selectedPosition.position.job_requirements,
                        )
                          ? selectedPosition.position.job_requirements.join(
                              ", ",
                            )
                          : selectedPosition.position.job_requirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Applicants table */}
              <div className="flex-1 overflow-auto p-6">
                <div className={`rounded-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <table className="w-full">
                    <thead className={`sticky top-0 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                      <tr>
                        {[
                          "Name",
                          "Resume Score",
                          "Job Fit Score",
                          "Status",
                          "Interviewer",
                          "Applied Date",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'bg-gray-700 divide-gray-600' : 'bg-white divide-gray-200'}`}>
                      {(() => {
                        let filtered =
                          selectedPosition.position.applicants.filter((a) => {
                            const fullName =
                              `${a.app_first_name} ${a.app_last_name}`.toLowerCase();
                            const matchesSearch = fullName.includes(
                              applicantSearchTerm.toLowerCase(),
                            );
                            const matchesStatus =
                              applicantFilterStatus === "All" ||
                              a.application_current_status ===
                                applicantFilterStatus;
                            return matchesSearch && matchesStatus;
                          });
                        if (applicantScoreSort === "high-to-low")
                          filtered = [...filtered].sort(
                            (a, b) => b.resume_score - a.resume_score,
                          );
                        if (applicantScoreSort === "low-to-high")
                          filtered = [...filtered].sort(
                            (a, b) => a.resume_score - b.resume_score,
                          );

                        if (filtered.length === 0)
                          return (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-8 text-center text-gray-500"
                              >
                                No applicants found
                              </td>
                            </tr>
                          );

                        return filtered.map((applicant) => (
                          <tr
                            key={applicant.application_id}
                            className={`cursor-pointer ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setApplicantEditForm({
                                interviewer: applicant.interviewer || "",
                                meetingLink: applicant.meeting_link || "",
                                interviewDate: applicant.interview_date || "",
                                declinedReason: applicant.declined_reason || "",
                                rejectedReason: applicant.rejected_reason || "",
                                salaryRange: selectedPosition?.position.job_salary_range || "",
                              });
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-green-600 font-semibold text-sm">
                                    {applicant.app_first_name[0]}
                                    {applicant.app_last_name[0]}
                                  </span>
                                </div>
                                <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {applicant.app_first_name}{" "}
                                  {applicant.app_last_name}
                                </div>
                              </div>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={applicant.application_current_status}
                                onChange={(e) =>
                                  handleApplicantStatusChange(
                                    applicant.application_id,
                                    e.target.value,
                                  )
                                }
                                className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${getApplicantStatusColor(applicant.application_current_status)}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {[
                                  "Applied",
                                  "Shortlist",
                                  "Scheduled",
                                  "Interviewed",
                                  "Accepted",
                                  "Rejected",
                                ].map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              {applicant.interviewer || (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {applicant.applied_date}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={`flex justify-end items-center space-x-3 px-6 py-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                {/* TODO: wire up export handler */}
                <button
                  onClick={() => alert("Export coming soon.")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Export Applicants
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applicant Detail Modal */}
        {selectedApplicant && (
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={() => {
              setSelectedApplicant(null);
              setIsEditingApplicant(false);
            }}
          >
            <div
              className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xl">
                      {selectedApplicant.app_first_name[0]}
                      {selectedApplicant.app_last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedApplicant.app_first_name}{" "}
                      {selectedApplicant.app_last_name}
                    </h2>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1 ${getApplicantStatusColor(selectedApplicant.application_current_status)}`}
                    >
                      {selectedApplicant.application_current_status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedApplicant(null);
                    setIsEditingApplicant(false);
                  }}
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resume Score</p>
                    <p
                      className={`text-base ${getScoreColor(selectedApplicant.resume_score)}`}
                    >
                      {selectedApplicant.resume_score?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Job Fit Score</p>
                    <p
                      className={`text-base ${getScoreColor(selectedApplicant.job_fit_score)}`}
                    >
                      {selectedApplicant.job_fit_score?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Applied Date</p>
                    <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {selectedApplicant.applied_date || "—"}
                    </p>
                  </div>
                </div>

                {/* Interviewer */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Interviewer</p>
                  {isEditingApplicant ? (
                    <input
                      type="text"
                      value={applicantEditForm.interviewer}
                      onChange={(e) =>
                        setApplicantEditForm({
                          ...applicantEditForm,
                          interviewer: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter interviewer name"
                    />
                  ) : (
                    <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {selectedApplicant.interviewer || "—"}
                    </p>
                  )}
                </div>

                 {/* Interview Date */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Interview Date</p>
                  {isEditingApplicant ? (
                    <input
                      type="date"
                      value={applicantEditForm.interviewDate}
                      onChange={(e) =>
                        setApplicantEditForm({
                          ...applicantEditForm,
                          interviewDate: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                    />
                  ) : (
                    <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {selectedApplicant.interview_date || "—"}
                    </p>
                  )}
                </div>

                {/* Salary Range */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Salary Range</p>
                  {isEditingApplicant ? (
              <input
                type="text"
                value={applicantEditForm.salaryRange}
                onChange={(e) =>
                  setApplicantEditForm({ ...applicantEditForm, salaryRange: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                placeholder="e.g. $3,000-$5,000/month"
                />
            ) : (
              <p className={`text-base ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                {selectedPosition?.position.job_salary_range || "—"}
              </p>
            )}
          </div>

                {/* Meeting Link */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Meeting Link</p>
                  {isEditingApplicant ? (
                    <input
                      type="text"
                      value={applicantEditForm.meetingLink}
                      onChange={(e) =>
                        setApplicantEditForm({
                          ...applicantEditForm,
                          meetingLink: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://meet.example.com/..."
                    />
                  ) : selectedApplicant.meeting_link ? (
                    <a
                      href={selectedApplicant.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-sm break-all"
                    >
                      {selectedApplicant.meeting_link}
                    </a>
                  ) : (
                    <p className="text-gray-400">—</p>
                  )}
                </div>

                {/* Declined Reason */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Declined Reason</p>
                  {isEditingApplicant ? (
                    <textarea
                      value={applicantEditForm.declinedReason}
                      onChange={(e) =>
                        setApplicantEditForm({
                          ...applicantEditForm,
                          declinedReason: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter declined reason (if applicable)"
                    />
                  ) : selectedApplicant.declined_reason ? (
                    <div className={`border rounded-lg p-4 ${darkMode ? 'bg-orange-900/30 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
                      <p className={darkMode ? 'text-orange-300' : 'text-orange-800'}>
                        {selectedApplicant.declined_reason}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400">—</p>
                  )}
                </div>

                {/* Rejected Reason */}
                <div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rejected Reason</p>
                  {isEditingApplicant ? (
                    <textarea
                      value={applicantEditForm.rejectedReason}
                      onChange={(e) =>
                        setApplicantEditForm({
                          ...applicantEditForm,
                          rejectedReason: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter rejected reason (if applicable)"
                    />
                  ) : selectedApplicant.rejected_reason ? (
                    <div className={`border rounded-lg p-4 ${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'}`}>
                      <p className={darkMode ? 'text-red-300' : 'text-red-800'}>
                        {selectedApplicant.rejected_reason}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-400">—</p>
                  )}
                </div>

                {/* Resume */}
                <div className={`border-l-4 border-blue-600 rounded-lg p-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className={`font-bold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>Resume</h3>
                    </div>
                    <div className="flex space-x-2">
                      {selectedApplicant.resume_url ? (
                        <>
                          <a
                            href={selectedApplicant.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </a>
                          <a
                            href={selectedApplicant.resume_url}
                            download={`${selectedApplicant.app_first_name}-${selectedApplicant.app_last_name}-Resume.pdf`}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                          </a>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          No resume uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`sticky bottom-0 border-t px-6 py-4 flex justify-between items-center ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="relative group">
                  <button
                    disabled={
                      selectedApplicant.application_current_status !==
                      "Interviewed"
                    }
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedApplicant.application_current_status ===
                      "Interviewed"
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Offer</span>
                  </button>
                  {selectedApplicant.application_current_status !==
                    "Interviewed" && (
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3">
                      Applicant must be interviewed
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedApplicant(null);
                      setIsEditingApplicant(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Close
                  </button>
                  {isEditingApplicant ? (
                    <button
                      onClick={async () => {
                        const { error: updateError } = await supabase
                          .from("t_applications")
                          .update({
                            application_interviewer:
                              applicantEditForm.interviewer,
                            application_interview_schedule:
                              applicantEditForm.interviewDate,
                            application_meeting_link:
                              applicantEditForm.meetingLink,
                            application_decline_reason:
                              applicantEditForm.declinedReason,
                            application_rejected_reason:
                              applicantEditForm.rejectedReason,
                          })
                          .eq(
                            "application_id",
                            selectedApplicant.application_id,
                          );
                        // After the t_applications update, add this:
                        if (applicantEditForm.salaryRange !== selectedPosition?.position.job_salary_range) {
                          await supabase
                            .from("t_job_positions")
                            .update({ job_salary_range: applicantEditForm.salaryRange })
                            .eq("position_id", selectedPosition!.position.position_id);
                          // Sync it locally too
                          setSelectedPosition({
                            ...selectedPosition!,
                            position: {
                              ...selectedPosition!.position,
                              job_salary_range: applicantEditForm.salaryRange,
                            },
                          });
                        }
                        if (updateError) {
                          alert("Failed to save changes.");
                          return;
                        }

                        const updatedApplicant = {
                          ...selectedApplicant,
                          interviewer: applicantEditForm.interviewer,
                          interview_date: applicantEditForm.interviewDate,
                          meeting_link: applicantEditForm.meetingLink,
                          declined_reason: applicantEditForm.declinedReason,
                          rejected_reason: applicantEditForm.rejectedReason,
                        };

                        if (selectedPosition) {
                          const updatedApplicants =
                            selectedPosition.position.applicants.map((a) =>
                              a.application_id ===
                              selectedApplicant.application_id
                                ? updatedApplicant
                                : a,
                            );
                          setSelectedPosition({
                            ...selectedPosition,
                            position: {
                              ...selectedPosition.position,
                              applicants: updatedApplicants,
                            },
                          });
                        }

                        setSelectedApplicant(updatedApplicant);
                        setIsEditingApplicant(false);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Save Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingApplicant(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Edit Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Position Modal */}
        {showAddPositionModal && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`flex items-center justify-between p-6 border-b sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add New Position
                </h2>
                <button
                  onClick={() => setShowAddPositionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                {[
                  {
                    label: "Job Title",
                    key: "job_title",
                    type: "input",
                    placeholder: "e.g., Software Engineer",
                  },
                  {
                    label: "Job Description",
                    key: "job_description",
                    type: "textarea",
                    placeholder: "Describe the role...",
                  },
                  {
                    label: "Job Requirements",
                    key: "job_requirements",
                    type: "textarea",
                    placeholder: "List qualifications...",
                  },
                  {
                    label: "Contract Length",
                    key: "job_contract_length",
                    type: "input",
                    placeholder: "e.g., 6 months",
                  },
                  {
                    label: "Salary Range",
                    key: "job_salary_range",
                    type: "input",
                    placeholder: "e.g., $3,000-$5,000/month",
                  },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    {type === "textarea" ? (
                      <textarea
                        value={(newPosition as any)[key]}
                        onChange={(e) =>
                          setNewPosition({
                            ...newPosition,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={placeholder}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(newPosition as any)[key]}
                        onChange={(e) =>
                          setNewPosition({
                            ...newPosition,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    )}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPosition.job_number_needed}
                    onChange={(e) =>
                      setNewPosition({
                        ...newPosition,
                        job_number_needed: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newPosition.job_category}
                    onChange={(e) =>
                      setNewPosition({
                        ...newPosition,
                        job_category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a category</option>
                    {[
                      "Construction",
                      "Healthcare",
                      "Hospitality",
                      "Manufacturing",
                      "Technology",
                      "Agriculture",
                      "Transportation",
                      "Other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={`flex items-center justify-end space-x-3 p-6 border-t ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <button
                  onClick={() => setShowAddPositionModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPosition}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Position"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Form View
  if (viewMode === "form") {
    return (
      <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`border-b px-6 py-5 shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-4 max-w-7xl mx-auto">
            <button
              onClick={() => {
                setViewMode("list");
                resetForm();
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Job Orders</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Job Order
              </h1>
              <p className="text-sm text-gray-600">
                Fill in details and add positions
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Left - Job Order Info */}
            <div className="space-y-6">
              <div className={`border border-gray-200 rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`border-l-4 border-green-600 p-5 rounded-lg space-y-4 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Job Order Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobOrderForm.company_id}
                      onChange={(e) => {
                        const company = companies.find(
                          (c) => c.company_id === Number(e.target.value),
                        );
                        setJobOrderForm({
                          ...jobOrderForm,
                          company_id: e.target.value,
                          jo_country: company?.company_country || "",
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    >
                      <option value="">Select a company</option>
                      {companies.map((c) => (
                        <option key={c.company_id} value={c.company_id}>
                          {c.company_name} — {c.company_country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={jobOrderForm.jo_country}
                      onChange={(e) =>
                        setJobOrderForm({
                          ...jobOrderForm,
                          jo_country: e.target.value,
                        })
                      }
                      placeholder="Auto-filled from company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Point Person <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobOrderForm.jo_created_by}
                      onChange={(e) =>
                        setJobOrderForm({
                          ...jobOrderForm,
                          jo_created_by: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    >
                      <option value="">Select a point person</option>
                      {employees.map((e) => (
                        <option key={e.employee_id} value={e.employee_id}>
                          {e.employee_first_name} {e.employee_last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Application Deadline{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={jobOrderForm.jo_deadline}
                      onChange={(e) =>
                        setJobOrderForm({
                          ...jobOrderForm,
                          jo_deadline: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jobOrderForm.is_active}
                        onChange={(e) =>
                          setJobOrderForm({
                            ...jobOrderForm,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-green-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jobOrderForm.is_posted}
                        onChange={(e) =>
                          setJobOrderForm({
                            ...jobOrderForm,
                            is_posted: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-green-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Posted
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Added positions preview */}
              {positions.length > 0 && (
                <div className={`border border-gray-200 rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`border-l-4 border-blue-600 p-5 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Added Positions ({positions.length})
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {positions.map((pos, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {pos.job_title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {pos.job_category} • {pos.job_number_needed}{" "}
                              needed • {pos.job_salary_range}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setPositions(
                                positions.filter((_, idx) => idx !== i),
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right - Add Position form */}
            <div className={`border border-gray-200 rounded-xl p-6 shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`border-l-4 border-purple-600 p-5 rounded-lg space-y-4 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add Position
                </h3>

                {[
                  {
                    label: "Position Title",
                    key: "job_title",
                    type: "input",
                    placeholder: "e.g., Software Engineer",
                  },
                  {
                    label: "Description",
                    key: "job_description",
                    type: "textarea",
                    placeholder: "Describe responsibilities...",
                  },
                  {
                    label: "Requirements",
                    key: "job_requirements",
                    type: "textarea",
                    placeholder: "List qualifications...",
                  },
                  {
                    label: "Contract Length",
                    key: "job_contract_length",
                    type: "input",
                    placeholder: "e.g., 6 months",
                  },
                  {
                    label: "Salary Range",
                    key: "job_salary_range",
                    type: "input",
                    placeholder: "e.g., $3,000-$5,000/month",
                  },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    {type === "textarea" ? (
                      <textarea
                        value={(currentPosition as any)[key]}
                        onChange={(e) =>
                          setCurrentPosition({
                            ...currentPosition,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={placeholder}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={(currentPosition as any)[key]}
                        onChange={(e) =>
                          setCurrentPosition({
                            ...currentPosition,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentPosition.job_number_needed}
                    onChange={(e) =>
                      setCurrentPosition({
                        ...currentPosition,
                        job_number_needed: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentPosition.job_category}
                    onChange={(e) =>
                      setCurrentPosition({
                        ...currentPosition,
                        job_category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  >
                    <option value="">Select a category</option>
                    {[
                      "Construction",
                      "Healthcare",
                      "Hospitality",
                      "Manufacturing",
                      "Technology",
                      "Agriculture",
                      "Transportation",
                      "Other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (
                      !currentPosition.job_title ||
                      !currentPosition.job_requirements ||
                      !currentPosition.job_contract_length ||
                      !currentPosition.job_salary_range ||
                      !currentPosition.job_category
                    ) {
                      alert("Please fill in all position fields");
                      return;
                    }
                    setPositions([...positions, { ...currentPosition }]);
                    setCurrentPosition({
                      job_title: "",
                      job_description: "",
                      job_requirements: "",
                      job_number_needed: 1,
                      job_contract_length: "",
                      job_salary_range: "",
                      job_category: "",
                    });
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Position to Job Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>

       <div className={`border-t px-6 py-4 shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              <span className="font-semibold text-lg">{positions.length}</span>{" "}
              position{positions.length !== 1 ? "s" : ""} added
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setViewMode("list");
                  resetForm();
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePostJobOrder}
                disabled={saving}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {saving ? "Posting..." : "Post Job Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Job Orders",
            value: totalJobOrders,
            color: "border-green-600",
          },
          {
            label: "Active Job Orders",
            value: activeJobs,
            color: "border-blue-600",
          },
          {
            label: "Total Positions",
            value: totalPositions,
            color: "border-yellow-600",
          },
          {
            label: "Total Applicants",
            value: totalApplicants,
            color: "border-purple-600",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-lg shadow-md p-4 border-l-4 ${color} ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <p
              className={`text-xs mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {label}
            </p>
            <p
              className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by job order, company, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-300"}`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
          >
            {/* Labels fix*/}
            <option>All</option>
            <option>Active</option>
            <option>Closed</option>
            <option>On Hold</option>
          </select>
        </div>
        <button
          onClick={() => setViewMode("form")}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          disabled={!hasPermission}
        >
          <Plus className="w-5 h-5" />
          <span>Add Job Order</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      <div
        className={`rounded-xl shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        {filteredJobOrders.length === 0 ? (
          <p
            className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            No job orders found.
          </p>
        ) : (
          <div
            className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
          >
            {filteredJobOrders.map((jo) => {
              const totalJobApplicants = jo.positions.reduce(
                (sum, pos) => sum + pos.applicants.length,
                0,
              );
              const totalNeeded = jo.positions.reduce(
                (sum, pos) => sum + pos.job_number_needed,
                0,
              );

              return (
                <div
                  key={jo.jo_id}
                  onClick={() => {
                    setSelectedJobOrder(jo);
                    setViewMode("positions");
                  }}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                    >
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3
                        className={`font-mono font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                         
                      >
                        JO-{jo.jo_id}
                      </h3>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {jo.company_name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {/* job order status*/}
                       <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                         {editingStatus === jo.jo_id ? (
                  <select
                    value={getStatusLabel(jo.is_active, jo.is_posted)}
                    onChange={(e) => {
                      const val = e.target.value;
                      const is_posted = val !== "On Hold";
                      const is_active = val === "Active";
                      handleToggleJobOrderStatus(jo.jo_id, is_active, is_posted);
                      setEditingStatus(null);
                    }}
                    onBlur={() => setEditingStatus(null)}
                    autoFocus
                    className={`text-xs px-2 py-1 rounded-full border-2 border-blue-500 focus:outline-none font-medium ${getStatusColor(jo.is_active, jo.is_posted)} ${darkMode ? 'bg-gray-700 border-blue-400 text-white' : ''}`}
                    >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Closed">Closed</option>
                  </select>) : (
                  <button
                    onClick={() => setEditingStatus(jo.jo_id)}
                    className={`text-xs px-2 py-0.5 rounded-full flex items-center space-x-1 hover:opacity-80 font-medium ${getStatusColor(jo.is_active, jo.is_posted)}`}
                    >
                    <span>{getStatusLabel(jo.is_active, jo.is_posted)}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
                       </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                      <p
                        className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                        Slots Needed
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {totalNeeded}
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p
                        className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Applicants
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {totalJobApplicants}
                      </p>
                    </div>
                    <div className="text-right hidden lg:block">
                      <p
                        className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        Deadline
                      </p>
                      <p
                        className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {jo.jo_deadline}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
