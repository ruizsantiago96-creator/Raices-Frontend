import React from 'react'

export interface FriendlyDoodleProps {
  size?: number
  style?: React.CSSProperties
  className?: string
}

/**
 * Friendly SVG doodle-style emojis matching the Raíces Landing Page aesthetic:
 * - Bold #0C3B4B contours (2 - 2.5px width)
 * - Cheerful organic colors (#FDE674, #FFB703, #FF4D68, #229B58, #3A86FF, #A8B86B)
 * - Expressive kawaii / friendly facial features (eyes, smiles, blush cheeks)
 * - Rounded caps and joints for approachable accessibility
 */

/* ── 1. RELEVANTES (Radiant Cheerful Sparkle / Sun) ── */
export const DoodleSparkle: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Secondary mini sparkle top right */}
    <path
      d="M24 4 L25 8 L29 9 L25 10 L24 14 L23 10 L19 9 L23 8 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Main 4-pointed radiant star body */}
    <path
      d="M15 3 C15 10 10 15 3 15 C10 15 15 20 15 27 C15 20 20 15 27 15 C20 15 15 10 15 3 Z"
      fill="#FDE674"
      stroke="#0C3B4B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Cute eyes */}
    <circle cx="12.5" cy="14" r="1.3" fill="#0C3B4B" />
    <circle cx="17.5" cy="14" r="1.3" fill="#0C3B4B" />
    {/* Sweet smile */}
    <path
      d="M13 17 Q15 19 17 17"
      stroke="#0C3B4B"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Rosy cheeks */}
    <ellipse cx="10.8" cy="15.8" rx="1.4" ry="0.9" fill="#FF4D68" opacity="0.6" />
    <ellipse cx="19.2" cy="15.8" rx="1.4" ry="0.9" fill="#FF4D68" opacity="0.6" />
    {/* Tiny shine dot */}
    <circle cx="6" cy="24" r="1.6" fill="#229B58" stroke="#0C3B4B" strokeWidth="1" />
  </svg>
)

/* ── 2. RECIENTES (Friendly illustrated Clock) ── */
export const DoodleClock: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Clock bells / top ear tabs */}
    <path
      d="M7 6 C5 4 8 2 10 4"
      stroke="#0C3B4B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M25 6 C27 4 24 2 22 4"
      stroke="#0C3B4B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Little top hammer / loop */}
    <path d="M14 4 H18" stroke="#0C3B4B" strokeWidth="2" strokeLinecap="round" />
    {/* Clock feet */}
    <path d="M9 26 L7 29" stroke="#0C3B4B" strokeWidth="2" strokeLinecap="round" />
    <path d="M23 26 L25 29" stroke="#0C3B4B" strokeWidth="2" strokeLinecap="round" />
    {/* Clock round body */}
    <circle cx="16" cy="16" r="11" fill="#E0F2FE" stroke="#0C3B4B" strokeWidth="2.2" />
    {/* Clock inner warm tint */}
    <circle cx="16" cy="16" r="9" fill="#F8FAFC" />
    {/* Clock hands pointing at 10:10 (happy face angle) */}
    <path d="M16 16 L12 11" stroke="#0C3B4B" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 16 L20 12" stroke="#FF4D68" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="1.6" fill="#0C3B4B" />
    {/* Cute smile below the hands */}
    <circle cx="13" cy="19" r="1.1" fill="#0C3B4B" />
    <circle cx="19" cy="19" r="1.1" fill="#0C3B4B" />
    <path
      d="M14 21.5 Q16 23.5 18 21.5"
      stroke="#0C3B4B"
      strokeWidth="1.3"
      strokeLinecap="round"
      fill="none"
    />
    {/* Rosy blush */}
    <ellipse cx="11.5" cy="20.5" rx="1.2" ry="0.8" fill="#FF4D68" opacity="0.5" />
    <ellipse cx="20.5" cy="20.5" rx="1.2" ry="0.8" fill="#FF4D68" opacity="0.5" />
  </svg>
)

