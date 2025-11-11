import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  joinDate: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-23051d03`;

// Permission mappings based on roles
const rolePermissions: Record<string, string[]> = {
  admin: [
    'manage_companies',
    'manage_categories', 
    'manage_games',
    'view_reports',
    'manage_users',
    'purchase_games',
    'review_games',
    'view_purchase_history'
  ],
  user: [
    'purchase_games',
    'review_games',
    'view_purchase_history'
  ]
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    permissions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('synthx_token');
      const savedUser = localStorage.getItem('synthx_user');
      
      if (savedToken && savedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const user = data.user;
            const permissions = rolePermissions[user.role] || [];
            
            setAuthState({
              user,
              token: savedToken,
              isAuthenticated: true,
              permissions
            });
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('synthx_token');
            localStorage.removeItem('synthx_user');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('synthx_token');
          localStorage.removeItem('synthx_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Login error:', error);
        console.error('Status:', response.status);
        console.error('%cDica: Execute o wizard de setup se for a primeira vez!', 'color: #9146FF; font-weight: bold;');
        console.error('%cPara resetar: window.resetSetup()', 'color: #9146FF;');
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        const { token, user } = data;
        const permissions = rolePermissions[user.role] || [];
        
        const newAuthState = {
          user,
          token,
          isAuthenticated: true,
          permissions
        };
        
        setAuthState(newAuthState);
        
        // Persist session
        localStorage.setItem('synthx_token', token);
        localStorage.setItem('synthx_user', JSON.stringify(user));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Signup error:', error);
        return false;
      }

      const data = await response.json();
      
      if (data.success) {
        // Auto login after registration
        return await login(email, password);
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: []
    });
    
    // Clear persisted session
    localStorage.removeItem('synthx_token');
    localStorage.removeItem('synthx_user');
  };

  const hasPermission = (permission: string): boolean => {
    return authState.permissions.includes(permission);
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    hasPermission,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
