'use client';

import React from 'react';

export interface Icon3dProps extends React.SVGAttributes<SVGElement> {
  size?: number | string;
  className?: string;
  title?: string;
  interactive?: boolean;
}

/**
 * Tanya AI Neural Core
 */
export function Icon3dAiCore({ size = 64, className = '', title = 'Tanya AI Neural Core', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-ai-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="60%" stopColor="#000000" stopOpacity="0.2"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <radialGradient id="r-ai-glass-body" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stopColor="#A2E5E1" stopOpacity="0.95"/>
      <stop offset="35%" stopColor="#4B8F8C" stopOpacity="0.85"/>
      <stop offset="70%" stopColor="#14463F" stopOpacity="0.92"/>
      <stop offset="100%" stopColor="#082522" stopOpacity="0.98"/>
    </radialGradient>
    <radialGradient id="r-ai-core-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#C2FAF5" stopOpacity="1"/>
      <stop offset="40%" stopColor="#4B8F8C" stopOpacity="0.7"/>
      <stop offset="100%" stopColor="#0E1410" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-ai-specular-main" x1="28%" y1="18%" x2="55%" y2="48%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
      <stop offset="50%" stopColor="#E0FAF8" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#4B8F8C" stopOpacity="0"/>
    </linearGradient>
    <linearGradient id="r-ai-rim-bounce" x1="75%" y1="85%" x2="45%" y2="55%">
      <stop offset="0%" stopColor="#BA8230" stopOpacity="0.45"/>
      <stop offset="50%" stopColor="#4B8F8C" stopOpacity="0.2"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </linearGradient>
    <linearGradient id="r-ai-glass-rim" x1="20%" y1="15%" x2="85%" y2="88%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8"/>
      <stop offset="30%" stopColor="#8ED3CF" stopOpacity="0.5"/>
      <stop offset="70%" stopColor="#1D4838" stopOpacity="0.3"/>
      <stop offset="100%" stopColor="#64E5DD" stopOpacity="0.75"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="42" ry="9" fill="url(#r-ai-shadow)"/>
  <path d="M64 16C37.49 16 16 36.6 16 62C16 73.18 20.16 83.43 27.12 91.31C25.68 97.48 22.88 103.54 18.28 108.52C17.48 109.38 18.04 110.74 19.2 110.74C28.44 110.74 36.88 106.84 43.12 101.44C49.44 105.56 56.48 108 64 108C90.51 108 112 87.4 112 62C112 36.6 90.51 16 64 16Z" fill="url(#r-ai-glass-body)"/>
  <path d="M64 17.5C38.32 17.5 17.5 37.43 17.5 62C17.5 72.84 21.52 82.78 28.25 90.41L29.08 91.35L28.64 92.54C27.38 95.96 25.5 99.47 23 102.77C27.91 101.95 32.74 99.88 36.98 96.65L37.94 95.92L38.99 96.53C46.3 100.8 54.85 103.25 64 103.25C89.68 103.25 110.5 83.32 110.5 62C110.5 37.43 89.68 17.5 64 17.5Z" stroke="url(#r-ai-glass-rim)" strokeWidth="2.5" fill="none"/>
  <path d="M64 16C37.49 16 16 36.6 16 62C16 73.18 20.16 83.43 27.12 91.31C25.68 97.48 22.88 103.54 18.28 108.52C17.48 109.38 18.04 110.74 19.2 110.74C28.44 110.74 36.88 106.84 43.12 101.44C49.44 105.56 56.48 108 64 108C90.51 108 112 87.4 112 62C112 36.6 90.51 16 64 16Z" fill="url(#r-ai-rim-bounce)"/>
  <g transform="translate(64, 58)">
    <circle cx="0" cy="0" r="26" fill="url(#r-ai-core-glow)"/>
    <path d="M0 -18L18 0L0 18L-18 0Z" stroke="#8ED3CF" strokeWidth="1.75" strokeDasharray="3 2" fill="none" opacity="0.8"/>
    <path d="M0 -12L12 0L0 12L-12 0Z" fill="#2E706B" stroke="#A2E5E1" strokeWidth="1.5"/>
    <path d="M0 -12L12 0L0 0Z" fill="#C2FAF5" opacity="0.6"/>
    <path d="M0 0L12 0L0 12Z" fill="#14463F" opacity="0.8"/>
    <circle cx="0" cy="0" r="3.5" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="1.5" fill="#4B8F8C"/>
    <circle cx="-18" cy="0" r="2" fill="#C2FAF5"/>
    <circle cx="18" cy="0" r="2" fill="#C2FAF5"/>
    <circle cx="0" cy="-18" r="2" fill="#C2FAF5"/>
    <circle cx="0" cy="18" r="2" fill="#C2FAF5"/>
  </g>
  <path d="M42 24C52 20.5 64 20.5 74 23C78 24 81 26 79 28C77 30 73 29 68 28C58 26.5 48 27.5 39 32C36 33.5 33 32 34 29C35 26.5 38 25 42 24Z" fill="#FFFFFF" opacity="0.85"/>
  <ellipse cx="36" cy="46" rx="11" ry="20" transform="rotate(-30 36 46)" fill="url(#r-ai-specular-main)"/>
  <circle cx="48" cy="32" r="2.5" fill="#FFFFFF" opacity="0.95"/>
    </svg>
  );
}

/**
/**
 * Kinetic Physics & Atomic Energy Orbital
 * High-precision atomic quantum core with intersecting Bohr orbital shells and glowing photon nodes.
 */
