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
      companyContactNumber: '+1-555-0101',
      companyRepresentative: 'John Smith',
      country: 'United States',
      pointPersonId: 3,
      placementFee: '15% of annual salary',
      requirements: ['Valid work permit', 'Bachelor\'s degree in Computer Science', 'Minimum 3 years experience'],
      highlights: ['Competitive salary package', 'Health insurance', 'Remote work options'],
      featuredOpportunity: true,
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
          contractLength: '6 months',
          salaryRange: '$4,000 - $6,000/month',
          category: 'Engineering',
          applicants: [
            {
              id: 1,
              name: 'John Doe',
              resumeScore: 85,
              jobFitScore: 78,
              status: 'Shortlist',
              positionApplied: 'Software Engineer',
              interviewer: 'Sarah Johnson',
              salary: '$5,000/month',
              resumeUrl: 'https://example.com/resumes/john-doe-resume.pdf'
            },
            {
              id: 2,
              name: 'Mike Johnson',
              resumeScore: 78,
              jobFitScore: 82,
              positionApplied: 'Software Engineer',
              interviewer: '',
              salary: '',
              resumeUrl: 'https://example.com/resumes/mike-johnson-resume.pdf'
            },
            {
              id: 3,
              name: 'Lisa Anderson',
              resumeScore: 95,
              jobFitScore: 91,
              status: 'Accepted',
              appliedDate: '2026-01-12',
              positionApplied: 'Software Engineer',
              interviewer: 'Michael Chen',
              salary: '$6,000/month',
              resumeUrl: 'https://example.com/resumes/lisa-anderson-resume.pdf'
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
          category: 'Engineering',
          applicants: [
            {
              id: 4,
              name: 'Sarah Williams',
              resumeScore: 88,
              jobFitScore: 85,
              status: 'Interviewed',
              positionApplied: 'Senior Developer',
              interviewer: 'John Smith',
              salary: '$7,000/month',
              resumeUrl: 'https://example.com/resumes/sarah-williams-resume.pdf'
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
      principalCompanyName: 'Digital Innovations Ltd.',
      companyContactNumber: '+1-555-0102',
      companyRepresentative: 'Sarah Johnson',
      country: 'Canada',
      pointPersonId: 2,
      placementFee: '$5,000 flat fee',
      requirements: ['Canadian work visa', 'MBA preferred', 'Strong communication skills'],
      highlights: ['Career growth opportunities', 'Professional development budget', 'Flexible hours'],
      featuredOpportunity: false,
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
          category: 'Operations',
          applicants: [
            {
              id: 5,
              name: 'Tom Brown',
              resumeScore: 82,
              jobFitScore: 75,
              status: 'Shortlist',
              positionApplied: 'Logistics Manager',
              interviewer: '',
              salary: '',
              resumeUrl: 'https://example.com/resumes/tom-brown-resume.pdf'
            },
            {
              id: 6,
              name: 'Emily Davis',
              resumeScore: 90,
              jobFitScore: 88,
              status: 'Declined',
              positionApplied: 'Logistics Manager',
              interviewer: 'David Lee',
              salary: '$5,500/month',
              declinedReason: 'Accepted position at another company',
              resumeUrl: 'https://example.com/resumes/emily-davis-resume.pdf'
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
      principalCompanyName: 'Data Analytics Corp.',
      companyContactNumber: '+44-20-7946-0958',
      companyRepresentative: 'Michael Chen',
      country: 'United Kingdom',
      pointPersonId: 5,
      placementFee: '20% of annual salary',
      requirements: ['UK work authorization', 'Advanced Excel skills', '5+ years in data analysis'],
      highlights: ['Pension scheme', 'Annual bonus', 'Training opportunities'],
      featuredOpportunity: false,
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
          category: 'Product Management',
          applicants: [
            {
              id: 7,
              name: 'Chris Martin',
              resumeScore: 91,
              jobFitScore: 87,
              status: 'Rejected',
              positionApplied: 'Product Manager',
              interviewer: 'Jessica Wang',
              salary: '',
              rejectedReason: 'Did not meet technical requirements',
              resumeUrl: 'https://example.com/resumes/chris-martin-resume.pdf'
            }
          ]
        }
      ]
    },
    {
      id: 4,
      jobOrderCode: 'JO-2026-004',
      jobOrderNumber: '004',
      referenceNumber: 'REF-2026-004',
      principalCompanyName: 'Tech Solutions Inc.',
      companyContactNumber: '+1-555-0101',
      companyRepresentative: 'John Smith',
      country: 'United States',
      pointPersonId: 3,
      placementFee: '10% of annual salary',
      requirements: ['Valid work permit', '2+ years experience'],
      highlights: ['Remote work', 'Professional development'],
      featuredOpportunity: false,
      status: 'Active',
      dateCreated: '2026-01-20',
      deadline: '2026-02-28',
      positions: [
        {
          id: 401,
          title: 'Frontend Developer',
          openPositions: 2,
          description: 'Looking for frontend developers...',
          requirements: 'React, TypeScript, 2+ years experience...',
          contractLength: '6 months',
          salaryRange: '$3,500 - $5,000/month',
          category: 'Engineering',
          applicants: [
            {
              id: 8,
              name: 'Alex Turner',
              jobFitScore: 88,
              status: 'Applied',
              positionApplied: 'Frontend Developer',
              interviewer: '',
              salary: '',
              resumeUrl: 'https://example.com/resumes/alex-turner-resume.pdf'
            }
          ]
        }
      ]
    },
     {
      id: 5,
      jobOrderCode: 'JO-2026-005',
      jobOrderNumber: '005',
      referenceNumber: 'REF-2026-005',
      principalCompanyName: 'Digital Innovations Ltd.',
      companyContactNumber: '+1-555-0102',
      companyRepresentative: 'Sarah Johnson',
      country: 'Canada',
      pointPersonId: 2,
      placementFee: '$3,000 flat fee',
      requirements: ['Canadian work visa', 'Excellent communication'],
      highlights: ['Health benefits', 'Work-life balance'],
      featuredOpportunity: false,
      status: 'On Hold',
      dateCreated: '2026-01-25',
      deadline: '2026-03-15',
      positions: [
        {
          id: 501,
          title: 'Marketing Specialist',
          openPositions: 1,
          description: 'Marketing role for digital campaigns...',
          requirements: '3+ years in digital marketing...',
          contractLength: '3 months',
          salaryRange: '$4,000 - $6,000/month',
          category: 'Marketing',
          applicants: []
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
