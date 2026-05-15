// =============================================================================
// Survey Types — Aligned with Mobile App JSON Contract
// =============================================================================

/**
 * All question types the mobile app can produce.
 * The QuestionRenderer must handle every one of these.
 */
export type EvalQuestionType =
  | 'header'
  | 'privacy'
  | 'rating'
  | 'likert'
  | 'text'
  | 'short_text'
  | 'paragraph'
  | 'radio'
  | 'checkbox'
  | 'dropdown'
  | 'linear_scale'
  | 'grid_multiple_choice'
  | 'grid_checkbox';

/**
 * A single question inside a Page, as defined by the mobile app.
 */
export interface EvalQuestion {
  id: string;
  type: EvalQuestionType;
  label: string;
  required: boolean;
  /** Used by likert questions — array of statement strings */
  statements: string[];
  /** Used by radio/checkbox/dropdown — array of option strings */
  options?: string[];
  /** Optional description/subtitle */
  description?: string;
  /** Optional subtype (e.g., 'email' for text questions) */
  subtype?: string;
  /** Grid config (rows/cols) for legacy web-created surveys */
  config?: {
    min_label?: string;
    max_label?: string;
    scale_start?: number;
    scale_end?: number;
    rows?: { id: string; label: string }[];
    cols?: { id: string; label: string }[];
  };
}

/**
 * A Page (section) in the evaluation form.
 * The mobile app groups questions into pages.
 */
export interface EvalPage {
  id: string;
  title: string;
  description?: string;
  questions: EvalQuestion[];
}

/**
 * The full evaluation template fetched from the backend.
 */
export interface EvaluationTemplate {
  id: string;
  event_id: string;
  title?: string;
  questions: EvalPage[];
  is_active: boolean;
  /** DB column: 'am-eval' | 'pm-eval' — identifies which session this template belongs to */
  session_type?: 'am-eval' | 'pm-eval';
  created_at?: string;
}

// ---------------------------------------------------------------------------
// Legacy types kept for backward compatibility with old survey components
// ---------------------------------------------------------------------------
export type QuestionType =
  | 'short_text'
  | 'paragraph'
  | 'radio'
  | 'checkbox'
  | 'dropdown'
  | 'linear_scale'
  | 'likert'
  | 'grid_multiple_choice'
  | 'grid_checkbox';

export interface SurveyOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  order_index: number;
}

export interface QuestionConfig {
  min_label?: string;
  max_label?: string;
  scale_start?: number;
  scale_end?: number;
  rows?: { id: string; label: string }[];
  cols?: { id: string; label: string }[];
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  order_index: number;
  config?: QuestionConfig;
  options?: SurveyOption[];
}

export interface SurveyMetadata {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed';
  questions: SurveyQuestion[];
}

export interface SurveyAnswer {
  question_id: string;
  answer_value: any;
}

export interface SurveyResponseSubmission {
  survey_id: string;
  answers: SurveyAnswer[];
}
