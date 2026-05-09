import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';

export const getSurveyById = async (req: Request, res: Response) => {
  const { surveyId } = req.params;

  try {
    // Fetch template from evaluation_templates
    const { data: template, error } = await supabase
      .from('evaluation_templates')
      .select('*')
      .eq('id', surveyId)
      .eq('is_active', true)
      .single();

    if (error || !template) {
      return res.status(404).json({ error: 'Evaluation form not found or inactive' });
    }

    // New schema stores questions as JSONB in 'questions'
    return res.json(template);

  } catch (error: any) {
    console.error('Fetch Evaluation Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const submitSurveyResponse = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const { answers, registration_id, session_id } = req.body;

  try {
    // Schema: evaluation_responses
    // Columns: template_id, registration_id, session_id, responses (JSONB)
    const { data: result, error } = await supabase
      .from('evaluation_responses')
      .insert([
        { 
          template_id: surveyId,
          registration_id: registration_id,
          session_id: session_id || null,
          responses: answers,
          submitted_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ 
          error: 'Already Submitted',
          message: 'You have already submitted an evaluation for this session.'
        });
      }
      throw error;
    }

    return res.status(201).json({ 
      message: 'Evaluation submitted successfully',
      data: result[0]
    });

  } catch (error: any) {
    console.error('Submit Evaluation Error:', error);
    return res.status(500).json({ error: 'Failed to submit evaluation' });
  }
};
