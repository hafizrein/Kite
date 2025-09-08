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

  useEffect(() => {
    if (!authUser) {
      dispatch({ type: 'SET_CURRENT_USER', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    dispatch({ type: 'SET_CURRENT_USER', payload: authUser });
    
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load data progressively instead of all at once
        // Start with essential data first
        const users = await usersService.getAll();
        
        // Load projects and opportunities in parallel (most commonly needed)
        const [projects, opportunities] = await Promise.all([
          projectsService.getAll(),
          opportunitiesService.getAll(),
        ]);
        
        // Load remaining data
        const [accounts, timeEntries] = await Promise.all([
          accountsService.getAll(),
          timeEntriesService.getAll(),
        ]);

        // Fix progress values for existing projects
        const fixedProjects = projects.map(project => {
          let correctedProgress = project.progress;
          
          // Auto-correct progress based on status if it seems wrong
          if (project.status === 'Completed' && project.progress !== 100) {
            correctedProgress = 100;
          } else if (project.status === 'Not Started' && project.progress > 0) {
            correctedProgress = 0;
          }
          
          return correctedProgress !== project.progress 
            ? { ...project, progress: correctedProgress }
            : project;
        });

        dispatch({ 
          type: 'SET_DATA', 
          payload: { projects: fixedProjects, accounts, opportunities, users, timeEntries } 
        });
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays instead of keeping loading state
        dispatch({ 
          type: 'SET_DATA', 
          payload: { 
            projects: [], 
            accounts: [], 
            opportunities: [], 
            users: [], 
            timeEntries: [] 
          } 
        });
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
