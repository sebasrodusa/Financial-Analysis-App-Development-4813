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
      hasCompletedOnboarding: true,
      profilePhoto: null,
      phone: '+1 (555) 123-4567',
      company: 'ProsperTrack Inc.',
      bio: 'System administrator with extensive experience in financial technology platforms.'
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
      hasCompletedOnboarding: true,
      profilePhoto: null,
      phone: '+1 (555) 234-5678',
      company: 'Smith Financial Advisory',
      bio: 'Certified Financial Planner with over 10 years of experience helping clients achieve their financial goals.'
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
      hasCompletedOnboarding: true,
      profilePhoto: null,
      phone: '+1 (555) 345-6789',
      company: 'Doe Wealth Management',
      bio: 'Investment advisor specializing in retirement planning and portfolio management.'
    }
  ],
  passwordResetTokens: [], // Store password reset tokens
  emailVerificationTokens: [] // Store email verification tokens
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
          user.id === action.payload ? { ...user, isActive: !user.isActive } : user
        )
      };
    case 'LOAD_USERS':
      return {
        ...state,
        users: action.payload
      };
    case 'ADD_PASSWORD_RESET_TOKEN':
      return {
        ...state,
        passwordResetTokens: [...state.passwordResetTokens, action.payload]
      };
    case 'USE_PASSWORD_RESET_TOKEN':
      return {
        ...state,
        passwordResetTokens: state.passwordResetTokens.map(token =>
          token.token === action.payload ? { ...token, used: true } : token
        )
      };
    case 'CLEAN_EXPIRED_TOKENS':
      const now = new Date();
      return {
        ...state,
        passwordResetTokens: state.passwordResetTokens.filter(
          token => new Date(token.expiresAt) > now
        ),
        emailVerificationTokens: state.emailVerificationTokens.filter(
          token => new Date(token.expiresAt) > now
        )
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

// Generate random token
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = getFromStorage('currentUser');
    const savedUsers = getFromStorage('allUsers');
    const savedPasswordResetTokens = getFromStorage('passwordResetTokens', []);
    const savedEmailVerificationTokens = getFromStorage('emailVerificationTokens', []);

    if (savedUsers && Array.isArray(savedUsers)) {
      dispatch({ type: 'LOAD_USERS', payload: savedUsers });
    }

    if (savedUser) {
      dispatch({ type: 'LOGIN', payload: savedUser });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    // Clean expired tokens on load
    dispatch({ type: 'CLEAN_EXPIRED_TOKENS' });
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.user) {
      saveToStorage('currentUser', state.user);
    } else {
      localStorage.removeItem('currentUser');
    }
    
    saveToStorage('allUsers', state.users);
    saveToStorage('passwordResetTokens', state.passwordResetTokens);
    saveToStorage('emailVerificationTokens', state.emailVerificationTokens);
  }, [state.user, state.users, state.passwordResetTokens, state.emailVerificationTokens]);

  // Authentication functions
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const user = state.users.find(u => 
        u.email === email && u.password === password && u.isActive
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
      hasCompletedOnboarding: true,
      profilePhoto: null
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    return { success: true, user: newUser };
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    return { success: true };
  };

  // Enhanced update functions for profile management
  const updateUserEmail = async (newEmail, currentPassword) => {
    if (!state.user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify current password
    if (currentPassword !== state.user.password) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Check if email is already taken
    const emailExists = state.users.find(u => 
      u.email === newEmail && u.id !== state.user.id
    );

    if (emailExists) {
      return { success: false, error: 'Email address is already in use' };
    }

    // Update user email
    const updatedUser = {
      ...state.user,
      email: newEmail,
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    return { success: true };
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!state.user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify current password
    if (currentPassword !== state.user.password) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update user password
    const updatedUser = {
      ...state.user,
      password: newPassword,
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    return { success: true };
  };

  // Password reset functionality
  const sendPasswordResetEmail = async (email) => {
    const user = state.users.find(u => u.email === email && u.isActive);
    
    if (!user) {
      return { success: false, error: 'No user found with this email address' };
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const resetToken = {
      id: `reset-${Date.now()}`,
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_PASSWORD_RESET_TOKEN', payload: resetToken });

    // In a real app, you would send an email here
    // For demo purposes, we'll show an alert with the reset link
    const resetLink = `${window.location.origin}/#/reset-password?token=${token}`;
    console.log('Password reset link:', resetLink);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, resetLink };
  };

  const verifyResetToken = async (token) => {
    const resetToken = state.passwordResetTokens.find(t => 
      t.token === token && !t.used && new Date(t.expiresAt) > new Date()
    );

    if (!resetToken) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    return { success: true, userId: resetToken.userId };
  };

  const resetPassword = async (token, newPassword) => {
    const resetToken = state.passwordResetTokens.find(t => 
      t.token === token && !t.used && new Date(t.expiresAt) > new Date()
    );

    if (!resetToken) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    const user = state.users.find(u => u.id === resetToken.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Update user password
    const updatedUser = {
      ...user,
      password: newPassword,
      updatedAt: new Date().toISOString()
    };

    dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    dispatch({ type: 'USE_PASSWORD_RESET_TOKEN', payload: token });

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
      hasCompletedOnboarding: true,
      profilePhoto: null
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    return { success: true, user: newUser };
  };

  const completeOnboarding = () => {
    if (state.user) {
      const updatedUser = {
        ...state.user,
        hasCompletedOnboarding: true
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      addUser,
      updateUser,
      updateUserEmail,
      updateUserPassword,
      sendPasswordResetEmail,
      verifyResetToken,
      resetPassword,
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