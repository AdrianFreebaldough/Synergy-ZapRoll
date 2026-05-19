import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';
import { sendRegistrationEmail, sendAttendanceEmail } from '../utils/mailer.js';

export const registerEntry = async (req: Request, res: Response) => {
  const { category } = req.params;
  const { full_name, email, name, quotaId, ...otherData } = req.body;

  // Secure time-lock for 3rd Year Students (Enforce until May 19, 2026, 10:00 AM GMT+8)
  if (category === 'student' && otherData.yearLevel === '3rd Year') {
    const openTime = new Date('2026-05-19T10:00:00+08:00');
    if (new Date() < openTime) {
      return res.status(403).json({
        error: 'Registration Not Open',
        message: 'Registration for 3rd Year students is locked until May 19, 2026, at 10:00 AM.'
      });
    }
  }

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
    const is3rdYear = category === 'student' && otherData.yearLevel === '3rd Year';
    const selectedRole = otherData.studentRole || (is3rdYear && !req.body.isWalkIn ? 'Poster Attendee' : null);
    const shouldIgnoreQuota = selectedRole === 'Poster Presenter' || selectedRole === 'Poster Attendee';

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

      if (!shouldIgnoreQuota && count !== null && count >= quota.capacity) {
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
      .select('id, full_name, email, external_id, metadata, quota_id, reg_type')
      .eq('event_id', targetEventId)
      .filter('id', 'not.is', null) // Dummy filter to start the query
      .or(
        `email.eq."${email || '___NULL___'}",external_id.eq."${externalId || '___NULL___'}"`
      )
      .maybeSingle();

    let isEdit = req.body.isEdit === true;
    let isPreRegWalkIn = false;

    if (existingReg) {
      const isEmailConflict = email && existingReg.email === email;
      const isIdConflict = externalId && existingReg.external_id === externalId;

      if (isEmailConflict || isIdConflict) {
        const prevMeta = existingReg.metadata as any || {};

        // If they are registering via walk-in, and they were originally pre-registered:
        if (req.body.isWalkIn && (existingReg.reg_type === 'pre-reg' || prevMeta.reg_type === 'pre-reg')) {
          isEdit = true;
          req.body.isEdit = true;
          isPreRegWalkIn = true;
        } else {
          // Otherwise do normal validation checks
          const newFirst = String(otherData.firstName || '').trim().toLowerCase();
          const oldFirst = String(prevMeta.firstName || '').trim().toLowerCase();
          
          const newLast = String(otherData.lastName || '').trim().toLowerCase();
          const oldLast = String(prevMeta.lastName || '').trim().toLowerCase();

          const newMiddle = String(otherData.middleName || '').trim().toLowerCase();
          const oldMiddle = String(prevMeta.middleName || '').trim().toLowerCase();

          const newYear = String(otherData.yearLevel || '').trim().toLowerCase();
          const oldYear = String(prevMeta.yearLevel || '').trim().toLowerCase();

          const newSection = String(otherData.section || '').trim().toLowerCase();
          const oldSection = String(prevMeta.section || '').trim().toLowerCase();

          const newEmail = String(email || '').trim().toLowerCase();
          const oldEmail = String(existingReg.email || '').trim().toLowerCase();

          const newId = String(externalId || '').trim().toLowerCase();
          const oldId = String(existingReg.external_id || '').trim().toLowerCase();

          // Check name parity (handling split names and legacy single string names)
          const newNameStr = String(finalName || '').trim().toLowerCase().replace(/\s+/g, ' ');
          const oldNameStr = String(existingReg.full_name || '').trim().toLowerCase().replace(/\s+/g, ' ');
          const isNameMatch = oldFirst && oldLast ? (newFirst === oldFirst && newLast === oldLast) : newNameStr === oldNameStr;

          const isExactMatch = 
            isNameMatch &&
            newMiddle === oldMiddle &&
            newYear === oldYear &&
            newSection === oldSection &&
            newEmail === oldEmail &&
            newId === oldId;

          if (!isEdit && !isExactMatch) {
            return res.status(400).json({
              error: 'Already Registered',
              message: isEmailConflict
                ? `The email "${email}" is already registered for this event.`
                : `The ID "${externalId}" is already registered for this event.`
            });
          }

          // If they match exactly, we accept their new entry and just update their existing row in database!
          if (isExactMatch) {
            isEdit = true;
            req.body.isEdit = true;
          }
        }
      }
    }

    // Extract previous roles for merging if in edit mode
    let previousRoles: string[] = [];
    if (isEdit && existingReg) {
      const prevMeta = existingReg.metadata as any;
      if (prevMeta && prevMeta.studentRole) {
        previousRoles = Array.isArray(prevMeta.studentRole)
          ? prevMeta.studentRole
          : [prevMeta.studentRole];
      }
    }

    const currentRole = (is3rdYear && !req.body.isWalkIn)
      ? 'Poster Attendee' 
      : (otherData.studentRole || otherData.registered_category);
    let finalRoles: string[] = [];

    if (is3rdYear && !req.body.isWalkIn) {
      // For 3rd-year pre-registrations, discard any 4th-year participant/presenter roles
      finalRoles = ['Poster Attendee'];
    } else if (previousRoles.length > 0) {
      finalRoles = [...previousRoles];
      if (currentRole && !finalRoles.includes(currentRole)) {
        finalRoles.push(currentRole);
      }
    } else {
      finalRoles = currentRole ? [currentRole] : [];
    }

    // 3. Bundle metadata
    const walkinFlags = isPreRegWalkIn ? {
      attended_as_walkin: true,
      walkin_session: new Date().getHours() >= 12 ? 'pm-reg' : 'am-reg',
      walkin_timestamp: new Date().toISOString()
    } : {};

    const metadata = {
      ...otherData,
      studentRole: finalRoles, // Structurally consistent JSON array
      registered_category: category,
      registration_source: req.body.isWalkIn ? 'on_site' : 'web_portal',
      reg_type: existingReg ? (existingReg.reg_type || (existingReg.metadata as any)?.reg_type) : (req.body.isWalkIn ? 'walk-in' : 'pre-reg'),
      ...walkinFlags
    };

    // 4. Insert or Update (Upsert) into the unified registrations table (Allows editing registration details)
    const upsertRow: any = {
      event_id: targetEventId,
      full_name: finalName,
      email: email || null,
      external_id: externalId,
      quota_id: shouldIgnoreQuota ? null : (quotaId || null),
      metadata: metadata,
      status: 'registered',
      reg_type: existingReg ? existingReg.reg_type : (req.body.isWalkIn ? 'walk-in' : 'pre-reg'),
      created_at: isEdit && existingReg ? undefined : new Date().toISOString() // Preserve original creation date on edits
    };

    if (isEdit && existingReg) {
      upsertRow.id = existingReg.id;
    }

    const { data: result, error } = await supabase
      .from('registrations')
      .upsert([upsertRow])
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

    // 4.1 Trigger Registration Email (Async) - Skip on dual role updates (isEdit === true)
    if (registration.email && !isEdit) {
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

      // Find if an attendance record already exists for this participant to avoid Unique Violation crashes
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('participant_id', registration.id)
        .maybeSingle();

      if (existingAttendance) {
        const { error: attendError } = await supabase
          .from('attendance')
          .update({
            [sessionTypeField]: now.toISOString()
          })
          .eq('id', existingAttendance.id);

        if (attendError) {
          throw new Error(`Attendance Recording Update Failed: ${attendError.message}`);
        }
      } else {
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
      }

      // 5.1 Trigger Attendance Email for Walk-ins (Async)
      const meta = registration.metadata as any;
      const is3rdYear = meta?.yearLevel === '3rd Year';
      const isCollPart = meta?.studentRole === 'Colloquium Participant';
      const isCollPres = meta?.studentRole === 'Colloquium Presenter';
      const isPoster = meta?.studentRole === 'Poster Presenter';

      if (registration.email && (is3rdYear || isCollPart || isCollPres || isPoster)) {
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

export const lookupRegistration = async (req: Request, res: Response) => {
  const { student_id } = req.query as { student_id?: string };

  if (!student_id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    // 0. Auto-Fetch the latest Event ID to scope search
    const { data: latestEvent, error: eventError } = await supabase
      .from('events')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (eventError || !latestEvent) {
      return res.status(404).json({ error: 'No Active Event Found' });
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('event_id', latestEvent.id)
      .eq('external_id', student_id)
      .maybeSingle();

    if (error) {
      console.error('Lookup DB Error:', error);
      throw error;
    }

    if (!registration) {
      return res.status(404).json({
        error: 'Registration Not Found',
        message: `No registration was found for Student ID "${student_id}" in this event.`
      });
    }

    // Format the response structure so it maps exactly back into the React Hook Form structure!
    const meta = registration.metadata as any;
    
    // Split name or extract from metadata if stored there
    const nameParts = registration.full_name.split(' ');
    const lastName = meta?.lastName || nameParts[nameParts.length - 1];
    const firstName = meta?.firstName || nameParts[0];
    const middleName = meta?.middleName || (nameParts.length > 2 ? nameParts.slice(1, nameParts.length - 1).join(' ') : '');

    return res.status(200).json({
      success: true,
      data: {
        firstName,
        lastName,
        middleName,
        email: registration.email || '',
        studentId: registration.external_id || '',
        yearLevel: meta?.yearLevel || '',
        studentRole: meta?.studentRole || '',
        section: meta?.section || ''
      }
    });

  } catch (error: any) {
    console.error('Lookup Registration Error:', error);
    return res.status(500).json({
      error: 'Failed to look up registration details'
    });
  }
};
