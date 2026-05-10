import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import StudentRegistration from './pages/StudentRegistration';
import WalkInRegistration from './pages/WalkInRegistration';
import EmployeeRegistration from './pages/EmployeeRegistration';
import GuestRegistration from './pages/GuestRegistration';
import ParticipantRegistration from './pages/ParticipantRegistration';
import AttendanceEntry from './pages/attendance/AttendanceEntry';
import SurveyPage from './pages/SurveyPage';
import NotFound from './pages/NotFound';
import InvalidLink from './pages/error/InvalidLink';
import { verifyRouteToken } from './services/tokenService';

/**
 * Traffic controller for Registration pages
 */
export const RegistrationRouter: React.FC<{ subType?: string }> = ({ subType }) => {
  switch (subType) {
    case 'STUDENT': return <StudentRegistration />;
    case 'STUDENT_WALK_IN': return <WalkInRegistration />;
    case 'EMPLOYEE': return <EmployeeRegistration />;
    case 'GUEST': return <GuestRegistration />;
    case 'PARTICIPANT': return <ParticipantRegistration />;
    default: return <Navigate to="/invalid-link" replace />;
  }
};

/**
 * Traffic controller for Attendance pages
 */
export const AttendanceRouter: React.FC<{ subType?: string }> = ({ subType }) => {
  return <AttendanceEntry subType={subType} />;
};

interface TokenGuardProps {
  children: React.ReactElement;
  requiredType: 'REGISTRATION' | 'ATTENDANCE' | 'SURVEY';
}

const TokenGuard: React.FC<TokenGuardProps> = ({ children, requiredType }) => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [subType, setSubType] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      const result = await verifyRouteToken(token);

      if (result.valid && result.type === requiredType) {
        setSubType(result.subType);
        setStatus('valid');
      } else {
        setStatus('invalid');
      }
    };

    checkToken();
  }, [token, requiredType]);

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-app-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-app-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (status === 'invalid') return <Navigate to="/invalid-link" replace />;

  return React.cloneElement(children, { subType });
};

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/invalid-link" replace />} />
          
          {/* Dynamic Protected Registration */}
          <Route path="/register/:token" element={
            <TokenGuard requiredType="REGISTRATION">
              <RegistrationRouter />
            </TokenGuard>
          } />

          {/* Dynamic Protected Attendance */}
          <Route path="/attendance/:token" element={
            <TokenGuard requiredType="ATTENDANCE">
              <AttendanceRouter />
            </TokenGuard>
          } />

          {/* Protected Survey */}
          <Route path="/survey/:token" element={
            <TokenGuard requiredType="SURVEY">
              <SurveyPage />
            </TokenGuard>
          } />

          <Route path="/invalid-link" element={<InvalidLink />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
