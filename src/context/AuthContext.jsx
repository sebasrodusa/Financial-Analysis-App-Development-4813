import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  users: [
    // Default admin user
    {
      id: 'admin-1',
      email: 'sebasrodus+admin@gmail.com',
      password: 'admin1234',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: ['all']
    },
    // Sample financial professional
    {
      id: 'fp-1',
      email: 'advisor@prospertrack.com',
      password: 'advisor123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'financial_professional',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: ['clients', 'analyses', 'reports']
    }
  ]
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'LOAD_AUTH_DATA':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
}

// Safe localStorage operations with error handling
const safeGetFromStorage = (key, fallback = null) => {
  try {
    if (typeof window === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    if (item === null || item === 'undefined') return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error parsing localStorage item "${key}":`, error);
    // Clear corrupted data
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Could not clear corrupted localStorage item:', e);
    }
    return fallback;
  }
};

const safeSetToStorage = (key, value) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving to localStorage "${key}":`, error);
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load data from localStorage on mount with error handling
  useEffect(() => {
    try {
      const savedAuthData = safeGetFromStorage('authData');
      const savedUser = safeGetFromStorage('currentUser');
      
      if (savedAuthData && typeof savedAuthData === 'object') {
        dispatch({ type: 'LOAD_AUTH_DATA', payload: savedAuthData });
      }
      
      if (savedUser && typeof savedUser === 'object') {
        dispatch({ type: 'LOGIN', payload: savedUser });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.warn('Error loading auth data from localStorage:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const { user, isAuthenticated, isLoading, ...authData } = state;
      safeSetToStorage('authData', authData);
      
      if (user && typeof user === 'object') {
        safeSetToStorage('currentUser', user);
      } else {
        try {
          localStorage.removeItem('currentUser');
        } catch (e) {
          console.warn('Could not remove currentUser from localStorage:', e);
        }
      }
    } catch (error) {
      console.warn('Error saving auth data to localStorage:', error);
    }
  }, [state]);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = state.users.find(u => 
        u.email === email && u.password === password && u.isActive
      );
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        dispatch({ type: 'LOGIN', payload: userWithoutPassword });
        return { success: true };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const addUser = (userData) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    return newUser;
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const deleteUser = (userId) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    return state.user.permissions?.includes(permission) || false;
  };

  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const isFinancialProfessional = () => {
    return state.user?.role === 'financial_professional';
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      dispatch,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      hasPermission,
      isAdmin,
      isFinancialProfessional
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}