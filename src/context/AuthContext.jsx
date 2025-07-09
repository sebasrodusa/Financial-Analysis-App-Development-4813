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

  return (
    <AuthContext.Provider value={{ ...state, login, signUp, logout, fetchUsers, addUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {  return useContext(AuthContext);
}
