import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, useSegments } from 'expo-router';
import { auth } from '@/configs/firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      console.log(firebaseUser ? "Logged in" : "No Auth");
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/login');
    } else {
      router.replace('/(pages)/home');
    }
  }, [user, segments, isLoading]);

  const value = {
    user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}