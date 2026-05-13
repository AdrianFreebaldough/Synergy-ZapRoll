import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { EvaluationTemplate, EvalPage } from '../types/survey';
import { fetchEvaluationTemplate, verifyStudentAttendance, submitEvaluationResponse } from '../services/surveyService';
import EvalQuestionRenderer from '../components/survey/EvalQuestionRenderer';
import Skeleton from '../components/ui/Skeleton';
import LoadingButton from '../components/ui/LoadingButton';
import SubmissionStatus from '../components/ui/SubmissionStatus';

const EvaluationPage: React.FC = () => {
  const { eventId, token } = useParams<{ eventId: string; token?: string }>();

  // ── Session Detection ──
  // If a token is provided, use it to force a session. Otherwise auto-detect by time.
  const forcedSession = useMemo(() => {
    if (token === 'f82da3e882e02b') return 'am';
    if (token === 'g93eb4f993f13c') return 'pm';
    return null;
  }, [token]);

  const currentHour = new Date().getHours();
  const sessionLabel = forcedSession || (currentHour >= 12 ? 'pm' : 'am');

  // ── Data State ──
  const [template, setTemplate] = useState<EvaluationTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Attendance Verification State ──
  const [isVerified, setIsVerified] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [verifiedSession, setVerifiedSession] = useState<string | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // ── Wizard State ──
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // ── Submission State ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);

  const methods = useForm({ mode: 'onChange' });

  // ── Persistence Key (session-aware) ──
  const persistenceKey = `eval_${eventId}_${sessionLabel}`;

  // ── Check for prior submission on mount ──
  useEffect(() => {
    if (localStorage.getItem(`submitted_${persistenceKey}`) === 'true') {
      setHasAlreadySubmitted(true);
    }
  }, [persistenceKey]);

  // ── Fetch Template ──
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchEvaluationTemplate();
        setTemplate(data);
      } catch (err: any) {
        setFetchError(err.response?.data?.error || 'Failed to load evaluation form');
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    load();
  }, []); // No dependencies needed anymore

  // ── Student ID Input Mask (00-0000 format) ──
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    if (value.length > 2) {
      value = value.slice(0, 2) + '-' + value.slice(2);
    }
    setStudentIdInput(value);
    setVerifyError(null);
  };

  // ── Verify Attendance Handler ──
  const handleVerifyAttendance = async () => {
    if (!studentIdInput || studentIdInput.length < 7) return;

    setIsVerifying(true);
    setVerifyError(null);

    try {
      // Use event_id from the fetched template
      const targetEventId = template?.event_id || eventId || '';
      const result = await verifyStudentAttendance(targetEventId, studentIdInput, sessionLabel);
      setIsVerified(true);
      setRegistrationId(result.registration_id);
      setStudentName(result.full_name);
      setVerifiedSession(result.session);
    } catch (err: any) {
      const errData = err.response?.data;
      setVerifyError(errData?.message || errData?.error || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Derived: Current Page ──
  const pages: EvalPage[] = useMemo(() => template?.questions || [], [template]);
  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === totalPages - 1;

  // ── Get all field IDs for the current page (for validation) ──
  const currentPageFieldIds = useMemo(() => {
    if (!currentPage) return [];
    const ids: string[] = [];
    const questionList = (currentPage as any).questions || (currentPage as any).Questions || [];
    for (const q of questionList) {
      if (q.type === 'header') continue;
      if (q.type === 'likert' && q.statements?.length > 0) {
        q.statements.forEach((_: any, sIdx: number) => ids.push(`${q.id}_s${sIdx}`));
      } else {
        ids.push(q.id);
      }
    }
    return ids;
  }, [currentPage]);

  // ── Navigation Handlers ──
  const handleNext = async () => {
    const valid = await methods.trigger(currentPageFieldIds);
    if (!valid) return;

    if (isLastPage) {
      handleSubmit();
    } else {
      setCurrentPageIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Submit Handler ──
  const handleSubmit = async () => {
    if (!template || !registrationId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = methods.getValues();
      const targetEventId = template?.event_id || eventId || '';
      await submitEvaluationResponse(targetEventId, template.id, registrationId, formData, sessionLabel);
      setIsSuccess(true);
      localStorage.setItem(`submitted_${persistenceKey}`, 'true');
    } catch (err: any) {
      const errData = err.response?.data;
      const msg = errData?.error || errData?.message || 'Submission failed';
      const detail = errData?.details || errData?.hint || errData?.code || '';
      const fullMsg = detail ? `${msg} [${detail}]` : msg;
      if (msg.toLowerCase().includes('already')) {
        setHasAlreadySubmitted(true);
        localStorage.setItem(`submitted_${persistenceKey}`, 'true');
      } else {
        setSubmitError(fullMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────────────────────────────────

  if (hasAlreadySubmitted) {
    return (
      <div className="max-w-[720px] mx-auto pb-12">
        <SubmissionStatus
          type="already-submitted"
          title="Response Already Submitted"
          message="Our system has already received your feedback for this evaluation. Thank you for your participation!"
        />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="max-w-[720px] mx-auto pb-12">
        <SubmissionStatus
          type="success"
          title="Evaluation Submitted"
          message="Thank you for sharing your feedback! Your response has been securely recorded."
        />
      </div>
    );
  }

  if (isLoading) {
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
              <Skeleton className="h-12 w-full" count={3} />
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

  if (fetchError || !template || pages.length === 0) {
    return (
      <div className="glass-card p-8 text-center max-w-[720px] mx-auto">
        <div className="w-16 h-16 bg-app-danger/10 text-app-danger rounded-full flex items-center justify-center mx-auto mb-4 border border-app-danger/20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Evaluation Not Found</h2>
        <p className="text-app-text-secondary text-sm">
          {fetchError || 'No evaluation form is currently available for this event.'}
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STUDENT ID VERIFICATION GATE
  // ─────────────────────────────────────────────────────────────────────────

  if (!isVerified) {
    return (
      <div className="max-w-[720px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="glass-card overflow-hidden border-t-8 border-t-app-primary shadow-2xl">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-white/[0.04] bg-white/[0.01]">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
              Event Evaluation
            </h1>
            <p className="mt-2 text-app-text-secondary text-sm leading-relaxed opacity-80">
              Please verify your identity to proceed with the evaluation form.
            </p>
          </div>

          {/* Verification Form */}
          <div className="p-6 md:p-8">
            <div className="space-y-4">
              {/* Icon */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-app-primary/10 text-app-primary rounded-xl flex items-center justify-center border border-app-primary/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Student ID Verification</h3>
                  <p className="text-[10px] text-app-text-muted uppercase tracking-wider">
                    Attendance will be checked automatically
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-white/90">
                  Student ID <span className="text-app-danger">*</span>
                </label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={handleStudentIdChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleVerifyAttendance();
                    }
                  }}
                  className="w-full glass-input px-3.5 py-3 text-sm text-center tracking-[0.3em] font-mono"
                  placeholder="00-0000"
                  maxLength={7}
                  autoFocus
                />
              </div>

              {/* Error Message */}
              {verifyError && (
                <div className="p-4 bg-app-danger/10 border border-app-danger/20 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-app-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-app-danger text-xs leading-relaxed">
                      {verifyError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/[0.04]">
            <LoadingButton
              type="button"
              onClick={handleVerifyAttendance}
              isLoading={isVerifying}
              loadingText="Verifying..."
              size="lg"
              disabled={studentIdInput.length < 7}
            >
              Verify & Continue
            </LoadingButton>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVALUATION FORM (After Verification)
  // ─────────────────────────────────────────────────────────────────────────

  const progressPercent = totalPages > 1 ? ((currentPageIndex + 1) / totalPages) * 100 : 100;

  return (
    <div className="max-w-[720px] mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="glass-card overflow-hidden border-t-8 border-t-app-primary shadow-2xl"
        >
          {/* ── Verified Badge ── */}
          <div className="px-6 md:px-8 pt-4 pb-2 flex items-center gap-2">
            <div className="w-5 h-5 bg-app-success/20 text-app-success rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[10px] text-app-text-muted uppercase tracking-widest font-bold">
              Verified: {studentName} ({studentIdInput}) — {verifiedSession} Session
            </span>
          </div>

          {/* ── Progress Bar ── */}
          {totalPages > 1 && (
            <div className="h-1 bg-white/[0.04] relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-app-primary to-app-accent transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* ── Page Header ── */}
          <div className="p-6 md:p-8 border-b border-white/[0.04] bg-white/[0.01]">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {currentPage.title}
              </h1>
              {totalPages > 1 && (
                <span className="text-[10px] text-app-text-muted font-bold uppercase tracking-widest shrink-0 ml-4">
                  {currentPageIndex + 1} / {totalPages}
                </span>
              )}
            </div>
            {currentPage.description && (
              <p className="mt-2 text-app-text-secondary text-sm leading-relaxed max-w-2xl opacity-80">
                {currentPage.description}
              </p>
            )}
          </div>

          {/* ── Questions ── */}
          <div
            key={currentPage.id}
            className="divide-y divide-white/[0.04] animate-in fade-in slide-in-from-right-4 duration-500"
          >
            {((currentPage as any).questions || (currentPage as any).Questions || []).map((question: any) => (
              <div
                key={question.id}
                className="p-6 md:p-8 hover:bg-white/[0.01] transition-all duration-300"
              >
                <EvalQuestionRenderer question={question} />
              </div>
            ))}
          </div>

          {/* ── Error Display ── */}
          {submitError && (
            <div className="mx-6 md:mx-8 mb-4 p-4 bg-app-danger/10 border border-app-danger/20 text-app-danger rounded-xl text-xs animate-in slide-in-from-top-2">
              {submitError}
            </div>
          )}

          {/* ── Navigation Footer ── */}
          <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between gap-4">
            {!isFirstPage ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 text-[10px] text-app-text-secondary uppercase tracking-widest font-bold hover:text-white transition-colors disabled:opacity-20 py-2 px-3"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            ) : (
              <div />
            )}

            <LoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Submitting..."
              size="lg"
              fullWidth={false}
              className="md:px-12"
            >
              {isLastPage ? 'Submit Evaluation' : 'Next'}
            </LoadingButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EvaluationPage;
