import React, { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext';
import supabaseClient from '../lib/supabase';

const CLIENTS_TABLE = 'client_pt2024';
const ANALYSES_TABLE = 'analyses_pt2024';

const ClientContext = createContext();

const initialState = {
  clients: [],
  currentClient: null,
  analyses: [],
  currentAnalysis: null,
};

function clientReducer(state, action) {
  switch (action.type) {
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload],
      };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client => 
          client.id === action.payload.id ? action.payload : client
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
      };
    case 'SET_CURRENT_CLIENT':
      return {
        ...state,
        currentClient: action.payload,
      };
    case 'ADD_ANALYSIS':
      return {
        ...state,
        analyses: [...state.analyses, action.payload],
      };
    case 'UPDATE_ANALYSIS':
      return {
        ...state,
        analyses: state.analyses.map(analysis => 
          analysis.id === action.payload.id ? action.payload : analysis
        ),
      };
    case 'SET_CURRENT_ANALYSIS':
      return {
        ...state,
        currentAnalysis: action.payload,
      };
    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

// Safe localStorage operations
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

export function ClientProvider({ children }) {
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const { user } = useAuth();

  // Load data from localStorage on mount with error handling
  React.useEffect(() => {
    const savedData = safeGetFromStorage('financialAnalysisData', initialState);
    if (savedData && typeof savedData === 'object') {
      dispatch({ type: 'LOAD_DATA', payload: savedData });
    }
  }, []);

  // Fetch data from Supabase on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: clients, error: clientsError } = await supabaseClient
          .from(CLIENTS_TABLE)
          .select('*');

        const { data: analyses, error: analysesError } = await supabaseClient
          .from(ANALYSES_TABLE)
          .select('*');

        if (clientsError || analysesError) {
          console.error('Error loading data:', clientsError || analysesError);
          return;
        }

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            clients: clients || [],
            analyses: analyses || []
          }
        });
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };

    fetchData();
  }, []);

  // Save data to localStorage whenever state changes
  React.useEffect(() => {
    safeSetToStorage('financialAnalysisData', state);
  }, [state]);

  // Filter data based on user role and permissions
  const getFilteredState = () => {
    if (!user) return { clients: [], analyses: [] };
    
    // Admins can see all data
    if (user.role === 'admin') {
      return state;
    }
    
    // Financial professionals can only see their own clients and analyses
    const userClients = state.clients.filter(client => 
      client.userId === user.id || !client.userId // Legacy clients without userId
    );
    
    const userClientIds = userClients.map(client => client.id);
    const userAnalyses = state.analyses.filter(analysis => 
      userClientIds.includes(analysis.clientId)
    );
    
    return {
      ...state,
      clients: userClients,
      analyses: userAnalyses
    };
  };

  // Enhanced dispatch to add userId to new clients
  const enhancedDispatch = (action) => {
    if (action.type === 'ADD_CLIENT' && user) {
      action.payload.userId = user.id;
    }
    dispatch(action);
  };

  const addClient = async (clientData) => {
    try {
      const { data, error } = await supabaseClient
        .from(CLIENTS_TABLE)
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;

      enhancedDispatch({ type: 'ADD_CLIENT', payload: data });
      return data;
    } catch (err) {
      console.error('Error adding client:', err);
      throw err;
    }
  };

  const updateClient = async (clientData) => {
    try {
      const { data, error } = await supabaseClient
        .from(CLIENTS_TABLE)
        .update(clientData)
        .eq('id', clientData.id)
        .select()
        .single();

      if (error) throw error;

      enhancedDispatch({ type: 'UPDATE_CLIENT', payload: data });
      return data;
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  };

  const deleteClient = async (clientId) => {
    try {
      const { error } = await supabaseClient
        .from(CLIENTS_TABLE)
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      enhancedDispatch({ type: 'DELETE_CLIENT', payload: clientId });
    } catch (err) {
      console.error('Error deleting client:', err);
      throw err;
    }
  };

  const addAnalysis = async (analysisData) => {
    try {
      const { data, error } = await supabaseClient
        .from(ANALYSES_TABLE)
        .insert(analysisData)
        .select()
        .single();

      if (error) throw error;

      enhancedDispatch({ type: 'ADD_ANALYSIS', payload: data });
      return data;
    } catch (err) {
      console.error('Error adding analysis:', err);
      throw err;
    }
  };

  const updateAnalysis = async (analysisData) => {
    try {
      const { data, error } = await supabaseClient
        .from(ANALYSES_TABLE)
        .update(analysisData)
        .eq('id', analysisData.id)
        .select()
        .single();

      if (error) throw error;

      enhancedDispatch({ type: 'UPDATE_ANALYSIS', payload: data });
      return data;
    } catch (err) {
      console.error('Error updating analysis:', err);
      throw err;
    }
  };

  return (
    <ClientContext.Provider value={{
      state: getFilteredState(),
      dispatch: enhancedDispatch,
      addClient,
      updateClient,
      deleteClient,
      addAnalysis,
      updateAnalysis,
      rawState: state // For admin access to all data
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}