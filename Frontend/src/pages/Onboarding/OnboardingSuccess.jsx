import React from 'react';
import { Link } from 'react-router-dom';
import guideSuccess from '../../assets/onboarding/guide-success.png';
import './OnboardingSuccess.css';

export const OnboardingSuccess = () => {
  return (
    <div className="success-page">
      <div className="success-message" role="status" aria-live="polite">
        <img
          src={guideSuccess}
          alt=""
          className="success-guide-image"
          aria-hidden="true"
        />
        <h1 className="success-title display-title">Onboarding submitted</h1>
        <p className="success-subtitle">
          Your client onboarding has been submitted successfully.
        </p>
        <Link to="/onboarding" className="btn btn-primary success-again-btn">
          Submit again
        </Link>
      </div>
    </div>
  );
};
