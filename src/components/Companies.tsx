import React, { useState } from 'react';
import { Search, Building2, ChevronDown, ChevronRight, Briefcase, Users, Plus } from 'lucide-react';
import { useJobOrders } from '../contexts/JobOrdersContext';

export default function Companies({ darkMode = false }) {
  const { jobOrders, updateJobOrderStatus } = useJobOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [expandedJobOrders, setExpandedJobOrders] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);

  // Group job orders by company
  const companies = jobOrders.reduce((acc, jobOrder) => {
    const companyName = jobOrder.principalCompanyName;
    let company = acc.find(c => c.name === companyName);
    
    if (!company) {
      company = {
        id: acc.length + 1,
        name: companyName,
        country: jobOrder.country || 'N/A',
        jobOrders: []
      };
      acc.push(company);
    }

    // Add job order with aggregated applicant data
    const totalApplicants = jobOrder.positions.reduce((sum, pos) => sum + pos.applicants.length, 0);
    const firstPosition = jobOrder.positions[0];
    
    company.jobOrders.push({
      id: jobOrder.id,
      jobOrderCode: jobOrder.jobOrderCode,
      position: firstPosition ? firstPosition.title : 'N/A',
      numberOfApplicants: totalApplicants,
      status: jobOrder.status,
      deadline: jobOrder.deadline
    });

    return acc;
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.jobOrders.some(jo => 
      jo.jobOrderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jo.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleCompany = (companyId) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const toggleJobOrder = (jobOrderId) => {
    const newExpanded = new Set(expandedJobOrders);
    if (newExpanded.has(jobOrderId)) {
      newExpanded.delete(jobOrderId);
    } else {
      newExpanded.add(jobOrderId);
    }
    setExpandedJobOrders(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCompanies = companies.length;
  const totalJobOrders = companies.reduce((sum, company) => sum + company.jobOrders.length, 0);
  const totalApplicants = companies.reduce((sum, company) => 
    sum + company.jobOrders.reduce((jobSum, jo) => jobSum + jo.numberOfApplicants, 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
          <p className="text-xs text-gray-500 mb-1">Total Companies</p>
          <p className="text-2xl font-bold text-gray-900">{totalCompanies}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
          <p className="text-xs text-gray-500 mb-1">Total Job Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalJobOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-600">
          <p className="text-xs text-gray-500 mb-1">Total Applicants</p>
          <p className="text-2xl font-bold text-gray-900">{totalApplicants}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search companies, job orders, or positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredCompanies.map((company) => (
            <div key={company.id}>
              {/* Company Row */}
              <div
                onClick={() => toggleCompany(company.id)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">
                      {company.jobOrders.length} Job Order{company.jobOrders.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">Total Applicants</p>
                    <p className="text-lg font-bold text-blue-600">
                      {company.jobOrders.reduce((sum, jo) => sum + jo.numberOfApplicants, 0)}
                    </p>
                  </div>
                  {expandedCompanies.has(company.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Job Orders */}
              {expandedCompanies.has(company.id) && (
                <div className="bg-gray-50 px-4 py-2">
                  <div className="ml-16 space-y-2">
                    {company.jobOrders.map((jobOrder) => (
                      <div key={jobOrder.id} className="bg-white rounded-lg border border-gray-200">
                        {/* Job Order Row */}
                        <div
                          onClick={() => toggleJobOrder(jobOrder.id)}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-mono font-semibold text-gray-900">{jobOrder.jobOrderCode}</p>
                              <div className="relative inline-block mt-1">
                                {editingStatus === jobOrder.id ? (
                                  <select
                                    value={jobOrder.status}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      updateJobOrderStatus(jobOrder.id, e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onBlur={() => setEditingStatus(null)}
                                    autoFocus
                                    className={`text-xs px-2 py-1 rounded-full border-2 border-blue-500 focus:outline-none ${getStatusColor(jobOrder.status)}`}
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Closed">Closed</option>
                                    <option value="On Hold">On Hold</option>
                                  </select>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingStatus(jobOrder.id);
                                    }}
                                    className={`text-xs px-2 py-1 rounded-full flex items-center space-x-1 hover:opacity-80 transition-opacity ${getStatusColor(jobOrder.status)}`}
                                  >
                                    <span>{jobOrder.status}</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expandedJobOrders.has(jobOrder.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Job Order Details */}
                        {expandedJobOrders.has(jobOrder.id) && (
                          <div className="px-3 pb-3 pt-0 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Position</p>
                                <p className="font-semibold text-gray-900">{jobOrder.position}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Number of Applicants</p>
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4 text-green-600" />
                                  <p className="font-bold text-green-600">{jobOrder.numberOfApplicants}</p>
                                </div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Deadline</p>
                                <p className="font-semibold text-gray-900">{jobOrder.deadline}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Company</h2>
            <form 
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Adding company...');
                setShowAddModal(false);
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Contact Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Representative</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                  placeholder="Enter representative name"
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
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}