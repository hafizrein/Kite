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
import { Project, Account, Opportunity, User, TimeEntry, WBSTask, Attachment } from './types';

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

// Attachment-specific functions (metadata only - no file storage)
export async function createAttachmentMetadata(
  file: File,
  entityType: 'projects' | 'accounts' | 'opportunities',
  entityId: string,
  userId: string
): Promise<Attachment> {
  try {
    // Create a unique file name
    const timestamp = Date.now();

    // Create attachment object with metadata only (no actual file upload)
    const attachment: Attachment = {
      id: timestamp.toString(),
      name: file.name,
      type: 'file',
      url: '', // No actual file URL - just metadata
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
    };

    return attachment;
  } catch (error) {
    console.error('Error creating attachment metadata:', error);
    throw new Error('Failed to create attachment metadata');
  }
}

export async function removeAttachmentMetadata(
  attachmentId: string,
  entityType: 'projects' | 'accounts' | 'opportunities',
  entityId: string
): Promise<void> {
  try {
    // This function just removes the metadata - no actual file deletion needed
    console.log(`Removed attachment metadata for ${attachmentId}`);
  } catch (error) {
    console.error('Error removing attachment metadata:', error);
  }
}

export async function saveAttachmentsToEntity(
  entityType: 'projects' | 'accounts' | 'opportunities',
  entityId: string,
  attachments: Attachment[]
): Promise<void> {
  try {
    const entityRef = doc(db, entityType, entityId);

    await updateDoc(entityRef, {
      attachments: attachments,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving attachments to entity:', error);
    throw new Error('Failed to save attachments');
  }
}

export async function getEntityWithAttachments(
  entityType: 'projects' | 'accounts' | 'opportunities',
  entityId: string
): Promise<any> {
  try {
    const entityRef = doc(db, entityType, entityId);
    const entitySnap = await getDoc(entityRef);

    if (entitySnap.exists()) {
      return {
        id: entitySnap.id,
        ...entitySnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting entity with attachments:', error);
    throw new Error('Failed to load entity');
  }
}
