'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { api } from './api';

// Types
interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'professional' | 'reception' | 'patient';
  professionalId?: string;
  isActive: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetch: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current user query
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const token = Cookies.get('auth-token');
      if (!token) return null;

      try {
        const response = await api.auth.me();
        const userData = response.data.data.user;
        
        console.log('🔍 [Auth Context] API Response received:', {
          hasUserData: !!userData,
          userName: userData?.name,
          userRole: userData?.role,
          hasProfileImage: !!userData?.profileImage,
          profileImageLength: userData?.profileImage?.length || 0
        });
        
        return userData;
      } catch (error: any) {
        // If token is invalid, clear it
        if (error.response?.status === 401) {
          Cookies.remove('auth-token');
          Cookies.remove('refresh-token');
        }
        throw error;
      }
    },
    enabled: !!Cookies.get('auth-token'), // Auto-fetch when token exists
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await api.auth.login({ email, password });
      return response.data.data;
    },
    onSuccess: (data) => {
      if (data) {
        // Store tokens
        Cookies.set('auth-token', data.accessToken, { expires: 1 }); // 1 day
        Cookies.set('refresh-token', data.refreshToken, { expires: 7 }); // 7 days
        
        // Store user data in localStorage for role-based redirects
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.accessToken);
        
        // Update query cache
        queryClient.setQueryData(['auth', 'profile'], data.user);
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await api.auth.logout();
      } catch (error) {
        // Ignore logout errors, proceed with local cleanup
        console.warn('Logout API call failed, proceeding with local cleanup');
      }
    },
    onSettled: () => {
      // Always clean up local state
      Cookies.remove('auth-token');
      Cookies.remove('refresh-token');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      queryClient.setQueryData(['auth', 'profile'], null);
      queryClient.clear();
    },
  });

  // Auth context value
  const contextValue: AuthContextType = {
    user: user || null,
    isLoading: isLoading,
    isAuthenticated: !!user,
    login: async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
      // Trigger refetch to get updated user data immediately after login
      await refetch();
    },
    logout: () => {
      logoutMutation.mutate();
    },
    refetch,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to check if user has required role
export function useRequireAuth(requiredRoles?: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return { canAccess: false, isLoading: true };
  }

  if (!isAuthenticated) {
    return { canAccess: false, isLoading: false, redirectTo: '/auth/login' };
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return { canAccess: false, isLoading: false, redirectTo: '/unauthorized' };
  }

  return { canAccess: true, isLoading: false };
}

export default AuthContext;
