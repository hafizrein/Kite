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
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // This case might happen if a user was created but the doc failed to write
          // We can try to create it here as a fallback, but primary creation should be in signup/google-signin
           const newUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || 'New User',
              email: fbUser.email || '',
              role: 'Member',
              avatar: fbUser.photoURL || undefined,
            };
            await setDoc(doc(db, "users", fbUser.uid), newUser, { merge: true });
            setUser(newUser);
        }
      } else {
        setUser(null);
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
      };

      if (userData.avatar) {
        newUser.avatar = userData.avatar;
      }
      
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      setUser(newUser);
  };

  const signInWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || 'New User',
          email: fbUser.email || '',
          role: 'Member', // Default role
        };

        if (fbUser.photoURL) {
            newUser.avatar = fbUser.photoURL;
        }

        await setDoc(doc(db, 'users', fbUser.uid), newUser);
        setUser(newUser);
      }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const value = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
