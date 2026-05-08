import React from 'react';
import { SurveyQuestion } from '../../types/survey';
import { 
  ShortText, 
  Paragraph, 
  RadioGroup, 
  CheckboxGroup, 
  DropdownField 
} from './QuestionComponents';
import { LikertTable, GridTable } from './GridComponents';

interface QuestionRendererProps {
  question: SurveyQuestion;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question }) => {
  switch (question.type) {
    case 'short_text':
      return <ShortText question={question} />;
    case 'paragraph':
      return <Paragraph question={question} />;
    case 'radio':
      return <RadioGroup question={question} />;
    case 'checkbox':
      return <CheckboxGroup question={question} />;
    case 'dropdown':
      return <DropdownField question={question} />;
    case 'likert':
    case 'linear_scale':
      return <LikertTable question={question} />;
    case 'grid_multiple_choice':
    case 'grid_checkbox':
      return <GridTable question={question} />;
    default:
      return (
        <div className="p-4 border border-dashed border-white/10 rounded-xl text-[10px] text-app-text-muted uppercase tracking-widest text-center">
          Unsupported question type: {question.type}
        </div>
      );
  }
};

export default QuestionRenderer;
