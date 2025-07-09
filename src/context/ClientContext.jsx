import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useApi from '../lib/api';

const ClientContext = createContext();

const initialState = {
  clients: [],
  analyses: [],
  isLoading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, clients: action.clients, analyses: action.analyses, isLoading: false };
    case 'LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function ClientProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();
  const api = useApi();

  const loadData = async () => {
    dispatch({ type: 'LOADING', payload: true });
    try {
      const [clients, analyses] = await Promise.all([api.getClients(), api.getAnalyses()]);
      dispatch({ type: 'SET_DATA', clients, analyses });
    } catch (err) {
      dispatch({ type: 'LOADING', payload: false });
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const addClient = async (data) => {
    const res = await api.createClient(data);
    await loadData();
    return res;
  };

  const updateClient = async (id, data) => {
    const res = await api.updateClient(id, data);
    await loadData();
    return res;
  };

  const deleteClient = async (id) => {
    await api.deleteClient(id);
    await loadData();
  };

  const addAnalysis = async (data) => {
    const res = await api.createAnalysis(data);
    await loadData();
    return res;
  };

  const updateAnalysis = async (id, data) => {
    const res = await api.updateAnalysis(id, data);
    await loadData();
    return res;
  };

  const deleteAnalysis = async (id) => {
    await api.deleteAnalysis(id);
    await loadData();
  };

  return (
    <ClientContext.Provider value={{ state, addClient, updateClient, deleteClient, addAnalysis, updateAnalysis, deleteAnalysis }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {  return useContext(ClientContext);
}
