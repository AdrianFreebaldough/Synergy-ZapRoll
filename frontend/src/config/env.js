export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Synergy ZapRoll',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  authStorageKey: import.meta.env.VITE_AUTH_STORAGE_KEY || 'synergy_auth_token',
}
