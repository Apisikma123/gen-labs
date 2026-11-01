'use client';

import React from 'react';

interface ScientificWorkflowGraphicProps {
  className?: string;
  activeStep?: number; // 0: Tanya, 1: Coba, 2: Amati, 3: Pahami
}

/**
 * Empirical Scientific Discovery Workflow Diagram
 * Scientific illustration: The 4-phase laboratory learning cycle
 * 1. Hypothesis Formulation (H0)
 * 2. Parameter Variation (Delta-theta)
 * 3. Empirical Telemetry Acquisition (Sensor Data)
 * 4. Conceptual Law Validation (Q.E.D.)
 */
export function ScientificWorkflowGraphic({
  className = 'w-full h-24',
  activeStep = 0,
}: ScientificWorkflowGraphicProps) {
  const steps = [
    { num: '01', title: 'TANYA', formula: 'H₀: Prinsip', color: '#4B8F8C', x: 60 },
    { num: '02', title: 'COBA', formula: 'Δθ: Variasi', color: '#BA8230', x: 160 },
    { num: '03', title: 'AMATI', formula: '∫dt: Telemetri', color: '#4B8F8C', x: 260 },
    { num: '04', title: 'PAHAMI', formula: 'Q.E.D: Valid', color: '#E6ECE8', x: 360 },
  ];

  return (
    <svg
      viewBox="0 0 420 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Diagram Alur Metode Ilmiah Eksperimen Empiris Laboratorium"
    >
      <defs>
        <pattern id="wf-graticule" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" stroke="#2B3025" strokeWidth="0.5" strokeOpacity="0.4" />
        </pattern>
        <marker id="wf-cyan-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#4B8F8C" />
        </marker>
        <marker id="wf-ochre-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 1 L 5 3 L 0 5 Z" fill="#BA8230" />
        </marker>
      </defs>

      {/* Recessed Ground Surface */}
      <rect width="420" height="80" rx="8" fill="#0E1410" />
      <rect width="420" height="80" rx="8" fill="url(#wf-graticule)" />
      <rect x="0.5" y="0.5" width="419" height="79" rx="7.5" stroke="#2B3025" strokeWidth="1" />

      {/* Longitudinal Main Bus Beam */}
      <line x1="40" y1="40" x2="380" y2="40" stroke="#1D4838" strokeWidth="2" strokeLinecap="round" />
      <line
        x1="40"
        y1="40"
        x2={steps[activeStep].x}
        y2="40"
        stroke="#4B8F8C"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transition: 'x2 450ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Inter-node Connector Arrows */}
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={steps[i].x + 28}
          y1="40"
          x2={steps[i + 1].x - 28}
          y2="40"
          stroke={activeStep > i ? '#4B8F8C' : '#2B3025'}
          strokeWidth="1.2"
          markerEnd={activeStep > i ? 'url(#wf-cyan-arr)' : undefined}
          strokeDasharray={activeStep > i ? undefined : '2 2'}
        />
      ))}

      {/* 4 Step Apparatus Nodes */}
      {steps.map((st, idx) => {
        const isCurrent = activeStep === idx;
        const isPast = activeStep > idx;

        return (
          <g key={st.num} transform={`translate(${st.x}, 40)`}>
            {/* Outer Orbit Reticle */}
            <circle
              cx="0"
              cy="0"
              r={isCurrent ? '18' : '14'}
              fill="#151B16"
              stroke={isCurrent ? '#BA8230' : isPast ? '#4B8F8C' : '#2B3025'}
              strokeWidth={isCurrent ? '1.8' : '1.2'}
              style={{
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Inner Core */}
            <circle
              cx="0"
              cy="0"
              r={isCurrent ? '5' : '3'}
              fill={isCurrent ? '#BA8230' : isPast ? '#4B8F8C' : '#1D241E'}
              style={{
                transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Step Number Top Label */}
            <text
              x="0"
              y="-24"
              fill={isCurrent ? '#BA8230' : isPast ? '#4B8F8C' : '#8FA396'}
              fontSize="6.5"
              fontFamily="Space Mono, monospace"
              fontWeight="700"
              textAnchor="middle"
            >
              {st.num} // {st.title}
            </text>

            {/* Step Formula Bottom Tag */}
            <text
              x="0"
              y="28"
              fill={isCurrent ? '#E6ECE8' : '#8FA396'}
              fontSize="6"
              fontFamily="Space Mono, monospace"
              textAnchor="middle"
              opacity={isCurrent ? '1' : '0.7'}
            >
              {st.formula}
            </text>
          </g>
        );
      })}

      {/* Top Left Telemetry Reticle */}
      <text x="12" y="14" fill="#8FA396" fontSize="6" fontFamily="Space Mono, monospace" opacity="0.8">
        METODOLOGI LABORATORIUM // TAHAP {steps[activeStep].num}
      </text>

      {/* Top Right Status Tag */}
      <text x="408" y="14" fill="#4B8F8C" fontSize="6" fontFamily="Space Mono, monospace" textAnchor="end">
        SIKLUS PENEMUAN TERVALIDASI
      </text>
    </svg>
  );
}
