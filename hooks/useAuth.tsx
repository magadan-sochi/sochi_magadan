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

  useEffect(() => {
    // Set up the listener for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, session });
      
      if (session?.user) {
        // User is logged in, fetch their profile from public.users
        const { data: profile, error } = await supabase
          .from('users')
          .select('full_name') // Only select what's needed
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        }
        
        setUser(currentUser => {
          const newUser: User = {
            ...session.user,
            full_name: profile?.full_name,
          };

          // This check prevents unnecessary re-renders when the session token is refreshed
          // but the actual user data hasn't changed.
          if (currentUser && currentUser.id === newUser.id && currentUser.full_name === newUser.full_name) {
            console.log('User data is unchanged. Preventing re-render.');
            return currentUser; // Return the existing state object
          }

          console.log('User data has changed or is new. Updating state.');
          return newUser;
        });

      } else {
        // User is logged out
        setUser(null);
      }
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
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
