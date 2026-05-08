import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { SurveyMetadata } from '../types/survey';
import QuestionRenderer from '../components/survey/QuestionRenderer';
import { useRegistration } from '../hooks/useRegistration'; // Reusing infrastructure
import axios from 'axios';

const SurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<SurveyMetadata | null>(null);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { register: submitResponse, isLoading, error, success } = useRegistration();

  const methods = useForm();

  useEffect(() => {
    const fetchSurvey = async () => {
      if (surveyId === 'demo') {
        setSurvey({
          id: 'demo',
          title: 'Synergy Experience Survey',
          description: 'This is a preview of the dynamic survey system. All components are rendered based on a JSON configuration.',
          status: 'published',
          questions: [
            {
              id: 'q1',
              type: 'short_text',
              title: 'Full Name',
              is_required: true,
              order_index: 1,
              survey_id: 'demo'
            },
            {
              id: 'q2',
              type: 'likert',
              title: 'Rate your experience with the following sessions',
              is_required: true,
              order_index: 2,
              survey_id: 'demo',
              config: {
                rows: [{ id: 'r1', label: 'AI Workshop' }, { id: 'r2', label: 'Cybersecurity Keynote' }],
                cols: [{ id: 'c1', label: 'Poor' }, { id: 'c2', label: 'Neutral' }, { id: 'c3', label: 'Excellent' }]
              }
            },
            {
              id: 'q3',
              type: 'grid_checkbox',
              title: 'Which features did you find most useful?',
              is_required: false,
              order_index: 3,
              survey_id: 'demo',
              config: {
                rows: [{ id: 'r1', label: 'Mobile App' }, { id: 'r2', label: 'Web Portal' }],
                cols: [{ id: 'c1', label: 'Speed' }, { id: 'c2', label: 'UI Design' }, { id: 'c3', label: 'Ease of Use' }]
              }
            }
          ]
        });
        setIsLoadingSurvey(false);
        return;
      }

      try {
        setIsLoadingSurvey(true);
        const response = await axios.get(`http://localhost:5000/api/surveys/${surveyId}`);
        setSurvey(response.data);
      } catch (err: any) {
        setFetchError(err.response?.data?.error || 'Failed to load survey');
      } finally {
        setIsLoadingSurvey(false);
      }
    };

    if (surveyId) fetchSurvey();
  }, [surveyId]);

  const onSubmit = async (data: any) => {
    // Transform flat form data to API structure
    const answers = Object.entries(data).map(([question_id, value]) => ({
      question_id,
      answer_value: value,
    }));

    await submitResponse(`survey-${surveyId}`, {
      survey_id: surveyId!,
      answers,
    } as any);
  };

  if (isLoadingSurvey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-app-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold">Fetching Survey structure...</p>
      </div>
    );
  }

  if (fetchError || !survey) {
    return (
      <div className="glass-card p-8 text-center">
        <h2 className="text-xl font-bold text-app-danger mb-2">Survey Not Found</h2>
        <p className="text-app-text-secondary text-sm">{fetchError || 'The requested survey does not exist.'}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-card p-10 text-center animate-in zoom-in duration-500">
        <div className="w-16 h-16 bg-app-success/10 text-app-success rounded-full flex items-center justify-center mx-auto mb-4 border border-app-success/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-app-text-primary mb-1">Response Submitted</h2>
        <p className="text-app-text-muted text-[10px] uppercase tracking-widest">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto pb-12 animate-in fade-in duration-700">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="glass-card overflow-hidden border-t-8 border-t-app-primary">
          {/* Internal Header Section */}
          <div className="p-6 md:p-8 border-b border-white/[0.04] bg-white/[0.01]">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="mt-3 text-app-text-secondary text-sm leading-relaxed max-w-2xl opacity-80">
                {survey.description}
              </p>
            )}
          </div>

          <div className="divide-y divide-white/[0.04]">
            {survey.questions.map((question) => (
              <div key={question.id} className="p-6 md:p-8 hover:bg-white/[0.01] transition-all duration-300">
                <QuestionRenderer question={question} />
              </div>
            ))}
          </div>

          <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-3 bg-app-primary text-white font-bold rounded-lg hover:bg-app-accent hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-20 uppercase tracking-widest text-[10px]"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => methods.reset()}
              className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold hover:text-white transition-colors"
            >
              Reset Form
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SurveyPage;
