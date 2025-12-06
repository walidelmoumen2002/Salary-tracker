
import React from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// A simple hook to get the current user from Supabase auth state
export function useAuth() {
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
      const fetchUser = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            setUser(user);
        } catch (e) {
             console.error("Error fetching user in hook:", e);
        }
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
