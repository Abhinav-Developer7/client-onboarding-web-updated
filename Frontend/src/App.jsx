import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Header } from './components/Header/Header';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { PageShimmer } from './components/ui/Shimmer';
import { OnboardingShimmer } from './components/ui/OnboardingShimmer';
import './App.css';

const OnboardingWizard = lazy(() =>
  import('./pages/Onboarding/OnboardingWizard').then((m) => ({ default: m.OnboardingWizard }))
);
const OnboardingSuccess = lazy(() =>
  import('./pages/Onboarding/OnboardingSuccess').then((m) => ({ default: m.OnboardingSuccess }))
);
const AdminLogin = lazy(() =>
  import('./pages/Admin/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./pages/Admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const ClientsPage = lazy(() =>
  import('./pages/Admin/ClientsPage').then((m) => ({ default: m.ClientsPage }))
);
const ClientDetailsPage = lazy(() =>
  import('./pages/Admin/ClientDetailsPage').then((m) => ({ default: m.ClientDetailsPage }))
);

const PageLoader = () => <PageShimmer label="Loading…" />;
const OnboardingLoader = () => <OnboardingShimmer />;

const PublicLayout = ({ children }) => (
  <div className="app-layout">
    <Header />
    <main className="app-main">{children}</main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          <Route
            path="/onboarding"
            element={
              <PublicLayout>
                <Suspense fallback={<OnboardingLoader />}>
                  <OnboardingWizard />
                </Suspense>
              </PublicLayout>
            }
          />
          <Route
            path="/confirmation/:referenceId"
            element={
              <PublicLayout>
                <Suspense fallback={<OnboardingLoader />}>
                  <OnboardingSuccess />
                </Suspense>
              </PublicLayout>
            }
          />

          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminLogin />
              </Suspense>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="clients"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClientsPage />
                </Suspense>
              }
            />
            <Route
              path="clients/:id"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ClientDetailsPage />
                </Suspense>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
