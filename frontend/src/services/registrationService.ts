import axios from 'axios';
import { RegistrationFormData } from '../validations/registrationSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const submitRegistration = async (category: string, data: RegistrationFormData) => {
  const response = await axios.post(`${API_URL}/register/${category}`, data);
  return response.data;
};
