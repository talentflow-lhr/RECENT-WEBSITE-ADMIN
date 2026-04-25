import { useState, useEffect } from "react";
import { Shield, Users, Edit, Trash2, Plus, X } from "lucide-react";
import { supabase } from "./supabaseClient";

interface Role {
  role_id: number;
  role_name: string;
  role_description: string;
  user_count: number;
}

interface FormData {
  role_name: string;
  role_description: string;
}

const allPermissions = [
  "All Permissions",
  "Manage Users",
  "Manage Roles",
  "View Analytics",
  "Manage Orders",
  "Manage Applicants",
  "View Job Orders",
  "Update Status",
];

// Since permissions aren't in the DB, we define defaults per role name
const defaultPermissions: Record<string, string[]> = {
  Admin: [
    "All Permissions",
    "Manage Users",
    "Manage Roles",
    "View Analytics",
    "Manage Orders",
  ],
  "Project Manager": [
    "View Analytics",
    "Manage Orders",
    "Manage Applicants",
    "View Job Orders",
    "Update Status",
  ],
  "Project Officer": ["Manage Applicants", "View Job Orders", "Update Status"],
};

export default function ManageRoles({
  darkMode = false,
}: {
  darkMode?: boolean;
}) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    role_name: "",
    role_description: "",
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase.from("t_role").select(`
        role_id,
        role_name,
        role_description,
        t_employee(employee_id)
      `);

    if (dbError) {
      console.error(dbError);
      setError("Failed to load roles.");
      setLoading(false);
      return;
    }

    const mapped: Role[] = (data || []).map((row: any) => ({
      role_id: row.role_id,
      role_name: row.role_name || "",
      role_description: row.role_description || "",
      user_count: (row.t_employee || []).length,
    }));

    setRoles(mapped);
    setLoading(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error: insertError } = await supabase.from("t_role").insert({
      role_name: formData.role_name,
      role_description: formData.role_description,
    });

    if (insertError) {
      alert("Failed to add role.");
      setSaving(false);
      return;
    }

    await fetchRoles();
    setSaving(false);
    setShowAddModal(false);
    setFormData({ role_name: "", role_description: "" });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setSaving(true);

    const { error: updateError } = await supabase
      .from("t_role")
      .update({
        role_name: formData.role_name,
        role_description: formData.role_description,
      })
      .eq("role_id", editingRole.role_id);

    if (updateError) {
      alert("Failed to update role.");
      setSaving(false);
      return;
    }

    await fetchRoles();
    setSaving(false);
    setEditingRole(null);
    setFormData({ role_name: "", role_description: "" });
  };

  const handleDelete = async (role_id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? Employees assigned to it will lose their role.",
      )
    )
      return;

    const { error: deleteError } = await supabase
      .from("t_role")
      .delete()
      .eq("role_id", role_id);

    if (deleteError) {
      alert(
        "Failed to delete role. It may still have employees assigned to it.",
      );
      return;
    }

    setRoles((prev) => prev.filter((r) => r.role_id !== role_id));
    if (selectedRole?.role_id === role_id) setSelectedRole(null);
  };

  const getRolePermissions = (roleName: string) => {
    return defaultPermissions[roleName] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading roles...
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
      <div className="flex justify-between items-center">
        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
          Manage user roles and permissions
        </p>
        <button
          onClick={() => {
            setFormData({ role_name: "", role_description: "" });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.length === 0 ? (
          <p
            className={`col-span-2 text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            No roles found.
          </p>
        ) : (
          roles.map((role) => (
            <div
              key={role.role_id}
              className={`rounded-xl shadow-md p-6 border-2 transition-all cursor-pointer ${
                selectedRole?.role_id === role.role_id
                  ? "border-green-600"
                  : darkMode
                    ? "border-transparent bg-gray-800"
                    : "border-transparent bg-white"
              } ${darkMode ? "bg-gray-800" : "bg-white"}`}
              onClick={() =>
                setSelectedRole(
                  selectedRole?.role_id === role.role_id ? null : role,
                )
              }
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                  >
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {role.role_name}
                    </h3>
                    <p
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {role.role_description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({
                        role_name: role.role_name,
                        role_description: role.role_description,
                      });
                      setEditingRole(role);
                    }}
                    className={`p-2 rounded-lg ${darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(role.role_id);
                    }}
                    className={`p-2 rounded-lg ${darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className={`flex items-center space-x-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {role.user_count} user{role.user_count !== 1 ? "s" : ""}{" "}
                    with this role
                  </span>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Permissions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getRolePermissions(role.role_name).length > 0 ? (
                      getRolePermissions(role.role_name).map(
                        (permission, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {permission}
                          </span>
                        ),
                      )
                    ) : (
                      <span
                        className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        No permissions defined
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Permission Details Panel */}
      {selectedRole && (
        <div
          className={`rounded-xl shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h2
            className={`text-xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Permissions for {selectedRole.role_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPermissions.map((permission, index) => {
              const isChecked = getRolePermissions(
                selectedRole.role_name,
              ).includes(permission);
              return (
                <label
                  key={index}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span
                    className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {permission}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setSelectedRole(null)}
              className={`px-4 py-2 border rounded-lg transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Permissions saved!");
                setSelectedRole(null);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl shadow-xl max-w-md w-full p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Add New Role
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleAddSubmit}>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.role_name}
                  onChange={(e) =>
                    setFormData({ ...formData, role_name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Description
                </label>
                <textarea
                  value={formData.role_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_description: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Enter role description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Adding..." : "Add Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-xl shadow-xl max-w-md w-full p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Edit Role
              </h2>
              <button
                onClick={() => setEditingRole(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.role_name}
                  onChange={(e) =>
                    setFormData({ ...formData, role_name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Description
                </label>
                <textarea
                  value={formData.role_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_description: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Enter role description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
