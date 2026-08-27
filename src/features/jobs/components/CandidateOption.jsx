/* ─── CandidateOption (tarjeta de selección de candidato) ─── */
export default function CandidateOption({ label, description, icon, selected, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '14px 12px',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--border-color)'}`,
        background: selected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        textAlign: 'center',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: selected ? 'var(--primary)' : 'var(--primary-subtle)', color: selected ? '#fff' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--fg3)', lineHeight: 1.3 }}>{description}</span>
    </button>
  )
}
