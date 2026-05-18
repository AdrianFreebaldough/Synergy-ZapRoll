import { useState, useCallback } from 'react';

interface UseSubmissionOptions<T, R> {
  onSuccess?: (result: R) => void;
  onError?: (error: string) => void;
  persistenceKey?: string;
}

export const useSubmission = <T, R>(
  submitFn: (data: T) => Promise<R>,
  options: UseSubmissionOptions<T, R> = {}
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Track if they had already submitted prior to this session
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(() => {
    if (options.persistenceKey) {
      return localStorage.getItem(`submitted_${options.persistenceKey}`) === 'true';
    }
    return false;
  });

  const execute = useCallback(
    async (data: T) => {
      const isEdit = (data as any)?.isEdit === true;
      if (isSubmitting || success || (hasAlreadySubmitted && !isEdit)) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const result = await submitFn(data);
        setSuccess(true);
        if (options.persistenceKey) {
          localStorage.setItem(`submitted_${options.persistenceKey}`, 'true');
        }
        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, success, hasAlreadySubmitted, submitFn, options]
  );

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setError(null);
    setSuccess(false);
    setHasAlreadySubmitted(false);
    if (options.persistenceKey) {
      localStorage.removeItem(`submitted_${options.persistenceKey}`);
    }
  }, [options.persistenceKey]);

  return {
    execute,
    isSubmitting,
    error,
    success,
    hasAlreadySubmitted,
    reset,
  };
};
