import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';
import { sendAttendanceEmail } from '../utils/mailer.js';

export const submitAttendance = async (req: Request, res: Response) => {
  const { studentId, name, category, token, session: sessionType } = req.body;

  try {
    // 1. Validate Token & Session
    let sessionData = null;

    // 1. Resolve Session (Flexible Lookup)
    let session = null;

    // Try token first
    const { data: sessionByToken } = await supabase
      .from('sessions')
      .select('*')
      .eq('qr_access_token', token)
      .maybeSingle();

    if (sessionByToken) {
      session = sessionByToken;
    } else {
      // Fallback: Smart session lookup
      const isAM = sessionType?.toUpperCase() === 'AM';
      const isEmployee = category === 'employee';
      
      let searchPattern = '%am%';
      if (isEmployee) {
        searchPattern = '%employee%';
      } else if (sessionType?.toUpperCase() === 'PM') {
        searchPattern = '%pm%';
      }
      
      const { data: sessionByMatch } = await supabase
        .from('sessions')
        .select('*')
        .ilike('session_type', searchPattern)
        .eq('is_open', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      session = sessionByMatch;
    }

    if (!session || !session.is_open) {
      return res.status(403).json({
        error: 'Session Not Active',
        message: `No active ${category?.toUpperCase()} session was found. Please ensure the session is toggled to "Open" in the database.`
      });
    }

    // 2. Resolve Participant/Registration
    // ... (rest of step 2 stays the same) ...
    let regQuery = supabase.from('registrations').select('*');
    if (category === 'student') {
      regQuery = regQuery.eq('external_id', studentId);
    } else {
      regQuery = regQuery.eq('full_name', name);
    }

    const { data: registration, error: regError } = await regQuery.maybeSingle();

    if (regError || !registration) {
      return res.status(404).json({
        error: 'Participant Not Registered',
        message: 'We could not find a registration matching these details.'
      });
    }

    // 3. Record Attendance (Robust Upsert Logic)
    const typeLower = (session.session_type || '').toLowerCase();
    // PRIORITIZE employee field first, then PM, then AM
    const sessionTypeField = typeLower.includes('employee') ? 'employee_scanned_at' : 
                             typeLower.includes('pm') ? 'pm_scanned_at' : 
                             'am_scanned_at';

    const now = new Date().toISOString();

    // Check for existing record to prevent duplicates in the SAME session
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('participant_id', registration.id)
      .maybeSingle();

    if (existing && existing[sessionTypeField]) {
      return res.status(400).json({
        error: 'Already Attended',
        message: `Your attendance for the ${session.session_type} is already recorded.`
      });
    }

    // Upsert the record (Match by participant_id)
    const { error: upsertError } = await supabase
      .from('attendance')
      .upsert({
        id: existing?.id, // Use existing ID if we found one
        participant_id: registration.id,
        registration_id: registration.id,
        session_id: session.id, // Record the specific session ID
        event_id: session.event_id || registration.event_id || existing?.event_id || null,
        [sessionTypeField]: now
      });

    if (upsertError) {
      console.error('Upsert Error:', upsertError);
      throw upsertError;
    }

    // 4. Trigger Attendance Email (Async)
    // Filter: Only 3rd Years, 4th Year Colloquium Participants, and 4th Year Colloquium Presenters
    const meta = registration.metadata as any;
    const is3rdYear = meta?.yearLevel === '3rd Year';
    const isCollPart = meta?.studentRole === 'Colloquium Participant';
    const isCollPres = meta?.studentRole === 'Colloquium Presenter';

    if (registration.email && (is3rdYear || isCollPart || isCollPres)) {
      // Generate a Unique Verification Code (Format: SESSION-REGID-DATE)
      const datePart = `${new Date().getDate()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
      const shortId = registration.id.split('-')[0].toUpperCase().slice(0, 4);
      const sessionLabel = (session.session_type || 'EVT').split(' ')[0].toUpperCase();
      const verificationId = `${sessionLabel}-${shortId}-${datePart}`;

      sendAttendanceEmail(registration.email, registration.full_name, session.session_type, verificationId)
        .catch(err => console.error('Background Attendance Email Error:', err));
    }

    return res.status(201).json({
      message: 'Attendance recorded successfully',
      session: session.session_type,
      column: sessionTypeField
    });

  } catch (error: any) {
    console.error('Attendance Error:', error);
    // Move the specific error message to the 'error' field so it shows in the frontend UI
    const displayError = error.message || 'Internal Server Error';
    return res.status(500).json({
      error: `Server Error: ${displayError}`,
      message: displayError,
      details: error
    });
  }
};

export const posterLogout = async (req: Request, res: Response) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    // 1. Find Registration and verify Role
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id, metadata')
      .eq('external_id', studentId)
      .maybeSingle();

    if (regError || !registration) {
      return res.status(404).json({
        error: 'Participant Not Registered',
        message: 'We could not find a registration matching this student number.'
      });
    }

    // Verify if they are a poster participant (Strict restriction)
    const metadata = registration.metadata as any;
    if (metadata?.studentRole !== 'Poster Presenter') {
      return res.status(403).json({
        error: 'Not a Poster Participant',
        message: 'This logout form is exclusively for students registered with the "Poster Presenter" role. Your registered role is different.'
      });
    }

    // 2. Check for existing attendance record
    const { data: existing, error: existError } = await supabase
      .from('attendance')
      .select('*')
      .eq('registration_id', registration.id)
      .maybeSingle();

    if (existError) throw existError;

    if (!existing) {
       return res.status(404).json({
         error: 'Attendance Record Not Found',
         message: 'No attendance record found for this student. Did you check in for AM/PM first?'
       });
    }

    if (existing.poster_out_at) {
      return res.status(400).json({
        error: 'Already Logged Out',
        message: 'Your poster logout has already been recorded.'
      });
    }

    // 3. Update Attendance
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('attendance')
      .update({ poster_out_at: now })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Update Poster Out Error:', updateError);
      throw updateError;
    }

    return res.status(200).json({
      message: 'Poster logout recorded successfully',
      time: now
    });

  } catch (error: any) {
    console.error('Poster Logout Error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Internal Server Error'
    });
  }
};
