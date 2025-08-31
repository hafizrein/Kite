"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Project, Account, Opportunity, User, TimeEntry } from '@/lib/types';
import { 
  projectsService, 
  accountsService, 
  opportunitiesService, 
  usersService, 
  timeEntriesService 
} from '@/lib/firestore';
import { useAuth } from './auth-context';

// Initial data
const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Kite Web App',
    description: 'Building the main Kite platform',
    status: 'In Progress',
    cpi: 1.1,
    spi: 0.9,
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 150000,
    spent: 112500,
    managerId: 'user-1',
    teamMembers: ['user-1', 'user-2', 'user-3'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20'
  },
  {
    id: 'proj-2',
    name: 'CRM Integration',
    description: 'Integrating CRM functionality',
    status: 'On Hold',
    cpi: 1.0,
    spi: 1.0,
    progress: 30,
    startDate: '2024-02-01',
    budget: 80000,
    spent: 24000,
    managerId: 'user-2',
    teamMembers: ['user-2', 'user-4'],
    createdAt: '2024-01-25',
    updatedAt: '2024-02-10'
  },
  {
    id: 'proj-3',
    name: 'API Development',
    description: 'RESTful API for mobile apps',
    status: 'Completed',
    cpi: 1.2,
    spi: 1.1,
    progress: 100,
    startDate: '2023-11-01',
    endDate: '2024-01-31',
    budget: 120000,
    spent: 100000,
    managerId: 'user-1',
    teamMembers: ['user-1', 'user-3'],
    createdAt: '2023-10-15',
    updatedAt: '2024-01-31'
  },
  {
    id: 'proj-4',
    name: 'Mobile App Design',
    description: 'UI/UX design for mobile application',
    status: 'In Progress',
    cpi: 0.8,
    spi: 1.2,
    progress: 40,
    startDate: '2024-01-01',
    endDate: '2024-04-30',
    budget: 60000,
    spent: 45000,
    managerId: 'user-4',
    teamMembers: ['user-4', 'user-5'],
    createdAt: '2023-12-20',
    updatedAt: '2024-02-15'
  },
  {
    id: 'proj-5',
    name: 'Marketing Website',
    description: 'Corporate marketing website',
    status: 'Not Started',
    cpi: 1.0,
    spi: 1.0,
    progress: 0,
    startDate: '2024-03-01',
    budget: 40000,
    spent: 0,
    managerId: 'user-2',
    teamMembers: [],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  }
];

const initialAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Innovate Inc.',
    industry: 'Technology',
    website: 'https://innovate-inc.com',
    phone: '+1-555-0123',
    email: 'contact@innovate-inc.com',
    ownerId: 'user-1',
    createdAt: '2023-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 'acc-2',
    name: 'Global Solutions',
    industry: 'Consulting',
    website: 'https://globalsolutions.com',
    phone: '+1-555-0456',
    email: 'info@globalsolutions.com',
    ownerId: 'user-2',
    createdAt: '2023-02-20',
    updatedAt: '2024-02-10'
  },
  {
    id: 'acc-3',
    name: 'TechStart LLC',
    industry: 'Startup',
    phone: '+1-555-0789',
    email: 'hello@techstart.com',
    ownerId: 'user-1',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
  }
];

const initialOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    name: 'Project Phoenix',
    accountId: 'acc-1',
    accountName: 'Innovate Inc.',
    stage: 'Qualification',
    amount: 150000,
    probability: 60,
    closeDate: '2024-08-30',
    description: 'Large scale digital transformation project',
    ownerId: 'user-1',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-15'
  },
  {
    id: 'opp-2',
    name: 'Consulting Gig',
    accountId: 'acc-2',
    accountName: 'Global Solutions',
    stage: 'Closed Lost',
    amount: 75000,
    probability: 0,
    closeDate: '2024-06-01',
    description: 'Strategic consulting engagement',
    ownerId: 'user-2',
    createdAt: '2024-01-05',
    updatedAt: '2024-06-01'
  },
  {
    id: 'opp-3',
    name: 'Website Redesign',
    accountId: 'acc-1',
    accountName: 'Innovate Inc.',
    stage: 'Closed Won',
    amount: 50000,
    probability: 100,
    closeDate: '2024-05-15',
    description: 'Complete website redesign and development',
    ownerId: 'user-1',
    createdAt: '2023-12-10',
    updatedAt: '2024-05-15'
  },
  {
    id: 'opp-4',
    name: 'Mobile App Development',
    accountId: 'acc-3',
    accountName: 'TechStart LLC',
    stage: 'Proposal',
    amount: 90000,
    probability: 75,
    closeDate: '2024-09-30',
    description: 'Native mobile app for iOS and Android',
    ownerId: 'user-1',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-20'
  }
];

const initialUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    department: 'Engineering',
    hourlyRate: 150
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'PM',
    department: 'Project Management',
    hourlyRate: 120
  },
  {
    id: 'user-3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'Member',
    department: 'Engineering',
    hourlyRate: 100
  },
  {
    id: 'user-4',
    name: 'Alice Wilson',
    email: 'alice.wilson@example.com',
    role: 'Sales',
    department: 'Sales',
    hourlyRate: 110
  },
  {
    id: 'user-5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    role: 'Member',
    department: 'Design',
    hourlyRate: 95
  }
];

const initialState: AppState = {
  projects: [],
  accounts: [],
  opportunities: [],
  users: [],
  timeEntries: [],
  currentUser: null,
  loading: true,
};

// Actions
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { projects: Project[]; accounts: Account[]; opportunities: Opportunity[]; users: User[]; timeEntries: TimeEntry[] } }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: { id: string; updates: Partial<Account> } }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_OPPORTUNITY'; payload: Opportunity }
  | { type: 'UPDATE_OPPORTUNITY'; payload: { id: string; updates: Partial<Opportunity> } }
  | { type: 'DELETE_OPPORTUNITY'; payload: string }
  | { type: 'ADD_TIME_ENTRY'; payload: TimeEntry }
  | { type: 'UPDATE_TIME_ENTRY'; payload: { id: string; updates: Partial<TimeEntry> } }
  | { type: 'DELETE_TIME_ENTRY'; payload: string }
  | { type: 'SET_CURRENT_USER'; payload: User | null };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_DATA':
      return {
        ...state,
        ...action.payload,
        loading: false
      };
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload
      };
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : project
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        accounts: [...state.accounts, action.payload]
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id
            ? { ...account, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : account
        )
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload)
      };
    case 'ADD_OPPORTUNITY':
      return {
        ...state,
        opportunities: [...state.opportunities, action.payload]
      };
    case 'UPDATE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map(opportunity =>
          opportunity.id === action.payload.id
            ? { ...opportunity, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : opportunity
        )
      };
    case 'DELETE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.filter(opportunity => opportunity.id !== action.payload)
      };
    case 'ADD_TIME_ENTRY':
      return {
        ...state,
        timeEntries: [...state.timeEntries, action.payload]
      };
    case 'UPDATE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.map(entry =>
          entry.id === action.payload.id
            ? { ...entry, ...action.payload.updates }
            : entry
        )
      };
    case 'DELETE_TIME_ENTRY':
      return {
        ...state,
        timeEntries: state.timeEntries.filter(entry => entry.id !== action.payload)
      };
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload
      };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user: authUser } = useAuth();

  // Load data from Firestore when user is authenticated
  useEffect(() => {
    if (!authUser) {
      dispatch({ type: 'SET_CURRENT_USER', payload: null });
      return;
    }

    dispatch({ type: 'SET_CURRENT_USER', payload: authUser });
    
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load all data in parallel
        const [projects, accounts, opportunities, users, timeEntries] = await Promise.all([
          projectsService.getAll(),
          accountsService.getAll(),
          opportunitiesService.getAll(),
          usersService.getAll(),
          timeEntriesService.getAll(),
        ]);

        dispatch({ 
          type: 'SET_DATA', 
          payload: { projects, accounts, opportunities, users, timeEntries } 
        });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, [authUser]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
