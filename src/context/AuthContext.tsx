import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '@/types/dashboard';
import { login as apiLogin, LoginResponse } from '@/lib/api';

type Role = 'customer' | 'driver' | 'worker' | 'admin';

interface AuthContextType {
  user: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = '';

const getEffectiveRole = (email: string | null | undefined, backendRole?: string | null): Role => {
  // Temporary Development Override: treat admin@gmail.com as an admin regardless of backend role.
  if (email?.trim().toLowerCase() === 'admin@gmail.com') return 'admin';
  return (backendRole as Role) ?? 'customer';
};

const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('moveline_token')}`,
  'Content-Type': 'application/json',
});

// Fetch user by ID from /api/users/ list
async function fetchUserById(userId: number): Promise<Customer | null> {
  const response = await fetch(`${BASE_URL}/api/users/`, { headers: getHeaders() });
  if (!response.ok) return null;

  const data = await response.json();
  const users: Customer[] = Array.isArray(data) ? data : (data.results ?? []);
  return users.find(u => Number(u.id) === userId) ?? null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount using stored user ID
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('moveline_token');
      const storedId = localStorage.getItem('moveline_user_id');
      if (!token || !storedId) { setIsLoading(false); return; }

      try {
        const found = await fetchUserById(Number(storedId));
        if (found) {
          const resolvedRole = getEffectiveRole(found.email, found.role);
          setUser({ ...found, role: resolvedRole });
        } else {
          // Token may be stale — clear session
          localStorage.removeItem('moveline_token');
          localStorage.removeItem('moveline_refresh_token');
          localStorage.removeItem('moveline_user_id');
        }
      } catch {
        // Network error — keep token, user stays null (soft fail)
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string): Promise<Role> => {
    setIsLoading(true);
    try {
      const loginData: LoginResponse = await apiLogin(email, password);
      // Store user ID for session restore
      localStorage.setItem('moveline_user_id', String(loginData.user.id));

      // Fetch full user profile to get all fields including role
      const fullUser = await fetchUserById(loginData.user.id);
      const resolvedRole = getEffectiveRole(email, fullUser?.role ?? loginData.user.role);
      // Fallback: build minimal user from login response if fetch fails
      const resolvedUser: Customer = fullUser ?? {
        id: loginData.user.id,
        fullName: email,
        email,
        phone: '',
        role: resolvedRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser({ ...resolvedUser, role: resolvedRole, email: resolvedUser.email ?? email });
      return resolvedRole;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('moveline_token');
    localStorage.removeItem('moveline_refresh_token');
    localStorage.removeItem('moveline_user_id');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<Customer>) => {
    if (!user) return;
    // Optimistic update — patch on server not implemented here yet
    setUser({ ...user, ...updates, updatedAt: new Date().toISOString() });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Role → dashboard route mapping — single source of truth
export const ROLE_DASHBOARD: Record<string, string> = {
  admin: '/admin',
  customer: '/dashboard',
  driver: '/driver',
  worker: '/worker',
};
