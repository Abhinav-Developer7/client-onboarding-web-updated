import React from 'react';
import { ShimmerBlock } from './Shimmer';
import './OnboardingShimmer.css';

export const OnboardingShimmer = () => (
  <div className="oshimmer-page" aria-busy="true" aria-label="Loading onboarding">
    <div className="oshimmer-shell glass-panel">
      <div className="oshimmer-stepper">
        {[0, 1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <div className="oshimmer-step">
              <ShimmerBlock className="oshimmer-dot" />
              <ShimmerBlock className="oshimmer-step-label" />
            </div>
            {i < 3 ? <div className="oshimmer-connector" aria-hidden="true" /> : null}
          </React.Fragment>
        ))}
      </div>

      <div className="oshimmer-body">
        <aside className="oshimmer-guide" aria-hidden="true">
          <ShimmerBlock className="oshimmer-guide-figure" />
          <ShimmerBlock className="oshimmer-guide-caption" />
        </aside>

        <div className="oshimmer-form">
          <div className="oshimmer-form-header">
            <ShimmerBlock className="oshimmer-form-title" />
            <ShimmerBlock className="oshimmer-form-sub" />
          </div>

          <div className="oshimmer-fields">
            <ShimmerBlock className="oshimmer-field" />
            <div className="oshimmer-field-row">
              <ShimmerBlock className="oshimmer-field" />
              <ShimmerBlock className="oshimmer-field" />
            </div>
            <div className="oshimmer-field-row">
              <ShimmerBlock className="oshimmer-field" />
              <ShimmerBlock className="oshimmer-field" />
            </div>
          </div>

          <div className="oshimmer-actions">
            <ShimmerBlock className="oshimmer-btn" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
