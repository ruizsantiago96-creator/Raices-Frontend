const InstitutionDoodle = ({ active }) => (
  <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <path d="M 22 9 L 22 4" stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2" strokeLinecap="round"/>
    <path d="M 22 4 C 18 2 18 -1 22 1 Z" fill={active ? "rgba(255,255,255,0.2)" : "#10B981"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M 22 4 C 26 2 26 -1 22 1 Z" fill={active ? "rgba(255,255,255,0.3)" : "#A8B86B"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M 12 18 H 32 V 36 H 12 Z" fill={active ? "rgba(255,255,255,0.1)" : "#2F80ED"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 9 18 L 22 9 L 35 18 Z" fill={active ? "rgba(255,255,255,0.25)" : "#FF4D68"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 19 36 V 28 C 19 26.5 25 26.5 25 28 V 36 Z" fill={active ? "rgba(255,255,255,0.2)" : "#FDE674"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2" strokeLinejoin="round" />
    <rect x="15" y="21" width="4" height="4" rx="1" fill={active ? "rgba(255,255,255,0.5)" : "#FFFFFF"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.5" />
    <rect x="25" y="21" width="4" height="4" rx="1" fill={active ? "rgba(255,255,255,0.5)" : "#FFFFFF"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.5" />
  </svg>
)

export default InstitutionDoodle
