import React, { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext';

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

export function ClientProvider({ children }) {
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const { user } = useAuth();

  // Load data from localStorage on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('financialAnalysisData');
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
    }
  }, []);

  // Save data to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem('financialAnalysisData', JSON.stringify(state));
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

  return (
    <ClientContext.Provider value={{ 
      state: getFilteredState(), 
      dispatch: enhancedDispatch,
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