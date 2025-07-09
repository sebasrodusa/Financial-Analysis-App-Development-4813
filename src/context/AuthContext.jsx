import React, { createContext, useContext, useReducer, useEffect } from 'react';
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

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) dispatch({ type: 'SET_USER', payload: JSON.parse(saved) });
  }, []);

  useEffect(() => {
    if (state.user) localStorage.setItem('currentUser', JSON.stringify(state.user));
    else localStorage.removeItem('currentUser');
  }, [state.user]);

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

  const logout = () => dispatch({ type: 'SET_USER', payload: null });

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

  const isAdmin = () => state.user?.role === 'admin';

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
        isAdmin,
        needsOnboarding,
        completeOnboarding,
        toggleUserStatus,
        sendEmailCode,
        verifyEmailCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {  return useContext(AuthContext);
}
