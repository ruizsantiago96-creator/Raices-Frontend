import { useNavigate } from 'react-router-dom'
import { Icons } from '@shared/components/shared'

/**
 * EditarEmpresaPage — Placeholder de edición de datos de la empresa.
 * Sigue el mismo patrón de /institution-portal/editar: ruta accesible desde
 * el sidebar del portal. La lógica de actualización se conectará cuando el
 * backend exponga el endpoint de perfil de empresa.
 */
export default function EditarEmpresaPage() {
  const navigate = useNavigate()

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '900px' } as Record<string, string>}>
      <button
        onClick={() => navigate('/empresa-portal')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg3)', fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0, fontFamily: 'var(--font-body)' }}
      >
        {Icons.arrowRight({ s: 16, color: 'var(--fg3)' })} Volver a la Bolsa de Trabajo
      </button>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Editar empresa
      </h1>
      <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '0 0 28px' }}>
        Actualiza la información pública de tu empresa: nombre, descripción, ubicación y datos de contacto.
      </p>

      <div className="animate-fade-in-up" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          {Icons.building({ s: 28 })}
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 10px', fontFamily: 'var(--font-display)' }}>
          Edición en construcción
        </h2>
        <p style={{ fontSize: 14, color: 'var(--fg3)', marginBottom: 24, lineHeight: 1.6, maxWidth: 440, marginInline: 'auto' }}>
          El formulario de datos de la empresa estará disponible próximamente. Mientras tanto, puedes publicar y administrar tus vacantes desde la Bolsa de Trabajo.
        </p>
        <button onClick={() => navigate('/empresa-portal')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15, fontWeight: 600, borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {Icons.briefcase({ s: 18 })} Ir a Bolsa de Trabajo
        </button>
      </div>
    </main>
  )
}
