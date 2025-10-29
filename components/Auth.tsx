import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // This is where we can set initial data for a new user.
            // A Supabase Function (e.g., on user creation trigger) is needed to populate the 'profiles' table.
            // For example, create a function that inserts a new row into `profiles` with the new user's ID and a default salary.
            // The function would look something like this:
            //
            // CREATE OR REPLACE FUNCTION public.handle_new_user()
            // RETURNS trigger
            // LANGUAGE plpgsql
            // SECURITY DEFINER SET search_path = public
            // AS $$
            // BEGIN
            //   INSERT INTO public.profiles (id, salary)
            //   VALUES (new.id, 7000);
            //   RETURN new;
            // END;
            // $$;
            //
            // And a trigger:
            //
            // CREATE TRIGGER on_auth_user_created
            // AFTER INSERT ON auth.users
            // FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{isLogin ? 'Sign In' : 'Sign Up'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          </form>
          <div className="mt-4 text-center text-sm">
            <a
              onClick={(e) => {
                e.preventDefault();
                setIsLogin(!isLogin);
                setError(null);
              }}
              href="#"
              className="text-muted-foreground hover:text-primary"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
