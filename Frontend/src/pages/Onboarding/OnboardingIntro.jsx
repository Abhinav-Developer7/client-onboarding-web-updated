import React from 'react';
import { Button } from '../../components/ui/Button';
import guideIntro from '../../assets/onboarding/guide-intro.png';
import './OnboardingIntro.css';

export const OnboardingIntro = ({ onContinue, isLeaving = false }) => {
  return (
    <div className={`onboarding-intro ${isLeaving ? 'is-leaving' : ''}`}>
      <div className="intro-content">
        <img
          src={guideIntro}
          alt=""
          className="intro-guide-image"
          aria-hidden="true"
        />

        <h1 className="intro-title display-title">Welcome to the Tortillon family</h1>
        <p className="intro-subtitle">
          A few quick details and you’re ready to get started with us.
        </p>

        <Button
          type="button"
          variant="primary"
          className="intro-continue-btn"
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
