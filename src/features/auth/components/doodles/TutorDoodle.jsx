const TutorDoodle = ({ active }) => (
  <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <path d="M 30 18 C 30 12 25 10 23 15 C 25 18 28 19 30 18 Z"
      fill={active ? "rgba(255,255,255,0.15)" : "#10B981"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M 30 18 C 35 12 37 16 33 19 C 31 18 30 18 30 18 Z"
      fill={active ? "rgba(255,255,255,0.25)" : "#A8B86B"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="18" cy="25" r="9" fill={active ? "rgba(255,255,255,0.25)" : "#FDE674"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2.5" />
    <circle cx="15.5" cy="23.5" r="1.2" fill={active ? "#FFFFFF" : "#0C3B4B"} />
    <circle cx="20.5" cy="23.5" r="1.2" fill={active ? "#FFFFFF" : "#0C3B4B"} />
    <path d="M 15.5 27 Q 18 29.5 20.5 27" stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <circle cx="29" cy="29" r="7.5" fill={active ? "rgba(255,255,255,0.15)" : "#3A86FF"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2.5" />
    <circle cx="27" cy="28" r="1" fill={active ? "#FFFFFF" : "#0C3B4B"} />
    <circle cx="31" cy="28" r="1" fill={active ? "#FFFFFF" : "#0C3B4B"} />
    <path d="M 27 31.5 Q 29 33.5 31 31.5" stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
)

export default TutorDoodle
