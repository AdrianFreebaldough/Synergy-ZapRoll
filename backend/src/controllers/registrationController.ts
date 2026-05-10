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

    // 0.1 Quota/Capacity Check (Real-Time Validation)
    let targetEventId = latestEvent.id;

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

      // Important: Use the event_id linked to the quota
      targetEventId = quota.event_id || latestEvent.id;

      // Count existing registrations for this quota to prevent overbooking
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('quota_id', quotaId)
        .eq('status', 'registered');

      if (countError) throw countError;

      if (count !== null && count >= quota.capacity) {
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
          event_id: targetEventId, // Use the resolved event ID
          full_name: finalName,
          email: email || null,
          external_id: externalId,
          quota_id: quotaId || null,
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
