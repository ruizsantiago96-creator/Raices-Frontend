const EnterpriseDoodle = ({ active }) => (
  <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <rect x="8" y="14" width="28" height="22" rx="3" fill={active ? "rgba(255,255,255,0.1)" : "#6366F1"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M 8 22 H 36" stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2" />
    <rect x="14" y="26" width="6" height="6" rx="1" fill={active ? "rgba(255,255,255,0.3)" : "#FDE674"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.5" />
    <rect x="24" y="26" width="6" height="6" rx="1" fill={active ? "rgba(255,255,255,0.3)" : "#FDE674"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.5" />
    <path d="M 18 14 V 10 C 18 8 26 8 26 10 V 14" stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="22" cy="18" r="2" fill={active ? "#FFFFFF" : "#0C3B4B"} />
  </svg>
)

export default EnterpriseDoodle
