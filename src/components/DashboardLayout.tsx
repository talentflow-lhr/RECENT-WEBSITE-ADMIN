import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Shield,
  Briefcase,
  Building2,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  TrendingUp,
  Plane,
  UserCheck,
  CheckSquare,
  FileText,
} from "lucide-react";
import logoImage from "figma:asset/59d793a5637be5743b4000eaed07893258073d54.png";
import Dashboard from "./Dashboard";
import DashboardJobOrders from "./DashboardJobOrders";
import Analytics from "./Analytics";
import ManageUsers from "./ManageUsers";
import ManageRoles from "./ManageRoles";
import JobOrders from "./JobOrders";
import Companies from "./Companies";
import General from "./General";
import Deployment from "./Deployment";
import Applicants from "./Applicants";
import PreDeploymentChecklist from "./PreDeploymentChecklist";

interface AdminUser {
  admin_acc_id: number;
  admin_acc_username: string;
  employee_id: number;
  t_employee: {
    employee_first_name: string;
    employee_last_name: string;
    employee_email: string;
    t_role: {
      role_name: string;
      role_permissions: string[];
    };
  };
}

interface DashboardLayoutProps {
  adminUser: AdminUser;
  onLogout: () => void;
}

export default function DashboardLayout({
  adminUser,
  onLogout,
}: DashboardLayoutProps) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "View Analytics" },
    {
      id: "dashboardjoborders",
      label: "Dashboard - Job Orders",
      icon: TrendingUp,
      permission: "View Analytics"
    },
    { id: "analytics", label: "Analytics", icon: BarChart3, permission: "View Analytics" },
    { id: "users", label: "Manage Users", icon: Users, permission: "Manage Users"}, // Manage Users
    { id: "roles", label: "Manage Roles", icon: Shield, permission: "Manage Roles"}, // Manage Roles
    { id: "applicants", label: "Applicants", icon: UserCheck, permission: "" },
    { id: "companies", label: "Companies", icon: Building2, permission: ""},
    { id: "joborders", label: "Job Orders", icon: Briefcase, permission: "View Job Orders" },
    {
      id: "predeployment",
      label: "Pre-Deployment Checklist",
      icon: CheckSquare,
      permission: ""
    },
    { id: "deployment", label: "Deployment", icon: Plane, permission: ""},
    { id: "general", label: "General", icon: Settings, permission: "" },
  ];

  const currentAdminUserPermissions = adminUser.t_employee.t_role.role_permissions;

  const availMenuItems = menuItems.filter((item) =>
    item.permission === "" ||
    currentAdminUserPermissions.includes(item.permission)
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "general":
        return <General darkMode={darkMode} />;
      case "dashboard":
        return <Dashboard darkMode={darkMode} />;
      case "dashboardjoborders":
        return <DashboardJobOrders darkMode={darkMode} />;
      case "analytics":
        return <Analytics darkMode={darkMode} />;
      case "users":
        return <ManageUsers darkMode={darkMode} />;
      case "roles":
        return <ManageRoles darkMode={darkMode} />;
      case "applicants":
        return <Applicants darkMode={darkMode} hasPermission={currentAdminUserPermissions.includes("Manage Applicants")}/>;
      case "joborders":
        return <JobOrders darkMode={darkMode} hasPermission={currentAdminUserPermissions.includes("Manage Orders")}/>;
      case "companies":
        return <Companies darkMode={darkMode} hasPermission={currentAdminUserPermissions.includes("Manage Company")} />;
      case "predeployment":
        return <PreDeploymentChecklist darkMode={darkMode} hasPermission={currentAdminUserPermissions.includes("Update Status")}/>;
      case "deployment":
        return <Deployment darkMode={darkMode} hasPermission={currentAdminUserPermissions.includes("Update Status")}/>;
      default:
        return <Dashboard darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-r overflow-hidden z-40 shadow-2xl`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <img
              src={logoImage}
              alt="Logo"
              onClick={() => setActiveMenu("dashboard")}
              className="w-16 h-16 cursor-pointer hover:opacity-80"
            />
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Collapse sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <nav className="space-y-2">
            {availMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    activeMenu === item.id
                      ? "bg-green-600 text-white"
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="w-full">
        {/* Header */}
        <header
          className={`sticky top-0 z-10 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-b`}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {availMenuItems.find((item) => item.id === activeMenu)?.label}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Logged in user info */}
              <div
                className={`text-sm text-right ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                <p className="font-semibold">
                  {adminUser.t_employee.employee_first_name}{" "}
                  {adminUser.t_employee.employee_last_name}
                </p>
                <p className="text-xs opacity-70">
                  {adminUser.t_employee.t_role.role_name}
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "bg-gray-700 text-yellow-400"
                    : "bg-gray-100 text-gray-700"
                }`}
                title={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
