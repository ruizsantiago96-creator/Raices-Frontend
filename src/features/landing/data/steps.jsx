export const STEPS = [
  {
    num: 1,
    title: 'Conocer quién eres',
    desc: 'Conocer quién eres y los apoyos que necesitas nos ayuda a ofrecerte un espacio seguro, respetuoso e incluyente.',
    numBg: '#0C3B4B',
    icon: (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
        {/* Outer warm cream circle */}
        <circle cx="50" cy="50" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

        {/* Character Body / Shoulders */}
        <path
          d="M 33 72 C 33 55, 67 55, 67 72"
          fill="#FDE674"
          stroke="#0C3B4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 43 56 C 46 60, 54 60, 57 56"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Character Head */}
        <circle cx="50" cy="38" r="14.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.5" />

        {/* Eyes & Smile */}
        <circle cx="45" cy="36" r="2.2" fill="#0C3B4B" />
        <circle cx="55" cy="36" r="2.2" fill="#0C3B4B" />
        <path
          d="M 45.5 42 C 47.5 45.5, 52.5 45.5, 54.5 42"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Heart Badge Top-Right */}
        <g transform="translate(74, 32)">
          <circle cx="0" cy="0" r="7.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.5" />
          <path
            d="M 0 3.2 C -3 1.2 -4.4 -0.6 -4.4 -2.2 A 1.8 1.8 0 0 1 -1.2 -3.4 L 0 -2.1 L 1.2 -3.4 A 1.8 1.8 0 0 1 4.4 -2.2 C 4.4 -0.6 3 1.2 0 3.2 Z"
            fill="#FFFFFF"
          />
        </g>
        <path d="M 64 34 L 61 35" stroke="#0C3B4B" strokeWidth="2.2" strokeLinecap="round" />

        {/* Green Check Badge Bottom-Left */}
        <g transform="translate(26, 59)">
          <circle cx="0" cy="0" r="7" fill="#10B981" stroke="#0C3B4B" strokeWidth="2.5" />
          <path
            d="M -2.8 0 L -0.5 2.3 L 3.2 -1.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Sparkle top-left */}
        <path
          d="M 25 25 L 26.2 29.2 L 30.4 30.4 L 26.2 31.6 L 25 35.8 L 23.8 31.6 L 19.6 30.4 L 23.8 29.2 Z"
          fill="#FFB703"
          stroke="#0C3B4B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    num: 2,
    title: 'Comprender tu contexto',
    desc: 'Conocer tu situación, tus fortalezas y los apoyos que necesitas nos permite acercarte opciones útiles y adecuadas para ti.',
    numBg: '#0C3B4B',
    icon: (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
        {/* Outer warm cream circle */}
        <circle cx="50" cy="50" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

        {/* Body / Shoulders */}
        <path
          d="M 33 72 C 33 55, 67 55, 67 72"
          fill="#FDE674"
          stroke="#0C3B4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 43 56 C 46 60, 54 60, 57 56"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="50" cy="38" r="14.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.5" />

        {/* Eyes & Smile */}
        <circle cx="45" cy="36" r="2.2" fill="#0C3B4B" />
        <circle cx="55" cy="36" r="2.2" fill="#0C3B4B" />
        <path
          d="M 45.5 42 C 47.5 45.5, 52.5 45.5, 54.5 42"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Orbit dots with connectors / whiskers */}
        {/* Top-Left Red/Pink */}
        <circle cx="24" cy="34" r="6.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.8" />
        <path d="M 31 35 L 34.5 36" stroke="#0C3B4B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Top-Right Blue */}
        <circle cx="76" cy="34" r="6.5" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="2.8" />
        <path d="M 69 35 L 65.5 36" stroke="#0C3B4B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Bottom-Left Green */}
        <circle cx="26" cy="58" r="6.5" fill="#10B981" stroke="#0C3B4B" strokeWidth="2.8" />

        {/* Bottom-Right Orange */}
        <circle cx="74" cy="58" r="6.5" fill="#FB8500" stroke="#0C3B4B" strokeWidth="2.8" />
      </svg>
    ),
  },
  {
    num: 3,
    title: 'Entender lo que te gusta y quieres hacer',
    desc: 'Conocer lo que disfrutas, lo que te gustaría aprender o hacer y cómo prefieres usar tus habilidades y tu tiempo, para acercarte actividades y opciones que se ajustan a ti.',
    numBg: '#0C3B4B',
    icon: (
      <svg width="96" height="96" viewBox="0 0 100 100" fill="none">
        {/* Outer warm cream circle */}
        <circle cx="50" cy="50" r="46" fill="#FBF6EE" stroke="#EFE5D8" strokeWidth="2.5" />

        {/* Body / Shoulders */}
        <path
          d="M 33 72 C 33 55, 67 55, 67 72"
          fill="#FDE674"
          stroke="#0C3B4B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 43 56 C 46 60, 54 60, 57 56"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Head */}
        <circle cx="50" cy="38" r="14.5" fill="#FDE674" stroke="#0C3B4B" strokeWidth="3.5" />

        {/* Happy expression */}
        <circle cx="45" cy="36" r="2.2" fill="#0C3B4B" />
        <circle cx="55" cy="36" r="2.2" fill="#0C3B4B" />
        <path
          d="M 44.5 41.5 C 47 46.5, 53 46.5, 55.5 41.5"
          fill="none"
          stroke="#0C3B4B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Big Golden Star Top-Right */}
        <polygon
          points="75,22 77.2,28.5 84,29 78.8,33.5 80.5,40 75,36.2 69.5,40 71.2,33.5 66,29 72.8,28.5"
          fill="#FFB703"
          stroke="#0C3B4B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Green Check Badge Bottom-Left */}
        <g transform="translate(26, 58)">
          <circle cx="0" cy="0" r="7" fill="#10B981" stroke="#0C3B4B" strokeWidth="2.5" />
          <path
            d="M -2.8 0 L -0.5 2.3 L 3.2 -1.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Blue Orb Bottom-Right */}
        <circle cx="74" cy="58" r="5.5" fill="#3A86FF" stroke="#0C3B4B" strokeWidth="2.5" />

        {/* Coral Orb Top-Left */}
        <circle cx="25" cy="32" r="5.5" fill="#FF4D68" stroke="#0C3B4B" strokeWidth="2.5" />
      </svg>
    ),
  },
]