export function Icon3dPhysicsEnergy({ size = 64, className = '', title = 'Kinetic Physics Energy', ...props }: Icon3dProps) {
  const rawId = React.useId();
  const id = rawId.replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={`phys-shadow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
          <stop offset="65%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`phys-core-glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A2E5E1" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#4B8F8C" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#1C332A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1C332A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`phys-nucleus-${id}`} cx="35%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#4EAA8F" />
          <stop offset="65%" stopColor="#3E8E75" />
          <stop offset="90%" stopColor="#1C332A" />
          <stop offset="100%" stopColor="#0C1410" />
        </radialGradient>
        <linearGradient id={`phys-ring-1-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A2E5E1" />
          <stop offset="50%" stopColor="#4EAA8F" />
          <stop offset="100%" stopColor="#1C332A" />
        </linearGradient>
        <linearGradient id={`phys-ring-2-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4B8F8C" />
          <stop offset="50%" stopColor="#3E8E75" />
          <stop offset="100%" stopColor="#14171E" />
        </linearGradient>
        <linearGradient id={`phys-ring-3-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="50%" stopColor="#BA8230" />
          <stop offset="100%" stopColor="#5B3900" />
        </linearGradient>
      </defs>

      {/* Shadow Base */}
      <ellipse cx="64" cy="116" rx="36" ry="8" fill={`url(#phys-shadow-${id})`} />

      {/* Orbital Ring 1: -35 deg */}
      <ellipse
        cx="64"
        cy="64"
        rx="50"
        ry="18"
        transform="rotate(-35 64 64)"
        stroke={`url(#phys-ring-1-${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Orbital Ring 2: +35 deg */}
      <ellipse
        cx="64"
        cy="64"
        rx="50"
        ry="18"
        transform="rotate(35 64 64)"
        stroke={`url(#phys-ring-2-${id})`}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Orbital Ring 3: 90 deg (Vertical) with dashed precision telemetry */}
      <ellipse
        cx="64"
        cy="64"
        rx="50"
        ry="18"
        transform="rotate(90 64 64)"
        stroke={`url(#phys-ring-3-${id})`}
        strokeWidth="2.5"
        strokeDasharray="8 5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Energy Nucleus Outer Aura */}
      <circle cx="64" cy="64" r="26" fill={`url(#phys-core-glow-${id})`} />

      {/* Central Solid Quantum Nucleus */}
      <circle cx="64" cy="64" r="14" fill={`url(#phys-nucleus-${id})`} stroke="#4EAA8F" strokeWidth="1.5" />
      <circle cx="60" cy="59" r="3.5" fill="#FFFFFF" opacity="0.85" />

      {/* Quantum Photon Nodes (Electrons) */}
      {/* Node on Ring 1 */}
      <circle cx="98" cy="40" r="5" fill="#A2E5E1" stroke="#0C0E12" strokeWidth="1.5" />
      <circle cx="96.5" cy="38.5" r="1.5" fill="#FFFFFF" />

      {/* Node on Ring 2 */}
      <circle cx="30" cy="40" r="4.5" fill="#4B8F8C" stroke="#0C0E12" strokeWidth="1.5" />
      <circle cx="28.5" cy="38.5" r="1.5" fill="#FFFFFF" />

      {/* Node on Ring 3 */}
      <circle cx="64" cy="14" r="4" fill="#F5D061" stroke="#0C0E12" strokeWidth="1.5" />
      <circle cx="63" cy="13" r="1.2" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Volumetric Chemistry Flask
 */
export function Icon3dChemistryFlask({ size = 64, className = '', title = 'Volumetric Chemistry Flask', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-chem-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-chem-glass-body" x1="15%" y1="15%" x2="85%" y2="85%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35"/>
      <stop offset="35%" stopColor="#8ED3CF" stopOpacity="0.15"/>
      <stop offset="70%" stopColor="#1D4838" stopOpacity="0.25"/>
      <stop offset="100%" stopColor="#0E1410" stopOpacity="0.4"/>
    </linearGradient>
    <linearGradient id="r-chem-liquid-body" x1="50%" y1="52%" x2="50%" y2="108%">
      <stop offset="0%" stopColor="#8ED3CF"/>
      <stop offset="30%" stopColor="#4B8F8C"/>
      <stop offset="75%" stopColor="#1D4838"/>
      <stop offset="100%" stopColor="#0C241B"/>
    </linearGradient>
    <linearGradient id="r-chem-meniscus" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#C2FAF5"/>
      <stop offset="50%" stopColor="#8ED3CF"/>
      <stop offset="100%" stopColor="#4B8F8C"/>
    </linearGradient>
    <linearGradient id="r-chem-specular-edge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
      <stop offset="50%" stopColor="#C2FAF5" stopOpacity="0.4"/>
      <stop offset="100%" stopColor="#4B8F8C" stopOpacity="0"/>
    </linearGradient>
    <linearGradient id="r-chem-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFF3DC"/>
      <stop offset="50%" stopColor="#BA8230"/>
      <stop offset="100%" stopColor="#5B3900"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="40" ry="9" fill="url(#r-chem-shadow)"/>
  <path d="M54 18H74V48L104 98C106.5 102 103.5 108 98 108H30C24.5 108 21.5 102 24 98L54 48V18Z" fill="url(#r-chem-glass-body)"/>
  <path d="M38.5 74H89.5L98 98C100 101.5 98 106 94 106H34C30 106 28 101.5 30 98L38.5 74Z" fill="url(#r-chem-liquid-body)"/>
  <ellipse cx="64" cy="74" rx="25.5" ry="5.5" fill="url(#r-chem-meniscus)"/>
  <circle cx="56" cy="94" r="3.5" fill="#C2FAF5" opacity="0.8"/>
  <circle cx="55" cy="93" r="1.2" fill="#FFFFFF"/>
  <circle cx="72" cy="86" r="2.5" fill="#C2FAF5" opacity="0.7"/>
  <circle cx="62" cy="82" r="1.8" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="78" cy="98" r="4.5" fill="#8ED3CF" opacity="0.6"/>
  <line x1="48" y1="88" x2="55" y2="88" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  <line x1="51" y1="78" x2="57" y2="78" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  <line x1="53" y1="68" x2="58" y2="68" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  <path d="M54 18H74V48L104 98C106.5 102 103.5 108 98 108H30C24.5 108 21.5 102 24 98L54 48V18Z" stroke="#8ED3CF" strokeWidth="2" strokeLinejoin="round" fill="none" opacity="0.7"/>
  <rect x="50" y="14" width="28" height="5" rx="2.5" fill="#C2FAF5" stroke="#FFFFFF" strokeWidth="1.5"/>
  <ellipse cx="64" cy="16.5" rx="11" ry="2" fill="#14463F"/>
  <path d="M52 22L28 96C27 99 28.5 102 32 102L34 100L56 24V22H52Z" fill="url(#r-chem-specular-edge)"/>
  <path d="M55 24H58V46L62 52L58 54L55 48V24Z" fill="#FFFFFF" opacity="0.7"/>
  <g transform="translate(94, 38)">
    <polygon points="0,-14 12,-7 12,7 0,14 -12,7 -12,-7" fill="none" stroke="url(#r-chem-gold-ring)" strokeWidth="2.5"/>
    <circle cx="0" cy="0" r="4.5" fill="url(#r-chem-gold-ring)"/>
    <circle cx="0" cy="-14" r="2.5" fill="#FFE2B3"/>
    <circle cx="12" cy="7" r="2.5" fill="#FFE2B3"/>
    <circle cx="-12" cy="7" r="2.5" fill="#FFE2B3"/>
  </g>
    </svg>
  );
}

/**
 * Obsidian Logic Microprocessor
 */
export function Icon3dCsMatrix({ size = 64, className = '', title = 'Obsidian Logic Microprocessor', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-cs-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.5"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.2"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-cs-chassis" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#363B2F"/>
      <stop offset="25%" stopColor="#22281D"/>
      <stop offset="60%" stopColor="#151B16"/>
      <stop offset="100%" stopColor="#090D0A"/>
    </linearGradient>
    <linearGradient id="r-cs-top-facet" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stopColor="#4B5344"/>
      <stop offset="50%" stopColor="#2B3226"/>
      <stop offset="100%" stopColor="#181E15"/>
    </linearGradient>
    <linearGradient id="r-cs-gold-pin" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#643F00"/>
      <stop offset="25%" stopColor="#FBBA63"/>
      <stop offset="60%" stopColor="#FFF3DC"/>
      <stop offset="85%" stopColor="#DDA14C"/>
      <stop offset="100%" stopColor="#382000"/>
    </linearGradient>
    <radialGradient id="r-cs-silicon-die" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#2D5A4C"/>
      <stop offset="40%" stopColor="#15362B"/>
      <stop offset="80%" stopColor="#0A1E17"/>
      <stop offset="100%" stopColor="#05100C"/>
    </radialGradient>
    <linearGradient id="r-cs-rim-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
      <stop offset="30%" stopColor="#CAD5CD" stopOpacity="0.6"/>
      <stop offset="70%" stopColor="#414944" stopOpacity="0.2"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0.7"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="46" ry="9" fill="url(#r-cs-shadow)"/>
  <g fill="url(#r-cs-gold-pin)">
    <rect x="36" y="10" width="7" height="12" rx="2"/>
    <rect x="49" y="10" width="7" height="12" rx="2"/>
    <rect x="62" y="10" width="7" height="12" rx="2"/>
    <rect x="75" y="10" width="7" height="12" rx="2"/>
    <rect x="88" y="10" width="7" height="12" rx="2"/>
    <rect x="36" y="102" width="7" height="12" rx="2"/>
    <rect x="49" y="102" width="7" height="12" rx="2"/>
    <rect x="62" y="102" width="7" height="12" rx="2"/>
    <rect x="75" y="102" width="7" height="12" rx="2"/>
    <rect x="88" y="102" width="7" height="12" rx="2"/>
    <rect x="10" y="36" width="12" height="7" rx="2"/>
    <rect x="10" y="49" width="12" height="7" rx="2"/>
    <rect x="10" y="62" width="12" height="7" rx="2"/>
    <rect x="10" y="75" width="12" height="7" rx="2"/>
    <rect x="10" y="88" width="12" height="7" rx="2"/>
    <rect x="106" y="36" width="12" height="7" rx="2"/>
    <rect x="106" y="49" width="12" height="7" rx="2"/>
    <rect x="106" y="62" width="12" height="7" rx="2"/>
    <rect x="106" y="75" width="12" height="7" rx="2"/>
    <rect x="106" y="88" width="12" height="7" rx="2"/>
  </g>
  <rect x="20" y="20" width="88" height="88" rx="18" fill="url(#r-cs-chassis)"/>
  <rect x="20.5" y="20.5" width="87" height="87" rx="17.5" stroke="url(#r-cs-rim-light)" strokeWidth="2.5" fill="none"/>
  <rect x="25" y="25" width="78" height="78" rx="14" fill="url(#r-cs-top-facet)"/>
  <rect x="36" y="36" width="56" height="56" rx="10" fill="url(#r-cs-silicon-die)" stroke="#4B8F8C" strokeWidth="1.5"/>
  <g stroke="#8ED3CF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
    <path d="M44 48H52L58 54H68"/>
    <path d="M84 48H76L70 54"/>
    <path d="M44 80H52L58 74H70L76 80H84"/>
    <path d="M64 36V44"/>
    <path d="M64 84V92"/>
  </g>
  <rect x="58" y="58" width="12" height="12" rx="3" fill="#A2E5E1" stroke="#FFFFFF" strokeWidth="1.5"/>
  <circle cx="64" cy="64" r="2" fill="#003735"/>
  <path d="M38 42C44 38 52 38 60 40L88 68V76L48 36H40L38 42Z" fill="#FFFFFF" opacity="0.45"/>
  <circle cx="28" cy="28" r="2.5" fill="#FFFFFF" opacity="0.9"/>
  <line x1="28" y1="21" x2="42" y2="21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
    </svg>
  );
}

/**
 * Verified Equilibrium Proof
 */
export function Icon3dVerifiedEquilibrium({ size = 64, className = '', title = 'Verified Equilibrium Proof', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-ver-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-ver-shield-body" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stopColor="#3C7F6B"/>
      <stop offset="35%" stopColor="#1D4838"/>
      <stop offset="75%" stopColor="#123528"/>
      <stop offset="100%" stopColor="#081A13"/>
    </linearGradient>
    <linearGradient id="r-ver-check-front" x1="25%" y1="15%" x2="75%" y2="85%">
      <stop offset="0%" stopColor="#FFFFFF"/>
      <stop offset="30%" stopColor="#C2FAF5"/>
      <stop offset="70%" stopColor="#4B8F8C"/>
      <stop offset="100%" stopColor="#1D554D"/>
    </linearGradient>
    <linearGradient id="r-ver-check-depth" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#14463F"/>
      <stop offset="50%" stopColor="#0A2823"/>
      <stop offset="100%" stopColor="#041210"/>
    </linearGradient>
    <linearGradient id="r-ver-rim-light" x1="10%" y1="10%" x2="90%" y2="90%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
      <stop offset="35%" stopColor="#8ED3CF" stopOpacity="0.6"/>
      <stop offset="70%" stopColor="#1D4838" stopOpacity="0.3"/>
      <stop offset="100%" stopColor="#A2E5E1" stopOpacity="0.8"/>
    </linearGradient>
    <linearGradient id="r-ver-specular" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
      <stop offset="60%" stopColor="#C2FAF5" stopOpacity="0.3"/>
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="38" ry="9" fill="url(#r-ver-shadow)"/>
  <path d="M64 14L102 28C102 64 86 98 64 110C42 98 26 64 26 28L64 14Z" fill="url(#r-ver-shield-body)"/>
  <path d="M64 16.5L99.5 29.5C99.5 63.5 84.5 95.5 64 107C43.5 95.5 28.5 63.5 28.5 29.5L64 16.5Z" stroke="url(#r-ver-rim-light)" strokeWidth="2.5" fill="none"/>
  <path d="M64 22L92 32C92 60 80 88 64 98C48 88 36 60 36 32L64 22Z" fill="#0D251C" opacity="0.6"/>
  <path d="M54 78L40 64L48 56L55 63L85 33L93 41L54 80Z" fill="url(#r-ver-check-depth)"/>
  <g transform="translate(-1, -2)">
    <path d="M54 78L36 60C34 58 34 54 37 52C40 50 44 50 46 53L54 61L86 29C88 27 92 27 94 29C96 31 96 35 94 37L56 75C55 77 53 78 51 78C52 78 53 78 54 78Z" fill="url(#r-ver-check-front)" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M38 54L46 62L88 30" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
  </g>
  <path d="M38 24C46 19 55 17 64 16.5C73 17 82 19 90 24" stroke="url(#r-ver-specular)" strokeWidth="3" strokeLinecap="round" fill="none"/>
  <circle cx="34" cy="30" r="2.5" fill="#FFFFFF" opacity="0.95"/>
  <circle cx="64" cy="18" r="3" fill="#FFFFFF" opacity="0.95"/>
    </svg>
  );
}

/**
 * Market Quant Candlestick
 */
export function Icon3dQuantCandlestick({ size = 64, className = '', title = 'Market Quant Candlestick', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-quant-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.5"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.2"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-quant-gold-cyl" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#5B3900"/>
      <stop offset="18%" stopColor="#DDA14C"/>
      <stop offset="42%" stopColor="#FFF5DE"/>
      <stop offset="65%" stopColor="#FBBA63"/>
      <stop offset="85%" stopColor="#BA8230"/>
      <stop offset="100%" stopColor="#462B00"/>
    </linearGradient>
    <radialGradient id="r-quant-gold-top" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#FFFFFF"/>
      <stop offset="40%" stopColor="#FFF3DC"/>
      <stop offset="80%" stopColor="#DDA14C"/>
      <stop offset="100%" stopColor="#8C5800"/>
    </radialGradient>
    <linearGradient id="r-quant-sage-body" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#14463F"/>
      <stop offset="20%" stopColor="#4B8F8C"/>
      <stop offset="45%" stopColor="#A2E5E1"/>
      <stop offset="70%" stopColor="#4B8F8C"/>
      <stop offset="90%" stopColor="#1D4838"/>
      <stop offset="100%" stopColor="#082522"/>
    </linearGradient>
    <radialGradient id="r-quant-sage-cap" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#FFFFFF"/>
      <stop offset="45%" stopColor="#A2E5E1"/>
      <stop offset="85%" stopColor="#4B8F8C"/>
      <stop offset="100%" stopColor="#1D4838"/>
    </radialGradient>
    <linearGradient id="r-quant-wick" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#5B3900"/>
      <stop offset="40%" stopColor="#FFFFFF"/>
      <stop offset="70%" stopColor="#DDA14C"/>
      <stop offset="100%" stopColor="#382000"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="42" ry="9" fill="url(#r-quant-shadow)"/>
  <rect x="52" y="12" width="4.5" height="24" rx="2.25" fill="url(#r-quant-wick)"/>
  <circle cx="54.25" cy="12" r="2.25" fill="#FFF5DE"/>
  <g transform="translate(18, 0)">
    <rect x="22" y="32" width="28" height="52" fill="url(#r-quant-sage-body)"/>
    <ellipse cx="36" cy="84" rx="14" ry="4.5" fill="#082522"/>
    <ellipse cx="36" cy="32" rx="14" ry="4.5" fill="url(#r-quant-sage-cap)"/>
    <rect x="27" y="33" width="3.5" height="50" rx="1.75" fill="#FFFFFF" opacity="0.85"/>
  </g>
  <rect x="52" y="84" width="4.5" height="24" rx="2.25" fill="url(#r-quant-wick)"/>
  <circle cx="54.25" cy="108" r="2.25" fill="#DDA14C"/>
  <g transform="translate(68, 16)">
    <rect x="14" y="6" width="3.5" height="16" rx="1.75" fill="url(#r-quant-wick)"/>
    <rect x="14" y="48" width="3.5" height="16" rx="1.75" fill="url(#r-quant-wick)"/>
    <rect x="6" y="20" width="19" height="30" fill="url(#r-quant-gold-cyl)"/>
    <ellipse cx="15.5" cy="50" rx="9.5" ry="3" fill="#462B00"/>
    <ellipse cx="15.5" cy="20" rx="9.5" ry="3" fill="url(#r-quant-gold-top)"/>
    <rect x="9.5" y="21" width="2" height="28" rx="1" fill="#FFFFFF" opacity="0.9"/>
  </g>
  <g transform="translate(26, 78) rotate(-15)">
    <ellipse cx="0" cy="5" rx="16" ry="10" fill="#5B3900"/>
    <rect x="-16" y="0" width="32" height="5" fill="url(#r-quant-gold-cyl)"/>
    <ellipse cx="0" cy="5" rx="16" ry="7" fill="#8C5800"/>
    <ellipse cx="0" cy="0" rx="16" ry="9" fill="url(#r-quant-gold-top)"/>
    <ellipse cx="0" cy="0" rx="12" ry="6.5" stroke="#BA8230" strokeWidth="1.5" fill="none"/>
    <path d="M-2 -3C-2 -4 0 -5 2 -5C4 -5 5 -4 5 -3C5 -1.5 3 -1 0 0C-3 1 -5 2 -5 4C-5 6 -3 7 0 7C3 7 5 6 5 4.5" stroke="#462B00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M-8 -5C-4 -7 2 -7 8 -5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9"/>
    <circle cx="-6" cy="-4" r="1.5" fill="#FFFFFF"/>
  </g>
  <path d="M34 76C44 64 56 60 74 46L86 38" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" opacity="0.6"/>
  <polygon points="86,34 94,37 89,44" fill="#FFFFFF" opacity="0.9"/>
    </svg>
  );
}

/**
 * Biology Molecular DNA Helix
 */
export function Icon3dBiologyDna({ size = 64, className = '', title = 'Biology Molecular DNA Helix', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-dna-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-dna-strand-1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#A2E5E1"/>
      <stop offset="40%" stopColor="#4B8F8C"/>
      <stop offset="100%" stopColor="#14463F"/>
    </linearGradient>
    <linearGradient id="r-dna-strand-2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFDDB5"/>
      <stop offset="40%" stopColor="#BA8230"/>
      <stop offset="100%" stopColor="#5B3900"/>
    </linearGradient>
    <radialGradient id="r-dna-node" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#FFFFFF"/>
      <stop offset="45%" stopColor="#8ED3CF"/>
      <stop offset="100%" stopColor="#1D4838"/>
    </radialGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="38" ry="9" fill="url(#r-dna-shadow)"/>
  {/* Helix Base Rungs */}
  <g strokeLinecap="round" strokeWidth="3">
    <line x1="36" y1="28" x2="92" y2="40" stroke="#BA8230" opacity="0.7"/>
    <line x1="42" y1="46" x2="86" y2="58" stroke="#4B8F8C" opacity="0.8"/>
    <line x1="50" y1="64" x2="78" y2="64" stroke="#FFF2D6" opacity="0.9"/>
    <line x1="42" y1="82" x2="86" y2="70" stroke="#BA8230" opacity="0.8"/>
    <line x1="36" y1="100" x2="92" y2="88" stroke="#4B8F8C" opacity="0.7"/>
  </g>
  {/* Primary Strand A (Sage Glass) */}
  <path d="M36 24C48 40 80 44 92 64C80 84 48 88 36 104" stroke="url(#r-dna-strand-1)" strokeWidth="8" strokeLinecap="round" fill="none"/>
  <path d="M36 24C48 40 80 44 92 64C80 84 48 88 36 104" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.75"/>
  {/* Primary Strand B (Warm Ochre) */}
  <path d="M92 24C80 40 48 44 36 64C48 84 80 88 92 104" stroke="url(#r-dna-strand-2)" strokeWidth="8" strokeLinecap="round" fill="none"/>
  <path d="M92 24C80 40 48 44 36 64C48 84 80 88 92 104" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
  {/* Sphere Nodes on Intersections */}
  <circle cx="36" cy="24" r="5.5" fill="url(#r-dna-node)"/>
  <circle cx="92" cy="24" r="5.5" fill="#FBBA63"/>
  <circle cx="64" cy="64" r="6.5" fill="#FFFFFF"/>
  <circle cx="36" cy="104" r="5.5" fill="url(#r-dna-node)"/>
  <circle cx="92" cy="104" r="5.5" fill="#FBBA63"/>
    </svg>
  );
}

/**
 * Mathematical Function & Calculus
 */
export function Icon3dMathFunction({ size = 64, className = '', title = 'Mathematical Function & Calculus', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-math-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-math-curve" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFF2D6"/>
      <stop offset="30%" stopColor="#BA8230"/>
      <stop offset="70%" stopColor="#4B8F8C"/>
      <stop offset="100%" stopColor="#14463F"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="42" ry="9" fill="url(#r-math-shadow)"/>
  {/* 3D Coordinate Graticule Grid Plate */}
  <polygon points="64,28 108,52 64,76 20,52" fill="#151B16" stroke="#2B3025" strokeWidth="2"/>
  <line x1="64" y1="28" x2="64" y2="76" stroke="#2B3025" strokeWidth="1.5"/>
  <line x1="20" y1="52" x2="108" y2="52" stroke="#2B3025" strokeWidth="1.5"/>
  {/* Coordinate Axis Spindles */}
  <line x1="64" y1="20" x2="64" y2="100" stroke="#8FA396" strokeWidth="2.5" strokeLinecap="round"/>
  <polygon points="64,14 60,22 68,22" fill="#8FA396"/>
  {/* Dimensional Polynomial Curve Tube */}
  <path d="M24 82C36 82 44 26 64 26C84 26 92 82 104 82" stroke="#0A2823" strokeWidth="9" strokeLinecap="round" fill="none"/>
  <path d="M24 80C36 80 44 24 64 24C84 24 92 80 104 80" stroke="url(#r-math-curve)" strokeWidth="7" strokeLinecap="round" fill="none"/>
  <path d="M24 80C36 80 44 24 64 24C84 24 92 80 104 80" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85"/>
  {/* Tangent Extrema Pin */}
  <circle cx="64" cy="24" r="5" fill="#FFFFFF"/>
  <circle cx="64" cy="24" r="2.5" fill="#BA8230"/>
    </svg>
  );
}

/**
 * Voice Telemetry Microphone
 */
export function Icon3dMic({ size = 64, className = '', title = 'Voice Telemetry Microphone', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-mic-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-mic-capsule" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#14463F"/>
      <stop offset="25%" stopColor="#4B8F8C"/>
      <stop offset="50%" stopColor="#C2FAF5"/>
      <stop offset="75%" stopColor="#4B8F8C"/>
      <stop offset="100%" stopColor="#082522"/>
    </linearGradient>
    <linearGradient id="r-mic-stand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#363B2F"/>
      <stop offset="50%" stopColor="#CAD5CD"/>
      <stop offset="100%" stopColor="#151B16"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="34" ry="8" fill="url(#r-mic-shadow)"/>
  {/* Microphone Capsule Body */}
  <rect x="48" y="18" width="32" height="48" rx="16" fill="url(#r-mic-capsule)"/>
  {/* Capsule Specular Glint */}
  <rect x="52" y="24" width="4" height="34" rx="2" fill="#FFFFFF" opacity="0.85"/>
  <ellipse cx="64" cy="22" rx="10" ry="3" fill="#FFFFFF" opacity="0.9"/>
  {/* Mesh Texture Rings */}
  <line x1="48" y1="36" x2="80" y2="36" stroke="#082522" strokeWidth="1.5" opacity="0.7"/>
  <line x1="48" y1="46" x2="80" y2="46" stroke="#082522" strokeWidth="1.5" opacity="0.7"/>
  {/* U-Bracket Cradle (3D Wireframe) */}
  <path d="M40 46C40 68 50 78 64 78C78 78 88 68 88 46" stroke="url(#r-mic-stand)" strokeWidth="5" strokeLinecap="round" fill="none"/>
  {/* Vertical Stem */}
  <rect x="61.5" y="78" width="5" height="24" rx="2.5" fill="url(#r-mic-stand)"/>
  {/* Base Pedestal */}
  <ellipse cx="64" cy="104" rx="24" ry="7" fill="url(#r-mic-stand)"/>
  <ellipse cx="64" cy="102" rx="20" ry="5.5" fill="#4B8F8C" opacity="0.8"/>
    </svg>
  );
}

/**
 * Curriculum & Module Guide Book
 */
export function Icon3dBookModule({ size = 64, className = '', title = 'Curriculum & Module Guide Book', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-book-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-book-cover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2D5A4C"/>
      <stop offset="40%" stopColor="#1D4838"/>
      <stop offset="100%" stopColor="#0E241B"/>
    </linearGradient>
    <linearGradient id="r-book-pages" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#FFFFFF"/>
      <stop offset="40%" stopColor="#E6ECE8"/>
      <stop offset="80%" stopColor="#CAD5CD"/>
      <stop offset="100%" stopColor="#8FA396"/>
    </linearGradient>
    <linearGradient id="r-book-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFF3DC"/>
      <stop offset="50%" stopColor="#BA8230"/>
      <stop offset="100%" stopColor="#5B3900"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="44" ry="9" fill="url(#r-book-shadow)"/>
  {/* Book Back Cover */}
  <path d="M22 84L64 98L106 84L106 88L64 102L22 88Z" fill="#0C1D16"/>
  {/* Paper Edge Block (Stepped Layer Volume) */}
  <path d="M24 40L64 54L104 40V80L64 94L24 80Z" fill="url(#r-book-pages)"/>
  <path d="M24 80L64 94L104 80L104 84L64 98L24 84Z" fill="#CAD5CD"/>
  {/* Top Open Pages */}
  <path d="M24 40C40 44 54 48 64 54C74 48 88 44 104 40L100 36C86 40 72 44 64 48C56 44 42 40 28 36Z" fill="#FFFFFF"/>
  {/* Left Page Leaf */}
  <path d="M26 38C40 42 52 46 63 52V88C52 82 40 78 26 74Z" fill="#FFFFFF"/>
  {/* Right Page Leaf */}
  <path d="M65 52C76 46 88 42 102 38V74C88 78 76 82 65 88Z" fill="#F4F7F5"/>
  {/* Center Gold Bookmark Ribbon */}
  <path d="M62 48V106L66 102L70 106V48Z" fill="url(#r-book-gold)"/>
  {/* Golden Nexus Emblem on Cover */}
  <polygon points="64,20 72,25 64,30 56,25" fill="url(#r-book-gold)"/>
    </svg>
  );
}

/**
 * Prismatic Exploration Compass
 */
export function Icon3dCompassExplore({ size = 64, className = '', title = 'Prismatic Exploration Compass', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-comp-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-comp-dial" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2D5A4C"/>
      <stop offset="50%" stopColor="#151B16"/>
      <stop offset="100%" stopColor="#090D0A"/>
    </linearGradient>
    <linearGradient id="r-comp-needle-n" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFB4AB"/>
      <stop offset="50%" stopColor="#D9534F"/>
      <stop offset="100%" stopColor="#690005"/>
    </linearGradient>
    <linearGradient id="r-comp-needle-s" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF"/>
      <stop offset="50%" stopColor="#CAD5CD"/>
      <stop offset="100%" stopColor="#414944"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="40" ry="9" fill="url(#r-comp-shadow)"/>
  {/* Outer Brass Ring */}
  <circle cx="64" cy="62" r="46" fill="#BA8230"/>
  <circle cx="64" cy="62" r="44" fill="#5B3900"/>
  <circle cx="64" cy="60" r="44" fill="url(#r-comp-dial)" stroke="#FFF2D6" strokeWidth="2"/>
  {/* Degree Graduations */}
  <circle cx="64" cy="60" r="36" stroke="#4B8F8C" strokeWidth="1.5" strokeDasharray="2 6" fill="none"/>
  {/* Dynamic 3D Needle (North Diamond) */}
  <polygon points="64,26 71,58 64,60" fill="url(#r-comp-needle-n)"/>
  <polygon points="64,26 57,58 64,60" fill="#FFB4AB"/>
  {/* Dynamic 3D Needle (South Diamond) */}
  <polygon points="64,94 71,62 64,60" fill="url(#r-comp-needle-s)"/>
  <polygon points="64,94 57,62 64,60" fill="#E6ECE8"/>
  {/* Center Jewel Hub */}
  <circle cx="64" cy="60" r="5" fill="#FFFFFF"/>
  <circle cx="64" cy="60" r="2.5" fill="#BA8230"/>
  {/* Specular Lens Curve */}
  <path d="M34 40C42 30 54 24 68 22" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85"/>
    </svg>
  );
}

/**
 * Obsidian Precision Gear
 */
export function Icon3dGearSettings({ size = 64, className = '', title = 'Obsidian Precision Gear', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-gear-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.5"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.2"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-gear-metal" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stopColor="#4B5344"/>
      <stop offset="30%" stopColor="#2B3226"/>
      <stop offset="70%" stopColor="#151B16"/>
      <stop offset="100%" stopColor="#080C09"/>
    </linearGradient>
    <linearGradient id="r-gear-rim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
      <stop offset="40%" stopColor="#8FA396" stopOpacity="0.5"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0.7"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="42" ry="9" fill="url(#r-gear-shadow)"/>
  {/* 6-Tooth Chamfered Spur Gear Silhouette */}
  <path d="M54 18H74L77 30C82 32 86 35 90 38L101 32L111 49L102 58C103 63 103 67 102 72L111 81L101 98L90 92C86 95 82 98 77 100L74 112H54L51 100C46 98 42 95 38 92L27 98L17 81L26 72C25 67 25 63 26 58L17 49L27 32L38 38C42 35 46 32 51 30L54 18Z" fill="url(#r-gear-metal)"/>
  {/* Chamfer Bevel Stroke */}
  <path d="M54 18H74L77 30C82 32 86 35 90 38L101 32L111 49L102 58C103 63 103 67 102 72L111 81L101 98L90 92C86 95 82 98 77 100L74 112H54L51 100C46 98 42 95 38 92L27 98L17 81L26 72C25 67 25 63 26 58L17 49L27 32L38 38C42 35 46 32 51 30L54 18Z" stroke="url(#r-gear-rim)" strokeWidth="2.5" fill="none"/>
  {/* Central Recessed Bore Hole */}
  <circle cx="64" cy="65" r="16" fill="#080C09" stroke="#4B8F8C" strokeWidth="1.5"/>
  <circle cx="64" cy="65" r="12" fill="#0E1410"/>
  {/* Top Specular Highlight Arc */}
  <path d="M56 22H72" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="34" cy="40" r="2" fill="#FFFFFF"/>
    </svg>
  );
}

/**
 * Laboratory Cryptographic Lock
 */
export function Icon3dLockSecure({ size = 64, className = '', title = 'Laboratory Cryptographic Lock', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-lock-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.5"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.2"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-lock-body" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4B8F8C"/>
      <stop offset="35%" stopColor="#1D4838"/>
      <stop offset="80%" stopColor="#14382A"/>
      <stop offset="100%" stopColor="#081A13"/>
    </linearGradient>
    <linearGradient id="r-lock-shackle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#363B2F"/>
      <stop offset="25%" stopColor="#CAD5CD"/>
      <stop offset="50%" stopColor="#FFFFFF"/>
      <stop offset="75%" stopColor="#8FA396"/>
      <stop offset="100%" stopColor="#151B16"/>
    </linearGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="38" ry="9" fill="url(#r-lock-shadow)"/>
  {/* Metallic Shackle U-Bar */}
  <path d="M42 56V34C42 22 52 14 64 14C76 14 86 22 86 34V56" stroke="url(#r-lock-shackle)" strokeWidth="12" strokeLinecap="round" fill="none"/>
  {/* Shackle Specular Glint */}
  <path d="M42 34C42 24 50 18 64 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
  {/* Chunky Enameled Lock Body */}
  <rect x="28" y="52" width="72" height="56" rx="18" fill="url(#r-lock-body)"/>
  {/* Lock Body Bevel Rim */}
  <rect x="29" y="53" width="70" height="54" rx="17" stroke="#A2E5E1" strokeWidth="2" fill="none" opacity="0.6"/>
  {/* Keyhole Slot */}
  <circle cx="64" cy="74" r="6" fill="#081A13"/>
  <polygon points="61,74 67,74 68,88 60,88" fill="#081A13"/>
  {/* Primary Specular Softbox Highlight */}
  <path d="M38 58C46 55 54 55 62 55" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
  <rect x="34" y="66" width="3" height="34" rx="1.5" fill="#FFFFFF" opacity="0.8"/>
    </svg>
  );
}

/**
 * Dual-Beveled Gold Star
 */
export function Icon3dStarAward({ size = 64, className = '', title = 'Dual-Beveled Gold Star', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-star-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <linearGradient id="r-star-outer" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFF5DE"/>
      <stop offset="25%" stopColor="#DDA14C"/>
      <stop offset="60%" stopColor="#BA8230"/>
      <stop offset="100%" stopColor="#462B00"/>
    </linearGradient>
    <radialGradient id="r-star-inner" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stopColor="#FFFDF8"/>
      <stop offset="40%" stopColor="#FFDDB5"/>
      <stop offset="85%" stopColor="#DDA14C"/>
      <stop offset="100%" stopColor="#8C5800"/>
    </radialGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="40" ry="8.5" fill="url(#r-star-shadow)"/>
  {/* Outer Raised Golden Star Rim */}
  <path d="M64 12L78 44L112 48L86 72L94 106L64 88L34 106L42 72L16 48L50 44L64 12Z" fill="url(#r-star-outer)" stroke="#FFF5DE" strokeWidth="2" strokeLinejoin="round"/>
  {/* Recessed Inner Facet */}
  <path d="M64 24L74 48L100 52L80 70L86 96L64 82L42 96L48 70L28 52L54 48L64 24Z" fill="url(#r-star-inner)" stroke="#BA8230" strokeWidth="1.5" strokeLinejoin="round"/>
  {/* Specular Hotspot on Top Tip */}
  <circle cx="64" cy="14" r="3" fill="#FFFFFF"/>
  <circle cx="112" cy="48" r="2.5" fill="#FFFFFF"/>
  <circle cx="16" cy="48" r="2.5" fill="#FFFFFF"/>
    </svg>
  );
}

/**
 * Laboratory Telemetry Bell
 */
export function Icon3dBellAlert({ size = 64, className = '', title = 'Laboratory Telemetry Bell', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-bell-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <radialGradient id="r-bell-body" cx="36%" cy="30%" r="72%">
      <stop offset="0%" stopColor="#FFF2D6"/>
      <stop offset="25%" stopColor="#FBBA63"/>
      <stop offset="65%" stopColor="#BA8230"/>
      <stop offset="90%" stopColor="#6B4100"/>
      <stop offset="100%" stopColor="#382000"/>
    </radialGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="40" ry="9" fill="url(#r-bell-shadow)"/>
  {/* Bell Top Crown Knob */}
  <circle cx="64" cy="18" r="7" fill="#BA8230" stroke="#FFF2D6" strokeWidth="1.5"/>
  {/* Flared Bell Dome Body */}
  <path d="M64 22C46 22 36 40 34 68C32 82 22 92 20 96C20 99 23 102 28 102H100C105 102 108 99 108 96C106 92 96 82 94 68C92 40 82 22 64 22Z" fill="url(#r-bell-body)"/>
  {/* Flared Base Rim Lip */}
  <ellipse cx="64" cy="98" rx="42" ry="7" fill="#462B00"/>
  <ellipse cx="64" cy="98" rx="40" ry="5.5" fill="#BA8230"/>
  {/* Interior Clapper Tongue */}
  <circle cx="64" cy="100" r="8" fill="#FFF2D6" stroke="#462B00" strokeWidth="2"/>
  {/* Specular Studio Stripe */}
  <path d="M48 28C42 42 40 60 40 78" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9"/>
  <circle cx="58" cy="26" r="2.5" fill="#FFFFFF"/>
    </svg>
  );
}

/**
 * Alabaster Cloud Platform
 */
export function Icon3dCloudStorage({ size = 64, className = '', title = 'Alabaster Cloud Platform', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
    <radialGradient id="r-cloud-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#000000" stopOpacity="0.4"/>
      <stop offset="65%" stopColor="#000000" stopOpacity="0.15"/>
      <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
    </radialGradient>
    <radialGradient id="r-cloud-body" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stopColor="#FFFFFF"/>
      <stop offset="50%" stopColor="#E6ECE8"/>
      <stop offset="85%" stopColor="#CAD5CD"/>
      <stop offset="100%" stopColor="#8FA396"/>
    </radialGradient>
  </defs>
  <ellipse cx="64" cy="116" rx="42" ry="8.5" fill="url(#r-cloud-shadow)"/>
  {/* Pillowy Smooth 3D Cloud Lobe Volume */}
  <path d="M42 98H90C103 98 114 88 114 75C114 63 105 53 94 52C92 34 77 20 58 20C42 20 28 32 26 48C14 50 6 60 6 72C6 86 18 98 32 98H42Z" fill="url(#r-cloud-body)"/>
  {/* Upper Lobes Studio Highlight */}
  <path d="M48 24C52 22 56 22 62 23" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
  <path d="M84 54C88 53 94 54 98 56" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
  {/* Underside Cool Ambient Occlusion */}
  <path d="M28 92C48 95 80 95 98 92" stroke="#8FA396" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

/**
 * Spectrometer Optical Prism & Spectral Dispersion
 */
export function Icon3dSpectrometerPrism({ size = 64, className = '', title = 'Spectrometer Optical Prism', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id="r-prism-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
          <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="r-prism-front-left" x1="25%" y1="15%" x2="70%" y2="85%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
          <stop offset="25%" stopColor="#C2FAF5" stopOpacity="0.8"/>
          <stop offset="60%" stopColor="#4B8F8C" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#14463F" stopOpacity="0.85"/>
        </linearGradient>
        <linearGradient id="r-prism-front-right" x1="40%" y1="20%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#8ED3CF" stopOpacity="0.7"/>
          <stop offset="45%" stopColor="#1D4838" stopOpacity="0.85"/>
          <stop offset="85%" stopColor="#0E241B" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#081812" stopOpacity="0.98"/>
        </linearGradient>
        <linearGradient id="r-prism-apex-gleam" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
          <stop offset="50%" stopColor="#C2FAF5" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#4B8F8C" stopOpacity="0.2"/>
        </linearGradient>
        <linearGradient id="r-dispersion-spectrum" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
          <stop offset="30%" stopColor="#4B8F8C" stopOpacity="0.85"/>
          <stop offset="65%" stopColor="#3E8E75" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#BA8230" stopOpacity="0.95"/>
        </linearGradient>
        <linearGradient id="r-incident-beam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0"/>
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95"/>
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="116" rx="44" ry="9" fill="url(#r-prism-shadow)"/>
      <path d="M12 36L44 62" stroke="url(#r-incident-beam)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
      <circle cx="44" cy="62" r="2.5" fill="#FFFFFF"/>
      <path d="M78 68L116 52" stroke="#4B8F8C" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <path d="M80 72L118 64" stroke="#69E39A" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <path d="M82 76L116 78" stroke="#BA8230" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
      <polygon points="78,68 116,52 118,64 116,78 82,76" fill="url(#r-dispersion-spectrum)" opacity="0.18"/>
      <polygon points="64,18 26,98 64,106" fill="url(#r-prism-front-left)"/>
      <polygon points="64,18 64,106 102,94" fill="url(#r-prism-front-right)"/>
      <path d="M44 62L64 74L79 70" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" fill="none" opacity="0.75"/>
      <circle cx="64" cy="74" r="2" fill="#C2FAF5" opacity="0.9"/>
      <polygon points="64,18 26,98 64,106" stroke="#C2FAF5" strokeWidth="1.25" strokeOpacity="0.4" fill="none"/>
      <polygon points="64,18 64,106 102,94" stroke="#64E5DD" strokeWidth="1.25" strokeOpacity="0.3" fill="none"/>
      <line x1="64" y1="18" x2="64" y2="106" stroke="url(#r-prism-apex-gleam)" strokeWidth="2"/>
      <path d="M60 26L34 88" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
      <circle cx="64" cy="18" r="3" fill="#FFFFFF"/>
    </svg>
  );
}

/**
 * Precision Inertial Gyroscope Apparatus
 */
export function Icon3dGyroscopeApparatus({ size = 64, className = '', title = 'Precision Gyroscope Apparatus', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id="r-gyro-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45"/>
          <stop offset="65%" stopColor="#000000" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="r-gyro-brass-outer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3DC"/>
          <stop offset="25%" stopColor="#DDA14C"/>
          <stop offset="60%" stopColor="#BA8230"/>
          <stop offset="85%" stopColor="#6B4100"/>
          <stop offset="100%" stopColor="#2D1A00"/>
        </linearGradient>
        <linearGradient id="r-gyro-inner-ring" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E0FAF8"/>
          <stop offset="35%" stopColor="#4B8F8C"/>
          <stop offset="70%" stopColor="#1D4838"/>
          <stop offset="100%" stopColor="#0C241B"/>
        </linearGradient>
        <radialGradient id="r-gyro-rotor" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF8EC"/>
          <stop offset="30%" stopColor="#E8B868"/>
          <stop offset="70%" stopColor="#BA8230"/>
          <stop offset="92%" stopColor="#5E3802"/>
          <stop offset="100%" stopColor="#321D00"/>
        </radialGradient>
        <linearGradient id="r-gyro-spindle" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8FA396"/>
          <stop offset="35%" stopColor="#FFFFFF"/>
          <stop offset="70%" stopColor="#D0DDD4"/>
          <stop offset="100%" stopColor="#55695C"/>
        </linearGradient>
        <linearGradient id="r-gyro-vector" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C2FAF5"/>
          <stop offset="100%" stopColor="#4B8F8C"/>
        </linearGradient>
      </defs>
      <ellipse cx="64" cy="116" rx="42" ry="8.5" fill="url(#r-gyro-shadow)"/>
      <path d="M52 110C52 108 56 106 64 106C72 106 76 108 76 110L74 114C74 115 70 116 64 116C58 116 54 115 54 114Z" fill="#1B221E"/>
      <rect x="62" y="94" width="4" height="13" rx="2" fill="url(#r-gyro-spindle)"/>
      <path d="M46 96C46 94 82 94 82 96L78 100C78 102 50 102 50 100Z" fill="#2E3832"/>
      <ellipse cx="64" cy="58" rx="46" ry="46" stroke="url(#r-gyro-brass-outer)" strokeWidth="4.5" fill="none"/>
      <ellipse cx="64" cy="58" rx="38" ry="19" transform="rotate(55 64 58)" stroke="url(#r-gyro-inner-ring)" strokeWidth="3.5" fill="none"/>
      <g transform="rotate(-25 64 58)">
        <ellipse cx="64" cy="62" rx="28" ry="10" fill="#4B2E04"/>
        <ellipse cx="64" cy="58" rx="28" ry="10" fill="url(#r-gyro-rotor)"/>
        <ellipse cx="64" cy="58" rx="28" ry="10" stroke="#FFF3DC" strokeWidth="1.2" strokeOpacity="0.8" fill="none"/>
        <ellipse cx="64" cy="58" rx="19" ry="6.5" stroke="#BA8230" strokeWidth="1.5" fill="none" opacity="0.7"/>
        <ellipse cx="64" cy="58" rx="9" ry="3.5" fill="#4B2E04"/>
      </g>
      <line x1="64" y1="18" x2="64" y2="98" stroke="url(#r-gyro-spindle)" strokeWidth="4.5" strokeLinecap="round"/>
      <circle cx="64" cy="18" r="3.5" fill="#BA8230"/>
      <circle cx="64" cy="18" r="1.5" fill="#FFFFFF"/>
      <circle cx="64" cy="98" r="3" fill="#BA8230"/>
      <path d="M64 22L64 8" stroke="url(#r-gyro-vector)" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="64,4 60,11 68,11" fill="#C2FAF5"/>
      <path d="M42 45C48 38 72 38 84 46" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" opacity="0.85"/>
      <polygon points="86,48 83,43 88,43" fill="#FFFFFF"/>
    </svg>
  );
}

/**
 * AI Credit Token — Beveled ochre coin with lightning bolt emblem
 */
export function Icon3dAiCredit({ size = 64, className = '', title = 'AI Credit Token', ...props }: Icon3dProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 select-none align-middle ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id="r-credit-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5"/>
          <stop offset="60%" stopColor="#000000" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="r-credit-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF5DE"/>
          <stop offset="20%" stopColor="#E8B868"/>
          <stop offset="50%" stopColor="#BA8230"/>
          <stop offset="80%" stopColor="#6B4100"/>
          <stop offset="100%" stopColor="#3A2200"/>
        </linearGradient>
        <radialGradient id="r-credit-face" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFFDF8"/>
          <stop offset="25%" stopColor="#FFDDB5"/>
          <stop offset="55%" stopColor="#DDA14C"/>
          <stop offset="85%" stopColor="#BA8230"/>
          <stop offset="100%" stopColor="#6B4100"/>
        </radialGradient>
        <linearGradient id="r-credit-bolt" x1="40%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#C2FAF5"/>
          <stop offset="50%" stopColor="#4B8F8C"/>
          <stop offset="100%" stopColor="#1D4838"/>
        </linearGradient>
        <linearGradient id="r-credit-edge" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#DDA14C"/>
          <stop offset="50%" stopColor="#8C5800"/>
          <stop offset="100%" stopColor="#4A2E00"/>
        </linearGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="64" cy="116" rx="38" ry="8" fill="url(#r-credit-shadow)"/>
      {/* Coin edge thickness */}
      <ellipse cx="64" cy="72" rx="42" ry="14" fill="url(#r-credit-edge)"/>
      <path d="M22 64C22 64 22 72 22 72C22 79.73 40.32 86 64 86C87.68 86 106 79.73 106 72V64" fill="url(#r-credit-edge)"/>
      {/* Back face (dark rim) */}
      <ellipse cx="64" cy="64" rx="42" ry="14" fill="#4A2E00" stroke="#3A2200" strokeWidth="1"/>
      {/* Outer coin rim */}
      <circle cx="64" cy="58" r="42" fill="url(#r-credit-rim)" stroke="#FFF5DE" strokeWidth="1.5"/>
      {/* Inner coin face */}
      <circle cx="64" cy="58" r="36" fill="url(#r-credit-face)" stroke="#BA8230" strokeWidth="1.5"/>
      {/* Engraved inner ring */}
      <circle cx="64" cy="58" r="30" fill="none" stroke="#BA8230" strokeWidth="1.2" opacity="0.5"/>
      <circle cx="64" cy="58" r="28" fill="none" stroke="#FFF5DE" strokeWidth="0.8" opacity="0.3"/>
      {/* Lightning bolt emblem */}
      <path d="M58 42L68 42L62 56L72 56L56 76L60 62L50 62Z" fill="url(#r-credit-bolt)" stroke="#1D4838" strokeWidth="1.2" strokeLinejoin="round"/>
      {/* Specular highlights */}
      <ellipse cx="50" cy="42" rx="14" ry="6" fill="#FFFFFF" opacity="0.25" transform="rotate(-15 50 42)"/>
      <circle cx="48" cy="38" r="3" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="80" cy="74" r="2" fill="#FFFFFF" opacity="0.3"/>
    </svg>
  );
}

export type Icon3dName =
  | '3d-ai-core' | 'ai-core'
  | '3d-physics-energy' | 'physics-energy'
  | '3d-chemistry-flask' | 'chemistry-flask'
  | '3d-cs-matrix' | 'cs-matrix'
  | '3d-verified-equilibrium' | 'verified-equilibrium'
  | '3d-quant-candlestick' | 'quant-candlestick'
  | '3d-biology-dna' | 'biology-dna'
  | '3d-math-function' | 'math-function'
  | '3d-mic' | 'mic'
  | '3d-book-module' | 'book-module'
  | '3d-compass-explore' | 'compass-explore'
  | '3d-gear-settings' | 'gear-settings'
  | '3d-lock-secure' | 'lock-secure'
  | '3d-star-award' | 'star-award'
  | '3d-bell-alert' | 'bell-alert'
  | '3d-cloud-storage' | 'cloud-storage'
  | '3d-spectrometer-prism' | 'spectrometer-prism'
  | '3d-gyroscope-apparatus' | 'gyroscope-apparatus'
  | '3d-ai-credit' | 'ai-credit';

export const ICON_3D_REGISTRY: Record<string, React.ComponentType<Icon3dProps>> = {
  // Prefixed
  '3d-ai-core': Icon3dAiCore,
  '3d-physics-energy': Icon3dPhysicsEnergy,
  '3d-chemistry-flask': Icon3dChemistryFlask,
  '3d-cs-matrix': Icon3dCsMatrix,
  '3d-verified-equilibrium': Icon3dVerifiedEquilibrium,
  '3d-quant-candlestick': Icon3dQuantCandlestick,
  '3d-biology-dna': Icon3dBiologyDna,
  '3d-math-function': Icon3dMathFunction,
  '3d-mic': Icon3dMic,
  '3d-book-module': Icon3dBookModule,
  '3d-compass-explore': Icon3dCompassExplore,
  '3d-gear-settings': Icon3dGearSettings,
  '3d-lock-secure': Icon3dLockSecure,
  '3d-star-award': Icon3dStarAward,
  '3d-bell-alert': Icon3dBellAlert,
  '3d-cloud-storage': Icon3dCloudStorage,
  '3d-spectrometer-prism': Icon3dSpectrometerPrism,
  '3d-gyroscope-apparatus': Icon3dGyroscopeApparatus,
  '3d-ai-credit': Icon3dAiCredit,

  // Unprefixed aliases
  'ai-core': Icon3dAiCore,
  'physics-energy': Icon3dPhysicsEnergy,
  'chemistry-flask': Icon3dChemistryFlask,
  'cs-matrix': Icon3dCsMatrix,
  'verified-equilibrium': Icon3dVerifiedEquilibrium,
  'quant-candlestick': Icon3dQuantCandlestick,
  'biology-dna': Icon3dBiologyDna,
  'math-function': Icon3dMathFunction,
  'mic': Icon3dMic,
  'book-module': Icon3dBookModule,
  'compass-explore': Icon3dCompassExplore,
  'gear-settings': Icon3dGearSettings,
  'lock-secure': Icon3dLockSecure,
  'star-award': Icon3dStarAward,
  'bell-alert': Icon3dBellAlert,
  'cloud-storage': Icon3dCloudStorage,
  'spectrometer-prism': Icon3dSpectrometerPrism,
  'gyroscope-apparatus': Icon3dGyroscopeApparatus,
  'ai-credit': Icon3dAiCredit,

  // Academic Disciplines & Common Aliases
  'fisika': Icon3dPhysicsEnergy,
  'physics': Icon3dPhysicsEnergy,
  'sains': Icon3dPhysicsEnergy,
  'sains-terapan': Icon3dPhysicsEnergy,
  'kimia': Icon3dChemistryFlask,
  'chemistry': Icon3dChemistryFlask,
  'biologi': Icon3dBiologyDna,
  'biology': Icon3dBiologyDna,
  'agribisnis': Icon3dBiologyDna,
  'agribisnis-hortikultura': Icon3dBiologyDna,
  'matematika': Icon3dMathFunction,
  'math': Icon3dMathFunction,
  'statistika': Icon3dMathFunction,
  'informatika': Icon3dCsMatrix,
  'trpl': Icon3dCsMatrix,
  'teknologi-rekayasa-perangkat-lunak': Icon3dCsMatrix,
  'teknik': Icon3dCsMatrix,
  'rekayasa': Icon3dCsMatrix,
  'ekonomi': Icon3dQuantCandlestick,
  'akuntansi': Icon3dQuantCandlestick,
  'akuntansi-perpajakan': Icon3dQuantCandlestick,
  'pemasaran': Icon3dQuantCandlestick,
  'manajemen-pemasaran-internasional': Icon3dQuantCandlestick,
  'event-mice': Icon3dStarAward,
  'mice': Icon3dStarAward,
  'pengelolaan-konvensi-acara': Icon3dStarAward,
  'giroskop': Icon3dGyroscopeApparatus,
  'spektrometer': Icon3dSpectrometerPrism,
  'prisma': Icon3dSpectrometerPrism,
  'prism': Icon3dSpectrometerPrism,
  'gyroscope': Icon3dGyroscopeApparatus,
  'credit': Icon3dAiCredit,
  'kredit': Icon3dAiCredit,
  'token': Icon3dAiCredit,
  'kuota': Icon3dAiCredit,
};

/**
 * Resolves a raw name or string into the most semantically accurate 3D icon component.
 * Eliminates repetitive fallbacks and avoids AI slop by matching domain keywords.
 */
export function resolve3dIconComponent(raw: string): React.ComponentType<Icon3dProps> {
  if (!raw) return Icon3dPhysicsEnergy;
  const s = raw.toLowerCase().trim().replace(/_/g, '-').replace(/\s+/g, '-');

  // Exact match
  if (ICON_3D_REGISTRY[s]) return ICON_3D_REGISTRY[s];
  if (ICON_3D_REGISTRY[`3d-${s}`]) return ICON_3D_REGISTRY[`3d-${s}`];

  // Domain & keyword fuzzy matching
  if (
    s.includes('prism') ||
    s.includes('spektro') ||
    s.includes('optik') ||
    s.includes('refraksi') ||
    s.includes('refract') ||
    s.includes('lens') ||
    s.includes('lensa') ||
    s.includes('cahaya')
  ) {
    return Icon3dSpectrometerPrism;
  }
  if (
    s.includes('gyro') ||
    s.includes('giro') ||
    s.includes('rotasi') ||
    s.includes('momentum') ||
    s.includes('newton') ||
    s.includes('peluru') ||
    s.includes('kinematika') ||
    s.includes('projectile')
  ) {
    return Icon3dGyroscopeApparatus;
  }
  if (
    s.includes('kimia') ||
    s.includes('chem') ||
    s.includes('flask') ||
    s.includes('ph') ||
    s.includes('larutan') ||
    s.includes('asam') ||
    s.includes('basa') ||
    s.includes('reaction') ||
    s.includes('reaksi') ||
    s.includes('titrasi')
  ) {
    return Icon3dChemistryFlask;
  }
  if (
    s.includes('bio') ||
    s.includes('dna') ||
    s.includes('agri') ||
    s.includes('horti') ||
    s.includes('tanaman') ||
    s.includes('gen')
  ) {
    return Icon3dBiologyDna;
  }
  if (
    s.includes('informa') ||
    s.includes('trpl') ||
    s.includes('komputer') ||
    s.includes('software') ||
    s.includes('algoritma') ||
    s.includes('array') ||
    s.includes('logic') ||
    s.includes('teknik') ||
    s.includes('rekayasa') ||
    s.includes('search') ||
    s.includes('binary') ||
    s.includes('sort')
  ) {
    return Icon3dCsMatrix;
  }
  if (
    s.includes('ekonomi') ||
    s.includes('akuntansi') ||
    s.includes('pemasaran') ||
    s.includes('pajak') ||
    s.includes('pasar') ||
    s.includes('keuangan') ||
    s.includes('candlestick') ||
    s.includes('bep') ||
    s.includes('interest') ||
    s.includes('invest') ||
    s.includes('bunga') ||
    s.includes('supply') ||
    s.includes('demand')
  ) {
    return Icon3dQuantCandlestick;
  }
  if (
    s.includes('matematika') ||
    s.includes('math') ||
    s.includes('statistika') ||
    s.includes('fungsi') ||
    s.includes('kalkulus') ||
    s.includes('regresi') ||
    s.includes('gauss') ||
    s.includes('vektor') ||
    s.includes('peluang') ||
    s.includes('probabilit') ||
    s.includes('coin') ||
    s.includes('parabola')
  ) {
    return Icon3dMathFunction;
  }
  if (
    s.includes('circuit') ||
    s.includes('listrik') ||
    s.includes('ohm') ||
    s.includes('hooke') ||
    s.includes('pegas') ||
    s.includes('archimedes') ||
    s.includes('fluida') ||
    s.includes('atom') ||
    s.includes('energi') ||
    s.includes('energy') ||
    s.includes('fisika') ||
    s.includes('physics')
  ) {
    return Icon3dPhysicsEnergy;
  }
  if (s.includes('modul') || s.includes('buku') || s.includes('book') || s.includes('materi')) {
    return Icon3dBookModule;
  }
  if (s.includes('kompas') || s.includes('explore') || s.includes('jelajah') || s.includes('navigasi')) {
    return Icon3dCompassExplore;
  }
  if (s.includes('mice') || s.includes('konvensi') || s.includes('acara') || s.includes('event') || s.includes('award') || s.includes('bintang')) {
    return Icon3dStarAward;
  }
  if (s.includes('setting') || s.includes('gear') || s.includes('pengaturan')) {
    return Icon3dGearSettings;
  }
  if (s.includes('lock') || s.includes('kunci') || s.includes('aman') || s.includes('security')) {
    return Icon3dLockSecure;
  }
  if (s.includes('bell') || s.includes('notif') || s.includes('alert') || s.includes('peringatan')) {
    return Icon3dBellAlert;
  }
  if (s.includes('cloud') || s.includes('storage') || s.includes('awan')) {
    return Icon3dCloudStorage;
  }
  if (s.includes('ai') || s.includes('tutor') || s.includes('brain') || s.includes('core')) {
    return Icon3dAiCore;
  }

  // Default to laboratory physics energy apparatus instead of AI core
  return Icon3dPhysicsEnergy;
}

export interface Dynamic3dIconProps extends Icon3dProps {
  name: Icon3dName | string;
}

export function Icon3d({ name, interactive = false, className = '', ...props }: Dynamic3dIconProps) {
  const Comp = resolve3dIconComponent(typeof name === 'string' ? name : String(name));
  const mergedClass = `${interactive ? 'icon-3d-interactive cursor-pointer' : ''} ${className}`.trim();
  return <Comp className={mergedClass} {...props} />;
}
