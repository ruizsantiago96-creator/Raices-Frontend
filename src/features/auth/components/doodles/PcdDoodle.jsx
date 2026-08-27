const PcdDoodle = ({ active }) => (
  <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
    <path d="M9 11 L10.2 13.8 L13 14.6 L10.2 15.4 L9 18.2 L7.8 15.4 L5 14.6 L7.8 13.8 Z"
      fill={active ? "#FFFFFF" : "#FFB703"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="23" cy="23" r="11" fill={active ? "rgba(255,255,255,0.25)" : "#FDE674"} stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="2.5" />
    <circle cx="19.5" cy="20.5" r="1.2" fill={active ? "#FFFFFF" : "#0C3B4B"} />
    <circle cx="26.5" cy="20.5" r="1.2" fill={active ? "#FFFFFF" : "#0C3B4B"} />
    <path d="M 19 25 Q 23 28.5 27 25" stroke={active ? "#FFFFFF" : "#0C3B4B"} strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
)

export default PcdDoodle
