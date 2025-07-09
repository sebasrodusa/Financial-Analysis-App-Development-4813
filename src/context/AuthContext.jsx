import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import useApi from '../lib/api'; // Keep useApi for abstraction

const AuthContext = createContext();

const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,
  isLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, isLoading: false };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const api = useApi(); // From codex branch

  const { isLoaded, isSignedIn, user } = useUser(); // From main
  const { signOut } = useClerkAuth(); // From main

  // You can combine logic here using Clerk and custom API
  // More logic will go here, depending on what functions you define in context
  useEffect(() => {
    if (!isLoaded) {
      dispatch({ type: 'LOADING', payload: true });
      return;
    }

    if (isSignedIn && user) {
      const mappedUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress || '',
        role: user.publicMetadata?.role || 'financial_professional',
      };
      dispatch({ type: 'SET_USER', payload: mappedUser });
    } else {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, [isLoaded, isSignedIn, user]);

  const login = async (email, password) => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const data = await api.login(email, password);
      dispatch({ type: 'SET_USER', payload: data.user });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOADING', payload: false });
      return { success: false, error: err.message };
    }
  };

  const signUp = async (info) => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const data = await api.signup(info);
      dispatch({ type: 'SET_USER', payload: data.user });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOADING', payload: false });
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await signOut();
    dispatch({ type: 'SET_USER', payload: null });
  };

  const isAuthenticated = () => state.isAuthenticated;
  const isAdmin = () => state.user?.role === 'admin' || state.user?.publicMetadata?.role === 'admin';

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      dispatch({ type: 'SET_USERS', payload: data });
    } catch (err) {
      console.error(err);
    }
  };

  const addUser = async (user) => {
    const data = await api.createUser(user);
    await fetchUsers();
    return data;
  };

  const updateUser = async (id, user) => {
    const data = await api.updateUser(id, user);
    await fetchUsers();
    return data;
  };

  const deleteUser = async (id) => {
    await api.deleteUser(id);
    await fetchUsers();
  };


  const needsOnboarding = state.user ? !state.user.hasCompletedOnboarding : false;

  const completeOnboarding = async () => {
    if (!state.user) return;
    try {
      const data = await api.updateUser(state.user.id, { hasCompletedOnboarding: true });
      dispatch({ type: 'SET_USER', payload: { ...state.user, ...data, hasCompletedOnboarding: true } });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const user = state.users.find(u => u.id === id);
      const data = await api.updateUser(id, { isActive: !user.isActive });
      await fetchUsers();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const sendEmailCode = async (email) => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      await api.sendEmailCode(email);
      dispatch({ type: 'LOADING', payload: false });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOADING', payload: false });
      return { success: false, error: err.message };
    }
  };

  const verifyEmailCode = async (email, code) => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const data = await api.verifyEmailCode(email, code);
      if (data.user) dispatch({ type: 'SET_USER', payload: data.user });
      return { success: true };
    } catch (err) {
      dispatch({ type: 'LOADING', payload: false });
      return { success: false, error: err.message };
    }
  };

return (
  <AuthContext.Provider
    value={{
      ...state,
      login,
      signUp,
      logout,
      fetchUsers,
      addUser,
      updateUser,
      deleteUser,
      isAuthenticated,      // from main
      isAdmin,              // from both
      needsOnboarding,      // from codex branch
      completeOnboarding,   // from codex branch
      toggleUserStatus,     // from codex branch
      sendEmailCode,        // from codex branch
      verifyEmailCode,      // from codex branch
    }}
  >
    {children}
  </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
