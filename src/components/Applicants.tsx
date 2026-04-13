import React, { useState } from "react";
import {
  Search,
  Download,
  Filter,
  X,
  Briefcase,
  Award,
  BookOpen,
} from "lucide-react";

interface Applicant {
  id: number;
  referenceNumber: string;
  name: string;
  jobOrder: string;
  position: string;
  resumeScore: number;
  status:
    | "Applied"
    | "AI-screened"
    | "Shortlist"
    | "Scheduled"
    | "Accepted"
    | "Rejected";
  meetingLink: string;
  rejectionReason?: string;
  appliedDate: string;
  experience: string;
  skills: string[];
  certifications: string[];
}

export default function Applicants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<string>("All");
  const [selectedApplicant, setSelectedApplicant] =
    useState<Applicant | null>(null);

  const [applicants, setApplicants] = useState<Applicant[]>([
    {
      id: 1,
      referenceNumber: "REF-001",
      name: "John Doe",
      jobOrder: "JO-2026-001",
      position: "Software Engineer",
      resumeScore: 85,
      status: "Shortlist",
      meetingLink: "https://meet.example.com/abc123",
      appliedDate: "2026-01-15",
      experience: "5 years",
      skills: ["JavaScript", "Python", "React"],
      certifications: ["AWS Certified Developer"],
    },
    {
      id: 2,
      referenceNumber: "REF-002",
      name: "Jane Smith",
      jobOrder: "JO-2026-002",
      position: "Product Manager",
      resumeScore: 92,
      status: "Scheduled",
      meetingLink: "https://meet.example.com/xyz789",
      appliedDate: "2026-01-14",
      experience: "3 years",
      skills: ["Agile", "Scrum", "Product Management"],
      certifications: ["PMP"],
    },
    {
      id: 3,
      referenceNumber: "REF-003",
      name: "Mike Johnson",
      jobOrder: "JO-2026-001",
      position: "Software Engineer",
      resumeScore: 78,
      status: "AI-screened",
      meetingLink: "",
      appliedDate: "2026-01-13",
      experience: "4 years",
      skills: ["Java", "Spring", "Docker"],
      certifications: ["Oracle Certified Professional"],
    },
    {
      id: 4,
      referenceNumber: "REF-004",
      name: "Sarah Williams",
      jobOrder: "JO-2026-003",
      position: "Data Analyst",
      resumeScore: 65,
      status: "Rejected",
      meetingLink: "",
      rejectionReason:
        "Does not meet minimum experience requirements (5+ years required)",
      appliedDate: "2026-01-12",
      experience: "2 years",
      skills: ["SQL", "Excel", "Tableau"],
      certifications: ["Certified Data Analyst"],
    },
    {
      id: 5,
      referenceNumber: "REF-005",
      name: "David Brown",
      jobOrder: "JO-2026-004",
      position: "DevOps Engineer",
      resumeScore: 88,
      status: "Accepted",
      meetingLink: "https://meet.example.com/def456",
      appliedDate: "2026-01-11",
      experience: "6 years",
      skills: ["AWS", "Kubernetes", "Terraform"],
      certifications: ["AWS Certified DevOps Engineer"],
    },
    {
      id: 6,
      referenceNumber: "REF-006",
      name: "Emily Davis",
      jobOrder: "JO-2026-002",
      position: "Product Manager",
      resumeScore: 70,
      status: "applied",
      meetingLink: "",
      appliedDate: "2026-01-10",
      experience: "1 year",
      skills: ["Agile", "Scrum", "Product Management"],
      certifications: ["PMP"],
    },
    {
      id: 7,
      referenceNumber: "REF-007",
      name: "Robert Miller",
      jobOrder: "JO-2026-005",
      position: "UX Designer",
      resumeScore: 55,
      status: "Rejected",
      meetingLink: "",
      rejectionReason:
        "Portfolio does not demonstrate required design skills for enterprise applications",
      appliedDate: "2026-01-09",
      experience: "3 years",
      skills: ["Sketch", "Figma", "Adobe XD"],
      certifications: ["Certified UX Designer"],
    },
    {
      id: 8,
      referenceNumber: "REF-008",
      name: "Lisa Anderson",
      jobOrder: "JO-2026-001",
      position: "Software Engineer",
      resumeScore: 95,
      status: "Scheduled",
      meetingLink: "https://meet.example.com/ghi789",
      appliedDate: "2026-01-08",
      experience: "5 years",
      skills: ["JavaScript", "Python", "React"],
      certifications: ["AWS Certified Developer"],
    },
  ]);

  const handleStatusChange = (
    id: number,
    newStatus: Applicant["status"],
  ) => {
    setApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === id
          ? { ...applicant, status: newStatus }
          : applicant,
      ),
    );
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.position
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      applicant.jobOrder
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "All" ||
      applicant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-gray-100 text-gray-800";
      case "AI-screened":
        return "bg-blue-100 text-blue-800";
      case "Shortlist":
        return "bg-purple-100 text-purple-800";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-bold";
    if (score >= 60) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          "Applied",
          "AI-screened",
          "Shortlist",
          "Scheduled",
          "Accepted",
          "Rejected",
        ].map((status) => {
          const count = applicants.filter(
            (a) => a.status === status,
          ).length;
          return (
            <div
              key={status}
              className="bg-white rounded-lg shadow-md p-4"
            >
              <p className="text-xs text-gray-500 mb-1">
                {status}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, position, or job order..."
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
            <option>applied</option>
            <option>AI-screened</option>
            <option>Shortlist</option>
            <option>Scheduled</option>
            <option>Accepted</option>
            <option>Rejected</option>
          </select>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resume Score
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
              {filteredApplicants.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() =>
                    setSelectedApplicant(applicant)
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono font-semibold">
                      {applicant.referenceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-semibold">
                          {applicant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {applicant.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {applicant.jobOrder}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {applicant.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${getScoreColor(applicant.resumeScore)}`}
                    >
                      {applicant.resumeScore}%
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={applicant.status}
                      onChange={(e) =>
                        handleStatusChange(
                          applicant.id,
                          e.target.value as Applicant["status"],
                        )
                      }
                      className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${getStatusColor(applicant.status)}`}
                    >
                      <option value="applied">Applied</option>
                      <option value="AI-screened">
                        AI-screened
                      </option>
                      <option value="Shortlist">
                        Shortlist
                      </option>
                      <option value="Scheduled">
                        Scheduled
                      </option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {applicant.appliedDate}
                  </td>
                  <td className="px-6 py-4">
                    {applicant.status === "Rejected" &&
                    applicant.rejectionReason ? (
                      <div className="text-sm text-red-800 max-w-xs">
                        {applicant.rejectionReason}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xl">
                    {selectedApplicant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedApplicant.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedApplicant.position}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Reference Number
                  </p>
                  <p className="text-base font-mono text-gray-900 font-semibold">
                    {selectedApplicant.referenceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Job Order
                  </p>
                  <p className="text-base font-mono text-gray-900">
                    {selectedApplicant.jobOrder}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Resume Score
                  </p>
                  <p
                    className={`text-base ${getScoreColor(selectedApplicant.resumeScore)}`}
                  >
                    {selectedApplicant.resumeScore}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplicant.status)}`}
                  >
                    {selectedApplicant.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Applied Date
                  </p>
                  <p className="text-base text-gray-900">
                    {selectedApplicant.appliedDate}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">
                    Experience
                  </h3>
                </div>
                <p className="text-gray-700">
                  {selectedApplicant.experience}
                </p>
              </div>

              {/* Skills */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">
                    Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.skills.map(
                    (skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-bold text-gray-900">
                    Certifications
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedApplicant.certifications.map(
                    (cert, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                        <span className="text-gray-700">
                          {cert}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Rejection Reason (if applicable) */}
              {selectedApplicant.status === "Rejected" &&
                selectedApplicant.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-bold text-red-900 mb-2">
                      Rejection Reason
                    </h3>
                    <p className="text-red-800">
                      {selectedApplicant.rejectionReason}
                    </p>
                  </div>
                )}

              {/* Meeting Link (if applicable) */}
              {selectedApplicant.meetingLink && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Meeting Link
                  </h3>
                  <a
                    href={selectedApplicant.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 hover:underline break-all"
                  >
                    {selectedApplicant.meetingLink}
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                Edit Applicant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}