/* ── 3. DESTACADAS (Magic Shining Star with personality) ── */
export const DoodleStar: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Secondary coral sparkle top right */}
    <path
      d="M25 3 L26 6.5 L29.5 7.5 L26 8.5 L25 12 L24 8.5 L20.5 7.5 L24 6.5 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Main 5-point warm golden star */}
    <path
      d="M16 4.5 L19 12.5 L27.5 13 L20.5 18 L23 26.5 L16 21.5 L9 26.5 L11.5 18 L4.5 13 L13 12.5 Z"
      fill="#FFB703"
      stroke="#0C3B4B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Friendly eyes */}
    <circle cx="13.5" cy="15" r="1.3" fill="#0C3B4B" />
    <circle cx="18.5" cy="15" r="1.3" fill="#0C3B4B" />
    {/* Sweet curved smile */}
    <path
      d="M14 18 Q16 20.2 18 18"
      stroke="#0C3B4B"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Cheerful blush */}
    <ellipse cx="11.8" cy="16.8" rx="1.3" ry="0.8" fill="#FF4D68" opacity="0.65" />
    <ellipse cx="20.2" cy="16.8" rx="1.3" ry="0.8" fill="#FF4D68" opacity="0.65" />
  </svg>
)

/* ── 4. MI CAMINO (Friendly illustrated Adventure Compass) ── */
export const DoodleCompass: React.FC<FriendlyDoodleProps> = ({ size = 28, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Top golden hanger loop */}
    <circle cx="18" cy="5" r="3" fill="#FDE674" stroke="#0C3B4B" strokeWidth="2" />
    {/* Outer compass ring */}
    <circle cx="18" cy="20" r="13" fill="#FFFDF5" stroke="#0C3B4B" strokeWidth="2.4" />
    {/* Secondary inner ring */}
    <circle cx="18" cy="20" r="10.5" stroke="#E2E8F0" strokeWidth="1.4" />
    {/* Cardinal direction ticks */}
    <line x1="18" y1="10" x2="18" y2="12" stroke="#0C3B4B" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="18" y1="28" x2="18" y2="30" stroke="#0C3B4B" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="20" x2="10" y2="20" stroke="#0C3B4B" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="26" y1="20" x2="28" y2="20" stroke="#0C3B4B" strokeWidth="1.8" strokeLinecap="round" />
    {/* Compass Needle - North (Coral/Red) */}
    <polygon points="18,11 20.8,19 18,17.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="1.4" strokeLinejoin="round" />
    <polygon points="18,11 15.2,19 18,17.5" fill="#FF758F" stroke="#0C3B4B" strokeWidth="1.4" strokeLinejoin="round" />
    {/* Compass Needle - South (Sky Blue / Turquoise) */}
    <polygon points="18,29 20.8,21 18,22.5" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="1.4" strokeLinejoin="round" />
    <polygon points="18,29 15.2,21 18,22.5" fill="#60A5FA" stroke="#0C3B4B" strokeWidth="1.4" strokeLinejoin="round" />
    {/* Center dial badge with smiling face */}
    <circle cx="18" cy="20" r="4.2" fill="#FDE674" stroke="#0C3B4B" strokeWidth="1.6" />
    <circle cx="16.7" cy="19.2" r="0.75" fill="#0C3B4B" />
    <circle cx="19.3" cy="19.2" r="0.75" fill="#0C3B4B" />
    <path d="M17 21 Q18 22.2 19 21" stroke="#0C3B4B" strokeWidth="0.9" strokeLinecap="round" fill="none" />
    {/* Cute blush */}
    <circle cx="15.8" cy="20.3" r="0.6" fill="#FF4D68" opacity="0.6" />
    <circle cx="20.2" cy="20.3" r="0.6" fill="#FF4D68" opacity="0.6" />
  </svg>
)

