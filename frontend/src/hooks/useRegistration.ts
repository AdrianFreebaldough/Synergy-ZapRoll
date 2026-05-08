import { useState } from 'react';
import { submitRegistration } from '../services/registrationService';
import { RegistrationFormData } from '../validations/registrationSchema';

export const useRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = async (category: string, data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await submitRegistration(category, data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error, success };
};
