import React from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// A simple hook to get the current user from Supabase auth state
export function useAuth() {
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
      fetchUser();

      const { data: authListener } = supabase.auth.onAuthStateChange(
          (_event, session) => {
              setUser(session?.user ?? null);
          }
      );
      return () => {
          authListener?.subscription.unsubscribe();
      };
    }, []);

    return { user };
}
