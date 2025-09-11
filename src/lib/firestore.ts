import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, Account, Opportunity, User, TimeEntry, WBSTask } from './types';

// Generic CRUD operations
export class FirestoreService<T extends { id: string }> {
  constructor(private collectionName: string) {}

  async getAll(): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as T;
    }
    return null;
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getByQuery(field: string, operator: any, value: any): Promise<T[]> {
    const q = query(
      collection(db, this.collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  // Real-time subscription
  onSnapshot(callback: (data: T[]) => void) {
    return onSnapshot(collection(db, this.collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(data);
    });
  }
}

// Specific service instances
export const projectsService = new FirestoreService<Project>('projects');
export const accountsService = new FirestoreService<Account>('accounts');
export const opportunitiesService = new FirestoreService<Opportunity>('opportunities');
export const usersService = new FirestoreService<User>('users');
export const timeEntriesService = new FirestoreService<TimeEntry>('timeEntries');

// Specialized functions for complex operations
export async function convertOpportunityToProject(
  opportunityId: string,
  projectData: Omit<Project, 'id'>
): Promise<string> {
  const batch = writeBatch(db);
  
  // Create new project
  const projectRef = doc(collection(db, 'projects'));
  batch.set(projectRef, {
    ...projectData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  
  // Update opportunity status
  const opportunityRef = doc(db, 'opportunities', opportunityId);
  batch.update(opportunityRef, {
    stage: 'Closed Won',
    convertedToProjectId: projectRef.id,
    updatedAt: Timestamp.now(),
  });
  
  await batch.commit();
  return projectRef.id;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  return projectsService.getByQuery('managerId', '==', userId);
}

export async function getUserTimeEntries(userId: string, projectId?: string): Promise<TimeEntry[]> {
  if (projectId) {
    const q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', userId),
      where('projectId', '==', projectId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimeEntry));
  }
  
  return timeEntriesService.getByQuery('userId', '==', userId);
}

export async function getAccountOpportunities(accountId: string): Promise<Opportunity[]> {
  return opportunitiesService.getByQuery('accountId', '==', accountId);
}

// WBS tasks stored under projects/{projectId}/wbs (single document) for simplicity
export async function getProjectWBSTasks(projectId: string): Promise<WBSTask[]> {
  const wbsDocRef = doc(db, 'projects', projectId, 'wbs', 'tree');
  const wbsSnap = await getDoc(wbsDocRef);
  if (!wbsSnap.exists()) return [];
  const data = wbsSnap.data() as { tasks?: WBSTask[] };
  return Array.isArray(data.tasks) ? data.tasks : [];
}

export async function saveProjectWBSTasks(projectId: string, tasks: WBSTask[]): Promise<void> {
  const wbsDocRef = doc(db, 'projects', projectId, 'wbs', 'tree');

  // Recursively remove undefined values so Firestore accepts the payload
  const removeUndefined = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(removeUndefined);
    }
    if (value && typeof value === 'object') {
      const result: Record<string, any> = {};
      Object.keys(value).forEach((key) => {
        const v = (value as any)[key];
        if (v !== undefined) {
          result[key] = removeUndefined(v);
        }
      });
      return result;
    }
    return value;
  };

  const sanitizedTasks = removeUndefined(tasks);

  await setDoc(
    wbsDocRef,
    {
      tasks: sanitizedTasks,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}
