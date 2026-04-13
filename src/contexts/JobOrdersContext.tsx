import React, { createContext, useContext, useState } from 'react';

const JobOrdersContext = createContext(undefined);

export function JobOrdersProvider({ children }) {
  const [jobOrders, setJobOrders] = useState([
    {
      id: 1,
      jobOrderCode: 'JO-2026-001',
      jobOrderNumber: '001',
      referenceNumber: 'REF-2026-001',
      principalCompanyName: 'Tech Solutions Inc.',
      companyContactNumber: '123-456-7890',
      companyRepresentative: 'John Smith',
      pointPersonId: 3,
      status: 'Open',
      dateCreated: '2026-01-10',
      deadline: '2026-02-15',
      positions: [
        {
          id: 101,
          title: 'Software Engineer',
          openPositions: 3,
          description: 'We are looking for talented software engineers to join our team...',
          requirements: 'Bachelor\'s degree in Computer Science, 3+ years of experience...',
          contractLength: '6 months',
          salaryRange: '$4,000 - $6,000/month',
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
              status: 'Accepted',
              appliedDate: '2026-01-12'
            }
          ]
        },
        {
          id: 102,
          title: 'Senior Developer',
          openPositions: 2,
          description: 'Looking for experienced developers...',
          requirements: '5+ years of experience, leadership skills...',
          contractLength: '3 months',
          salaryRange: '$6,000 - $8,000/month',
          applicants: [
            {
              id: 4,
              name: 'Sarah Williams',
              resumeScore: 88,
              status: 'Scheduled',
              appliedDate: '2026-01-14'
            }
          ]
        }
      ]
    },
    {
      id: 2,
      jobOrderCode: 'JO-2026-002',
      jobOrderNumber: '002',
      referenceNumber: 'REF-2026-002',
      principalCompanyName: 'Global Logistics Co.',
      companyContactNumber: '+1-555-0123',
      companyRepresentative: 'Sarah Johnson',
      country: 'Canada',
      pointPersonId: 2,
      status: 'On Hold',
      dateCreated: '2026-01-15',
      deadline: '2026-03-01',
      positions: [
        {
          id: 201,
          title: 'Logistics Manager',
          openPositions: 1,
          description: 'Manage logistics operations...',
          requirements: 'Experience in supply chain management...',
          contractLength: '4 months',
          salaryRange: '$5,000 - $7,000/month',
          applicants: [
            {
              id: 5,
              name: 'Tom Brown',
              resumeScore: 82,
              status: 'AI-screened',
              appliedDate: '2026-01-16'
            },
            {
              id: 6,
              name: 'Emily Davis',
              resumeScore: 90,
              status: 'Shortlist',
              appliedDate: '2026-01-17'
            }
          ]
        }
      ]
    },
    {
      id: 3,
      jobOrderCode: 'JO-2026-003',
      jobOrderNumber: '003',
      referenceNumber: 'REF-2026-003',
      principalCompanyName: 'Digital Innovations Ltd.',
      companyContactNumber: '+44-20-7946-0958',
      companyRepresentative: 'Michael Chen',
      country: 'Canada',
      pointPersonId: 5,
      status: 'Closed',
      dateCreated: '2025-12-01',
      deadline: '2026-01-15',
      positions: [
        {
          id: 301,
          title: 'Product Manager',
          openPositions: 1,
          description: 'Lead product development...',
          requirements: 'MBA preferred, 5+ years experience...',
          contractLength: '6 months',
          salaryRange: '$7,000 - $10,000/month',
          applicants: [
            {
              id: 7,
              name: 'Chris Martin',
              resumeScore: 91,
              status: 'Rejected',
              rejectionReason: 'Position filled',
              appliedDate: '2025-12-05'
            }
          ]
        }
      ]
    }
  ]);

  const updateJobOrderStatus = (jobOrderId, newStatus) => {
    setJobOrders(prevJobOrders => 
      prevJobOrders.map(jo => 
        jo.id === jobOrderId 
          ? { ...jo, status: newStatus }
          : jo
      )
    );
  };

  return (
    <JobOrdersContext.Provider value={{ jobOrders, setJobOrders, updateJobOrderStatus }}>
      {children}
    </JobOrdersContext.Provider>
  );
}

export function useJobOrders() {
  const context = useContext(JobOrdersContext);
  if (context === undefined) {
    throw new Error('useJobOrders must be used within a JobOrdersProvider');
  }
  return context;
}