// Clean router-based App entry replacing previous monolithic component
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastProvider.jsx';

// Lazy loaded pages
const CheckinPage = lazy(() => import('./pages/CheckinPage.jsx'));
const EmployeeLoginPage = lazy(() => import('./pages/EmployeeLoginPage.jsx'));
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage.jsx'));
const OTRegistrationPage = lazy(() => import('./pages/OTRegistrationPage.jsx'));

// Employee Protected Route
function EmployeeProtectedRoute({ children }) {
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('employeeSessionId');
  return isLoggedIn ? children : <Navigate to="/employee-login" replace />;
}

function EmployeeLogout() {
  React.useEffect(() => {
    localStorage.removeItem('employeeSessionId');
    localStorage.removeItem('employeeSessionName');
  }, []);
  return <Navigate to="/employee-login" replace />;
}

export default function AppRouter() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
          <Routes>
            <Route path="/employee-login" element={<EmployeeLoginPage />} />
            <Route path="/employee-logout" element={<EmployeeLogout />} />
            <Route
              path="/"
              element={
                <EmployeeProtectedRoute>
                  <CheckinPage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="/employee-profile"
              element={
                <EmployeeProtectedRoute>
                  <EmployeeProfilePage />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="/ot-registration"
              element={
                <EmployeeProtectedRoute>
                  <OTRegistrationPage />
                </EmployeeProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  );
}