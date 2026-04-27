import { useState } from "react";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import { JobOrdersProvider } from './contexts/JobOrdersContext';
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
    };
  };
}

export default function App() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const handleLogin = (adminData: AdminUser) => {
    setAdminUser(adminData);
  };

  const handleLogout = () => {
    setAdminUser(null);
  };

  if (!adminUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <JobOrdersProvider>
    <DashboardLayout adminUser={adminUser} onLogout={handleLogout} />;
    </JobOrdersProvider>
    );
}
