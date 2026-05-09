import { Request, Response } from 'express';
import { findTokenAction } from '../config/secureRoutes.js';

/**
 * Validates a secure route token against the static configuration
 */
export const validateToken = (req: Request, res: Response) => {
  const { token } = req.params;
  
  const tokenMatch = findTokenAction(token);

  if (!tokenMatch) {
    return res.status(403).json({ 
      valid: false, 
      error: 'Invalid Secure Token',
      message: 'This access link is invalid or has not been authorized.'
    });
  }

  // Token is valid, return the mapped category and subCategory
  return res.status(200).json({
    valid: true,
    type: tokenMatch.category,    // e.g., REGISTRATION
    subType: tokenMatch.subCategory // e.g., STUDENT
  });
};
