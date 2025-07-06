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
      hasCompletedOnboarding: true
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
      hasCompletedOnboarding: true
    },
    // Additional demo users
    {
      id: 'fp-2',
      email: 'jane.doe@prospertrack.com',
      password: 'demo123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'financial_professional',
      createdAt: new Date().toISOString(),
      isActive: true,
      hasCompletedOnboarding: true
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
        ),
        user: state.user?.id === action.payload.id ? action.payload : state.user
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    case 'TOGGLE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload
            ? { ...user, isActive: !user.isActive }
            : user
        )
      };
    case 'LOAD_USERS':
      return {
        ...state,
        users: action.payload
      };
    default:
      return state;
  }
}

// Safe localStorage operations
const getFromStorage = (key, fallback = null) => {
  try {
    if (typeof window === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error reading from localStorage: ${key}`, error);
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving to localStorage: ${key}`, error);
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = getFromStorage('currentUser');
    const savedUsers = getFromStorage('allUsers');

    if (savedUsers && Array.isArray(savedUsers)) {
      dispatch({ type: 'LOAD_USERS', payload: savedUsers });
    }

    if (savedUser) {
      dispatch({ type: 'LOGIN', payload: savedUser });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.user) {
      saveToStorage('currentUser', state.user);
    } else {
      localStorage.removeItem('currentUser');
    }
    
    saveToStorage('allUsers', state.users);
  }, [state.user, state.users]);

  // Authentication functions
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const user = state.users.find(u => 
        u.email === email && 
        u.password === password && 
        u.isActive
      );

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        dispatch({ type: 'LOGIN', payload: userWithoutPassword });
        return { success: true, user: userWithoutPassword };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('currentUser');
  };

  const addUser = (userData) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true,
      hasCompletedOnboarding: true
    };
    
    dispatch({ type: 'ADD_USER', payload: newUser });
    return { success: true, user: newUser };
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    return { success: true };
  };

  const deleteUser = (userId) => {
    // Prevent deletion of admin users
    const user = state.users.find(u => u.id === userId);
    if (user?.role === 'admin') {
      return { success: false, error: 'Cannot delete admin users' };
    }
    
    dispatch({ type: 'DELETE_USER', payload: userId });
    return { success: true };
  };

  const toggleUserStatus = (userId) => {
    dispatch({ type: 'TOGGLE_USER_STATUS', payload: userId });
  };

  // Role checking functions
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const isFinancialProfessional = () => {
    return state.user?.role === 'financial_professional';
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    
    // Define permissions for financial professionals
    const fpPermissions = ['clients', 'analyses', 'reports', 'calculators'];
    return fpPermissions.includes(permission);
  };

  // Admin-specific functions
  const getAdminSettings = async () => {
    return {
      success: true,
      settings: {
        autoApproveRegistrations: false
      }
    };
  };

  const updateAdminSettings = async (settings) => {
    // In a real app, this would save to a database
    return { success: true };
  };

  const getPendingUsers = async () => {
    return {
      success: true,
      users: [] // No pending users in this simplified system
    };
  };

  const approveUser = async (userId) => {
    return { success: true };
  };

  const rejectUser = async (userId) => {
    return { success: true };
  };

  // Email-based login (simplified)
  const sendEmailCode = async (email) => {
    const user = state.users.find(u => u.email === email && u.isActive);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Generate a simple code for demo
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code temporarily (in production, this would be in a database)
    saveToStorage(`emailCode_${email}`, {
      code,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Show code in alert for demo
    alert(`Demo: Your verification code is ${code}`);
    return { success: true };
  };

  const verifyEmailCode = async (email, code) => {
    const storedData = getFromStorage(`emailCode_${email}`);
    
    if (!storedData || storedData.expires < Date.now()) {
      return { success: false, error: 'Code expired or not found' };
    }

    if (storedData.code !== code) {
      return { success: false, error: 'Invalid code' };
    }

    // Find and login user
    const user = state.users.find(u => u.email === email && u.isActive);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      dispatch({ type: 'LOGIN', payload: userWithoutPassword });
      localStorage.removeItem(`emailCode_${email}`);
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'User not found' };
  };

  // Sign up function
  const signUp = async (userData) => {
    // Check if email already exists
    const existingUser = state.users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'financial_professional',
      company: userData.company || '',
      phone: userData.phone || '',
      bio: userData.bio || '',
      password: 'temp123', // Temporary password
      createdAt: new Date().toISOString(),
      isActive: true,
      hasCompletedOnboarding: true
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    return { success: true, user: newUser };
  };

  const completeOnboarding = () => {
    if (state.user) {
      const updatedUser = { ...state.user, hasCompletedOnboarding: true };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        isAdmin,
        isFinancialProfessional,
        hasPermission,
        getAdminSettings,
        updateAdminSettings,
        getPendingUsers,
        approveUser,
        rejectUser,
        sendEmailCode,
        verifyEmailCode,
        signUp,
        completeOnboarding
      }}
    >
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