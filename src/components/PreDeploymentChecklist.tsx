import React, { useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { useJobOrders } from '../contexts/JobOrdersContext';

export default function PreDeploymentChecklist({ darkMode = false }) {
  const { jobOrders } = useJobOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobOrder, setFilterJobOrder] = useState('All');
  const [filterPosition, setFilterPosition] = useState('All');

  // Get all accepted applicants for pre-deployment
  const [deploymentApplicants, setDeploymentApplicants] = useState(
    jobOrders.flatMap(jobOrder =>
      jobOrder.positions.flatMap(position =>
        position.applicants
          .filter(applicant => applicant.status === 'Accepted')
          .map(applicant => ({
            id: `${jobOrder.id}-${position.id}-${applicant.id}`,
            applicantId: applicant.id,
            name: applicant.name,
            position: position.title,
            company: jobOrder.principalCompanyName,
            jobOrderCode: jobOrder.jobOrderCode,
            medicalStatus: false,
            biometricStatus: true,
            visaApproval: false,
            insurance: false,
            pdos: false,
            oec: false,
            requestTicket: false,
            briefedContract: true,
            deploymentDate: '2026-03-15'
          }))
      )
    )
  );

  // Get unique job orders and positions for filters
  const uniqueJobOrders = Array.from(new Set(deploymentApplicants.map(a => a.jobOrderCode))).sort();
  const uniquePositions = Array.from(new Set(deploymentApplicants.map(a => a.position))).sort();

  // Update checkbox status
  const handleCheckboxChange = (applicantId, field) => {
    setDeploymentApplicants(prevApplicants =>
      prevApplicants.map(app =>
        app.id === applicantId
          ? { ...app, [field]: !app[field] }
          : app
      )
    );
  };

  // Update deployment date
  const handleDeploymentDateChange = (applicantId, newDate) => {
    setDeploymentApplicants(prevApplicants =>
      prevApplicants.map(app =>
        app.id === applicantId
          ? { ...app, deploymentDate: newDate }
          : app
      )
    );
  };

  // Calculate pre-deployment status
  const getPreDeploymentStatus = (applicant) => {
    const allChecked = applicant.medicalStatus &&
      applicant.biometricStatus &&
      applicant.visaApproval &&
      applicant.insurance &&
      applicant.pdos &&
      applicant.oec &&
      applicant.requestTicket &&
      applicant.briefedContract;
    return allChecked ? 'Complete' : 'Incomplete';
  };

  const filteredApplicants = deploymentApplicants.filter(applicant => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.jobOrderCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJobOrder = filterJobOrder === 'All' || applicant.jobOrderCode === filterJobOrder;
    const matchesPosition = filterPosition === 'All' || applicant.position === filterPosition;

    return matchesSearch && matchesJobOrder && matchesPosition;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Pre-Deployment Checklist</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track deployment requirements for accepted applicants</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by name, position, company, or job order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Job Order</label>
            <select
              value={filterJobOrder}
              onChange={(e) => setFilterJobOrder(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="All">All Job Orders</option>
              {uniqueJobOrders.map(jobOrder => (
                <option key={jobOrder} value={jobOrder}>{jobOrder}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Position</label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-600 ${
                darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="All">All Positions</option>
              {uniquePositions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Applicant Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  <div>Company</div>
                  <div className="text-center normal-case">Job Order</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Medical
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Biometric
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  VISA Approval
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Insurance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  PDOS
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  OEC
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Request Ticket
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Briefed Contract
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Pre-Deployment Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Deployment Date
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={13} className={`px-6 py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No applicants found
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => {
                  const preDeploymentStatus = getPreDeploymentStatus(applicant);
                  return (
                    <tr key={applicant.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            darkMode ? 'bg-green-900' : 'bg-green-100'
                          }`}>
                            <span className="text-green-600 font-semibold text-xs">
                              {applicant.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{applicant.name}</div>
                        </div>
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {applicant.position}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{applicant.company}</div>
                        <div className={`text-xs font-mono text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{applicant.jobOrderCode}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.medicalStatus}
                          onChange={() => handleCheckboxChange(applicant.id, 'medicalStatus')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.biometricStatus}
                          onChange={() => handleCheckboxChange(applicant.id, 'biometricStatus')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.visaApproval}
                          onChange={() => handleCheckboxChange(applicant.id, 'visaApproval')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.insurance}
                          onChange={() => handleCheckboxChange(applicant.id, 'insurance')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.pdos}
                          onChange={() => handleCheckboxChange(applicant.id, 'pdos')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.oec}
                          onChange={() => handleCheckboxChange(applicant.id, 'oec')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.requestTicket}
                          onChange={() => handleCheckboxChange(applicant.id, 'requestTicket')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={applicant.briefedContract}
                          onChange={() => handleCheckboxChange(applicant.id, 'briefedContract')}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          preDeploymentStatus === 'Complete'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {preDeploymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={applicant.deploymentDate}
                          onChange={(e) => handleDeploymentDateChange(applicant.id, e.target.value)}
                          className={`px-2 py-1 border rounded focus:outline-none focus:border-green-600 text-sm ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center">
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Applicants: <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{filteredApplicants.length}</span>
          </div>
          <div className="flex space-x-6">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete: <span className="font-semibold text-green-600">
                {filteredApplicants.filter(app => getPreDeploymentStatus(app) === 'Complete').length}
              </span>
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Incomplete: <span className="font-semibold text-yellow-600">
                {filteredApplicants.filter(app => getPreDeploymentStatus(app) === 'Incomplete').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
