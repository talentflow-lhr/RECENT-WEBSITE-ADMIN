import { Bell, Lock, Globe, Database, Mail } from 'lucide-react';

export default function General({ darkMode = false }) {
  return (
    <div className="space-y-6">
      {/* System Information */}
      <div className={`rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}">System Version</p>
            <p className="text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}">v2.4.1</p>
          </div>
          <div>
            <p className="text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}">Last Updated</p>
            <p className="text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}">Jan 15, 2026</p>
          </div>
          <div>
            <p className="text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}">Total Users</p>
            <p className="text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}">31 Active</p>
          </div>
          <div>
            <p className="text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}">Database Size</p>
            <p className="text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}">2.3 GB</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900' : 'bg-green-100'}">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Notifications</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">New Applicant Alerts</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Weekly Reports</span>
              <input type="checkbox" className="w-5 h-5 text-green-600 rounded" />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900' : 'bg-green-100'}">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Security</h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Two-Factor Authentication</span>
              <input type="checkbox" className="w-5 h-5 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Session Timeout</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Login Alerts</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600 rounded" />
            </label>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900' : 'bg-green-100'}">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Regional Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Language</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Timezone</label>
              <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}">
                <option>UTC-5 (Eastern)</option>
                <option>UTC-6 (Central)</option>
                <option>UTC-8 (Pacific)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900' : 'bg-green-100'}">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Database</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Backup Now
            </button>
            <button className="w-full px-4 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'}">
              View Backup History
            </button>
            <div className="pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
              <p className="text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}">Last backup: Jan 18, 2026 at 3:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-green-900' : 'bg-green-100'}">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Email Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}">SMTP Server</label>
            <input
              type="text"
              defaultValue="smtp.example.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}">Port</label>
            <input
              type="text"
              defaultValue="587"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}">From Email</label>
            <input
              type="email"
              defaultValue="admin@example.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}">From Name</label>
            <input
              type="text"
              defaultValue="Admin Portal"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 border rounded-lg transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-700 text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-900'}">
            Test Connection
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
