export const FEATURES = [
  {
    title: 'Caminos con opciones',
    desc: 'Rutas y alternativas que se ajustan a ti.',
    color: '#CA918E',
    icon: (
      <svg width="108" height="72" viewBox="0 0 108 72" fill="none" className="feat-icon-anim-1" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Shadow / ground guide line */}
        <path
          d="M 14 58 C 30 42, 42 22, 60 28 C 72 32, 80 18, 94 14"
          stroke="rgba(7, 59, 76, 0.12)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Curving blue path line */}
        <path
          d="M 14 58 C 30 42, 42 22, 60 28 C 72 32, 80 18, 94 14"
          stroke="#2F80ED"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Forward Arrow Head on the path */}
        <path
          d="M 82 10 L 98 13 L 93 28"
          stroke="#2F80ED"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Milestone nodes along the route */}
        <circle cx="14" cy="58" r="7" fill="#F4C84A" stroke="#073B4C" strokeWidth="2.5" />
        <circle cx="36" cy="38" r="6" fill="#A8B86B" stroke="#073B4C" strokeWidth="2" />
        <circle cx="60" cy="28" r="7.5" fill="#2F80ED" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="76" cy="25" r="6" fill="#F4A836" stroke="#073B4C" strokeWidth="2" />
        <circle cx="95" cy="14" r="5" fill="#FF4D68" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Acompañamiento en cada etapa',
    desc: 'Apoyo para avanzar y adaptarnos contigo.',
    color: '#229B58',
    icon: (
      <svg width="78" height="82" viewBox="0 0 78 82" fill="none" className="feat-icon-anim-2" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Ground ellipse shadow */}
        <ellipse cx="39" cy="72" rx="24" ry="4" fill="rgba(7, 59, 76, 0.08)" />
        {/* Golden-orange stem */}
        <path d="M 39 68 L 39 30" stroke="#D4944C" strokeWidth="5.5" strokeLinecap="round" />
        {/* Golden-orange base circle node */}
        <circle cx="39" cy="68" r="7" fill="#F4C84A" stroke="#073B4C" strokeWidth="2.2" />
        {/* Center bud node */}
        <circle cx="39" cy="32" r="5" fill="#FF4D68" stroke="#ffffff" strokeWidth="2" />
        {/* Left emerald leaf */}
        <path
          d="M 39 32 C 30 16, 16 8, 20 2 C 28 2, 37 16, 39 32 Z"
          fill="#138A8A"
          stroke="#073B4C"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Right matcha leaf */}
        <path
          d="M 39 32 C 48 16, 62 8, 58 2 C 50 2, 41 16, 39 32 Z"
          fill="#A8B86B"
          stroke="#073B4C"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Lower side leaf */}
        <path
          d="M 39 48 C 30 40, 20 44, 22 50 C 28 52, 37 50, 39 48 Z"
          fill="#229B58"
          stroke="#073B4C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Comunidades según tus intereses',
    desc: 'Conexiones para compartir y hacer crecer tu red de apoyo.',
    color: '#073B4C',
    icon: (
      <svg width="84" height="84" viewBox="0 0 84 84" fill="none" className="feat-icon-anim-3" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Dashed outer relationship triangle */}
        <path d="M 42 16 L 16 48 L 68 48 Z" stroke="#073B4C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" opacity="0.35" />
        {/* Connecting spokes */}
        <path d="M 42 44 L 42 16" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 42 44 L 16 48" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 42 44 L 68 48" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />
        <path d="M 42 44 L 42 70" stroke="#073B4C" strokeWidth="3" strokeLinecap="round" />

        {/* Center hub */}
        <circle cx="42" cy="44" r="10" fill="#F4C84A" stroke="#073B4C" strokeWidth="3" />

        {/* Top: Teal/Green */}
        <circle cx="42" cy="16" r="9" fill="#138A8A" stroke="#073B4C" strokeWidth="2.8" />
        {/* Left: Coral */}
        <circle cx="16" cy="48" r="9" fill="#FF4D68" stroke="#073B4C" strokeWidth="2.8" />
        {/* Right: Blue */}
        <circle cx="68" cy="48" r="9" fill="#2F80ED" stroke="#073B4C" strokeWidth="2.8" />
        {/* Bottom: Matcha */}
        <circle cx="42" cy="70" r="8" fill="#A8B86B" stroke="#073B4C" strokeWidth="2.8" />
      </svg>
    ),
  },
  {
    title: 'Continuidad para tu historia',
    desc: 'Un lugar para documentarla y seguir trazando tu camino.',
    color: '#229B58',
    icon: (
      <svg width="108" height="66" viewBox="0 0 108 66" fill="none" className="feat-icon-anim-4" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Shadow infinity */}
        <path
          d="M 54 33 C 44 13, 18 13, 18 33 C 18 53, 44 53, 54 33 C 64 13, 90 13, 90 33 C 90 53, 64 53, 54 33 Z"
          stroke="rgba(7, 59, 76, 0.12)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Thick green infinity symbol */}
        <path
          d="M 54 33 C 44 13, 18 13, 18 33 C 18 53, 44 53, 54 33 C 64 13, 90 13, 90 33 C 90 53, 64 53, 54 33 Z"
          stroke="#138A8A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Small coral heart in center crossing */}
        <g transform="translate(54, 33)">
          <circle cx="0" cy="0" r="9" fill="#FF4D68" stroke="#ffffff" strokeWidth="2" />
          <path
            d="M 0 3.2 C -3 1.2 -4.2 -0.6 -4.2 -2 A 1.6 1.6 0 0 1 -1.2 -3.2 L 0 -2.1 L 1.2 -3.2 A 1.6 1.6 0 0 1 4.2 -2 C 4.2 -0.6 3 1.2 0 3.2 Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    ),
  },
  {
    title: 'Un ecosistema que te acompaña',
    desc: 'Personas y organizaciones que pueden apoyar tu camino.',
    color: '#073B4C',
    icon: (
      <svg width="88" height="82" viewBox="0 0 88 82" fill="none" className="feat-icon-anim-5" style={{ display: 'block', margin: '0 auto', transition: 'transform 0.3s ease' }}>
        {/* Outer dashed triangular connecting lines */}
        <line x1="44" y1="14" x2="18" y2="64" stroke="#073B4C" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />
        <line x1="44" y1="14" x2="70" y2="64" stroke="#073B4C" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />
        <line x1="18" y1="64" x2="70" y2="64" stroke="#073B4C" strokeWidth="2" strokeDasharray="4 4" opacity="0.35" />

        {/* Solid inner blue spokes */}
        <line x1="44" y1="44" x2="44" y2="14" stroke="#2F80ED" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="44" y1="44" x2="18" y2="64" stroke="#2F80ED" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="44" y1="44" x2="70" y2="64" stroke="#2F80ED" strokeWidth="3.5" strokeLinecap="round" />

        {/* Top vertex: Emerald circle */}
        <circle cx="44" cy="14" r="8" fill="#138A8A" stroke="#073B4C" strokeWidth="2.5" />
        {/* Bottom-left vertex: Coral circle */}
        <circle cx="18" cy="64" r="8" fill="#FF4D68" stroke="#073B4C" strokeWidth="2.5" />
        {/* Bottom-right vertex: Sun yellow circle */}
        <circle cx="70" cy="64" r="8" fill="#F4C84A" stroke="#073B4C" strokeWidth="2.5" />

        {/* Center hub node: Vibrant Blue circle with white center */}
        <circle cx="44" cy="44" r="9.5" fill="#2F80ED" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="44" cy="44" r="3.5" fill="#ffffff" />
      </svg>
    ),
  },
]


