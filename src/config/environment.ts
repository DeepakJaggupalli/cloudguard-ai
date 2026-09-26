export const config = {
  // Connect directly to FastAPI backend service
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws',
  environmentName: (import.meta.env.VITE_APP_ENV as 'production' | 'staging' | 'development') || 'production',
  appVersion: '1.4.0-enterprise',
};
