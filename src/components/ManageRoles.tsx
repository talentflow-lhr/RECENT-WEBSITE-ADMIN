import { useState } from 'react';
import { Shield, Users, Edit, Trash2, Plus } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export default function ManageRoles() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access with all permissions',
      permissions: ['All Permissions', 'Manage Users', 'Manage Roles', 'View Analytics', 'Manage Orders'],
      userCount: 3
    },
    {
      id: 2,
      name: 'Project Manager',
      description: 'Manage projects, job orders, and team oversight',
      permissions: ['View Analytics', 'Manage Orders', 'Manage Applicants', 'View Job Orders', 'Update Status'],
      userCount: 5
    },
    {
      id: 3,
      name: 'Project Officer',
      description: 'Handle recruitment, applicants, and job order operations',
      permissions: ['Manage Applicants', 'View Job Orders', 'Update Status'],
      userCount: 12
    },
  ]);

  const allPermissions = [
    'All Permissions',
    'Manage Users',
    'Manage Roles',
    'View Analytics',
    'Manage Orders',
    'Manage Applicants',
    'View Job Orders',
    'Update Status',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage user roles and permissions</p>
        <button 
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all cursor-pointer ${
              selectedRole === role.id ? 'border-green-600' : 'border-transparent'
            }`}
            onClick={() => setSelectedRole(role.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingRole(role);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this role?')) {
                      setRoles(roles.filter(r => r.id !== role.id));
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{role.userCount} users with this role</span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Details */}
      {selectedRole && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Edit Permissions for {roles.find(r => r.id === selectedRole)?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPermissions.map((permission, index) => {
              const role = roles.find(r => r.id === selectedRole);
              const isChecked = role?.permissions.includes(permission) || false;
              
              return (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button"
              onClick={() => setSelectedRole(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => {
                alert('Permissions saved successfully!');
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Role</h2>
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert('Role added successfully!');
                setShowAddModal(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter role description"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Role</h2>
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const description = formData.get('description') as string;
                const selectedPermissions = allPermissions.filter(perm => formData.get(`perm_${perm}`) === 'on');
                
                setRoles(roles.map(r => 
                  r.id === editingRole.id 
                    ? { ...r, name, description, permissions: selectedPermissions }
                    : r
                ));
                
                setEditingRole(null);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingRole.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingRole.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter role description"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {allPermissions.map((permission, index) => {
                    const isChecked = editingRole.permissions.includes(permission);
                    return (
                      <label
                        key={index}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name={`perm_${permission}`}
                          defaultChecked={isChecked}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{permission}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}