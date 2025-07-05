// Quest configuration with safe defaults
export const questConfig = {
  GET_STARTED_QUESTID: 'c-greta-get-started',
  USER_ID: 'u-ff23eada-0109-47c6-b532-8c003e043f9d',
  APIKEY: 'k-01e20326-644b-41ae-a703-65bfe60fc6c1',
  TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1LWZmMjNlYWRhLTAxMDktNDdjNi1iNTMyLThjMDAzZTA0M2Y5ZCIsImlhdCI6MTc1MTUwNjQ2MywiZXhwIjoxNzU0MDk4NDYzfQ.AiAYpigfXfG8kdlcUXHZq12iW4_zf5SgYaTbw7eZvH4',
  ENTITYID: 'e-7a4dcfcd-535e-4d47-9fd2-11d2085767dd',
  PRIMARY_COLOR: '#3B82F6'
};

// Safe config getter with validation
export const getQuestConfig = () => {
  try {
    // Validate required fields
    const requiredFields = ['GET_STARTED_QUESTID', 'USER_ID', 'APIKEY', 'ENTITYID'];
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