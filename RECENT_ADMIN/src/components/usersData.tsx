export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  phone: string;
  created: string;
}

export const usersData: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', phone: '+1234567890', created: '2026-01-01' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Project Officer', status: 'Active', phone: '+1234567891', created: '2026-01-03' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Project Manager', status: 'Active', phone: '+1234567892', created: '2026-01-05' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Admin', status: 'Inactive', phone: '+1234567893', created: '2026-01-07' },
  { id: 5, name: 'David Brown', email: 'david@example.com', role: 'Project Officer', status: 'Active', phone: '+1234567894', created: '2026-01-10' },
];
