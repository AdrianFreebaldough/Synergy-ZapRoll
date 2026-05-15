import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

/**
 * Communicates with the backend to verify if a route token is valid
 * and what action it is authorized to perform.
 */
export const verifyRouteToken = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/tokens/validate/${token}`);
    return response.data;
  } catch (error: any) {
    // Return invalid if any error occurs (403, 404, 500)
    return { 
      valid: false, 
      error: error.response?.data?.error || 'Validation Failed' 
    };
  }
};
