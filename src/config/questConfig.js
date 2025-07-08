// Quest configuration with safe defaults
export const questConfig = {
  QUEST_ONBOARDING_QUESTID: import.meta.env.VITE_QUEST_ONBOARDING_QUESTID,
  GET_STARTED_QUESTID: import.meta.env.VITE_GET_STARTED_QUESTID,
  USER_ID: import.meta.env.VITE_QUEST_USER_ID,
  APIKEY: import.meta.env.VITE_QUEST_APIKEY,
  TOKEN: import.meta.env.VITE_QUEST_TOKEN,
  ENTITYID: import.meta.env.VITE_QUEST_ENTITYID,
  PRIMARY_COLOR: '#3B82F6'
};

// Safe config getter with validation
export const getQuestConfig = () => {
  try {
    // Check if running in browser
    if (typeof window === 'undefined') {
      console.warn('Quest config: Not in browser environment');
      return null;
    }

    // Validate required fields
    const requiredFields = ['QUEST_ONBOARDING_QUESTID', 'USER_ID', 'APIKEY', 'ENTITYID'];
    const missingFields = requiredFields.filter(field => !questConfig[field]);
    
    if (missingFields.length > 0) {
      console.warn('Missing Quest config fields:', missingFields);
      return null;
    }

    return questConfig;
  } catch (error) {
    console.warn('Error validating Quest config:', error);
    return null;
  }
};

// Export individual config values safely
export const getConfig = (key, fallback = null) => {
  try {
    return questConfig[key] || fallback;
  } catch (error) {
    console.warn(`Error getting config key ${key}:`, error);
    return fallback;
  }
};