import axios from 'axios';
import { AttendanceFormData } from '../types/attendance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export const submitAttendance = async (data: AttendanceFormData) => {
  const response = await axios.post(`${API_URL}/attendance`, data);
  return response.data;
};
