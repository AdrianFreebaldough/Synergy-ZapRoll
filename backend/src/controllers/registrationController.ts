import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';

export const registerEntry = async (req: Request, res: Response) => {
  const { category } = req.params;
  const data = req.body;

  try {
    // Map categories to Supabase tables
    let table = 'registrations'; // Default table
    
    if (category === 'student') table = 'students';
    else if (category === 'employee') table = 'employees';
    else if (category === 'guest') table = 'guests';

    const { data: result, error } = await supabase
      .from(table)
      .insert([
        { 
          ...data,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({
      message: `${category} registered successfully`,
      data: result[0]
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during registration'
    });
  }
};
