import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';

export const registerEntry = async (req: Request, res: Response) => {
  const { category } = req.params;
  const { full_name, email, name, quotaId, ...otherData } = req.body;

  try {
    // 0. Auto-Fetch the latest Event ID (Production Plan)
    const { data: latestEvent, error: eventError } = await supabase
      .from('events')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (eventError || !latestEvent) {
      return res.status(400).json({ 
        error: 'No Active Event', 
        message: 'Registration is currently closed because no active event was found in the system.' 
      });
    }

    // 1. Resolve primary fields
    const finalName = full_name || name;
    
    // 2. Extract external_id (e.g. Student ID)
    const externalId = otherData.studentId || null;

    // 3. Bundle metadata
    const metadata = {
      ...otherData,
      registered_category: category,
      registration_source: 'web_portal'
    };

    // 4. Insert into the unified registrations table
    const { data: result, error } = await supabase
      .from('registrations')
      .insert([
        { 
          event_id: latestEvent.id, // Auto-linked to latest event
          full_name: finalName,
          email: email || null,
          external_id: externalId,
          quota_id: quotaId || null, // Capture the quota ID here
          metadata: metadata,
          status: 'registered',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') { // Postgres Unique Violation
        return res.status(400).json({ 
          error: 'Already Registered', 
          message: 'A registration with this identifier already exists for this event.' 
        });
      }
      throw error;
    }

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
