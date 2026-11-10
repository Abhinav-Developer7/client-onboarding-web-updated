import React from 'react';
import './Shimmer.css';

export const ShimmerBlock = ({ className = '', style }) => (
  <div className={`skeleton-box shimmer-block ${className}`.trim()} style={style} aria-hidden="true" />
);

export const ShimmerRow = ({ lines = 3 }) => (
  <div className="shimmer-row" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <ShimmerBlock key={i} className={`shimmer-line shimmer-line-${(i % 3) + 1}`} />
    ))}
  </div>
);

export const PageShimmer = ({ label = 'Loading…' }) => (
  <div className="page-shimmer-shell" role="status" aria-live="polite" aria-label={label}>
    <div className="page-shimmer-card glass-panel">
      <div className="page-shimmer-top">
        <ShimmerBlock className="shimmer-avatar" />
        <div className="page-shimmer-top-copy">
          <ShimmerBlock className="shimmer-title" />
          <ShimmerBlock className="shimmer-meta" />
        </div>
      </div>
      <ShimmerRow lines={4} />
      <div className="page-shimmer-actions">
        <ShimmerBlock className="shimmer-chip" />
        <ShimmerBlock className="shimmer-chip" />
        <ShimmerBlock className="shimmer-chip is-wide" />
      </div>
    </div>
  </div>
);

export const DetailShimmer = () => (
  <div className="detail-shimmer" aria-busy="true" aria-label="Loading client profile">
    <div className="detail-shimmer-identity glass-panel">
      <ShimmerBlock className="shimmer-back" />
      <div className="detail-shimmer-title-stack">
        <ShimmerBlock className="shimmer-title is-lg" />
        <div className="detail-shimmer-meta-row">
          <ShimmerBlock className="shimmer-chip" />
          <ShimmerBlock className="shimmer-meta" />
        </div>
      </div>
    </div>

    <div className="detail-shimmer-grid">
      <div className="detail-shimmer-main">
        {[0, 1, 2].map((i) => (
          <div key={i} className="detail-shimmer-card glass-panel">
            <div className="detail-shimmer-card-head">
              <ShimmerBlock className="shimmer-icon" />
              <ShimmerBlock className="shimmer-section-title" />
            </div>
            <div className="detail-shimmer-fields">
              <ShimmerBlock className="shimmer-field" />
              <ShimmerBlock className="shimmer-field" />
              <ShimmerBlock className="shimmer-field is-wide" />
            </div>
          </div>
        ))}
      </div>

      <aside className="detail-shimmer-card glass-panel detail-shimmer-side">
        <ShimmerBlock className="shimmer-section-title" />
        <ShimmerBlock className="shimmer-meta" />
        <ShimmerBlock className="shimmer-field is-full" />
        <ShimmerBlock className="shimmer-field is-tall is-full" />
        <ShimmerBlock className="shimmer-action" />
      </aside>
    </div>
  </div>
);
