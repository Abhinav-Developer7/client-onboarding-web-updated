import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import './MonthlyClientsChart.css';

const buildSmoothLinePath = (points) => {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
};

export const MonthlyClientsChart = ({ data = [], loading = false }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const lineRef = useRef(null);
  const gradientId = useId().replace(/:/g, '');

  const chartData = useMemo(
    () =>
      data && data.length > 0
        ? data
        : [
            { name: 'Month 1', count: 0 },
            { name: 'Month 2', count: 0 },
            { name: 'Month 3', count: 0 },
            { name: 'Month 4', count: 0 },
            { name: 'Month 5', count: 0 },
            { name: 'Month 6', count: 0 }
          ],
    [data]
  );

  const width = 640;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const maxCount = Math.max(...chartData.map((d) => d.count), 4);
  const totalSubmissionsInPeriod = chartData.reduce((acc, d) => acc + d.count, 0);

  const points = useMemo(
    () =>
      chartData.map((d, index) => {
        const x = paddingX + (index / Math.max(chartData.length - 1, 1)) * innerWidth;
        const y = height - paddingY - (d.count / maxCount) * innerHeight;
        return { ...d, x, y, index };
      }),
    [chartData, innerHeight, innerWidth, maxCount]
  );

  const linePath = useMemo(() => buildSmoothLinePath(points), [points]);
  const areaPath = useMemo(() => {
    if (!points.length) return '';
    return `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }, [linePath, points]);

  useEffect(() => {
    setIsReady(false);
    const line = lineRef.current;
    if (!line) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const length = line.getTotalLength();
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = prefersReduced ? '0' : `${length}`;

    let frame = 0;
    frame = requestAnimationFrame(() => {
      setIsReady(true);
      if (!prefersReduced) {
        line.style.transition = 'stroke-dashoffset 1.15s cubic-bezier(0.22, 1, 0.36, 1)';
        line.style.strokeDashoffset = '0';
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [linePath]);

  if (loading) {
    return (
      <div className="chart-card saas-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <span className="chart-title">Onboarding volume</span>
            <span className="chart-subtitle">Monthly client submissions</span>
          </div>
        </div>
        <div className="skeleton-box chart-skeleton" />
      </div>
    );
  }

  return (
    <div className={`chart-card saas-card ${isReady ? 'chart-ready' : ''}`}>
      <div className="chart-header">
        <div className="chart-title-group">
          <div className="chart-title-row">
            <span className="chart-title">Onboarding volume</span>
            <span className="chart-badge">
              <TrendingUp size={14} />
              <span>{totalSubmissionsInPeriod} past 6 mo</span>
            </span>
          </div>
          <span className="chart-subtitle">Monthly client submissions</span>
        </div>
      </div>

      <div className="chart-body-wrapper">
        <div className="chart-svg-container">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="chart-svg"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Monthly onboarding submissions chart"
          >
            <defs>
              <linearGradient id={`chartGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.5, 1].map((ratio) => {
              const yVal = height - paddingY - ratio * innerHeight;
              const labelCount = Math.round(ratio * maxCount);
              return (
                <g key={ratio} className="chart-grid-group">
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={width - paddingX}
                    y2={yVal}
                    className="chart-grid-line"
                  />
                  <text
                    x={paddingX - 10}
                    y={yVal + 3}
                    textAnchor="end"
                    className="chart-axis-label"
                  >
                    {labelCount}
                  </text>
                </g>
              );
            })}

            <path
              d={areaPath}
              fill={`url(#chartGradient-${gradientId})`}
              className="chart-area"
            />

            <path
              ref={lineRef}
              d={linePath}
              fill="none"
              stroke="#0A0A0A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-line"
            />

            {points.map((pt) => {
              const isHovered = hoveredPoint?.index === pt.index;
              return (
                <g
                  key={pt.index}
                  className="chart-point-group"
                  style={{ '--point-index': pt.index }}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onFocus={() => setHoveredPoint(pt)}
                  onBlur={() => setHoveredPoint(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6.5 : 4.5}
                    className={`chart-point ${isHovered ? 'is-hovered' : ''}`}
                  />
                  <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" className="chart-hit-area" />
                </g>
              );
            })}

            {points.map((pt) => (
              <text
                key={`label-${pt.index}`}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className={`chart-month-label ${hoveredPoint?.index === pt.index ? 'active' : ''}`}
              >
                {pt.name}
              </text>
            ))}
          </svg>

          {hoveredPoint && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`
              }}
            >
              <span className="tooltip-month">{hoveredPoint.name}</span>
              <span className="tooltip-count">
                <strong>{hoveredPoint.count}</strong>{' '}
                {hoveredPoint.count === 1 ? 'client' : 'clients'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
