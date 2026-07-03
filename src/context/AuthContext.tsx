import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  experience?: string;
  timezone?: string;
  mt5Connected?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  googleLogin: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });

  const saveUser = (u: User) => {
    setUser(u);
    localStorage.setItem('auth_user', JSON.stringify(u));
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        saveUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        saveUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const googleLogin = useCallback(async () => {
    const email = prompt('Enter your Google email address:');
    if (!email) return false;
    const name = email.split('@')[0];
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (data.success) {
        saveUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    const current = user;
    if (!current?.email) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: current.email, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        saveUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, googleLogin, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
