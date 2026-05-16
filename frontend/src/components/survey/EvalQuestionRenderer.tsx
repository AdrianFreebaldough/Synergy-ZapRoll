import React from 'react';
import { EvalQuestion } from '../../types/survey';
import {
  HeaderBlock,
  PrivacyNotice,
  StarRating,
  EvalLikertTable,
  EvalShortText,
  EvalParagraph,
  EvalRadioGroup,
  EvalCheckboxGroup,
  EvalDropdown,
} from './EvalQuestionComponents';

interface EvalQuestionRendererProps {
  question: EvalQuestion;
}

/**
 * Dynamic Question Renderer — Maps mobile app question types to React components.
 * This is the "Switcher" described in the Developer Reference.
 */
const EvalQuestionRenderer: React.FC<EvalQuestionRendererProps> = ({ question }) => {
  const type = question.type?.toLowerCase();

  switch (type) {
    case 'header':
      return <HeaderBlock question={question} />;

    case 'privacy':
      return <PrivacyNotice question={question} />;

    case 'rating':
      return <StarRating question={question} />;

    case 'likert':
      return <EvalLikertTable question={question} />;

    case 'short_text':
    case 'text':
      return <EvalShortText question={question} />;

    case 'paragraph':
      return <EvalParagraph question={question} />;

    case 'radio':
    case 'choice':
      return <EvalRadioGroup question={question} />;

    case 'checkbox':
      return <EvalCheckboxGroup question={question} />;

    case 'dropdown':
      return <EvalDropdown question={question} />;

    default:
      return (
        <div className="p-4 border border-dashed border-white/10 rounded-xl text-[10px] text-app-text-muted uppercase tracking-widest text-center">
          Unsupported question type: {question.type}
        </div>
      );
  }
};

export default EvalQuestionRenderer;
