import { useState, useEffect } from "react";
import { Search, UserPlus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { supabase } from "./supabaseClient";

interface Role {
  role_id: number;
  role_name: string;
}

interface User {
  employee_id: number;
  employee_first_name: string;
  employee_middle_name: string;
  employee_last_name: string;
  employee_suffix: string;
  employee_email: string;
  employee_phone_number: string;
  employee_start_date: string;
  employee_is_active: boolean;
  employee_address: string;
  role_id: number;
  role_name: string;
  has_account: boolean;
  admin_acc_username?: string;
}

interface FormData {
  employee_first_name: string;
  employee_middle_name: string;
  employee_last_name: string;
  employee_suffix: string;
  employee_email: string;
  employee_phone_number: string;
  employee_address: string;
  role_id: number;
  employee_is_active: boolean;
  admin_acc_username: string;
  admin_acc_password: string;
}

export default function ManageUsers({ darkMode = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    employee_first_name: "",
    employee_middle_name: "",
    employee_last_name: "",
    employee_suffix: "",
    employee_email: "",
    employee_phone_number: "",
    employee_address: "",
    role_id: 1,
    employee_is_active: true,
    admin_acc_username: "",
    admin_acc_password: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const { data, error: dbError } = await supabase
      .from("t_role")
      .select("role_id, role_name");
    if (!dbError && data) setRoles(data);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase.from("t_employee").select(`
        employee_id,
        employee_first_name,
        employee_middle_name,
        employee_last_name,
        employee_suffix,
        employee_email,
        employee_phone_number,
        employee_start_date,
        employee_is_active,
        employee_address,
        role_id,
        t_role(role_name),
        t_admin_account(admin_acc_username)
      `);

    if (dbError) {
      console.error(dbError);
      setError("Failed to load users.");
      setLoading(false);
      return;
    }

    const mapped: User[] = (data || []).map((row: any) => ({
      employee_id: row.employee_id,
      employee_first_name: row.employee_first_name || "",
      employee_middle_name: row.employee_middle_name || "",
      employee_last_name: row.employee_last_name || "",
      employee_suffix: row.employee_suffix || "",
      employee_email: row.employee_email || "",
      employee_phone_number: row.employee_phone_number || "",
      employee_start_date: row.employee_start_date || "",
      employee_is_active: row.employee_is_active ?? true,
      employee_address: row.employee_address || "",
      role_id: row.role_id,
      role_name: row.t_role?.role_name || "",
      has_account: (row.t_admin_account || []).length > 0,
      admin_acc_username: row.t_admin_account?.[0]?.admin_acc_username || "",
    }));

    setUsers(mapped);
    setLoading(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      employee_first_name: user.employee_first_name,
      employee_middle_name: user.employee_middle_name,
      employee_last_name: user.employee_last_name,
      employee_suffix: user.employee_suffix,
      employee_email: user.employee_email,
      employee_phone_number: user.employee_phone_number,
      employee_address: user.employee_address,
      role_id: user.role_id,
      employee_is_active: user.employee_is_active,
      admin_acc_username: user.admin_acc_username || "",
      admin_acc_password: "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (employee_id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const { error: dbError } = await supabase
      .from("t_employee")
      .delete()
      .eq("employee_id", employee_id);

    if (dbError) {
      alert("Failed to delete user.");
      return;
    }

    setUsers((prev) => prev.filter((u) => u.employee_id !== employee_id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingUser) {
      const { error: updateError } = await supabase
        .from("t_employee")
        .update({
          employee_first_name: formData.employee_first_name,
          employee_middle_name: formData.employee_middle_name,
          employee_last_name: formData.employee_last_name,
          employee_suffix: formData.employee_suffix,
          employee_email: formData.employee_email,
          employee_phone_number: formData.employee_phone_number,
          employee_address: formData.employee_address,
          role_id: formData.role_id,
          employee_is_active: formData.employee_is_active,
        })
        .eq("employee_id", editingUser.employee_id);

      if (updateError) {
        alert("Failed to update user.");
        setSaving(false);
        return;
      }

      if (formData.admin_acc_username && editingUser.has_account) {
        const updatePayload: any = {
          admin_acc_username: formData.admin_acc_username,
        };
        if (formData.admin_acc_password)
          updatePayload.admin_acc_password = formData.admin_acc_password;
        await supabase
          .from("t_admin_account")
          .update(updatePayload)
          .eq("employee_id", editingUser.employee_id);
      }

      if (
        formData.admin_acc_username &&
        !editingUser.has_account &&
        formData.admin_acc_password
      ) {
        await supabase.from("t_admin_account").insert({
          employee_id: editingUser.employee_id,
          admin_acc_username: formData.admin_acc_username,
          admin_acc_password: formData.admin_acc_password,
        });
      }
    } else {
      const { data: newEmployee, error: insertError } = await supabase
        .from("t_employee")
        .insert({
          employee_first_name: formData.employee_first_name,
          employee_middle_name: formData.employee_middle_name,
          employee_last_name: formData.employee_last_name,
          employee_suffix: formData.employee_suffix,
          employee_email: formData.employee_email,
          employee_phone_number: formData.employee_phone_number,
          employee_address: formData.employee_address,
          role_id: formData.role_id,
          employee_is_active: formData.employee_is_active,
          employee_start_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (insertError || !newEmployee) {
        alert("Failed to add user.");
        setSaving(false);
        return;
      }

      if (formData.admin_acc_username && formData.admin_acc_password) {
        await supabase.from("t_admin_account").insert({
          employee_id: newEmployee.employee_id,
          admin_acc_username: formData.admin_acc_username,
          admin_acc_password: formData.admin_acc_password,
        });
      }
    }

    await fetchUsers();
    setSaving(false);
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({
      employee_first_name: "",
      employee_middle_name: "",
      employee_last_name: "",
      employee_suffix: "",
      employee_email: "",
      employee_phone_number: "",
      employee_address: "",
      role_id: 1,
      employee_is_active: true,
      admin_acc_username: "",
      admin_acc_password: "",
    });
  };

  const filteredUsers = users.filter((user) => {
    const fullName =
      `${user.employee_first_name} ${user.employee_last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.employee_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p
          className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Loading users...
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
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              employee_first_name: "",
              employee_middle_name: "",
              employee_last_name: "",
              employee_suffix: "",
              employee_email: "",
              employee_phone_number: "",
              employee_address: "",
              role_id: roles[0]?.role_id || 1,
              employee_is_active: true,
              admin_acc_username: "",
              admin_acc_password: "",
            });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <p
            className={`col-span-3 text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            No users found.
          </p>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.employee_id}
              className={`rounded-xl shadow-md p-6 border-l-4 border-green-600 ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? "bg-green-900" : "bg-green-100"}`}
                  >
                    <span className="text-green-600 font-bold text-lg">
                      {user.employee_first_name[0]}
                      {user.employee_last_name[0]}
                    </span>
                  </div>
                  <div>
                    <h3
                      className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {user.employee_first_name} {user.employee_last_name}
                      {user.employee_suffix ? ` ${user.employee_suffix}` : ""}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {user.role_name}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    user.employee_is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.employee_is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div
                  className={`flex items-center space-x-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Mail className="w-4 h-4" />
                  <span>{user.employee_email}</span>
                </div>
                <div
                  className={`flex items-center space-x-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  <Phone className="w-4 h-4" />
                  <span>{user.employee_phone_number || "—"}</span>
                </div>
                {user.has_account && (
                  <div
                    className={`text-xs px-2 py-1 rounded-full w-fit ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                  >
                    Username: {user.admin_acc_username}
                  </div>
                )}
              </div>

              <div
                className={`flex items-center justify-between pt-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <span
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-400"}`}
                >
                  Since: {user.employee_start_date}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className={`p-2 rounded-lg ${darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.employee_id)}
                    className={`p-2 rounded-lg ${darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/30">
          <div
            className={`rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.employee_first_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_first_name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.employee_middle_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_middle_name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                    placeholder="Middle name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.employee_last_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_last_name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                    placeholder="Last name"
                    required
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={formData.employee_suffix}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_suffix: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                    placeholder="e.g., Jr., Sr."
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={formData.employee_email}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_email: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Email address"
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.employee_phone_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employee_phone_number: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Address
                </label>
                <input
                  type="text"
                  value={formData.employee_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employee_address: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                  placeholder="Address"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Role
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_id: Number(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                >
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.employee_is_active}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employee_is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-green-600"
                />
                <label
                  htmlFor="is_active"
                  className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Active
                </label>
              </div>

              {/* Admin Account Section */}
              <div
                className={`border-t pt-4 ${darkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                <p
                  className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Admin Account (optional)
                </p>
                <div className="space-y-3">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.admin_acc_username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          admin_acc_username: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                      placeholder="Login username"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Password{" "}
                      {editingUser?.has_account
                        ? "(leave blank to keep current)"
                        : ""}
                    </label>
                    <input
                      type="password"
                      value={formData.admin_acc_password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          admin_acc_password: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                      placeholder="Login password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
