
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { getErrorMessage } from '../lib/utils';

type AuthView = 'sign_in' | 'sign_up' | 'forgot_password';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState<AuthView>('sign_in');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (view === 'sign_up') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Additional user metadata or redirect options can be added here
          }
        });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else if (view === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('Check your email for the password reset link!');
      }
    } catch (error: any) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'sign_in': return 'Sign In';
      case 'sign_up': return 'Sign Up';
      case 'forgot_password': return 'Reset Password';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com" 
              />
            </div>
            
            {view !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium" htmlFor="password">Password</label>
                  {view === 'sign_in' && (
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot_password');
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading 
                ? 'Loading...' 
                : (view === 'sign_in' ? 'Sign In' : view === 'sign_up' ? 'Sign Up' : 'Send Reset Link')}
            </Button>
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            {message && <p className="text-sm text-green-500 text-center">{message}</p>}
          </form>
          
          <div className="mt-4 text-center text-sm space-y-2">
            {view === 'sign_in' && (
              <button
                type="button"
                onClick={() => {
                  setView('sign_up');
                  setError(null);
                  setMessage(null);
                }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Don't have an account? Sign Up
              </button>
            )}
            
            {view === 'sign_up' && (
              <button
                type="button"
                onClick={() => {
                  setView('sign_in');
                  setError(null);
                  setMessage(null);
                }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Already have an account? Sign In
              </button>
            )}

            {view === 'forgot_password' && (
              <button
                type="button"
                onClick={() => {
                  setView('sign_in');
                  setError(null);
                  setMessage(null);
                }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
