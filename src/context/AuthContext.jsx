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
      email: 'admin@financial.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isActive: true,
      permissions: ['all']
    },
    // Sample financial professional
    {
      id: 'fp-1',
      email: 'advisor@financial.com',
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

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAuthData = localStorage.getItem('authData');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedAuthData) {
      const authData = JSON.parse(savedAuthData);
      dispatch({ type: 'LOAD_AUTH_DATA', payload: authData });
    }
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      dispatch({ type: 'LOGIN', payload: user });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const { user, isAuthenticated, isLoading, ...authData } = state;
    localStorage.setItem('authData', JSON.stringify(authData));
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
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