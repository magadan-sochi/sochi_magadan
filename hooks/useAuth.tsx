
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("AuthProvider rendered. Initial state:", { user, loading });

  useEffect(() => {
    console.log("AuthProvider useEffect triggered.");
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("onAuthStateChange event:", event, "session:", session);
      let fullUserData: User | null = null;
      if (session?.user) {
        console.log("User session found. Fetching profile for user ID:", session.user.id);
        // User is logged in, fetch their profile from public.users
        const { data: profile, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
            console.log("User profile fetched:", profile);
        }
        
        // Combine auth user data with public profile data
        fullUserData = {
          ...session.user,
          full_name: profile?.full_name,
        };
      }
      
      console.log("Setting user state to:", fullUserData);
      setUser(fullUserData);
      console.log("Setting loading state to false.");
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts.
    return () => {
      console.log("Unsubscribing from onAuthStateChange.");
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
