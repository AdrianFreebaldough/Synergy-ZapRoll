import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { verifyRouteToken } from '../../services/tokenService';

interface TokenGuardProps {
  children: React.ReactElement;
  requiredType: 'REGISTRATION' | 'ATTENDANCE' | 'SURVEY';
  requiredSubType: string;
}

/**
 * TokenGuard acts as a security bouncer for routes.
 * It prevents the page from rendering until the backend validates the token.
 */
const TokenGuard: React.FC<TokenGuardProps> = ({ children, requiredType, requiredSubType }) => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    const checkToken = async () => {
      // 1. If no token is provided at all, it's an immediate fail
      if (!token) {
        setStatus('invalid');
        return;
      }

      // 2. Ask the backend to validate the token
      const result = await verifyRouteToken(token);

      // 3. Verify both the token validity and the specific authorized action
      if (
        result.valid && 
        result.type === requiredType && 
        result.subType === requiredSubType
      ) {
        setStatus('valid');
      } else {
        setStatus('invalid');
      }
    };

    checkToken();
  }, [token, requiredType, requiredSubType]);

  // Loading state (Bouncer is checking the ID)
  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-app-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-app-text-secondary text-xs uppercase tracking-widest font-bold animate-pulse">
          Verifying Secure Access...
        </p>
      </div>
    );
  }

  // Invalid state (Unauthorized access)
  if (status === 'invalid') {
    return <Navigate to="/invalid-link" replace />;
  }

  // Valid state (Access granted)
  return children;
};

export default TokenGuard;
