import { useState, useEffect } from "react";
import {
  Search,
  Building2,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "./supabaseClient";

interface JobOrderSummary {
  jo_id: number;
  is_active: boolean | null;
  is_posted: boolean;
  jo_deadline: string;
  position_count: number;
  applicant_count: number;
}

interface Company {
  company_id: number;
  company_name: string;
  company_country: string;
  company_contact: string;
  company_representative: string;
  company_email: string;
  job_orders: JobOrderSummary[];
}

interface FormData {
  company_name: string;
  company_country: string;
  company_contact: string;
  company_representative: string;
  company_email: string;
}

export default function Companies({
  darkMode = false,
}: {
  darkMode?: boolean;
}) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCompanies, setExpandedCompanies] = useState(new Set<number>());
  const [expandedJobOrders, setExpandedJobOrders] = useState(new Set<number>());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    company_name: "",
    company_country: "",
    company_contact: "",
    company_representative: "",
    company_email: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase.from("t_companies").select(`
      company_id,
      company_name,
      company_country,
      company_contact,
      company_representative,
      company_email,
      t_job_orders(
        jo_id,
        is_active,
        is_posted,
        deadline:t_date!t_job_orders_jo_deadline_id_fkey(full_date),
        t_job_positions(
          position_id,
          t_applications(application_id)
        )
      )
    `);

    if (dbError) {
      console.error(dbError);
      setError("Failed to load companies.");
      setLoading(false);
      return;
    }

    const mapped: Company[] = (data || []).map((row: any) => ({
      company_id: row.company_id,
      company_name: row.company_name || "",
      company_country: row.company_country || "",
      company_contact: row.company_contact || "",
      company_representative: row.company_representative || "",
      company_email: row.company_email || "",
      job_orders: (row.t_job_orders || []).map((jo: any) => ({
        jo_id: jo.jo_id,
        is_active: jo.is_active ?? null,
        is_posted: jo.is_posted ?? false,
        jo_deadline: jo.deadline?.full_date || "",
        position_count: (jo.t_job_positions || []).length,
        applicant_count: (jo.t_job_positions || []).reduce(
          (sum: number, pos: any) => sum + (pos.t_applications || []).length,
          0,
        ),
      })),
    }));

    setCompanies(mapped);
    setLoading(false);
  };

  const handleStatusUpdate = async (
    jo_id: number,
    is_active: boolean | null,
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

    setCompanies((prev) =>
      prev.map((company) => ({
        ...company,
        job_orders: company.job_orders.map((jo) =>
          jo.jo_id === jo_id ? { ...jo, is_active, is_posted } : jo,
        ),
      })),
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error: insertError } = await supabase.from("t_companies").insert({
      company_name: formData.company_name,
      company_country: formData.company_country,
      company_contact: formData.company_contact,
      company_representative: formData.company_representative,
      company_email: formData.company_email,
    });

    if (insertError) {
      alert("Failed to add company.");
      setSaving(false);
      return;
    }

    await fetchCompanies();
    setSaving(false);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setSaving(true);

    const { error: updateError } = await supabase
      .from("t_companies")
      .update({
        company_name: formData.company_name,
        company_country: formData.company_country,
        company_contact: formData.company_contact,
        company_representative: formData.company_representative,
        company_email: formData.company_email,
      })
      .eq("company_id", editingCompany.company_id);

    if (updateError) {
      alert("Failed to update company.");
      setSaving(false);
      return;
    }

    await fetchCompanies();
    setSaving(false);
    setEditingCompany(null);
    resetForm();
  };

  const handleDelete = async (company_id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this company? This may affect related job orders.",
      )
    )
      return;

    const { error: deleteError } = await supabase
      .from("t_companies")
      .delete()
      .eq("company_id", company_id);

    if (deleteError) {
      alert("Failed to delete company. It may have existing job orders.");
      return;
    }

    setCompanies((prev) => prev.filter((c) => c.company_id !== company_id));
  };

  const resetForm = () => {
    setFormData({
      company_name: "",
      company_country: "",
      company_contact: "",
      company_representative: "",
      company_email: "",
    });
  };

  const openEdit = (company: Company) => {
    setFormData({
      company_name: company.company_name,
      company_country: company.company_country,
      company_contact: company.company_contact,
      company_representative: company.company_representative,
      company_email: company.company_email,
    });
    setEditingCompany(company);
  };

  const toggleCompany = (company_id: number) => {
    const newExpanded = new Set(expandedCompanies);
    newExpanded.has(company_id)
      ? newExpanded.delete(company_id)
      : newExpanded.add(company_id);
    setExpandedCompanies(newExpanded);
  };

  const toggleJobOrder = (jo_id: number) => {
    const newExpanded = new Set(expandedJobOrders);
    newExpanded.has(jo_id) ? newExpanded.delete(jo_id) : newExpanded.add(jo_id);
    setExpandedJobOrders(newExpanded);
  };

  const getStatusLabel = (is_active: boolean | null, is_posted: boolean) => {
    if (!is_posted) return "Draft";
    if (is_active === null) return "On Hold";
    if (is_active) return "Active";
    return "Closed";
  };

  const getStatusColor = (is_active: boolean | null, is_posted: boolean) => {
    if (!is_posted) return "bg-gray-100 text-gray-800";
    if (is_active === null) return "bg-yellow-100 text-yellow-800";
    if (is_active) return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const getSelectValue = (is_active: boolean | null, is_posted: boolean) => {
    if (!is_posted) return "draft";
    if (is_active === null) return "onhold";
    if (is_active) return "active";
    return "closed";
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company_country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalJobOrders = companies.reduce(
    (sum, c) => sum + c.job_orders.length,
    0,
  );
  const totalApplicants = companies.reduce(
    (sum, c) => sum + c.job_orders.reduce((s, jo) => s + jo.applicant_count, 0),
    0,
  );

  const modalForm = (onSubmit: (e: React.FormEvent) => void, title: string) => (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl shadow-xl max-w-md w-full p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={() => {
              setShowAddModal(false);
              setEditingCompany(null);
              resetForm();
            }}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          {[
            {
              label: "Company Name",
              key: "company_name",
              placeholder: "Enter company name",
              required: true,
            },
            {
              label: "Country",
              key: "company_country",
              placeholder: "Enter country",
              required: true,
            },
            {
              label: "Contact Number",
              key: "company_contact",
              placeholder: "Enter contact number",
            },
            {
              label: "Representative",
              key: "company_representative",
              placeholder: "Enter representative name",
            },
            {
              label: "Email",
              key: "company_email",
              placeholder: "Enter company email",
            },
          ].map(({ label, key, placeholder, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={formData[key as keyof FormData]}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder={placeholder}
                required={required}
              />
            </div>
          ))}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingCompany(null);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading companies...
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Companies",
            value: companies.length,
            color: "border-green-600",
          },
          {
            label: "Total Job Orders",
            value: totalJobOrders,
            color: "border-blue-600",
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

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search companies or countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "border-gray-300"
            }`}
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Companies List */}
      <div
        className={`rounded-xl shadow-md overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        {filteredCompanies.length === 0 ? (
          <p
            className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            No companies found.
          </p>
        ) : (
          <div
            className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
          >
            {filteredCompanies.map((company) => (
              <div key={company.company_id}>
                {/* Company Row */}
                <div
                  onClick={() => toggleCompany(company.company_id)}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                    >
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {company.company_name}
                      </h3>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {company.company_country} • {company.job_orders.length}{" "}
                        Job Order{company.job_orders.length !== 1 ? "s" : ""}
                      </p>
                      {company.company_representative && (
                        <p
                          className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                          Rep: {company.company_representative}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block mr-4">
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Active Job Orders
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {
                        company.job_orders.filter(
                          (jo) => jo.is_active === true && jo.is_posted,
                        ).length
                      }
                    </p>
                  </div>
                  <div
                    className="flex space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(company)}
                      className={`p-2 rounded-lg ${darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.company_id)}
                      className={`p-2 rounded-lg ${darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {expandedCompanies.has(company.company_id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  )}
                </div>

                {/* Expanded Job Orders */}
                {expandedCompanies.has(company.company_id) && (
                  <div
                    className={`px-4 py-2 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
                  >
                    <div className="ml-16 space-y-2">
                      {company.job_orders.length === 0 ? (
                        <p
                          className={`text-sm py-3 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                          No job orders yet.
                        </p>
                      ) : (
                        company.job_orders.map((jo) => (
                          <div
                            key={jo.jo_id}
                            className={`rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                          >
                            <div
                              onClick={() => toggleJobOrder(jo.jo_id)}
                              className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p
                                    className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                                  >
                                    Job Order #{jo.jo_id}
                                  </p>
                                  {/* Status Dropdown */}
                                  <div
                                    className="relative inline-block mt-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {editingStatus === jo.jo_id ? (
                                      <select
                                        value={getSelectValue(
                                          jo.is_active,
                                          jo.is_posted,
                                        )}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          if (val === "active")
                                            handleStatusUpdate(
                                              jo.jo_id,
                                              true,
                                              true,
                                            );
                                          else if (val === "closed")
                                            handleStatusUpdate(
                                              jo.jo_id,
                                              false,
                                              true,
                                            );
                                          else if (val === "onhold")
                                            handleStatusUpdate(
                                              jo.jo_id,
                                              null,
                                              true,
                                            );
                                          else if (val === "draft")
                                            handleStatusUpdate(
                                              jo.jo_id,
                                              false,
                                              false,
                                            );
                                          setEditingStatus(null);
                                        }}
                                        onBlur={() => setEditingStatus(null)}
                                        autoFocus
                                        className={`text-xs px-2 py-1 rounded-full border-2 border-blue-500 focus:outline-none ${getStatusColor(jo.is_active, jo.is_posted)}`}
                                      >
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                        <option value="onhold">On Hold</option>
                                        <option value="draft">Draft</option>
                                      </select>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          setEditingStatus(jo.jo_id)
                                        }
                                        className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 hover:opacity-80 transition-opacity ${getStatusColor(jo.is_active, jo.is_posted)}`}
                                      >
                                        <span>
                                          {getStatusLabel(
                                            jo.is_active,
                                            jo.is_posted,
                                          )}
                                        </span>
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {expandedJobOrders.has(jo.jo_id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>

                            {/* Expanded Job Order Details */}
                            {expandedJobOrders.has(jo.jo_id) && (
                              <div
                                className={`px-3 pb-3 border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                  <div
                                    className={`p-3 rounded-lg ${darkMode ? "bg-blue-900" : "bg-blue-50"}`}
                                  >
                                    <p
                                      className={`text-xs mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                                    >
                                      Positions
                                    </p>
                                    <p
                                      className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                                    >
                                      {jo.position_count}
                                    </p>
                                  </div>
                                  <div
                                    className={`p-3 rounded-lg ${darkMode ? "bg-green-900" : "bg-green-50"}`}
                                  >
                                    <p
                                      className={`text-xs mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                                    >
                                      Applicants
                                    </p>
                                    <div className="flex items-center space-x-2">
                                      <Users className="w-4 h-4 text-green-600" />
                                      <p className="font-bold text-green-600">
                                        {jo.applicant_count}
                                      </p>
                                    </div>
                                  </div>
                                  <div
                                    className={`p-3 rounded-lg ${darkMode ? "bg-purple-900" : "bg-purple-50"}`}
                                  >
                                    <p
                                      className={`text-xs mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                                    >
                                      Deadline
                                    </p>
                                    <p
                                      className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                                    >
                                      {jo.jo_deadline || "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && modalForm(handleAddSubmit, "Add Company")}

      {/* Edit Modal */}
      {editingCompany && modalForm(handleEditSubmit, "Edit Company")}
    </div>
  );
}