/* ── 5. PUBLICACIONES (Friendly Chat Bubble) ── */
export const DoodleChat: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Floating tiny heart top right */}
    <path
      d="M25 4 C23.5 2.5 21.5 3.5 21.5 5 C21.5 6.5 25 9 25 9 C25 9 28.5 6.5 28.5 5 C28.5 3.5 26.5 2.5 25 4 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
    {/* Cheerful speech bubble body */}
    <path
      d="M6 8 C6 5.5 8 4 11 4 H21 C24 4 26 5.5 26 8 V18 C26 20.5 24 22 21 22 H13 L8 27 V22 C6 22 6 20.5 6 18 Z"
      fill="#BAE6FD"
      stroke="#0C3B4B"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Friendly eyes */}
    <circle cx="12" cy="13" r="1.3" fill="#0C3B4B" />
    <circle cx="18" cy="13" r="1.3" fill="#0C3B4B" />
    {/* Cheerful open smile */}
    <path
      d="M13 16 Q15 18.5 17 16"
      stroke="#0C3B4B"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Rosy cheeks */}
    <ellipse cx="10" cy="14.8" rx="1.3" ry="0.9" fill="#FF4D68" opacity="0.55" />
    <ellipse cx="20" cy="14.8" rx="1.3" ry="0.9" fill="#FF4D68" opacity="0.55" />
  </svg>
)

/* ── 6. GRUPOS (Friendly Buddy Duo) ── */
export const DoodleUsers: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Buddy 2 (Right - Emerald Green) */}
    <g>
      <circle cx="21" cy="10" r="5" fill="#229B58" stroke="#0C3B4B" strokeWidth="2" />
      <path
        d="M17 26 C17 20 25 20 25 26"
        fill="#A8B86B"
        stroke="#0C3B4B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right buddy face */}
      <circle cx="20" cy="9.5" r="0.9" fill="#0C3B4B" />
      <circle cx="23" cy="9.5" r="0.9" fill="#0C3B4B" />
      <path d="M20.5 12 Q21.5 13 22.5 12" stroke="#0C3B4B" strokeWidth="1" strokeLinecap="round" fill="none" />
      <ellipse cx="18.8" cy="11" rx="0.9" ry="0.6" fill="#FF4D68" opacity="0.5" />
    </g>
    {/* Buddy 1 (Left - Cheerful Coral) */}
    <g>
      <circle cx="11" cy="13" r="5.5" fill="#FF758F" stroke="#0C3B4B" strokeWidth="2.2" />
      <path
        d="M6 28 C6 21.5 16 21.5 16 28"
        fill="#FFB703"
        stroke="#0C3B4B"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Left buddy face */}
      <circle cx="9.5" cy="12.5" r="1.1" fill="#0C3B4B" />
      <circle cx="13.5" cy="12.5" r="1.1" fill="#0C3B4B" />
      <path d="M10.2 15 Q11.5 16.5 12.8 15" stroke="#0C3B4B" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Rosy blush */}
      <ellipse cx="8" cy="14" rx="1.1" ry="0.7" fill="#FF4D68" opacity="0.6" />
      <ellipse cx="15" cy="14" rx="1.1" ry="0.7" fill="#FF4D68" opacity="0.6" />
    </g>
  </svg>
)

/* ── 7. GALERÍA (Friendly Artist Palette) ── */
export const DoodlePalette: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Wooden artist palette shape */}
    <path
      d="M16 4 C8 4 4 9 4 16 C4 23 9 28 16 28 C19 28 21 26 21 23 C21 21 19 20 19 18 C19 16.5 20.5 15.5 22 15.5 H24 C27.5 15.5 29 13 29 10 C29 6 23 4 16 4 Z"
      fill="#FDE68A"
      stroke="#0C3B4B"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
    {/* Thumb hole */}
    <ellipse cx="18" cy="23.5" rx="2" ry="1.6" fill="#FFFDF5" stroke="#0C3B4B" strokeWidth="1.4" />
    {/* Colorful paint drops */}
    <circle cx="10" cy="9.5" r="2" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="1.2" />
    <circle cx="16" cy="8" r="2" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="1.2" />
    <circle cx="22" cy="9.5" r="2" fill="#229B58" stroke="#0C3B4B" strokeWidth="1.2" />
    <circle cx="8" cy="16" r="2" fill="#A855F7" stroke="#0C3B4B" strokeWidth="1.2" />
    {/* Palette happy face in the middle */}
    <circle cx="12.5" cy="18" r="1.1" fill="#0C3B4B" />
    <circle cx="16.5" cy="18" r="1.1" fill="#0C3B4B" />
    <path d="M13.5 20.5 Q14.5 22 15.5 20.5" stroke="#0C3B4B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <ellipse cx="11.2" cy="19.3" rx="1" ry="0.6" fill="#FF4D68" opacity="0.5" />
  </svg>
)

