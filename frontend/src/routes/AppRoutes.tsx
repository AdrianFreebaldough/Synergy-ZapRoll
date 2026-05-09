import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Lazy load pages for production optimization
const StudentRegistration = lazy(() => import('../pages/StudentRegistration'));
const EmployeeRegistration = lazy(() => import('../pages/EmployeeRegistration'));
const GuestRegistration = lazy(() => import('../pages/GuestRegistration'));
const SpeakerRegistration = lazy(() => import('../pages/SpeakerRegistration'));
const ParticipantRegistration = lazy(() => import('../pages/ParticipantRegistration'));
const SurveyPage = lazy(() => import('../pages/SurveyPage'));
const AttendanceEntry = lazy(() => import('../pages/attendance/AttendanceEntry'));
const NotFound = lazy(() => import('../pages/NotFound'));

// High-end loading fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-in fade-in duration-500">
    <div className="w-12 h-12 border-2 border-app-primary/20 border-t-app-primary rounded-full animate-spin" />
    <p className="text-[10px] text-app-text-muted uppercase tracking-[0.2em] font-bold">Initializing Portal</p>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <MainLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/register/student" replace />} />
          <Route path="/register/student" element={<StudentRegistration />} />
          <Route path="/register/employee" element={<EmployeeRegistration />} />
          <Route path="/register/guest" element={<GuestRegistration />} />
          <Route path="/register/speaker" element={<SpeakerRegistration />} />
          <Route path="/register/participant" element={<ParticipantRegistration />} />
          <Route path="/survey/:surveyId" element={<SurveyPage />} />
          <Route path="/attendance/:category" element={<AttendanceEntry />} />
          <Route path="/attendance" element={<Navigate to="/attendance/student" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

export default AppRoutes;
