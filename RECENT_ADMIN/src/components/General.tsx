import { Bell, Lock, Globe, Database, Mail } from 'lucide-react';

export default function General({ darkMode = false }) {
  return (
    <div className="space-y-6">
      {/* System Information */}
      <div className={`rounded-xl shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">System Version</p>
            <p className="text-lg font-semibold text-gray-900">v2.4.1</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900">Jan 15, 2026</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Users</p>
            <p className="text-lg font-semibold text-gray-900">31 Active</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Database Size</p>
            <p className="text-lg font-semibold text-gray-900">2.3 GB</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Security</h2>
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Regional Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Language</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Timezone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600">
                <option>UTC-5 (Eastern)</option>
                <option>UTC-6 (Central)</option>
                <option>UTC-8 (Pacific)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Database</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Backup Now
            </button>
            <button className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
              View Backup History
            </button>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">Last backup: Jan 18, 2026 at 3:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Email Configuration</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">SMTP Server</label>
            <input
              type="text"
              defaultValue="smtp.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Port</label>
            <input
              type="text"
              defaultValue="587"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">From Email</label>
            <input
              type="email"
              defaultValue="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">From Name</label>
            <input
              type="text"
              defaultValue="Admin Portal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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