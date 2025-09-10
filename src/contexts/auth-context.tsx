"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: User['role']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to manage auth cookies
  const setAuthCookies = (user: User | null, token: string | null) => {
    if (typeof document !== 'undefined') {
      if (user && token) {
        // Set auth cookies for middleware
        document.cookie = `auth-token=${token}; path=/; max-age=86400; samesite=strict`;
        document.cookie = `user-role=${user.role.toLowerCase()}; path=/; max-age=86400; samesite=strict`;
      } else {
        // Clear auth cookies
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          let userData: User;
          
          if (userDoc.exists()) {
            userData = userDoc.data() as User;
          } else {
            // Create new user document
            // First user becomes Owner, subsequent users become Members
            const allUsersSnapshot = await getDocs(collection(db, 'users'));
            const isFirstUser = allUsersSnapshot.empty;
            
            userData = {
              id: fbUser.uid,
              name: fbUser.displayName || 'New User',
              email: fbUser.email || '',
              role: isFirstUser ? 'Owner' : 'Member',
              avatar: fbUser.photoURL || undefined,
            };
            const userToSave: Partial<User> = { ...userData };
            if (!userToSave.avatar) {
              delete userToSave.avatar;
            }
            await setDoc(doc(db, "users", fbUser.uid), userToSave, { merge: true });
          }
          
          setUser(userData);
          
          // Get auth token and set cookies
          const token = await fbUser.getIdToken();
          setAuthCookies(userData, token);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
          setAuthCookies(null, null);
        }
      } else {
        setUser(null);
        setAuthCookies(null, null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(result.user, {
        displayName: userData.name
      });
      
      const newUser: User = {
        id: result.user.uid,
        name: userData.name || 'User',
        email: email,
        role: userData.role || 'Member',
        department: userData.department,
        hourlyRate: userData.hourlyRate,
        avatar: userData.avatar,
      };

      const userToSave: Partial<User> = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };

      if (newUser.department) userToSave.department = newUser.department;
      if (newUser.hourlyRate) userToSave.hourlyRate = newUser.hourlyRate;
      if (newUser.avatar) userToSave.avatar = newUser.avatar;
      
      await setDoc(doc(db, 'users', result.user.uid), userToSave);
      setUser(newUser);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Auth state change will be handled by the onAuthStateChanged listener
  };

  const logout = async () => {
    setAuthCookies(null, null); // Clear cookies before signing out
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUserRole = async (role: User['role']) => {
    if (!firebaseUser || !user) {
      throw new Error('No user logged in');
    }

    const updatedUser = { ...user, role };
    
    // Update in Firestore
    await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser, { merge: true });
    
    // Update local state
    setUser(updatedUser);
    
    // Update cookies
    const token = await firebaseUser.getIdToken();
    setAuthCookies(updatedUser, token);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    updateUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
