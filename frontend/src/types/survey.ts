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
  rows?: { id: string; label: string }[]; // For grids/likert
  cols?: { id: string; label: string }[]; // For grids/likert
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
  answer_value: any; // Can be string, string[], or record
}

export interface SurveyResponseSubmission {
  survey_id: string;
  answers: SurveyAnswer[];
}
