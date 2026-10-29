/**
 * Centralized API & Server Configuration
 * Seamlessly supports:
 * 1. Local development (empty base URL -> Vite proxy to http://127.0.0.1:5000)
 * 2. Vercel deployment with VITE_API_BASE_URL environment variable
 * 3. Vercel rewrites or reverse proxy
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL || '';
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default apiUrl;

