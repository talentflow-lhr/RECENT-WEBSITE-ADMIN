import { useState } from "react";
import { supabase } from "./supabaseClient"; // adjust path if needed
import logoImage from "figma:asset/59d793a5637be5743b4000eaed07893258073d54.png";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from("t_admin_account")
      .select(
        `
        *,
        t_employee(
          employee_first_name,
          employee_last_name,
          employee_email,
          t_role(role_name, role_permissions)
        )
      `,
      )
      .eq("admin_acc_username", username)
      .eq("admin_acc_password", password)
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError("Invalid username or password.");
      return;
    }

    onLogin(data); // pass the full admin data up
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side */}
        <div className="space-y-6 text-center md:text-left">
          <img
            src={logoImage}
            alt="Logo"
            className="w-32 h-32 mx-auto md:mx-0"
          />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-green-800">
              Welcome to Admin Portal
            </h1>
            <p className="text-xl text-gray-700">
              Showing the right people at the right place at the right time
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-green-600">
          <h2 className="text-3xl font-bold text-center mb-8 text-green-800">
            LOGIN
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
