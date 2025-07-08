import React, { createContext, useContext, useReducer, useEffect } from 'react';
import supabaseClient from '../lib/supabase';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();

// Define table name
const USERS_TABLE = 'users_pt2024';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  users: [],
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
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload
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
    case 'CLEAN_EXPIRED_TOKENS': {
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
    }
    default:
      return state;
  }
}

// Safe localStorage operations
const getFromStorage = (key, fallback = null) => {
  try {
    if (typeof window === 'undefined') return fallback;
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading from localStorage: ${key}`, error);
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    if (typeof window === 'undefined') return;
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
      return;
    }
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

// Hash password using bcryptjs
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password with hashed password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Transform Supabase user to app user
const transformSupabaseUser = (dbUser) => {
  if (!dbUser) return null;
  
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    role: dbUser.role || 'financial_professional',
    isActive: dbUser.is_active,
    hasCompletedOnboarding: dbUser.has_completed_onboarding,
    profilePhoto: dbUser.profile_photo,
    company: dbUser.company,
    phone: dbUser.phone,
    bio: dbUser.bio,
    createdAt: dbUser.created_at
  };
};

// Transform app user to Supabase user format
const transformAppUser = (appUser, includePassword = false) => {
  const dbUser = {
    email: appUser.email,
    first_name: appUser.firstName,
    last_name: appUser.lastName,
    role: appUser.role || 'financial_professional',
    is_active: appUser.isActive !== undefined ? appUser.isActive : true,
    has_completed_onboarding: appUser.hasCompletedOnboarding !== undefined ? appUser.hasCompletedOnboarding : false,
    profile_photo: appUser.profilePhoto,
    company: appUser.company,
    phone: appUser.phone,
    bio: appUser.bio,
    updated_at: new Date().toISOString()
  };

  if (includePassword && appUser.password) {
    dbUser.password_hash = appUser.password; // Will be hashed before insertion
  }

  return dbUser;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        console.log('Loading users from Supabase...');
        
        // Load users from Supabase
        const { data: users, error } = await supabaseClient
          .from(USERS_TABLE)
          .select('*');
          
        if (error) {
          console.error('Error loading users:', error);
        } else if (users) {
          console.log('Loaded users:', users.length);
          // Transform users to app format
          const appUsers = users.map(transformSupabaseUser);
          dispatch({ type: 'SET_USERS', payload: appUsers });
        }
        
        // Check for current user in localStorage
        const savedUser = getFromStorage('currentUser');
        if (savedUser) {
          // Verify user still exists in DB
          const userExists = users?.find(u => u.id === savedUser.id);
          if (userExists) {
            const appUser = transformSupabaseUser(userExists);
            dispatch({ type: 'LOGIN', payload: appUser });
            console.log('Restored user session:', appUser.email);
          } else {
            // User no longer exists in DB, log them out
            dispatch({ type: 'LOGOUT' });
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Error during initial data load:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      
      // Clean expired tokens
      dispatch({ type: 'CLEAN_EXPIRED_TOKENS' });
    };

    loadInitialData();
  }, []);

  // Save tokens whenever they change
  useEffect(() => {
    saveToStorage('passwordResetTokens', state.passwordResetTokens);
    saveToStorage('emailVerificationTokens', state.emailVerificationTokens);
  }, [state.passwordResetTokens, state.emailVerificationTokens]);

  // Save current user to localStorage
  useEffect(() => {
    if (state.user) {
      saveToStorage('currentUser', state.user);
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [state.user]);

  // Authentication functions
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      console.log('Attempting login for:', email);

      if (!supabaseClient) {
        console.error('Supabase client not initialized');
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Server configuration error' };
      }

      // Find user in Supabase
      const { data: users, error } = await supabaseClient
        .rpc('get_user_for_login', { p_email: email });

      if (error) {
        console.error('Login error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Database error. Please try again.' };
      }

      if (!users || users.length === 0) {
        console.log('No user found with email:', email);
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, error: 'Invalid email or password' };
      }
      
      const user = users[0];
      console.log('Found user:', user.email);
      
      // For demo accounts, check hardcoded passwords first
      if (email === 'sebasrodus+admin@gmail.com' && password === 'admin1234') {
        const appUser = transformSupabaseUser(user);
        dispatch({ type: 'LOGIN', payload: appUser });
        dispatch({ type: 'SET_LOADING', payload: false });
        console.log('Admin login successful');
        return { success: true, user: appUser };
      }
      
      if (email === 'advisor@prospertrack.com' && password === 'advisor123') {
        const appUser = transformSupabaseUser(user);
        dispatch({ type: 'LOGIN', payload: appUser });
        dispatch({ type: 'SET_LOADING', payload: false });
        console.log('Advisor login successful');
        return { success: true, user: appUser };
      }
      
      // Regular password check
      const passwordMatches = await comparePassword(password, user.password_hash);
      console.log('Password matches:', passwordMatches);
      
      if (passwordMatches) {
        const appUser = transformSupabaseUser(user);
        dispatch({ type: 'LOGIN', payload: appUser });
        dispatch({ type: 'SET_LOADING', payload: false });
        console.log('Login successful for:', appUser.email);
        return { success: true, user: appUser };
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
    console.log('Logging out user');
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('currentUser');
  };

  const addUser = async (userData) => {
    try {
      console.log('Adding new user:', userData.email);
      
      // Hash password
      const passwordHash = await hashPassword(userData.password || 'temp123');
      
      // Transform to DB format
      const dbUser = transformAppUser(userData);
      dbUser.password_hash = passwordHash;
      
      // Insert into Supabase
      const { data, error } = await supabaseClient
        .from(USERS_TABLE)
        .insert(dbUser)
        .select()
        .single();
        
      if (error) {
        console.error('Error adding user:', error);
        return { success: false, error: error.message };
      }
      
      console.log('User added successfully:', data);
      
      // Transform back to app format
      const newUser = transformSupabaseUser(data);
      
      // Add to state
      dispatch({ type: 'ADD_USER', payload: newUser });
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: 'Failed to add user' };
    }
  };

  const updateUser = async (userData) => {
    try {
      console.log('Updating user:', userData.id);
      
      // Transform to DB format (without password)
      const dbUser = transformAppUser(userData);
      
      // Update in Supabase
      const { error } = await supabaseClient
        .from(USERS_TABLE)
        .update(dbUser)
        .eq('id', userData.id);
        
      if (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }
      
      // Get updated user from Supabase
      const { data: updatedData, error: fetchError } = await supabaseClient
        .from(USERS_TABLE)
        .select('*')
        .eq('id', userData.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
        return { success: false, error: fetchError.message };
      }
      
      console.log('User updated successfully');
      
      // Transform back to app format
      const updatedUser = transformSupabaseUser(updatedData);
      
      // Update in state
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const updateUserEmail = async (newEmail, currentPassword) => {
    if (!state.user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log('Updating email for user:', state.user.id);
      
      // Get current user from DB to check password
      const { data: userData, error: fetchError } = await supabaseClient
        .from(USERS_TABLE)
        .select('*')
        .eq('id', state.user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        return { success: false, error: fetchError.message };
      }
      
      // Special case for demo accounts
      let passwordValid = false;
      
      if (userData.email === 'sebasrodus+admin@gmail.com' && currentPassword === 'admin1234') {
        passwordValid = true;
      } else if (userData.email === 'advisor@prospertrack.com' && currentPassword === 'advisor123') {
        passwordValid = true;
      } else {
        // Verify password
        passwordValid = await comparePassword(currentPassword, userData.password_hash);
      }
      
      if (!passwordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }
      
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabaseClient
        .from(USERS_TABLE)
        .select('id')
        .eq('email', newEmail);
        
      if (checkError) {
        console.error('Error checking email:', checkError);
        return { success: false, error: checkError.message };
      }
      
      if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Email address is already in use' };
      }
      
      // Update email
      const { error: updateError } = await supabaseClient
        .from(USERS_TABLE)
        .update({ email: newEmail, updated_at: new Date().toISOString() })
        .eq('id', state.user.id);
        
      if (updateError) {
        console.error('Error updating email:', updateError);
        return { success: false, error: updateError.message };
      }
      
      console.log('Email updated successfully');
      
      // Update user in state
      const updatedUser = { ...state.user, email: newEmail };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating email:', error);
      return { success: false, error: 'Failed to update email' };
    }
  };

  const updateUserPassword = async (currentPassword, newPassword) => {
    if (!state.user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log('Updating password for user:', state.user.id);
      
      // Get current user from DB
      const { data: userData, error: fetchError } = await supabaseClient
        .from(USERS_TABLE)
        .select('*')
        .eq('id', state.user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        return { success: false, error: fetchError.message };
      }
      
      // Special case for demo accounts
      let passwordValid = false;
      
      if (userData.email === 'sebasrodus+admin@gmail.com' && currentPassword === 'admin1234') {
        passwordValid = true;
      } else if (userData.email === 'advisor@prospertrack.com' && currentPassword === 'advisor123') {
        passwordValid = true;
      } else {
        // Verify current password
        passwordValid = await comparePassword(currentPassword, userData.password_hash);
      }
      
      if (!passwordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }
      
      // Hash new password
      const passwordHash = await hashPassword(newPassword);
      
      // Update password
      const { error: updateError } = await supabaseClient
        .from(USERS_TABLE)
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);
        
      if (updateError) {
        console.error('Error updating password:', updateError);
        return { success: false, error: updateError.message };
      }
      
      console.log('Password updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: 'Failed to update password' };
    }
  };

  const sendPasswordResetEmail = async (email) => {
    try {
      console.log('Sending password reset email to:', email);
      
      // Check if user exists
      const { data: users, error } = await supabaseClient
        .from(USERS_TABLE)
        .select('id, is_active')
        .eq('email', email);
        
      if (error) {
        console.error('Error checking user:', error);
        return { success: false, error: error.message };
      }
      
      if (!users || users.length === 0 || !users[0].is_active) {
        return { success: false, error: 'No active user found with this email address' };
      }
      
      const userId = users[0].id;
      
      // Generate reset token
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      const resetToken = {
        id: `reset-${Date.now()}`,
        userId,
        token,
        expiresAt: expiresAt.toISOString(),
        used: false,
        createdAt: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_PASSWORD_RESET_TOKEN', payload: resetToken });
      
      // In a real app, you would send an email here
      // For demo purposes, show link in an alert
      const resetLink = `${window.location.origin}/#/reset-password?token=${token}`;
      console.log('Password reset link:', resetLink);
      alert(`Password Reset Link (since we don't have real email): ${resetLink}`);
      
      return { success: true, resetLink };
    } catch (error) {
      console.error('Error sending reset email:', error);
      return { success: false, error: 'Failed to send password reset' };
    }
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
    try {
      console.log('Resetting password with token');
      
      const resetToken = state.passwordResetTokens.find(t => 
        t.token === token && !t.used && new Date(t.expiresAt) > new Date()
      );
      
      if (!resetToken) {
        return { success: false, error: 'Invalid or expired reset token' };
      }
      
      // Hash new password
      const passwordHash = await hashPassword(newPassword);
      
      // Update password in DB
      const { error } = await supabaseClient
        .from(USERS_TABLE)
        .update({ 
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', resetToken.userId);
        
      if (error) {
        console.error('Error resetting password:', error);
        return { success: false, error: error.message };
      }
      
      // Mark token as used
      dispatch({ type: 'USE_PASSWORD_RESET_TOKEN', payload: token });
      
      console.log('Password reset successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  };

  const deleteUser = async (userId) => {
    try {
      console.log('Deleting user:', userId);
      
      // Check if user is admin
      const { data: userData, error: fetchError } = await supabaseClient
        .from(USERS_TABLE)
        .select('role')
        .eq('id', userId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        return { success: false, error: fetchError.message };
      }
      
      if (userData.role === 'admin') {
        return { success: false, error: 'Cannot delete admin users' };
      }
      
      // Delete user from Supabase
      const { error } = await supabaseClient
        .from(USERS_TABLE)
        .delete()
        .eq('id', userId);
        
      if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
      }
      
      console.log('User deleted successfully');
      
      // Update state
      dispatch({ type: 'DELETE_USER', payload: userId });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      console.log('Toggling user status:', userId);
      
      // Get current status
      const { data: userData, error: fetchError } = await supabaseClient
        .from(USERS_TABLE)
        .select('is_active')
        .eq('id', userId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        return { success: false, error: fetchError.message };
      }
      
      const newStatus = !userData.is_active;
      
      // Update status
      const { error } = await supabaseClient
        .from(USERS_TABLE)
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user status:', error);
        return { success: false, error: error.message };
      }
      
      // Update user in state
      const { data: updatedData, error: refreshError } = await supabaseClient
        .from(USERS_TABLE)
        .select('*')
        .eq('id', userId)
        .single();
        
      if (refreshError) {
        console.error('Error refreshing user data:', refreshError);
      } else {
        const updatedUser = transformSupabaseUser(updatedData);
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      }
      
      console.log('User status updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Error toggling user status:', error);
      return { success: false, error: 'Failed to update user status' };
    }
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
    try {
      // In a real app, you would fetch pending users from a separate table
      return { success: true, users: [] };
    } catch (error) {
      console.error('Error getting pending users:', error);
      return { success: false, error: 'Failed to get pending users' };
    }
  };

  const approveUser = async (userId) => {
    // In a real app, you would update the user's status
    return { success: true };
  };

  const rejectUser = async (userId) => {
    // In a real app, you would delete the pending user
    return { success: true };
  };

  // Email-based login (simplified)
  const sendEmailCode = async (email) => {
    try {
      console.log('Sending email code to:', email);
      
      // Check if user exists
      const { data: users, error } = await supabaseClient
        .from(USERS_TABLE)
        .select('id, is_active')
        .eq('email', email);
        
      if (error) {
        console.error('Error checking user:', error);
        return { success: false, error: error.message };
      }
      
      if (!users || users.length === 0 || !users[0].is_active) {
        return { success: false, error: 'No active user found with this email address' };
      }
      
      // Generate a simple code for demo
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code temporarily
      saveToStorage(`emailCode_${email}`, {
        code,
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
      });
      
      // Show code in alert for demo
      alert(`Demo: Your verification code is ${code}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email code:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  };

  const verifyEmailCode = async (email, code) => {
    try {
      console.log('Verifying email code for:', email);
      
      const storedData = getFromStorage(`emailCode_${email}`);
      
      if (!storedData || storedData.expires < Date.now()) {
        return { success: false, error: 'Code expired or not found' };
      }
      
      if (storedData.code !== code) {
        return { success: false, error: 'Invalid code' };
      }
      
      // Find user
      const { data: users, error } = await supabaseClient
        .from(USERS_TABLE)
        .select('*')
        .eq('email', email)
        .eq('is_active', true);
        
      if (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: error.message };
      }
      
      if (!users || users.length === 0) {
        return { success: false, error: 'User not found' };
      }
      
      // Log in user
      const appUser = transformSupabaseUser(users[0]);
      dispatch({ type: 'LOGIN', payload: appUser });
      
      // Clean up
      localStorage.removeItem(`emailCode_${email}`);
      
      console.log('Email code verified and user logged in');
      
      return { success: true, user: appUser };
    } catch (error) {
      console.error('Error verifying email code:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  };

  // Sign up function
  const signUp = async (userData) => {
    try {
      console.log('Signing up new user:', userData.email);

      if (!supabaseClient) {
        console.error('Supabase client not initialized');
        return { success: false, error: 'Server configuration error' };
      }

      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabaseClient
        .from(USERS_TABLE)
        .select('id')
        .eq('email', userData.email);
        
      if (checkError) {
        console.error('Error checking email:', checkError);
        return { success: false, error: checkError.message };
      }
      
      if (existingUsers && existingUsers.length > 0) {
        return { success: false, error: 'Email already registered' };
      }
      
      // Set a default password
      const defaultPassword = 'temp123';
      const passwordHash = await hashPassword(defaultPassword);
      
      // Insert via RPC to comply with RLS
      const { data: newUser, error } = await supabaseClient.rpc(
        'create_user_account',
        {
          p_email: userData.email,
          p_password_hash: passwordHash,
          p_first_name: userData.firstName,
          p_last_name: userData.lastName,
          p_role: userData.role || 'financial_professional',
          p_company: userData.company || '',
          p_phone: userData.phone || '',
          p_bio: userData.bio || ''
        }
      );
        
      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }
      
      console.log('User signed up successfully:', newUser);
      
      // Transform to app format
      const appUser = transformSupabaseUser(newUser);
      
      // Add to state
      dispatch({ type: 'ADD_USER', payload: appUser });
      
      return { success: true, user: appUser };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: 'Failed to create account' };
    }
  };

  const completeOnboarding = async () => {
    if (!state.user) return;
    
    try {
      console.log('Completing onboarding for user:', state.user.id);
      
      // Update onboarding status in DB
      const { error } = await supabaseClient
        .from(USERS_TABLE)
        .update({ 
          has_completed_onboarding: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);
        
      if (error) {
        console.error('Error completing onboarding:', error);
        return;
      }
      
      // Update user in state
      const updatedUser = { ...state.user, hasCompletedOnboarding: true };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Error completing onboarding:', error);
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