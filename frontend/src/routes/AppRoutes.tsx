import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StudentRegistration from '../pages/StudentRegistration';
import EmployeeRegistration from '../pages/EmployeeRegistration';
import GuestRegistration from '../pages/GuestRegistration';
import SpeakerRegistration from '../pages/SpeakerRegistration';
import ParticipantRegistration from '../pages/ParticipantRegistration';
import SurveyPage from '../pages/SurveyPage';

const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/register/student" element={<StudentRegistration />} />
        <Route path="/register/employee" element={<EmployeeRegistration />} />
        <Route path="/register/guest" element={<GuestRegistration />} />
        <Route path="/register/speaker" element={<SpeakerRegistration />} />
        <Route path="/register/participant" element={<ParticipantRegistration />} />
        <Route path="/survey/:surveyId" element={<SurveyPage />} />
        <Route path="*" element={<Navigate to="/register/student" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default AppRoutes;
