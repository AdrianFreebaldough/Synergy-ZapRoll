import { Request, Response } from 'express';
import { supabase } from '../supabase/client.js';

export const getSurveyById = async (req: Request, res: Response) => {
  const { surveyId } = req.params;

  try {
    // Fetch survey metadata
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) throw new Error('Survey not found');

    // Fetch questions with their options
    const { data: questions, error: questionsError } = await supabase
      .from('survey_questions')
      .select(`
        *,
        survey_options (*)
      `)
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    // Transform options for easier frontend consumption
    const formattedQuestions = questions.map(q => ({
      ...q,
      options: q.survey_options
    }));

    return res.json({
      ...survey,
      questions: formattedQuestions
    });

  } catch (error: any) {
    console.error('Fetch Survey Error:', error);
    return res.status(404).json({ error: error.message });
  }
};

export const submitSurveyResponse = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const { answers } = req.body;

  try {
    // 1. Create a response entry
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .insert([{ survey_id: surveyId }])
      .select()
      .single();

    if (responseError) throw responseError;

    // 2. Prepare answer entries
    const answerEntries = answers.map((ans: any) => ({
      response_id: response.id,
      question_id: ans.question_id,
      answer_value: ans.answer_value
    }));

    // 3. Insert all answers
    const { error: answersError } = await supabase
      .from('survey_response_answers')
      .insert(answerEntries);

    if (answersError) throw answersError;

    return res.status(201).json({ message: 'Response submitted successfully' });

  } catch (error: any) {
    console.error('Submit Response Error:', error);
    return res.status(500).json({ error: 'Failed to submit response' });
  }
};
