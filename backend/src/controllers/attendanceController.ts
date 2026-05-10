import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';

export const submitAttendance = async (req: Request, res: Response) => {
  const { studentId, name, category, token, session: sessionType } = req.body;

  try {
    // 1. Validate Token & Session
    let sessionData = null;

    // Try lookup by token first
    const { data: sessionByToken } = await supabase
      .from('sessions')
      .select('*')
      .eq('qr_access_token', token)
      .maybeSingle();

    sessionData = sessionByToken;

    // Fallback: If not found by token, try to find by session_type based on the sessionType (AM/PM)
    if (!sessionData) {
      let searchType = '';
      if (category === 'student') {
        searchType = sessionType?.toUpperCase() === 'AM' ? 'am-reg' : 'pm-reg';
      } else if (category === 'employee') {
        searchType = 'employee-reg';
      }

      if (searchType) {
        // Use order and limit to ensure we get the most recent one if duplicates exist
        const { data: sessionByTypeName } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_type', searchType)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        sessionData = sessionByTypeName;
      }
    }

    if (!sessionData) {
      return res.status(403).json({
        error: 'Session Access Denied',
        message: 'This session is either closed or requires a valid security token.'
      });
    }

    const session = sessionData;

    // 1.1 Toggle Check (is_open column from database)
    if (session.is_open === false) {
      return res.status(403).json({
        error: 'Attendance Closed',
        message: `Attendance for the "${session.session_type}" is currently closed. Please wait for the organizer to open the session.`
      });
    }

    // 2. Find the Registration
    let query = supabase.from('registrations').select('id');

    if (category === 'student') {
      query = query.eq('external_id', studentId);
    } else {
      query = query.eq('full_name', name);
    }

    const { data: registration, error: regError } = await query.maybeSingle();

    if (regError || !registration) {
      return res.status(404).json({
        error: 'Participant Not Registered',
        message: 'We could not find a registration matching these details. Please register first.'
      });
    }

    // 3. Record Attendance
    const { error: attendError } = await supabase
      .from('attendance')
      .insert([
        {
          registration_id: registration.id,
          session_id: session.id,
          scanned_at: new Date().toISOString()
        }
      ]);

    if (attendError) {
      if (attendError.code === '23505') { // Unique violation
        return res.status(400).json({
          error: 'Already Attended',
          message: 'Your attendance has already been recorded for this session.'
        });
      }
      throw attendError;
    }

    return res.status(201).json({
      message: 'Attendance recorded successfully',
      session: session.session_type || 'Session'
    });

  } catch (error: any) {
    console.error('Attendance Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unknown error occurred',
      details: error
    });
  }
};