/* ── 8. EVENTOS (Friendly Calendar) ── */
export const DoodleCalendar: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Calendar binder rings */}
    <rect x="9" y="3" width="2.5" height="5" rx="1.2" fill="#0C3B4B" />
    <rect x="20.5" y="3" width="2.5" height="5" rx="1.2" fill="#0C3B4B" />
    {/* Main calendar body */}
    <rect
      x="5"
      y="6"
      width="22"
      height="22"
      rx="4"
      fill="#FFFDF7"
      stroke="#0C3B4B"
      strokeWidth="2.2"
    />
    {/* Coral top bar */}
    <path
      d="M5 10 C5 7.8 6.8 6 9 6 H23 C25.2 6 27 7.8 27 10 V12 H5 V10 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="1.6"
    />
    {/* Friendly face on the calendar page */}
    <circle cx="12.5" cy="18" r="1.2" fill="#0C3B4B" />
    <circle cx="19.5" cy="18" r="1.2" fill="#0C3B4B" />
    <path
      d="M14 21.5 Q16 23.5 18 21.5"
      stroke="#0C3B4B"
      strokeWidth="1.4"
      strokeLinecap="round"
      fill="none"
    />
    {/* Rosy blush */}
    <ellipse cx="10.8" cy="19.8" rx="1.2" ry="0.7" fill="#FF4D68" opacity="0.55" />
    <ellipse cx="21.2" cy="19.8" rx="1.2" ry="0.7" fill="#FF4D68" opacity="0.55" />
    {/* Golden badge star in bottom corner */}
    <polygon
      points="23,23 24,25 26,25.5 24.5,27 25,29 23,28 21,29 21.5,27 20,25.5 22,25"
      fill="#FFB703"
    />
  </svg>
)

/* ── 9. ACERCA DE LA COMUNIDAD (Friendly Info Glow Badge) ── */
export const DoodleInfo: React.FC<FriendlyDoodleProps> = ({ size = 20, style, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ verticalAlign: 'middle', flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    {/* Cheerful matcha/mint badge circle */}
    <circle cx="16" cy="16" r="12" fill="#A8B86B" stroke="#0C3B4B" strokeWidth="2.2" />
    {/* Inner soft warm cream shield */}
    <circle cx="16" cy="16" r="9.5" fill="#F0FDF4" />
    {/* Top glowing dot as a cheerful heart */}
    <path
      d="M16 9.5 C15 8.2 13.5 9 13.5 10 C13.5 11.2 16 13 16 13 C16 13 18.5 11.2 18.5 10 C18.5 9 17 8.2 16 9.5 Z"
      fill="#FF4D68"
      stroke="#0C3B4B"
      strokeWidth="0.9"
    />
    {/* Lower "i" pillar transformed into a cute friendly guide */}
    <rect x="14.5" y="14" width="3" height="7.5" rx="1.5" fill="#0C3B4B" />
    {/* Bottom support line */}
    <line x1="13" y1="21.5" x2="19" y2="21.5" stroke="#0C3B4B" strokeWidth="1.6" strokeLinecap="round" />
    {/* Mini friendly blush or sparkles */}
    <circle cx="9" cy="16" r="1.3" fill="#FDE674" stroke="#0C3B4B" strokeWidth="0.8" />
    <circle cx="23" cy="16" r="1.3" fill="#FDE674" stroke="#0C3B4B" strokeWidth="0.8" />
  </svg>
)

export const FriendlyIcons = {
  sparkle: (props?: FriendlyDoodleProps) => <DoodleSparkle {...props} />,
  clock: (props?: FriendlyDoodleProps) => <DoodleClock {...props} />,
  star: (props?: FriendlyDoodleProps) => <DoodleStar {...props} />,
  compass: (props?: FriendlyDoodleProps) => <DoodleCompass {...props} />,
  chat: (props?: FriendlyDoodleProps) => <DoodleChat {...props} />,
  users: (props?: FriendlyDoodleProps) => <DoodleUsers {...props} />,
  palette: (props?: FriendlyDoodleProps) => <DoodlePalette {...props} />,
  calendar: (props?: FriendlyDoodleProps) => <DoodleCalendar {...props} />,
  info: (props?: FriendlyDoodleProps) => <DoodleInfo {...props} />,
}
