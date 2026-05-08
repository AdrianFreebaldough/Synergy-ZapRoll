import React from 'react';
import RegistrationForm from '../components/forms/RegistrationForm';

const ParticipantRegistration: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <RegistrationForm category="participant" title="General Participant Registration" />
    </div>
  );
};

export default ParticipantRegistration;
