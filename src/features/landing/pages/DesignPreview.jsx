/**
 * Design Preview — New Color Scheme Demo
 * Primary: #01ADFF (Blue) | Secondary: #F1FA3F (Yellow/Lime)
 */
import { BrandMark } from '@shared/components/shared'

const COLORS = {
  primary: '#01ADFF',
  primaryDark: '#0090D9',
  primarySubtle: 'rgba(1, 173, 255, 0.12)',
  secondary: '#F1FA3F',
  secondaryDark: '#D4DC2E',
  secondarySubtle: 'rgba(241, 250, 63, 0.15)',
  bg: '#FFFFFF',
  surface: '#F8FAFC',
  fg1: '#0F172A',
  fg2: '#475569',
  fg3: '#94A3B8',
  border: '#E2E8F0',
}

export default function DesignPreview() {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.fg1 }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${COLORS.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BrandMark />
        <span style={{ fontSize: 14, color: COLORS.fg2 }}>Design System Preview</span>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
        {/* Hero */}
        <section style={{ textAlign: 'center', marginBottom: 64 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 16px', color: COLORS.fg1 }}>
            Nuevo Sistema de Diseño
          </h1>
          <p style={{ fontSize: 20, color: COLORS.fg2, margin: '0 0 32px' }}>
            Colores, botones y componentes actualizados
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <span style={{ padding: '8px 16px', borderRadius: 8, background: COLORS.primary, color: '#FFF', fontWeight: 700 }}>Primary: #01ADFF</span>
            <span style={{ padding: '8px 16px', borderRadius: 8, background: COLORS.secondary, color: COLORS.fg1, fontWeight: 700 }}>Secondary: #F1FA3F</span>
          </div>
        </section>

        {/* Color Palette */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Paleta de Colores</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { name: 'Primary', color: COLORS.primary, text: '#FFF' },
              { name: 'Primary Dark', color: COLORS.primaryDark, text: '#FFF' },
              { name: 'Secondary', color: COLORS.secondary, text: COLORS.fg1 },
              { name: 'Secondary Dark', color: COLORS.secondaryDark, text: COLORS.fg1 },
              { name: 'Background', color: COLORS.bg, text: COLORS.fg1, border: true },
              { name: 'Surface', color: COLORS.surface, text: COLORS.fg1, border: true },
              { name: 'Text Primary', color: COLORS.fg1, text: '#FFF' },
              { name: 'Text Secondary', color: COLORS.fg2, text: '#FFF' },
            ].map(c => (
              <div key={c.name} style={{ borderRadius: 12, overflow: 'hidden', border: c.border ? `1px solid ${COLORS.border}` : 'none' }}>
                <div style={{ height: 80, background: c.color }} />
                <div style={{ padding: '12px 16px', background: '#FFF' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.fg1 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.fg3, fontFamily: 'monospace' }}>{c.color}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Botones</h2>

          {/* Primary Buttons */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.fg2, marginBottom: 16 }}>Botones Primarios</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button style={btnPrimary}>Primary</button>
              <button style={btnPrimary} disabled>Disabled</button>
              <button style={{ ...btnPrimary, background: COLORS.primaryDark }}>Hover</button>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.fg2, marginBottom: 16 }}>Botones Secundarios</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button style={btnSecondary}>Secondary</button>
              <button style={btnSecondary} disabled>Disabled</button>
              <button style={{ ...btnSecondary, background: COLORS.surface, borderColor: COLORS.primary, color: COLORS.primary }}>Hover</button>
            </div>
          </div>

          {/* Outline Buttons */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.fg2, marginBottom: 16 }}>Botones Outline</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button style={btnOutline}>Outline</button>
              <button style={{ ...btnOutline, background: COLORS.primarySubtle, borderColor: COLORS.primary, color: COLORS.primary }}>Outline Active</button>
            </div>
          </div>

          {/* Ghost Buttons */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.fg2, marginBottom: 16 }}>Botones Ghost</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button style={btnGhost}>Ghost</button>
              <button style={{ ...btnGhost, color: COLORS.primary }}>Ghost Primary</button>
            </div>
          </div>

          {/* Pill Buttons */}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: COLORS.fg2, marginBottom: 16 }}>Botones Pill (Redondeados)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <button style={btnPill}>Pill Primary</button>
              <button style={btnPillSecondary}>Pill Secondary</button>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Tarjetas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {/* Card 1 */}
            <div style={cardStyle}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.primarySubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth={2}><circle cx={12} cy={12} r={10}/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Card Title</h3>
              <p style={{ fontSize: 14, color: COLORS.fg2, margin: '0 0 16px', lineHeight: 1.5 }}>Una tarjeta limpia sin bordes, usando sombra para separación visual.</p>
              <button style={btnPrimarySmall}>Action</button>
            </div>

            {/* Card 2 */}
            <div style={cardStyle}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.secondarySubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={COLORS.secondaryDark} strokeWidth={2}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Otra Tarjeta</h3>
              <p style={{ fontSize: 14, color: COLORS.fg2, margin: '0 0 16px', lineHeight: 1.5 }}>Ejemplo con color secundario amarillo-lima para acentos.</p>
              <button style={btnSecondarySmall}>Ver más</button>
            </div>

            {/* Card 3 - Featured */}
            <div style={{ ...cardStyle, background: COLORS.primary, color: '#FFF' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#FFF' }}>Destacado</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: '0 0 16px', lineHeight: 1.5 }}>Tarjeta con fondo de color primario para contenido destacado.</p>
              <button style={{ ...btnPillSecondary, background: '#FFF', color: COLORS.primary, border: 'none' }}>Destacado</button>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Elementos de Formulario</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="correo@ejemplo.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input type="password" placeholder="••••••••" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Seleccionar</label>
              <select style={inputStyle}>
                <option>Opción 1</option>
                <option>Opción 2</option>
                <option>Opción 3</option>
              </select>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Badges y Tags</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={badgePrimary}>Primary</span>
            <span style={badgeSecondary}>Secondary</span>
            <span style={badgeOutline}>Outline</span>
            <span style={badgeSuccess}>Success</span>
            <span style={badgeWarning}>Warning</span>
            <span style={badgeError}>Error</span>
          </div>
        </section>
      </main>
    </div>
  )
}

