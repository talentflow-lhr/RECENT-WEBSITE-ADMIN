import React, { useState } from 'react';
import { Search, Download, Filter, Plus, ChevronDown, ChevronRight, Briefcase, Users, X, Trash2, ArrowLeft } from 'lucide-react';
import { companiesData } from './companiesData';
import { usersData } from './usersData';
import { useJobOrders } from '../contexts/JobOrdersContext';

export default function JobOrders() {
  const { jobOrders, setJobOrders, updateJobOrderStatus } = useJobOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [applicantSearchTerm, setApplicantSearchTerm] = useState('');
  const [applicantFilterStatus, setApplicantFilterStatus] = useState('All');
  const [applicantScoreSort, setApplicantScoreSort] = useState('none');
  const [viewMode, setViewMode] = useState('list');
  const [showAddPositionModal, setShowAddPositionModal] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: '',
    requirements: '',
    contractLength: '',
    openPositions: 1,
    salaryRange: '',
    category: ''
  });
  const [jobOrderForm, setJobOrderForm] = useState({
    referenceNumber: '',
    companyName: '',
    companyContactNumber: '',
    companyRepresentative: '',
    country: '',
    pointPersonId: '',
    deadline: ''
  });
  const [positions, setPositions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState({
    tempId: 0,
    title: '',
    description: '',
    requirements: '',
    openPositions: 1,
    contractLength: '',
    salaryRange: '',
    category: ''
  });
  const [editingStatus, setEditingStatus] = useState(null);

  /* const [jobOrders, setJobOrders] = useState<JobOrder[]>([
    {
      id: 1,
      jobOrderCode: 'JO-2026-001',
      jobOrderNumber: '001',
      principalCompanyName: 'Tech Solutions Inc.',
      status: 'Active',
      dateCreated: '2026-01-10',
      deadline: '2026-02-15',
      positions: [
        {
          id: 101,
          title: 'Software Engineer',
          openPositions: 3,
          description: 'We are looking for talented software engineers to join our team...',
          requirements: 'Bachelor\'s degree in Computer Science, 3+ years of experience...',
          applicants: [
            {
              id: 1,
              name: 'John Doe',
              resumeScore: 85,
              status: 'Shortlist',
              appliedDate: '2026-01-15'
            },
            {
              id: 2,
              name: 'Mike Johnson',
              resumeScore: 78,
              status: 'AI-screened',
              appliedDate: '2026-01-13'
            },
            {
              id: 3,
              name: 'Lisa Anderson',
              resumeScore: 95,
              status: 'Scheduled',
              appliedDate: '2026-01-08'
            }
          ]
        },
        {
          id: 102,
          title: 'Senior Backend Developer',
          openPositions: 2,
          description: 'Seeking experienced backend developers for our cloud infrastructure team...',
          requirements: '5+ years of backend development, proficiency in Node.js, AWS experience...',
          applicants: [
            {
              id: 4,
              name: 'Robert Chen',
              resumeScore: 92,
              status: 'Shortlist',
              appliedDate: '2026-01-14'
            },
            {
              id: 5,
              name: 'Maria Garcia',
              resumeScore: 88,
              status: 'Accepted',
              appliedDate: '2026-01-12'
            }
          ]
        },
        {
          id: 103,
          title: 'Frontend Developer',
          openPositions: 2,
          description: 'Join our frontend team to build modern web applications...',
          requirements: 'Strong knowledge of React, TypeScript, 2+ years experience...',
          applicants: []
        }
      ]
    },
    {
      id: 2,
      jobOrderCode: 'JO-2026-002',
      jobOrderNumber: '002',
      principalCompanyName: 'Digital Innovations Ltd.',
      status: 'Open',
      dateCreated: '2026-01-08',
      deadline: '2026-02-20',
      positions: [
        {
          id: 201,
          title: 'Product Manager',
          openPositions: 2,
          description: 'Lead product strategy and roadmap for our flagship products...',
          requirements: '5+ years product management experience, strong analytical skills...',
          applicants: [
            {
              id: 6,
              name: 'Jane Smith',
              resumeScore: 92,
              status: 'Scheduled',
              appliedDate: '2026-01-14'
            },
            {
              id: 7,
              name: 'Emily Davis',
              resumeScore: 70,
              status: 'applied',
              appliedDate: '2026-01-10'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      jobOrderCode: 'JO-2026-003',
      jobOrderNumber: '003',
      principalCompanyName: 'Data Analytics Corp.',
      status: 'On Hold',
      dateCreated: '2026-01-12',
      deadline: '2026-02-25',
      positions: [
        {
          id: 301,
          title: 'Data Analyst',
          openPositions: 1,
          description: 'Analyze data and provide insights to drive business decisions...',
          requirements: '5+ years data analysis experience, SQL, Python, data visualization...',
          applicants: [
            {
              id: 8,
              name: 'Sarah Williams',
              resumeScore: 65,
              status: 'Rejected',
              rejectionReason: 'Does not meet minimum experience requirements (5+ years required)',
              appliedDate: '2026-01-12'
            }
          ]
        }
      ]
    },
    {
      id: 4,
      jobOrderCode: 'JO-2026-004',
      jobOrderNumber: '004',
      principalCompanyName: 'Cloud Services Group',
      status: 'Open',
      dateCreated: '2026-01-15',
      deadline: '2026-02-22',
      positions: [
        {
          id: 401,
          title: 'DevOps Engineer',
          openPositions: 2,
          description: 'Manage infrastructure and deployment pipelines...',
          requirements: 'Experience with Docker, Kubernetes, CI/CD, cloud platforms...',
          applicants: [
            {
              id: 9,
              name: 'David Brown',
              resumeScore: 88,
              status: 'Accepted',
              appliedDate: '2026-01-11'
            }
          ]
        }
      ]
    },
    {
      id: 5,
      jobOrderCode: 'JO-2026-005',
      jobOrderNumber: '005',
      principalCompanyName: 'Creative Design Studio',
      status: 'Open',
      dateCreated: '2026-01-09',
      deadline: '2026-02-18',
      positions: [
        {
          id: 501,
          title: 'UX Designer',
          openPositions: 1,
          description: 'Design user experiences for enterprise applications...',
          requirements: 'Portfolio demonstrating UX design skills, Figma proficiency...',
          applicants: [
            {
              id: 10,
              name: 'Robert Miller',
              resumeScore: 55,
              status: 'Rejected',
              rejectionReason: 'Portfolio does not demonstrate required design skills for enterprise applications',
              appliedDate: '2026-01-09'
            }
          ]
        }
      ]
    },
  ]); */

  const filteredJobOrders = jobOrders.filter(job => {
    const matchesSearch = job.jobOrderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.principalCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.positions.some(pos => pos.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'All' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (applicantId, newStatus) => {
    if (!selectedPosition) return;
    
    setJobOrders(prev => prev.map(job => ({
      ...job,
      positions: job.positions.map(pos => {
        if (pos.id === selectedPosition.position.id) {
          const updatedPosition = {
            ...pos,
            applicants: pos.applicants.map(app =>
              app.id === applicantId ? { ...app, status: newStatus } : app
            )
          };
          // Update selectedPosition to reflect changes
          setSelectedPosition({
            ...selectedPosition,
            position: updatedPosition
          });
          return updatedPosition;
        }
        return pos;
      })
    })));
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

  const getApplicantStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-gray-100 text-gray-800';
      case 'AI-screened':
        return 'bg-blue-100 text-blue-800';
      case 'Shortlist':
        return 'bg-purple-100 text-purple-800';
      case 'Scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  const handleAddPosition = () => {
    if (!newPosition.title || !newPosition.requirements || !newPosition.contractLength || 
        !newPosition.salaryRange || !newPosition.category || !newPosition.openPositions) {
      alert('Please fill in all required fields');
      return;
    }

    const position = {
      id: Date.now(),
      title: newPosition.title,
      description: newPosition.requirements,
      requirements: newPosition.requirements,
      openPositions: parseInt(newPosition.openPositions),
      contractLength: newPosition.contractLength,
      salaryRange: newPosition.salaryRange,
      category: newPosition.category,
      applicants: []
    };

    // Update the job order with the new position
    setJobOrders(jobOrders.map(jo => 
      jo.id === selectedJobOrder.id 
        ? { ...jo, positions: [...jo.positions, position] }
        : jo
    ));

    // Update selectedJobOrder to reflect the change
    setSelectedJobOrder({
      ...selectedJobOrder,
      positions: [...selectedJobOrder.positions, position]
    });

    // Reset form and close modal
    setNewPosition({
      title: '',
      requirements: '',
      contractLength: '',
      openPositions: 1,
      salaryRange: '',
      category: ''
    });
    setShowAddPositionModal(false);
  };

  const totalJobOrders = jobOrders.length;
  const openJobs = jobOrders.filter(job => job.status === 'Open').length;
  const totalPositions = jobOrders.reduce((sum, job) => sum + job.positions.length, 0);
  const totalApplicants = jobOrders.reduce((sum, job) => 
    sum + job.positions.reduce((pSum, pos) => pSum + pos.applicants.length, 0), 0
  );

  const resetForm = () => {
    setJobOrderForm({
      referenceNumber: '',
      companyName: '',
      companyContactNumber: '',
      companyRepresentative: '',
      country: '',
      pointPersonId: '',
      deadline: ''
    });
    setPositions([]);
    setCurrentPosition({
      tempId: 0,
      title: '',
      description: '',
      requirements: '',
      openPositions: 1,
      contractLength: '',
      salaryRange: '',
      category: ''
    });
  };

  // Positions View - Full Screen
  if (viewMode === 'positions' && selectedJobOrder) {
    const totalJobApplicants = selectedJobOrder.positions.reduce((sum, pos) => sum + pos.applicants.length, 0);
    const totalOpenPositions = selectedJobOrder.positions.reduce((sum, pos) => sum + pos.openPositions, 0);

    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => {
                  setViewMode('list');
                  setSelectedJobOrder(null);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Job Orders</span>
              </button>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-mono">{selectedJobOrder.jobOrderCode}</h1>
                  <p className="text-lg text-gray-700 mt-1">{selectedJobOrder.principalCompanyName}</p>
                  {(selectedJobOrder.companyContactNumber || selectedJobOrder.companyRepresentative) && (
                    <div className="flex items-center space-x-4 mt-1">
                      {selectedJobOrder.companyRepresentative && (
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Representative:</span> {selectedJobOrder.companyRepresentative}
                        </span>
                      )}
                      {selectedJobOrder.companyContactNumber && (
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Contact:</span> {selectedJobOrder.companyContactNumber}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="relative inline-block">
                      {editingStatus === selectedJobOrder.id ? (
                        <select
                          value={selectedJobOrder.status}
                          onChange={(e) => {
                            updateJobOrderStatus(selectedJobOrder.id, e.target.value as 'Active' | 'Closed' | 'On Hold');
                            setSelectedJobOrder({ ...selectedJobOrder, status: e.target.value as 'Active' | 'Closed' | 'On Hold' });
                          }}
                          onBlur={() => setEditingStatus(null)}
                          autoFocus
                          className={`text-sm px-3 py-1 rounded-full border-2 border-blue-500 focus:outline-none font-semibold ${getStatusColor(selectedJobOrder.status)}`}
                        >
                          <option value="Active">Active</option>
                          <option value="Closed">Closed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingStatus(selectedJobOrder.id)}
                          className={`text-sm px-3 py-1 rounded-full flex items-center space-x-1 hover:opacity-80 transition-opacity font-semibold ${getStatusColor(selectedJobOrder.status)}`}
                        >
                          <span>{selectedJobOrder.status}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      Created: {selectedJobOrder.dateCreated}
                    </span>
                    <span className="text-sm text-gray-600">
                      Deadline: {selectedJobOrder.deadline}
                    </span>
                    {selectedJobOrder.pointPersonId && (
                      <span className="text-sm text-gray-600">
                        Point Person: {usersData.find(u => u.id === selectedJobOrder.pointPersonId)?.name || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
              <p className="text-sm text-gray-600 mb-1">Total Positions</p>
              <p className="text-3xl font-bold text-gray-900">{selectedJobOrder.positions.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
              <p className="text-sm text-gray-600 mb-1">Open Positions</p>
              <p className="text-3xl font-bold text-gray-900">{totalOpenPositions}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
              <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
              <p className="text-3xl font-bold text-gray-900">{totalJobApplicants}</p>
            </div>
          </div>
        </div>

        {/* Positions List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Positions</h2>
              <button 
                onClick={() => setShowAddPositionModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedJobOrder.positions.map((position) => (
                <div
                  key={position.id}
                  onClick={() => setSelectedPosition({ jobOrder: selectedJobOrder, position })}
                  className="bg-white rounded-2xl border-2 border-green-500 shadow-lg hover:shadow-xl hover:border-green-600 transition-all cursor-pointer p-5"
                >
                  {/* Icon and Status Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-blue-600" />
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      position.openPositions > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {position.openPositions} Open
                    </span>
                  </div>
                  
                  {/* Job Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{position.title}</h3>
                  
                  {/* Job Description */}
                  {position.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{position.description}</p>
                  )}

                  {/* Contract & Salary */}
                  <div className="space-y-1 mb-4">
                    {position.contractLength && (
                      <p className="text-sm">
                        <span className="text-gray-500">Contract:</span> <span className="text-gray-900 font-medium">{position.contractLength}</span>
                      </p>
                    )}
                    {position.salaryRange && (
                      <p className="text-sm">
                        <span className="text-gray-500">Salary:</span> <span className="text-gray-900 font-medium">{position.salaryRange}</span>
                      </p>
                    )}
                  </div>

                  {/* Applicants Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Applicants</p>
                      <p className="text-2xl font-bold text-gray-900">{position.applicants.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shortlisted</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {position.applicants.filter(a => a.status === 'Evaluated').length}
                      </p>
                    </div>
                    <div className="text-gray-300">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applicants Modal - Render when position is selected */}
        {selectedPosition && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPosition.position.title}</h2>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedPosition.position.openPositions > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPosition.position.openPositions} Open Position{selectedPosition.position.openPositions !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Job Order:</span> {selectedPosition.jobOrder.jobOrderCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Company:</span> {selectedPosition.jobOrder.principalCompanyName}
                    </p>
                    {selectedPosition.jobOrder.companyRepresentative && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Representative:</span> {selectedPosition.jobOrder.companyRepresentative}
                      </p>
                    )}
                    {selectedPosition.jobOrder.companyContactNumber && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Contact:</span> {selectedPosition.jobOrder.companyContactNumber}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Deadline:</span> {selectedPosition.jobOrder.deadline}
                    </p>
                    {selectedPosition.position.contractLength && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Contract:</span> {selectedPosition.position.contractLength}
                      </p>
                    )}
                    {selectedPosition.position.salaryRange && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Salary:</span> {selectedPosition.position.salaryRange}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Applicants Stats */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
                {['Applied', 'AI-screened', 'Shortlist', 'Scheduled', 'Accepted', 'Rejected'].map((status) => {
                  const count = selectedPosition.position.applicants.filter(a => a.status === status).length;
                  return (
                    <div key={status} className="bg-white rounded-lg shadow-sm p-3">
                      <p className="text-xs text-gray-500 mb-1">{status}</p>
                      <p className="text-xl font-bold text-gray-900">{count}</p>
                    </div>
                  );
                })}
              </div>

              {/* Position Details */}
              <div className="px-6 py-4 bg-white border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description */}
                  {selectedPosition.position.description && (
                    <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">Position Description</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedPosition.position.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Requirements */}
                  {selectedPosition.position.requirements && (
                    <div className="bg-purple-50 border-l-4 border-purple-600 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-purple-900 mb-2">Position Requirements</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedPosition.position.requirements}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-6 py-4 bg-white border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search applicants by name..."
                      value={applicantSearchTerm}
                      onChange={(e) => setApplicantSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={applicantFilterStatus}
                      onChange={(e) => setApplicantFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-sm"
                    >
                      <option value="All">All Status</option>
                      <option value="Not evaluated">Not evaluated</option>
                      <option value="Evaluated">Evaluated</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <select
                    value={applicantScoreSort}
                    onChange={(e) => setApplicantScoreSort(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-sm"
                  >
                    <option value="none">Resume Score (Default)</option>
                    <option value="high-to-low">Resume Score (High to Low)</option>
                    <option value="low-to-high">Resume Score (Low to High)</option>
                  </select>
                </div>
              </div>

              {/* Applicants Table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-green-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resume Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Fit Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rejection Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        // Filter applicants
                        let filteredApplicants = selectedPosition.position.applicants.filter(applicant => {
                          const matchesSearch = applicant.name.toLowerCase().includes(applicantSearchTerm.toLowerCase());
                          const matchesStatus = applicantFilterStatus === 'All' || applicant.status === applicantFilterStatus;
                          return matchesSearch && matchesStatus;
                        });

                        // Sort applicants by resume score
                        if (applicantScoreSort === 'high-to-low') {
                          filteredApplicants = [...filteredApplicants].sort((a, b) => b.resumeScore - a.resumeScore);
                        } else if (applicantScoreSort === 'low-to-high') {
                          filteredApplicants = [...filteredApplicants].sort((a, b) => a.resumeScore - b.resumeScore);
                        }

                        if (filteredApplicants.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                No applicants found
                              </td>
                            </tr>
                          );
                        }

                        return filteredApplicants.map((applicant) => (
                          <tr key={applicant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-green-600 font-semibold text-sm">
                                    {applicant.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${getScoreColor(applicant.resumeScore)}`}>
                                {applicant.resumeScore}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${getScoreColor(applicant.jobFitScore || 0)}`}>
                                {applicant.jobFitScore || 0}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={applicant.status}
                                onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${getApplicantStatusColor(applicant.status)}`}
                              >
                                <option value="Applied">Applied</option>
                                <option value="AI-screened">AI-screened</option>
                                <option value="Shortlist">Shortlist</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {applicant.appliedDate}
                            </td>
                            <td className="px-6 py-4">
                              {applicant.status === 'Rejected' && applicant.rejectionReason ? (
                                <div className="text-sm text-red-800 max-w-md">
                                  {applicant.rejectionReason}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{(() => {
                    const filtered = selectedPosition.position.applicants.filter(applicant => {
                      const matchesSearch = applicant.name.toLowerCase().includes(applicantSearchTerm.toLowerCase());
                      const matchesStatus = applicantFilterStatus === 'All' || applicant.status === applicantFilterStatus;
                      return matchesSearch && matchesStatus;
                    });
                    return filtered.length;
                  })()}</span> applicant{(() => {
                    const filtered = selectedPosition.position.applicants.filter(applicant => {
                      const matchesSearch = applicant.name.toLowerCase().includes(applicantSearchTerm.toLowerCase());
                      const matchesStatus = applicantFilterStatus === 'All' || applicant.status === applicantFilterStatus;
                      return matchesSearch && matchesStatus;
                    });
                    return filtered.length !== 1 ? 's' : '';
                  })()}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedPosition(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Export Applicants
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Position Modal */}
        {showAddPositionModal && (
          <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">Add New Position</h2>
                <button
                  onClick={() => {
                    setShowAddPositionModal(false);
                    setNewPosition({
                      title: '',
                      requirements: '',
                      contractLength: '',
                      openPositions: 1,
                      salaryRange: '',
                      category: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPosition.title}
                    onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                    placeholder="e.g., Software Engineer, Construction Worker"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Job Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newPosition.category}
                    onChange={(e) => setNewPosition({ ...newPosition, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Construction">Construction</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Technology">Technology</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Job Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newPosition.requirements}
                    onChange={(e) => setNewPosition({ ...newPosition, requirements: e.target.value })}
                    placeholder="Enter job requirements and qualifications..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Contract Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Length <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPosition.contractLength}
                    onChange={(e) => setNewPosition({ ...newPosition, contractLength: e.target.value })}
                    placeholder="e.g., 3 months, 6 months"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Number of Applicants Needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Applicants Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPosition.openPositions}
                    onChange={(e) => setNewPosition({ ...newPosition, openPositions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPosition.salaryRange}
                    onChange={(e) => setNewPosition({ ...newPosition, salaryRange: e.target.value })}
                    placeholder="e.g., $15-20/hour, ₱500-800/day"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowAddPositionModal(false);
                    setNewPosition({
                      title: '',
                      requirements: '',
                      contractLength: '',
                      openPositions: 1,
                      salaryRange: '',
                      category: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPosition}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Add Position
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Form View
  if (viewMode === 'form') {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        {/* Form Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setViewMode('list');
                  resetForm();
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Job Orders</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Job Order</h1>
                <p className="text-sm text-gray-600 mt-0.5">Fill in company details and add positions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body - Two Column Layout */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Job Order Details */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Order Information</h3>
                  
                  {/* Reference Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobOrderForm.referenceNumber}
                      onChange={(e) => setJobOrderForm({ ...jobOrderForm, referenceNumber: e.target.value })}
                      placeholder="Enter reference number (e.g., REF-2026-001)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 font-mono"
                    />
                  </div>

                  {/* Company Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobOrderForm.companyName}
                      onChange={(e) => setJobOrderForm({ ...jobOrderForm, companyName: e.target.value })}
                      placeholder="Enter principal company name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                  </div>

                  {/* Company Contact Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Contact Number
                    </label>
                    <input
                      type="tel"
                      value={jobOrderForm.companyContactNumber}
                      onChange={(e) => setJobOrderForm({ ...jobOrderForm, companyContactNumber: e.target.value })}
                      placeholder="Enter contact number (e.g., +1-555-0123)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                  </div>

                  {/* Company Representative */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Representative
                    </label>
                    <input
                      type="text"
                      value={jobOrderForm.companyRepresentative}
                      onChange={(e) => setJobOrderForm({ ...jobOrderForm, companyRepresentative: e.target.value })}
                      placeholder="Enter representative name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                  </div>

                  {/* Country Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobOrderForm.country}
                      onChange={(e) => setJobOrderForm({ ...jobOrderForm, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    >
                      <option value="">Select a country</option>
                      {companiesData.map((company) => (
                        <option key={company.id} value={company.country}>
                          {company.country} - {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Point Person Dropdown */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Point Person <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobOrderForm.pointPersonId}
                      onChange={(e) => setJobOrderForm({ ...jobOrderForm, pointPersonId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    >
                      <option value="">Select a point person</option>
                      {usersData
                        .filter(user => user.status === 'Active')
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} - {user.role}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Application Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={jobOrderForm.deadline}
                      onChange={(e) => setJobOrderForm({ ...jobOrderForm, deadline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
                    />
                  </div>
                </div>
              </div>

              {/* Added Positions List */}
              {positions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Added Positions ({positions.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                      {positions.map((pos) => (
                        <div key={pos.tempId} className="bg-white rounded-2xl border-2 border-green-500 shadow-lg p-5 relative">
                          {/* Icon and Status Badge */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Users className="w-7 h-7 text-blue-600" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                {pos.openPositions} Open
                              </span>
                              <button
                                onClick={() => setPositions(positions.filter(p => p.tempId !== pos.tempId))}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Remove position"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Job Title */}
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{pos.title}</h4>

                          {/* Job Description */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pos.description}</p>

                          {/* Contract & Salary */}
                          <div className="space-y-1 mb-4">
                            <p className="text-sm">
                              <span className="text-gray-500">Contract:</span> <span className="text-gray-900 font-medium">{pos.contractLength}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">Salary:</span> <span className="text-gray-900 font-medium">{pos.salaryRange}</span>
                            </p>
                          </div>

                          {/* Applicants Stats */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Applicants</p>
                              <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Shortlisted</p>
                              <p className="text-2xl font-bold text-purple-600">0</p>
                            </div>
                            <div className="text-gray-300">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Add Position Form */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="bg-purple-50 border-l-4 border-purple-600 p-5 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Position</h3>
                  
                  {/* Position Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentPosition.title}
                      onChange={(e) => setCurrentPosition({ ...currentPosition, title: e.target.value })}
                      placeholder="Enter position title (e.g., Software Engineer)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Open Positions */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Open Positions <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={currentPosition.openPositions}
                      onChange={(e) => setCurrentPosition({ ...currentPosition, openPositions: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={currentPosition.description}
                      onChange={(e) => setCurrentPosition({ ...currentPosition, description: e.target.value })}
                      placeholder="Enter detailed description of the position, responsibilities, and job duties..."
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 resize-none"
                    />
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position Requirements <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={currentPosition.requirements}
                      onChange={(e) => setCurrentPosition({ ...currentPosition, requirements: e.target.value })}
                      placeholder="Enter requirements such as qualifications, skills, experience, education, etc..."
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 resize-none"
                    />
                  </div>

                  {/* Contract Length */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contract Length <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentPosition.contractLength}
                      onChange={(e) => setCurrentPosition({ ...currentPosition, contractLength: e.target.value })}
                      placeholder="e.g., 3 months, 6 months"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Salary Range */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salary Range <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentPosition.salaryRange}
                      onChange={(e) => setCurrentPosition({ ...currentPosition, salaryRange: e.target.value })}
                      placeholder="e.g., $3,000 - $5,000/month"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  {/* Job Category */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Job Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={currentPosition.category}
                      onChange={(e) => setCurrentPosition({ ...currentPosition, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    >
                      <option value="">Select a category</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Add Position Button */}
                  <button
                    onClick={() => {
                      // Validate position fields
                      if (!currentPosition.title || !currentPosition.description || !currentPosition.requirements || !currentPosition.contractLength || !currentPosition.salaryRange || !currentPosition.category) {
                        alert('Please fill in all position fields');
                        return;
                      }

                      // Add position to list
                      setPositions([...positions, { ...currentPosition, tempId: Date.now() }]);
                      
                      // Reset current position form
                      setCurrentPosition({
                        tempId: 0,
                        title: '',
                        description: '',
                        requirements: '',
                        openPositions: 1,
                        contractLength: '',
                        salaryRange: ''
                      });
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Position to Job Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer - Sticky */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-gray-700">
              <span className="font-semibold text-lg text-gray-900">{positions.length}</span> 
              <span className="text-sm ml-1">position{positions.length !== 1 ? 's' : ''} added</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setViewMode('list');
                  resetForm();
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Validate job order fields
                  if (!jobOrderForm.referenceNumber || !jobOrderForm.companyName || !jobOrderForm.pointPersonId || !jobOrderForm.deadline) {
                    alert('Please fill in all required fields: reference number, company name, point person, and deadline');
                    return;
                  }

                  // Validate at least one position
                  if (positions.length === 0) {
                    alert('Please add at least one position to the job order');
                    return;
                  }

                  // Create new job order with all positions
                  const newJobOrder: JobOrder = {
                    id: jobOrders.length + 1,
                    jobOrderCode: `JO-2026-${String(jobOrders.length + 1).padStart(3, '0')}`,
                    jobOrderNumber: String(jobOrders.length + 1).padStart(3, '0'),
                    referenceNumber: jobOrderForm.referenceNumber,
                    principalCompanyName: jobOrderForm.companyName,
                    companyContactNumber: jobOrderForm.companyContactNumber,
                    companyRepresentative: jobOrderForm.companyRepresentative,
                    country: jobOrderForm.country,
                    pointPersonId: Number(jobOrderForm.pointPersonId),
                    status: 'Open',
                    dateCreated: new Date().toISOString().split('T')[0],
                    deadline: jobOrderForm.deadline,
                    positions: positions.map((pos, index) => ({
                      id: Date.now() + index,
                      title: pos.title,
                      openPositions: pos.openPositions,
                      description: pos.description,
                      requirements: pos.requirements,
                      contractLength: pos.contractLength,
                      salaryRange: pos.salaryRange,
                      applicants: []
                    }))
                  };

                  setJobOrders([newJobOrder, ...jobOrders]);
                  setViewMode('list');
                  resetForm();
                  
                  alert(`Job Order posted successfully with ${positions.length} position${positions.length !== 1 ? 's' : ''}!`);
                }}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
              >
                Post Job Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
          <p className="text-xs text-gray-500 mb-1">Total Job Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalJobOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
          <p className="text-xs text-gray-500 mb-1">Open Job Orders</p>
          <p className="text-2xl font-bold text-gray-900">{openJobs}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-600">
          <p className="text-xs text-gray-500 mb-1">Total Positions</p>
          <p className="text-2xl font-bold text-gray-900">{totalPositions}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-600">
          <p className="text-xs text-gray-500 mb-1">Total Applicants</p>
          <p className="text-2xl font-bold text-gray-900">{totalApplicants}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by job order, company, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600"
          >
            <option>All</option>
            <option>Open</option>
            <option>Closed</option>
            <option>On Hold</option>
          </select>
        </div>
        <button
          onClick={() => setViewMode('form')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Job Order</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Job Orders List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredJobOrders.map((jobOrder) => {
            const totalJobApplicants = jobOrder.positions.reduce((sum, pos) => sum + pos.applicants.length, 0);
            const totalOpenPositions = jobOrder.positions.reduce((sum, pos) => sum + pos.openPositions, 0);

            return (
              <div
                key={jobOrder.id}
                onClick={() => {
                  setSelectedJobOrder(jobOrder);
                  setViewMode('positions');
                }}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-mono font-semibold text-gray-900">{jobOrder.jobOrderCode}</h3>
                    <p className="text-sm text-gray-600">{jobOrder.principalCompanyName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="relative inline-block">
                        {editingStatus === jobOrder.id ? (
                          <select
                            value={jobOrder.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateJobOrderStatus(jobOrder.id, e.target.value as 'Active' | 'Closed' | 'On Hold');
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
                      <span className="text-xs text-gray-500">
                        {jobOrder.positions.length} Position{jobOrder.positions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-500">Open Positions</p>
                    <p className="text-lg font-bold text-green-600">{totalOpenPositions}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-gray-500">Applicants</p>
                    <p className="text-lg font-bold text-blue-600">{totalJobApplicants}</p>
                  </div>
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="text-sm font-medium text-gray-900">{jobOrder.deadline}</p>
                  </div>
                  {jobOrder.pointPersonId && (
                    <div className="text-right hidden xl:block">
                      <p className="text-xs text-gray-500">Point Person</p>
                      <p className="text-sm font-medium text-gray-900">
                        {usersData.find(u => u.id === jobOrder.pointPersonId)?.name || 'N/A'}
                      </p>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applicants Full Screen Modal */}
      {selectedPosition && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPosition.position.title}</h2>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedPosition.position.openPositions > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedPosition.position.openPositions} Open Position{selectedPosition.position.openPositions !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Job Order:</span> {selectedPosition.jobOrder.jobOrderCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Company:</span> {selectedPosition.jobOrder.principalCompanyName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Deadline:</span> {selectedPosition.jobOrder.deadline}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPosition(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Applicants Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
              {['Applied', 'AI-screened', 'Shortlist', 'Scheduled', 'Accepted', 'Rejected'].map((status) => {
                const count = selectedPosition.position.applicants.filter(a => a.status === status).length;
                return (
                  <div key={status} className="bg-white rounded-lg shadow-sm p-3">
                    <p className="text-xs text-gray-500 mb-1">{status}</p>
                    <p className="text-xl font-bold text-gray-900">{count}</p>
                  </div>
                );
              })}
            </div>

            {/* Position Details */}
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description */}
                {selectedPosition.position.description && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Position Description</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedPosition.position.description}
                    </p>
                  </div>
                )}
                
                {/* Requirements */}
                {selectedPosition.position.requirements && (
                  <div className="bg-purple-50 border-l-4 border-purple-600 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">Position Requirements</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedPosition.position.requirements}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="px-6 py-4 bg-white border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search applicants by name..."
                    value={applicantSearchTerm}
                    onChange={(e) => setApplicantSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={applicantFilterStatus}
                    onChange={(e) => setApplicantFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-sm"
                  >
                    <option value="All">All Status</option>
                    <option value="applied">applied</option>
                    <option value="AI-screened">AI-screened</option>
                    <option value="Shortlist">Shortlist</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <select
                  value={applicantScoreSort}
                  onChange={(e) => setApplicantScoreSort(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-sm"
                >
                  <option value="none">Resume Score (Default)</option>
                  <option value="high-to-low">Resume Score (High to Low)</option>
                  <option value="low-to-high">Resume Score (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-green-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resume Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Fit Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rejection Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      // Filter applicants
                      let filteredApplicants = selectedPosition.position.applicants.filter(applicant => {
                        const matchesSearch = applicant.name.toLowerCase().includes(applicantSearchTerm.toLowerCase());
                        const matchesStatus = applicantFilterStatus === 'All' || applicant.status === applicantFilterStatus;
                        return matchesSearch && matchesStatus;
                      });

                      // Sort applicants by resume score
                      if (applicantScoreSort === 'high-to-low') {
                        filteredApplicants = [...filteredApplicants].sort((a, b) => b.resumeScore - a.resumeScore);
                      } else if (applicantScoreSort === 'low-to-high') {
                        filteredApplicants = [...filteredApplicants].sort((a, b) => a.resumeScore - b.resumeScore);
                      }

                      if (filteredApplicants.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                              No applicants found
                            </td>
                          </tr>
                        );
                      }

                      return filteredApplicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-green-600 font-semibold text-sm">
                                  {applicant.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${getScoreColor(applicant.resumeScore)}`}>
                              {applicant.resumeScore}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${getScoreColor(applicant.jobFitScore || 0)}`}>
                              {applicant.jobFitScore || 0}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={applicant.status}
                              onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${getApplicantStatusColor(applicant.status)}`}
                            >
                              <option value="Applied">Applied</option>
                              <option value="AI-screened">AI-screened</option>
                              <option value="Shortlist">Shortlist</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {applicant.appliedDate}
                          </td>
                          <td className="px-6 py-4">
                            {applicant.status === 'Rejected' && applicant.rejectionReason ? (
                              <div className="text-sm text-red-800 max-w-md">
                                {applicant.rejectionReason}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{(() => {
                  const filtered = selectedPosition.position.applicants.filter(applicant => {
                    const matchesSearch = applicant.name.toLowerCase().includes(applicantSearchTerm.toLowerCase());
                    const matchesStatus = applicantFilterStatus === 'All' || applicant.status === applicantFilterStatus;
                    return matchesSearch && matchesStatus;
                  });
                  return filtered.length;
                })()}</span> applicant{(() => {
                  const filtered = selectedPosition.position.applicants.filter(applicant => {
                    const matchesSearch = applicant.name.toLowerCase().includes(applicantSearchTerm.toLowerCase());
                    const matchesStatus = applicantFilterStatus === 'All' || applicant.status === applicantFilterStatus;
                    return matchesSearch && matchesStatus;
                  });
                  return filtered.length !== 1 ? 's' : '';
                })()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedPosition(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  Export Applicants
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}