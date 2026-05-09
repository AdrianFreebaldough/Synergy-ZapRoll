import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { SurveyMetadata } from '../types/survey';
import Skeleton from '../components/ui/Skeleton';
import LoadingButton from '../components/ui/LoadingButton';
import { useSubmission } from '../hooks/useSubmission';
import { submitRegistration } from '../services/registrationService';
import QuestionRenderer from '../components/survey/QuestionRenderer';
import axios from 'axios';

import SubmissionStatus from '../components/ui/SubmissionStatus';

const SurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<SurveyMetadata | null>(null);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const { execute: submitResponse, isSubmitting, error, success, hasAlreadySubmitted } = useSubmission(
    async (payload: { category: string; data: any }) => {
      return submitRegistration(payload.category, payload.data);
    }
  );

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
            }
          ]
        });
        setIsLoadingSurvey(false);
        return;
      }

      try {
        setIsLoadingSurvey(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/surveys/${surveyId}`);
        setSurvey(response.data);
      } catch (err: any) {
        setFetchError(err.response?.data?.error || 'Failed to load survey');
      } finally {
        setTimeout(() => setIsLoadingSurvey(false), 800);
      }
    };

    if (surveyId) fetchSurvey();
  }, [surveyId]);

  const onSubmit = async (data: any) => {
    const answers = Object.entries(data).map(([question_id, value]) => ({
      question_id,
      answer_value: value,
    }));

    try {
      await submitResponse({
        category: `survey-${surveyId}`,
        data: {
          survey_id: surveyId!,
          answers,
        }
      });
    } catch (err) {
      // Handled by hook
    }
  };

  if (hasAlreadySubmitted) {
    return (
      <div className="max-w-[720px] mx-auto pb-12">
        <SubmissionStatus 
          type="already-submitted"
          title="Response Already Submitted"
          message="Our system has already received your feedback for this survey. Thank you for your participation!"
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-[720px] mx-auto pb-12">
        <SubmissionStatus 
          type="success"
          title="Feedback Received"
          message="Thank you for sharing your experience! Your response has been securely recorded."
        />
      </div>
    );
  }
  if (isLoadingSurvey) {
    return (
      <div className="max-w-[720px] mx-auto pb-12 animate-in fade-in duration-500">
        <div className="glass-card overflow-hidden border-t-8 border-t-app-primary/30">
          <div className="p-6 md:p-8 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" count={2} />
          </div>
          <div className="divide-y divide-white/[0.04]">
            <div className="p-6 md:p-8 space-y-6">
              <Skeleton className="h-6 w-1/4" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-12 w-full" count={3} />
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div className="p-6 md:p-8 bg-white/[0.02] flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError || !survey) {
    return (
      <div className="glass-card p-8 text-center max-w-[720px] mx-auto">
        <div className="w-16 h-16 bg-app-danger/10 text-app-danger rounded-full flex items-center justify-center mx-auto mb-4 border border-app-danger/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Survey Not Found</h2>
        <p className="text-app-text-secondary text-sm">{fetchError || 'The requested survey does not exist.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="glass-card overflow-hidden border-t-8 border-t-app-primary shadow-2xl">
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

          {error && (
            <div className="mx-6 md:mx-8 mb-4 p-4 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-xs animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-6">
            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Submitting Response..."
              size="lg"
              fullWidth={false}
              className="md:px-12"
            >
              Submit Response
            </LoadingButton>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => methods.reset()}
              className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold hover:text-white transition-colors disabled:opacity-20"
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