// ── Button Styles ──────────────────────────────────────────────────

const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px',
  padding: '10px 16px',
  minHeight: 40,
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

const btnPrimary = {
  ...btnBase,
  background: COLORS.primary,
  color: '#FFFFFF',
}
const btnPrimarySmall = {
  ...btnBase,
  fontSize: 13,
  padding: '8px 14px',
  minHeight: 36,
  background: COLORS.primary,
  color: '#FFFFFF',
}

const btnSecondary = {
  ...btnBase,
  background: '#F1F5F9',
  color: COLORS.fg1,
  border: '1px solid #E2E8F0',
}

const btnSecondarySmall = {
  ...btnBase,
  fontSize: 13,
  padding: '8px 14px',
  minHeight: 36,
  background: COLORS.secondary,
  color: COLORS.fg1,
}

const btnOutline = {
  ...btnBase,
  background: 'transparent',
  color: COLORS.fg1,
  border: `1px solid ${COLORS.border}`,
}

const btnGhost = {
  ...btnBase,
  background: 'transparent',
  color: COLORS.fg2,
}

const btnPill = {
  ...btnBase,
  background: COLORS.primary,
  color: '#FFFFFF',
  borderRadius: 9999,
}

const btnPillSecondary = {
  ...btnBase,
  background: COLORS.secondary,
  color: COLORS.fg1,
  borderRadius: 9999,
}

// ── Card Style ─────────────────────────────────────────────────────

const cardStyle = {
  background: '#FFFFFF',
  borderRadius: 12,
  padding: 24,
}

// ── Form Styles ────────────────────────────────────────────────────

const labelStyle = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  color: COLORS.fg1,
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  fontSize: 14,
  color: COLORS.fg1,
  background: '#FFFFFF',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

// ── Badge Styles ───────────────────────────────────────────────────

const badgeBase = {
  padding: '4px 10px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
}

const badgePrimary = { ...badgeBase, background: COLORS.primarySubtle, color: COLORS.primary }
const badgeSecondary = { ...badgeBase, background: COLORS.secondarySubtle, color: '#8B7A00' }
const badgeOutline = { ...badgeBase, background: 'transparent', color: COLORS.fg2, border: `1px solid ${COLORS.border}` }
const badgeSuccess = { ...badgeBase, background: 'rgba(34,197,94,0.12)', color: '#16A34A' }
const badgeWarning = { ...badgeBase, background: 'rgba(234,179,8,0.12)', color: '#CA8A04' }
const badgeError = { ...badgeBase, background: 'rgba(239,68,68,0.12)', color: '#DC2626' }
