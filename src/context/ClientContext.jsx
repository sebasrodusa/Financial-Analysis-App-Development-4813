import React, { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext';
import supabaseClient from '../lib/supabase';

// Table names
const CLIENTS_TABLE = 'clients';
const ANALYSES_TABLE = 'financial_analyses';

const ClientContext = createContext();

const initialState = {
  clients: [],
  currentClient: null,
  analyses: [],
  currentAnalysis: null,
  isLoading: false,
  error: null,
};

function clientReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client => 
          client.id === action.payload.id ? action.payload : client
        ),
        isLoading: false,
        error: null,
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
        isLoading: false,
        error: null,
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
        isLoading: false,
        error: null,
      };
    case 'UPDATE_ANALYSIS':
      return {
        ...state,
        analyses: state.analyses.map(analysis => 
          analysis.id === action.payload.id ? action.payload : analysis
        ),
        isLoading: false,
        error: null,
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
        isLoading: false,
        error: null,
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

// Convert object keys from camelCase to snake_case
const toSnakeCase = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
      value === '' ? null : value,
    ])
  );

// Convert object keys from snake_case to camelCase
const toCamelCase = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, l) => l.toUpperCase()),
      value,
    ])
  );

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

  // Fetch data from Supabase on mount with error handling
  React.useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // First, check if Supabase client is available
      if (!supabaseClient) {
        console.warn('Supabase client not available. Using localStorage data only.');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      try {
        // Wrap in try-catch to handle any API errors
        const fetchClients = async () => {
          try {
            const { data, error } = await supabaseClient
              .from(CLIENTS_TABLE)
              .select('*');

            if (error) throw error;
            return (data || []).map(toCamelCase);
          } catch (err) {
            console.warn('Error fetching clients:', err);
            return [];
          }
        };
        
        const fetchAnalyses = async () => {
          try {
            const { data, error } = await supabaseClient
              .from(ANALYSES_TABLE)
              .select('*');

            if (error) throw error;
            return (data || []).map(toCamelCase);
          } catch (err) {
            console.warn('Error fetching analyses:', err);
            return [];
          }
        };
        
        // Fetch data in parallel
        const [clients, analyses] = await Promise.all([
          fetchClients(),
          fetchAnalyses()
        ]);
        
        // Transform and load data
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            clients: clients,
            analyses: analyses,
          },
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      }
    };

    fetchData();
  }, []);

  // Save data to localStorage whenever state changes
  React.useEffect(() => {
    safeSetToStorage('financialAnalysisData', {
      clients: state.clients,
      analyses: state.analyses
    });
  }, [state.clients, state.analyses]);

  // Filter data based on user role and permissions
  const getFilteredState = () => {
    if (!user) return { 
      ...state, 
      clients: [], 
      analyses: [] 
    };
    
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

  const addClient = async (clientData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Generate a unique ID if one doesn't exist
      const clientWithId = {
        ...clientData,
        id: clientData.id || `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user?.id,
        createdAt: clientData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If Supabase is available, try to save there first
      if (supabaseClient) {
        try {
          const clientDb = toSnakeCase(clientWithId);
          const { data, error } = await supabaseClient
            .from(CLIENTS_TABLE)
            .insert(clientDb)
            .select()
            .single();
            
          if (error) {
            console.warn('Supabase insert failed, using localStorage:', error);
          } else {
            console.log('Client added to Supabase:', data);
            const clientApp = toCamelCase(data);
            dispatch({ type: 'ADD_CLIENT', payload: clientApp });
            return clientApp;
          }
        } catch (supabaseError) {
          console.warn('Supabase operation failed:', supabaseError);
          // Continue to localStorage fallback
        }
      }
      
      // Fall back to localStorage
      dispatch({ type: 'ADD_CLIENT', payload: clientWithId });
      return clientWithId;
      
    } catch (err) {
      console.error('Error adding client:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add client' });
      throw new Error('Failed to add client. Please try again.');
    }
  };

  const updateClient = async (clientData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const updatedData = {
        ...clientData,
        updatedAt: new Date().toISOString()
      };
      
      // If Supabase is available, try to update there first
      if (supabaseClient) {
        try {
          const updatedDb = toSnakeCase(updatedData);
          const { data, error } = await supabaseClient
            .from(CLIENTS_TABLE)
            .update(updatedDb)
            .eq('id', clientData.id)
            .select()
            .single();
            
          if (error) {
            console.warn('Supabase update failed, using localStorage:', error);
          } else {
            const clientApp = toCamelCase(data);
            dispatch({ type: 'UPDATE_CLIENT', payload: clientApp });
            return clientApp;
          }
        } catch (supabaseError) {
          console.warn('Supabase operation failed:', supabaseError);
          // Continue to localStorage fallback
        }
      }
      
      // Fall back to localStorage
      dispatch({ type: 'UPDATE_CLIENT', payload: updatedData });
      return updatedData;
      
    } catch (err) {
      console.error('Error updating client:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update client' });
      throw new Error('Failed to update client. Please try again.');
    }
  };

  const deleteClient = async (clientId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // If Supabase is available, try to delete there first
      if (supabaseClient) {
        try {
          const { error } = await supabaseClient
            .from(CLIENTS_TABLE)
            .delete()
            .eq('id', clientId);
            
          if (error) {
            console.warn('Supabase delete failed, using localStorage:', error);
          }
        } catch (supabaseError) {
          console.warn('Supabase operation failed:', supabaseError);
          // Continue to localStorage fallback
        }
      }
      
      // Always remove from local state
      dispatch({ type: 'DELETE_CLIENT', payload: clientId });
      
    } catch (err) {
      console.error('Error deleting client:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete client' });
      throw new Error('Failed to delete client. Please try again.');
    }
  };

  const addAnalysis = async (analysisData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const analysisWithId = {
        ...analysisData,
        id: analysisData.id || `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: analysisData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // If Supabase is available, try to save there first
      if (supabaseClient) {
        try {
          const analysisDb = toSnakeCase(analysisWithId);
          const { data, error } = await supabaseClient
            .from(ANALYSES_TABLE)
            .insert(analysisDb)
            .select()
            .single();
            
          if (error) {
            console.warn('Supabase insert failed, using localStorage:', error);
          } else {
            const analysisApp = toCamelCase(data);
            dispatch({ type: 'ADD_ANALYSIS', payload: analysisApp });
            return analysisApp;
          }
        } catch (supabaseError) {
          console.warn('Supabase operation failed:', supabaseError);
          // Continue to localStorage fallback
        }
      }
      
      // Fall back to localStorage
      dispatch({ type: 'ADD_ANALYSIS', payload: analysisWithId });
      return analysisWithId;
      
    } catch (err) {
      console.error('Error adding analysis:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add analysis' });
      throw new Error('Failed to add analysis. Please try again.');
    }
  };

  const updateAnalysis = async (analysisData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const updatedData = {
        ...analysisData,
        updatedAt: new Date().toISOString()
      };
      
      // If Supabase is available, try to update there first
      if (supabaseClient) {
        try {
          const updatedDb = toSnakeCase(updatedData);
          const { data, error } = await supabaseClient
            .from(ANALYSES_TABLE)
            .update(updatedDb)
            .eq('id', analysisData.id)
            .select()
            .single();
            
          if (error) {
            console.warn('Supabase update failed, using localStorage:', error);
          } else {
            const analysisApp = toCamelCase(data);
            dispatch({ type: 'UPDATE_ANALYSIS', payload: analysisApp });
            return analysisApp;
          }
        } catch (supabaseError) {
          console.warn('Supabase operation failed:', supabaseError);
          // Continue to localStorage fallback
        }
      }
      
      // Fall back to localStorage
      dispatch({ type: 'UPDATE_ANALYSIS', payload: updatedData });
      return updatedData;
      
    } catch (err) {
      console.error('Error updating analysis:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update analysis' });
      throw new Error('Failed to update analysis. Please try again.');
    }
  };

  return (
    <ClientContext.Provider value={{
      state: getFilteredState(),
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