export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  cpi: number; // Cost Performance Index
  spi: number; // Schedule Performance Index
  progress: number; // 0-100
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  managerId: string;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  stage: 'Lead' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  amount: number;
  probability: number; // 0-100
  closeDate: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'PM' | 'Sales' | 'Member';
  avatar?: string;
  department?: string;
  hourlyRate?: number;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  approved: boolean;
  createdAt: string;
}

export interface AppState {
  projects: Project[];
  accounts: Account[];
  opportunities: Opportunity[];
  users: User[];
  timeEntries: TimeEntry[];
  currentUser: User | null;
  loading?: boolean;
}
