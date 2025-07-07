import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabaseClient from '../lib/supabase';

const ClientContext = createContext();

// Table names
const CLIENTS_TABLE = 'clients_pt2024';
const ANALYSES_TABLE = 'analyses_pt2024';

const initialState = {
  clients: [],
  currentClient: null,
  analyses: [],
  currentAnalysis: null,
  isLoading: false
};

function clientReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_CLIENTS':
      return {
        ...state,
        clients: action.payload,
        isLoading: false
      };
    case 'SET_ANALYSES':
      return {
        ...state,
        analyses: action.payload,
        isLoading: false
      };
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload]
      };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        )
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload)
      };
    case 'SET_CURRENT_CLIENT':
      return {
        ...state,
        currentClient: action.payload
      };
    case 'ADD_ANALYSIS':
      return {
        ...state,
        analyses: [...state.analyses, action.payload]
      };
    case 'UPDATE_ANALYSIS':
      return {
        ...state,
        analyses: state.analyses.map(analysis =>
          analysis.id === action.payload.id ? action.payload : analysis
        )
      };
    case 'SET_CURRENT_ANALYSIS':
      return {
        ...state,
        currentAnalysis: action.payload
      };
    default:
      return state;
  }
}

// Generate UUID for client side (fallback)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Transform client data for Supabase
const transformClientForDB = (client) => {
  return {
    id: client.id || generateUUID(), // Ensure UUID
    user_id: client.userId,
    first_name: client.firstName,
    last_name: client.lastName,
    email: client.email,
    phone: client.phone || null,
    address: client.address || null,
    city: client.city || null,
    state: client.state || null,
    zip_code: client.zipCode || null,
    date_of_birth: client.dateOfBirth || null,
    occupation: client.occupation || null,
    employer: client.employer || null,
    marital_status: client.maritalStatus || 'single',
    spouse_first_name: client.spouseFirstName || null,
    spouse_last_name: client.spouseLastName || null,
    spouse_date_of_birth: client.spouseDateOfBirth || null,
    spouse_occupation: client.spouseOccupation || null,
    spouse_employer: client.spouseEmployer || null,
    spouse_phone: client.spousePhone || null,
    spouse_email: client.spouseEmail || null,
    children: client.children ? JSON.stringify(client.children) : null,
    created_at: client.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Transform client data from Supabase
const transformClientFromDB = (dbClient) => {
  return {
    id: dbClient.id,
    userId: dbClient.user_id,
    firstName: dbClient.first_name,
    lastName: dbClient.last_name,
    email: dbClient.email,
    phone: dbClient.phone,
    address: dbClient.address,
    city: dbClient.city,
    state: dbClient.state,
    zipCode: dbClient.zip_code,
    dateOfBirth: dbClient.date_of_birth,
    occupation: dbClient.occupation,
    employer: dbClient.employer,
    maritalStatus: dbClient.marital_status,
    spouseFirstName: dbClient.spouse_first_name,
    spouseLastName: dbClient.spouse_last_name,
    spouseDateOfBirth: dbClient.spouse_date_of_birth,
    spouseOccupation: dbClient.spouse_occupation,
    spouseEmployer: dbClient.spouse_employer,
    spousePhone: dbClient.spouse_phone,
    spouseEmail: dbClient.spouse_email,
    children: dbClient.children ? JSON.parse(dbClient.children) : [],
    createdAt: dbClient.created_at,
    updatedAt: dbClient.updated_at
  };
};

// Transform analysis data for Supabase
const transformAnalysisForDB = (analysis) => {
  return {
    id: analysis.id || generateUUID(), // Ensure UUID
    client_id: analysis.clientId,
    user_id: analysis.userId,
    income_data: JSON.stringify(analysis.income || {}),
    expenses_data: JSON.stringify(analysis.expenses || {}),
    assets_data: JSON.stringify(analysis.assets || {}),
    liabilities_data: JSON.stringify(analysis.liabilities || {}),
    financial_goals: JSON.stringify(analysis.financialGoals || []),
    life_insurance: JSON.stringify(analysis.lifeInsurance || []),
    net_income: analysis.netIncome || 0,
    net_worth: analysis.netWorth || 0,
    created_at: analysis.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Transform analysis data from Supabase
const transformAnalysisFromDB = (dbAnalysis) => {
  return {
    id: dbAnalysis.id,
    clientId: dbAnalysis.client_id,
    userId: dbAnalysis.user_id,
    income: dbAnalysis.income_data ? JSON.parse(dbAnalysis.income_data) : {},
    expenses: dbAnalysis.expenses_data ? JSON.parse(dbAnalysis.expenses_data) : {},
    assets: dbAnalysis.assets_data ? JSON.parse(dbAnalysis.assets_data) : {},
    liabilities: dbAnalysis.liabilities_data ? JSON.parse(dbAnalysis.liabilities_data) : {},
    financialGoals: dbAnalysis.financial_goals ? JSON.parse(dbAnalysis.financial_goals) : [],
    lifeInsurance: dbAnalysis.life_insurance ? JSON.parse(dbAnalysis.life_insurance) : [],
    netIncome: dbAnalysis.net_income || 0,
    netWorth: dbAnalysis.net_worth || 0,
    createdAt: dbAnalysis.created_at,
    updatedAt: dbAnalysis.updated_at
  };
};

export function ClientProvider({ children }) {
  const [state, dispatch] = useReducer(clientReducer, initialState);
  const { user } = useAuth();

  // Load data from Supabase on mount
  useEffect(() => {
    if (user) {
      loadClientsFromDB();
      loadAnalysesFromDB();
    }
  }, [user]);

  const loadClientsFromDB = async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      console.log('Loading clients from Supabase for user:', user.id);
      
      // Load user's clients or all clients for admin
      let query = supabaseClient.from(CLIENTS_TABLE).select('*');
      
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading clients:', error);
        // Fallback to localStorage if DB fails
        const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
        dispatch({ type: 'SET_CLIENTS', payload: savedClients });
      } else {
        console.log('Loaded clients from DB:', data?.length || 0);
        const clients = data ? data.map(transformClientFromDB) : [];
        dispatch({ type: 'SET_CLIENTS', payload: clients });
        // Also save to localStorage as backup
        localStorage.setItem('clients', JSON.stringify(clients));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      // Fallback to localStorage
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      dispatch({ type: 'SET_CLIENTS', payload: savedClients });
    }
  };

  const loadAnalysesFromDB = async () => {
    if (!user) return;
    
    try {
      console.log('Loading analyses from Supabase for user:', user.id);
      
      let query = supabaseClient.from(ANALYSES_TABLE).select('*');
      
      if (user.role !== 'admin') {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading analyses:', error);
        // Fallback to localStorage
        const savedAnalyses = JSON.parse(localStorage.getItem('analyses') || '[]');
        dispatch({ type: 'SET_ANALYSES', payload: savedAnalyses });
      } else {
        console.log('Loaded analyses from DB:', data?.length || 0);
        const analyses = data ? data.map(transformAnalysisFromDB) : [];
        dispatch({ type: 'SET_ANALYSES', payload: analyses });
        // Also save to localStorage as backup
        localStorage.setItem('analyses', JSON.stringify(analyses));
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
      // Fallback to localStorage
      const savedAnalyses = JSON.parse(localStorage.getItem('analyses') || '[]');
      dispatch({ type: 'SET_ANALYSES', payload: savedAnalyses });
    }
  };

  const saveClientToDB = async (clientData) => {
    try {
      console.log('Saving client to Supabase:', clientData);
      
      const dbClient = transformClientForDB({
        ...clientData,
        userId: user?.id
      });
      
      const { data, error } = await supabaseClient
        .from(CLIENTS_TABLE)
        .insert(dbClient)
        .select()
        .single();
        
      if (error) {
        console.error('Error saving client to DB:', error);
        // Save to localStorage as fallback
        const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
        savedClients.push(clientData);
        localStorage.setItem('clients', JSON.stringify(savedClients));
        return clientData;
      }
      
      console.log('Client saved to DB successfully');
      const transformedClient = transformClientFromDB(data);
      
      // Also save to localStorage
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      savedClients.push(transformedClient);
      localStorage.setItem('clients', JSON.stringify(savedClients));
      
      return transformedClient;
    } catch (error) {
      console.error('Error saving client:', error);
      // Fallback to localStorage
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      savedClients.push(clientData);
      localStorage.setItem('clients', JSON.stringify(savedClients));
      return clientData;
    }
  };

  const updateClientInDB = async (clientData) => {
    try {
      console.log('Updating client in Supabase:', clientData);
      
      const dbClient = transformClientForDB(clientData);
      
      const { data, error } = await supabaseClient
        .from(CLIENTS_TABLE)
        .update(dbClient)
        .eq('id', clientData.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating client in DB:', error);
        return clientData;
      }
      
      console.log('Client updated in DB successfully');
      const transformedClient = transformClientFromDB(data);
      
      // Update localStorage
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      const updatedClients = savedClients.map(c => 
        c.id === clientData.id ? transformedClient : c
      );
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      
      return transformedClient;
    } catch (error) {
      console.error('Error updating client:', error);
      return clientData;
    }
  };

  const deleteClientFromDB = async (clientId) => {
    try {
      console.log('Deleting client from Supabase:', clientId);
      
      const { error } = await supabaseClient
        .from(CLIENTS_TABLE)
        .delete()
        .eq('id', clientId);
        
      if (error) {
        console.error('Error deleting client from DB:', error);
      } else {
        console.log('Client deleted from DB successfully');
      }
      
      // Update localStorage
      const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
      const updatedClients = savedClients.filter(c => c.id !== clientId);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const saveAnalysisToDB = async (analysisData) => {
    try {
      console.log('Saving analysis to Supabase:', analysisData);
      
      const dbAnalysis = transformAnalysisForDB({
        ...analysisData,
        userId: user?.id
      });
      
      const { data, error } = await supabaseClient
        .from(ANALYSES_TABLE)
        .insert(dbAnalysis)
        .select()
        .single();
        
      if (error) {
        console.error('Error saving analysis to DB:', error);
        // Save to localStorage as fallback
        const savedAnalyses = JSON.parse(localStorage.getItem('analyses') || '[]');
        savedAnalyses.push(analysisData);
        localStorage.setItem('analyses', JSON.stringify(savedAnalyses));
        return analysisData;
      }
      
      console.log('Analysis saved to DB successfully');
      const transformedAnalysis = transformAnalysisFromDB(data);
      
      // Also save to localStorage
      const savedAnalyses = JSON.parse(localStorage.getItem('analyses') || '[]');
      savedAnalyses.push(transformedAnalysis);
      localStorage.setItem('analyses', JSON.stringify(savedAnalyses));
      
      return transformedAnalysis;
    } catch (error) {
      console.error('Error saving analysis:', error);
      // Fallback to localStorage
      const savedAnalyses = JSON.parse(localStorage.getItem('analyses') || '[]');
      savedAnalyses.push(analysisData);
      localStorage.setItem('analyses', JSON.stringify(savedAnalyses));
      return analysisData;
    }
  };

  const updateAnalysisInDB = async (analysisData) => {
    try {
      console.log('Updating analysis in Supabase:', analysisData);
      
      const dbAnalysis = transformAnalysisForDB(analysisData);
      
      const { data, error } = await supabaseClient
        .from(ANALYSES_TABLE)
        .update(dbAnalysis)
        .eq('id', analysisData.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating analysis in DB:', error);
        return analysisData;
      }
      
      console.log('Analysis updated in DB successfully');
      const transformedAnalysis = transformAnalysisFromDB(data);
      
      // Update localStorage
      const savedAnalyses = JSON.parse(localStorage.getItem('analyses') || '[]');
      const updatedAnalyses = savedAnalyses.map(a => 
        a.id === analysisData.id ? transformedAnalysis : a
      );
      localStorage.setItem('analyses', JSON.stringify(updatedAnalyses));
      
      return transformedAnalysis;
    } catch (error) {
      console.error('Error updating analysis:', error);
      return analysisData;
    }
  };

  // Enhanced dispatch that handles database operations
  const enhancedDispatch = async (action) => {
    switch (action.type) {
      case 'ADD_CLIENT': {
        const savedClient = await saveClientToDB(action.payload);
        dispatch({ type: 'ADD_CLIENT', payload: savedClient });
        break;
      }
      case 'UPDATE_CLIENT': {
        const updatedClient = await updateClientInDB(action.payload);
        dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
        break;
      }
      case 'DELETE_CLIENT': {
        await deleteClientFromDB(action.payload);
        dispatch({ type: 'DELETE_CLIENT', payload: action.payload });
        break;
      }
      case 'ADD_ANALYSIS': {
        const savedAnalysis = await saveAnalysisToDB(action.payload);
        dispatch({ type: 'ADD_ANALYSIS', payload: savedAnalysis });
        break;
      }
      case 'UPDATE_ANALYSIS': {
        const updatedAnalysis = await updateAnalysisInDB(action.payload);
        dispatch({ type: 'UPDATE_ANALYSIS', payload: updatedAnalysis });
        break;
      }
      default:
        dispatch(action);
    }
  };

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
      userClientIds.includes(analysis.clientId) || analysis.userId === user.id
    );

    return {
      ...state,
      clients: userClients,
      analyses: userAnalyses
    };
  };

  return (
    <ClientContext.Provider value={{
      state: getFilteredState(),
      dispatch: enhancedDispatch,
      rawState: state, // For admin access to all data
      loadClientsFromDB,
      loadAnalysesFromDB
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