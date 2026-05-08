import React from 'react';
import RegistrationForm from '../components/forms/RegistrationForm';

const SpeakerRegistration: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <RegistrationForm category="speaker" title="Speaker Registration" />
    </div>
  );
};

export default SpeakerRegistration;
