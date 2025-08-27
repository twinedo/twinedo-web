'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === 'twinedo.dev@gmail.com' && user?.role === 'superadmin';

  // Load auth state from localStorage
  useEffect(() => {
    const verifyToken = async (token: string) => {
      try {
        const response = await fetch('/api/auth/admin/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Token is invalid, clear auth state
          logout();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      }
    };

    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      verifyToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Verify this is admin email
    if (data.data.user.email !== 'twinedo.dev@gmail.com') {
      throw new Error('Access denied. Admin privileges required.');
    }

    setUser(data.data.user);
    setToken(data.data.token);
    
    // Save to localStorage
    localStorage.setItem('admin_token', data.data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

export function useRequireAdmin() {
  const { isAdmin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, loading, router]);

  return { isAdmin, loading };
}