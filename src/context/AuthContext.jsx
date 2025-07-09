import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../lib/api';

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
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerkAuth();

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

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signUp,
      logout,
      fetchUsers,
      addUser,
      updateUser,
      deleteUser,
      isAuthenticated,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {  return useContext(AuthContext);
}
