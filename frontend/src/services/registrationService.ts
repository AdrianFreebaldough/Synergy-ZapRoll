import axios from 'axios';
import { RegistrationFormData } from '../validations/registrationSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export const submitRegistration = async (category: string, data: RegistrationFormData) => {
  const response = await axios.post(`${API_URL}/register/${category}`, data);
  return response.data;
};

export const fetchRegistrationDetails = async (studentId: string) => {
  const response = await axios.get(`${API_URL}/register/lookup`, {
    params: { student_id: studentId }
  });
  return response.data;
};
