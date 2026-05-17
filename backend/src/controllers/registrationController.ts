import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';
import { sendRegistrationEmail, sendAttendanceEmail } from '../utils/mailer.js';

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

    // 0.1 Quota/Capacity Check (Real-Time Validation)
    let targetEventId = latestEvent.id;
    const isPoster = otherData.studentRole === 'Poster Presenter';

    if (quotaId) {
      // Fetch the specific quota record (Use maybeSingle to avoid coercion errors)
      const { data: quota, error: quotaError } = await supabase
        .from('event_quotas')
        .select('*')
        .eq('id', quotaId)
        .maybeSingle();

      if (quotaError || !quota) {
        console.error('Quota Error Details:', quotaError);

        // Help the user find a valid ID if this one failed
        const { data: availableQuotas } = await supabase
          .from('event_quotas')
          .select('id, category')
          .limit(5);

        const availableList = availableQuotas?.map(q => `${q.category}: ${q.id}`).join('\n') || 'None found';

        const detailedError = quotaError
          ? `Invalid Quota: ${quotaError.message}`
          : `Invalid Quota: The ID "${quotaId}" was not found in the database.`;

        return res.status(400).json({
          error: detailedError,
          message: detailedError,
          available_quotas: availableList,
          debug: { quotaId, quotaError }
        });
      }

      // 0.2 Active Status Check
      if (!quota.is_open) {
        return res.status(403).json({
          error: 'Registration Closed',
          message: `Registration for ${quota.category} is currently closed.`,
          subtext: 'Please wait for the organizers to open the registration period.'
        });
      }

      // Important: Use the event_id linked to the quota
      targetEventId = quota.event_id || latestEvent.id;

      // Count existing registrations for this quota to prevent overbooking
      // BUSINESS RULE: 'Poster Presenter' role does not count towards the quota limit
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('quota_id', quotaId)
        .eq('status', 'registered')
        .or(`metadata->>studentRole.neq."Poster Presenter",metadata->>studentRole.is.null`);

      if (countError) throw countError;

      if (!isPoster && count !== null && count >= quota.capacity) {
        return res.status(423).json({
          error: 'Registration Capacity Reached',
          message: `The registration limit for ${quota.category} has already been reached.`,
          subtext: 'We appreciate your interest in participating.'
        });
      }
    }

    // 1. Resolve primary fields (Check all possible name fields)
    const finalName = full_name || name || otherData.representativeName;

    // 2. Extract external_id (e.g. Student ID)
    const externalId = otherData.studentId || null;

    // 2.1 Duplicate Check (Email & ID)
    // We check if this email OR student ID is already registered for THIS event
    const { data: existingReg } = await supabase
      .from('registrations')
      .select('id, email, external_id')
      .eq('event_id', targetEventId)
      .filter('id', 'not.is', null) // Dummy filter to start the query
      .or(
        `email.eq."${email || '___NULL___'}",external_id.eq."${externalId || '___NULL___'}"`
      )
      .maybeSingle();

    if (existingReg) {
      const isEmailConflict = email && existingReg.email === email;
      const isIdConflict = externalId && existingReg.external_id === externalId;

      if (isEmailConflict || isIdConflict) {
        return res.status(400).json({
          error: 'Already Registered',
          message: isEmailConflict
            ? `The email "${email}" is already registered for this event.`
            : `The ID "${externalId}" is already registered for this event.`
        });
      }
    }

    // 3. Bundle metadata
    const metadata = {
      ...otherData,
      registered_category: category,
      registration_source: req.body.isWalkIn ? 'on_site' : 'web_portal',
      reg_type: req.body.isWalkIn ? 'walk-in' : 'pre-reg'
    };

    // 4. Insert into the unified registrations table
    const { data: result, error } = await supabase
      .from('registrations')
      .insert([
        {
          event_id: targetEventId,
          full_name: finalName,
          email: email || null,
          external_id: externalId,
          quota_id: isPoster ? null : (quotaId || null),
          metadata: metadata,
          status: 'registered',
          reg_type: req.body.isWalkIn ? 'walk-in' : 'pre-reg',
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

    const registration = result[0];
    console.log('--- Email Trigger Debug ---');
    console.log('Registration Success! Email found:', registration.email);
    console.log('Name:', registration.full_name);

    // 4.1 Trigger Registration Email (Async)
    if (registration.email) {
      console.log('Calling sendRegistrationEmail...');
      const role = (registration.metadata as any)?.studentRole;
      try {
        await sendRegistrationEmail(registration.email, registration.full_name, role);
        console.log('✅ Mailer process initiated');
      } catch (err) {
        console.error('❌ Background Email Error:', err);
      }
    }
    console.log('---------------------------');

    // 5. Automatic Attendance for Walk-ins (Mandatory for walk-in registrations)
    if (req.body.isWalkIn) {
      const now = new Date();
      const isAfternoon = now.getHours() >= 12;
      let searchPattern = isAfternoon ? '%pm%' : '%am%';
      if (category === 'employee') searchPattern = '%employee%';

      // Find the correct open session
      const { data: session, error: sessionLookupError } = await supabase
        .from('sessions')
        .select('*')
        .ilike('session_type', searchPattern)
        .eq('is_open', true)
        .maybeSingle();

      if (sessionLookupError) throw new Error(`Session Lookup Failed: ${sessionLookupError.message}`);

      if (!session) {
        throw new Error(`No open ${isAfternoon ? 'PM' : 'AM'} session was found for walk-in check-in.`);
      }

      const typeLower = (session.session_type || '').toLowerCase();
      const sessionTypeField =
        typeLower.includes('employee') ? 'employee_scanned_at' :
          typeLower.includes('pm') ? 'pm_scanned_at' :
            'am_scanned_at';

      const { error: attendError } = await supabase
        .from('attendance')
        .insert([{
          participant_id: registration.id,
          registration_id: registration.id,
          event_id: targetEventId,
          [sessionTypeField]: now.toISOString()
        }]);

      if (attendError) {
        throw new Error(`Attendance Recording Failed: ${attendError.message}`);
      }

      // 5.1 Trigger Attendance Email for Walk-ins (Async)
      const meta = registration.metadata as any;
      const is3rdYear = meta?.yearLevel === '3rd Year';
      const isCollPart = meta?.studentRole === 'Colloquium Participant';
      const isCollPres = meta?.studentRole === 'Colloquium Presenter';

      if (registration.email && (is3rdYear || isCollPart || isCollPres)) {
        const datePart = `${new Date().getDate()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
        const identifier = (registration.external_id || registration.id.split('-')[0].toUpperCase().slice(0, 4)).replace(/\s+/g, '');
        const sessionLabel = (session.session_type || 'EVT').split(' ')[0].toUpperCase();
        const verificationId = `${sessionLabel}-${identifier}-${datePart}`;

        try {
          await sendAttendanceEmail(registration.email, registration.full_name, session.session_type, verificationId);
        } catch (err) {
          console.error('Background Walk-in Attendance Email Error:', err);
        }
      }
    }

    return res.status(201).json({
      message: req.body.isWalkIn
        ? `${category} walk-in registered and checked-in successfully`
        : `${category} registered successfully`,
      data: registration,
      isWalkIn: !!req.body.isWalkIn
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during registration'
    });
  }
};
