import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, AlertCircle } from 'lucide-react';
import { InputField } from '../../components/FormFields/InputField';
import { Button } from '../../components/ui/Button';
import tortillonLogo from '../../assets/tortillon-logo.png';
import './AdminLogin.css';

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: 'admin@company.com',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError('');

    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <header className="login-topbar">
        <Link to="/admin/login" className="login-top-brand" aria-label="Tortillon workspace">
          <img src={tortillonLogo} alt="Tortillon" className="brand-wordmark" />
        </Link>
      </header>

      <main className="login-shell">
        <section className="login-brand-panel" aria-hidden="false">
          <p className="login-eyebrow">Workspace</p>
          <h1 className="login-hero-title display-title">
            Sign in to review
            <span className="login-hero-break"> client onboarding.</span>
          </h1>
          <p className="login-hero-copy">
            Access submissions, verification status, and account details in one place.
          </p>
        </section>

        <section className="login-form-panel glass-panel">
          <div className="login-form-intro">
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-subtitle">Use your staff credentials to continue.</p>
          </div>

          {loginError && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              register={register}
              error={errors.email?.message}
              autoComplete="email"
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter password"
              required
              register={register}
              error={errors.password?.message}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="btn-login-submit"
              isLoading={isSubmitting}
            >
              <Lock size={16} />
              <span>Sign in</span>
            </Button>
          </form>

          <p className="dev-credentials-hint">
            Demo access: <code>admin@company.com</code> · <code>admin123456</code>
          </p>
        </section>
      </main>
    </div>
  );
};
