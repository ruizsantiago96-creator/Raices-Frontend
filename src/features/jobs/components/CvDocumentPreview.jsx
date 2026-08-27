import { Icons } from '@shared/components/shared'

/* ─── CvDocumentPreview (Vista previa interactiva del CV) ────── */
export default function CvDocumentPreview({ name, email, phone, location, jobTitle, fileUrl }) {
  if (fileUrl) {
    return (
      <div style={{
        background: '#fff',
        border: '1.5px solid var(--border-strong)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        height: '420px',
        position: 'relative'
      }}>
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          title="Vista previa del currículum"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)',
      fontFamily: 'var(--font-body)',
      color: '#334155',
      fontSize: '11px',
      lineHeight: '1.6',
      maxHeight: '400px',
      overflowY: 'auto',
      textAlign: 'left'
    }}>
      {/* Fallback layout banner */}
      <div style={{
        background: 'color-mix(in srgb, var(--primary) 6%, #fff)',
        border: '1px solid var(--primary-subtle)',
        borderRadius: '6px',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '11.5px',
        color: 'var(--fg2)'
      }}>
        <span style={{ color: 'var(--primary)', fontSize: 14 }}>ℹ️</span>
        <span>
          <strong>Archivo cargado desde almacenamiento:</strong> Para ver la vista previa interactiva del PDF, vuelve a subir el archivo. Los datos de tu postulación siguen estando listos.
        </span>
      </div>

      {/* Resume Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
        
        {/* Left Column (Sidebar) */}
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '6px',
          borderRight: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Avatar / Photo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 'bold',
              margin: '0 auto 8px',
              fontFamily: 'var(--font-display)'
            }}>
              {(name?.[0] || 'C').toUpperCase()}
            </div>
            <span style={{ fontSize: '9px', color: 'var(--fg3)', fontWeight: 600 }}>CANDIDATO VERIFICADO</span>
          </div>
          
          {/* Contact details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span style={{ color: 'var(--primary)' }}>{Icons.phone({ s: 12 })}</span>
              <span>{phone || '999 338 6267'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span style={{ color: 'var(--primary)' }}>{Icons.mail({ s: 12 })}</span>
              <span>{email || 'candidato@correo.com'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
              <span style={{ color: 'var(--primary)' }}>{Icons.mapPin({ s: 12 })}</span>
              <span>{location || 'Mérida, Yucatán'}</span>
            </div>
          </div>

          {/* Habilidades */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Habilidades
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Proactividad', 'Trabajo en equipo', 'Organización', 'Puntualidad', 'Adaptabilidad', 'Comunicación'].map(skill => (
                <span key={skill} style={{ background: 'var(--primary-subtle)', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 600, color: 'var(--primary)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Idiomas */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
              Idiomas
            </span>
            <span style={{ fontSize: '10px', color: '#475569' }}>Español (Nativo)<br />Inglés (Básico)</span>
          </div>
        </div>

        {/* Right Column (Main Content) */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fg1)', margin: '0 0 2px', fontFamily: 'var(--font-display)' }}>
            {name || 'Nombre Candidato'}
          </h3>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '16px', letterSpacing: '0.05em' }}>
            {jobTitle ? `${jobTitle.toUpperCase()}` : 'CANDIDATO'}
          </span>

          {/* Perfil */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '2px solid var(--primary-subtle)', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Perfil Profesional
            </span>
            <p style={{ margin: '0', fontSize: '10.5px', color: 'var(--fg2)', textAlign: 'justify' }}>
              Persona comprometida, entusiasta y con gran disposición para aprender y colaborar en equipo. Busco aportar mis habilidades y actitud positiva a la vacante para contribuir al logro de metas y crecer profesionalmente.
            </p>
          </div>

          {/* Experiencia */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '2px solid var(--primary-subtle)', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Experiencia Laboral
            </span>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '10.5px' }}>
                <span>Auxiliar Operativo</span>
                <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2024 - Presente</span>
              </div>
              <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '4px', color: 'var(--primary)', fontWeight: 600 }}>Servicios Comerciales de Yucatán</span>
              <p style={{ margin: '0', fontSize: '10px', color: 'var(--fg2)' }}>
                Apoyo en tareas organizativas, control de material en almacén y servicio directo. Enfoque constante en el orden y eficiencia en equipo.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '10.5px' }}>
                <span>Atención al Cliente</span>
                <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2022 - 2024</span>
              </div>
              <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '4px', color: 'var(--primary)', fontWeight: 600 }}>Establecimiento Local</span>
              <p style={{ margin: '0', fontSize: '10px', color: 'var(--fg2)' }}>
                Atención directa al público, recepción y registro de solicitudes de clientes, garantizando una excelente experiencia y cuidado.
              </p>
            </div>
          </div>

          {/* Educación */}
          <div>
            <span style={{ fontWeight: 700, fontSize: '11px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '2px solid var(--primary-subtle)', paddingBottom: '4px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Educación
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '10.5px' }}>
              <span>Educación Media Superior / Bachillerato</span>
              <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>Graduado</span>
            </div>
            <span style={{ fontStyle: 'italic', color: 'var(--fg3)' }}>Institución Educativa del Estado de Yucatán</span>
          </div>

        </div>

      </div>
    </div>
  )
}
