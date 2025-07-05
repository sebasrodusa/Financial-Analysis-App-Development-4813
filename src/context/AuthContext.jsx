import React, { createContext, useContext, useReducer, useEffect } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  needsOnboarding: false,
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
      permissions: ['all'],
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
      permissions: ['clients', 'analyses', 'reports'],
      hasCompletedOnboarding: false
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
        isLoading: false,
        needsOnboarding: !action.payload.hasCompletedOnboarding
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsOnboarding: false
      };
    case 'COMPLETE_ONBOARDING':
      const updatedUser = { ...state.user, hasCompletedOnboarding: true };
      return {
        ...state,
        user: updatedUser,
        needsOnboarding: false,
        users: state.users.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
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

// Generate random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load data from localStorage on mount with error handling
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check Supabase session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Supabase session error:', error);
        }
        
        // Load local auth data
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
        console.warn('Error initializing auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Handle Supabase auth success
          const { data: userData, error } = await supabase
            .from('users_reg_7k9m2x')
            .select('*')
            .eq('supabase_user_id', session.user.id)
            .eq('status', 'approved')
            .single();

          if (userData && !error) {
            const user = {
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              role: userData.role,
              isActive: true,
              hasCompletedOnboarding: true,
              supabaseUserId: userData.supabase_user_id
            };
            dispatch({ type: 'LOGIN', payload: user });
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const { user, isAuthenticated, isLoading, needsOnboarding, ...authData } = state;
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
      // First try local authentication
      const user = state.users.find(u => 
        u.email === email && u.password === password && u.isActive
      );
      
      if (user) {
        // Try to sign in with Supabase (optional)
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
          });
          
          if (error && error.message !== 'Invalid login credentials') {
            console.warn('Supabase auth warning:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase auth error:', supabaseError);
          // Continue with local auth even if Supabase fails
        }
        
        const { password: _, ...userWithoutPassword } = user;
        dispatch({ type: 'LOGIN', payload: userWithoutPassword });
        return { success: true, user: userWithoutPassword };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Invalid email or password. Please try the demo credentials.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signUp = async (userData) => {
    try {
      // Insert user into Supabase
      const { data, error } = await supabase
        .from('users_reg_7k9m2x')
        .insert([{
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          company: userData.company,
          phone: userData.phone,
          bio: userData.bio,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if auto-approve is enabled
      const { data: settings } = await supabase
        .from('admin_settings_7k9m2x')
        .select('auto_approve_registrations')
        .single();

      if (settings?.auto_approve_registrations) {
        // Auto-approve the user
        const { error: updateError } = await supabase
          .from('users_reg_7k9m2x')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', data.id);

        if (!updateError) {
          // Create Supabase auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: generateVerificationCode() // Temporary password
          });

          if (authData.user && !authError) {
            // Link the auth user to our user record
            await supabase
              .from('users_reg_7k9m2x')
              .update({ supabase_user_id: authData.user.id })
              .eq('id', data.id);
          }
        }
      }

      return { success: true, user: data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const sendEmailCode = async (email) => {
    try {
      // Check if user exists and is approved
      const { data: userData, error } = await supabase
        .from('users_reg_7k9m2x')
        .select('*')
        .eq('email', email)
        .eq('status', 'approved')
        .single();

      if (error || !userData) {
        return { success: false, error: 'User not found or not approved.' };
      }

      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code
      const { error: codeError } = await supabase
        .from('email_verification_7k9m2x')
        .insert([{
          email: email,
          code: code,
          expires_at: expiresAt.toISOString()
        }]);

      if (codeError) {
        return { success: false, error: 'Failed to generate verification code.' };
      }

      // In a real app, you would send the email here
      // For demo purposes, we'll log the code
      console.log(`Verification code for ${email}: ${code}`);
      
      // Show the code in an alert for demo purposes
      alert(`Demo: Your verification code is ${code}`);

      return { success: true };
    } catch (error) {
      console.error('Send email code error:', error);
      return { success: false, error: 'Failed to send verification code.' };
    }
  };

  const verifyEmailCode = async (email, code) => {
    try {
      // Verify the code
      const { data: verificationData, error } = await supabase
        .from('email_verification_7k9m2x')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !verificationData) {
        return { success: false, error: 'Invalid or expired verification code.' };
      }

      // Mark code as verified
      await supabase
        .from('email_verification_7k9m2x')
        .update({ verified: true })
        .eq('id', verificationData.id);

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users_reg_7k9m2x')
        .select('*')
        .eq('email', email)
        .eq('status', 'approved')
        .single();

      if (userError || !userData) {
        return { success: false, error: 'User not found or not approved.' };
      }

      // Create user session
      const user = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        isActive: true,
        hasCompletedOnboarding: true,
        supabaseUserId: userData.supabase_user_id
      };

      dispatch({ type: 'LOGIN', payload: user });
      return { success: true, user };
    } catch (error) {
      console.error('Verify email code error:', error);
      return { success: false, error: 'Verification failed. Please try again.' };
    }
  };

  const getAdminSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings_7k9m2x')
        .select('*')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        settings: {
          autoApproveRegistrations: data.auto_approve_registrations
        }
      };
    } catch (error) {
      console.error('Get admin settings error:', error);
      return { success: false, error: 'Failed to load settings.' };
    }
  };

  const updateAdminSettings = async (settings) => {
    try {
      const { error } = await supabase
        .from('admin_settings_7k9m2x')
        .update({
          auto_approve_registrations: settings.autoApproveRegistrations,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('admin_settings_7k9m2x').select('id').single()).data.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Update admin settings error:', error);
      return { success: false, error: 'Failed to update settings.' };
    }
  };

  const getPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_reg_7k9m2x')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, users: data };
    } catch (error) {
      console.error('Get pending users error:', error);
      return { success: false, error: 'Failed to load pending users.' };
    }
  };

  const approveUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users_reg_7k9m2x')
        .update({ 
          status: 'approved', 
          approved_at: new Date().toISOString(),
          approved_by: state.user?.supabaseUserId
        })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Approve user error:', error);
      return { success: false, error: 'Failed to approve user.' };
    }
  };

  const rejectUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('users_reg_7k9m2x')
        .update({ status: 'rejected' })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reject user error:', error);
      return { success: false, error: 'Failed to reject user.' };
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase logout error:', error);
    }
    
    // Clear local auth state
    dispatch({ type: 'LOGOUT' });
    
    // Clear localStorage
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authData');
      localStorage.removeItem('userId');
      localStorage.removeItem('token');
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  };

  const completeOnboarding = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const addUser = (userData) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true,
      hasCompletedOnboarding: false
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
    <AuthContext.Provider
      value={{
        ...state,
        dispatch,
        login,
        signUp,
        sendEmailCode,
        verifyEmailCode,
        getAdminSettings,
        updateAdminSettings,
        getPendingUsers,
        approveUser,
        rejectUser,
        logout,
        completeOnboarding,
        addUser,
        updateUser,
        deleteUser,
        hasPermission,
        isAdmin,
        isFinancialProfessional
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