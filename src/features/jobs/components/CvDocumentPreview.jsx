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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Fallback layout banner */}
      <div style={{
        background: 'color-mix(in srgb, var(--primary) 6%, #fff)',
        border: '1px solid var(--primary-subtle)',
        borderRadius: '6px',
        padding: '10px 14px',
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

      {/* Mock PDF Viewer */}
      <div style={{
        background: '#525659',
        border: '1.5px solid var(--border-strong)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        width: '100%',
        height: '420px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* PDF Reader Toolbar */}
        <div style={{
          background: '#323639',
          color: '#f1f1f1',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: '11.5px',
          fontFamily: 'sans-serif',
          borderBottom: '1px solid #1a1c1d',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          userSelect: 'none'
        }}>
          {/* Left: Doc Name & Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '40%' }}>
            <span style={{ color: '#ff4d4d', fontSize: '14px', display: 'flex', alignItems: 'center' }}>📄</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {name ? `${name.replace(/\s+/g, '_')}_CV.pdf` : 'Curriculum_Vitae.pdf'}
            </span>
          </div>

          {/* Middle: Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>1 / 1</span>
            <div style={{ width: '1px', height: '14px', background: '#444' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '2px 6px', fontSize: '13px', fontWeight: 'bold' }}>-</button>
              <span style={{ fontSize: '11px' }}>100%</span>
              <button type="button" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '2px 6px', fontSize: '13px', fontWeight: 'bold' }}>+</button>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" title="Presentar" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '12px' }}>📺</button>
            <button type="button" title="Imprimir" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '12px' }}>🖨️</button>
            <button type="button" title="Descargar" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '12px' }}>📥</button>
          </div>
        </div>

        {/* Scrollable PDF Canvas Workspace */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#525659'
        }}>
          {/* A4 Document Page */}
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: '460px',
            minHeight: '580px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            borderRadius: '2px',
            padding: '24px',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-body)',
            color: '#334155',
            fontSize: '11px',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            {/* Resume Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
              {/* Left Column (Sidebar) */}
              <div style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: '6px',
                borderRight: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {/* Avatar / Photo */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    margin: '0 auto 6px',
                    fontFamily: 'var(--font-display)'
                  }}>
                    {(name?.[0] || 'C').toUpperCase()}
                  </div>
                  <span style={{ fontSize: '8px', color: 'var(--fg3)', fontWeight: 600 }}>CANDIDATO VERIFICADO</span>
                </div>
                
                {/* Contact details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}>
                    <span style={{ color: 'var(--primary)' }}>{Icons.phone({ s: 10 })}</span>
                    <span>{phone || '999 338 6267'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}>
                    <span style={{ color: 'var(--primary)' }}>{Icons.mail({ s: 10 })}</span>
                    <span>{email || 'candidato@correo.com'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}>
                    <span style={{ color: 'var(--primary)' }}>{Icons.mapPin({ s: 10 })}</span>
                    <span>{location || 'Mérida, Yucatán'}</span>
                  </div>
                </div>

                {/* Habilidades */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '9px', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                    Habilidades
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {['Proactividad', 'Trabajo en equipo', 'Organización', 'Puntualidad', 'Adaptabilidad', 'Comunicación'].map(skill => (
                      <span key={skill} style={{ background: 'var(--primary-subtle)', padding: '1px 6px', borderRadius: '3px', fontSize: '8px', fontWeight: 600, color: 'var(--primary)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Idiomas */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span style={{ fontWeight: 700, fontSize: '9px', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '3px', fontFamily: 'var(--font-display)' }}>
                    Idiomas
                  </span>
                  <span style={{ fontSize: '9px', color: '#475569' }}>Español (Nativo)<br />Inglés (Básico)</span>
                </div>
              </div>

              {/* Right Column (Main Content) */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--fg1)', margin: '0 0 1px', fontFamily: 'var(--font-display)' }}>
                  {name || 'Nombre Candidato'}
                </h3>
                <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  {jobTitle ? `${jobTitle.toUpperCase()}` : 'CANDIDATO'}
                </span>

                {/* Perfil */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '1.5px solid var(--primary-subtle)', paddingBottom: '3px', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                    Perfil Profesional
                  </span>
                  <p style={{ margin: '0', fontSize: '9.5px', color: 'var(--fg2)', textAlign: 'justify' }}>
                    Persona comprometida, entusiasta y con gran disposición para aprender y colaborar en equipo. Busco aportar mis habilidades y actitud positiva a la vacante para contribuir al logro de metas y crecer profesionalmente.
                  </p>
                </div>

                {/* Experiencia */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '1.5px solid var(--primary-subtle)', paddingBottom: '3px', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                    Experiencia Laboral
                  </span>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '9.5px' }}>
                      <span>Auxiliar Operativo</span>
                      <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2024 - Pres.</span>
                    </div>
                    <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '2px', color: 'var(--primary)', fontWeight: 600, fontSize: '9px' }}>Servicios Comerciales de Yucatán</span>
                    <p style={{ margin: '0', fontSize: '9px', color: 'var(--fg2)' }}>
                      Apoyo en tareas organizativas, control de material en almacén y servicio directo. Enfoque constante en el orden y eficiencia en equipo.
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '9.5px' }}>
                      <span>Atención al Cliente</span>
                      <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2022 - 2024</span>
                    </div>
                    <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '2px', color: 'var(--primary)', fontWeight: 600, fontSize: '9px' }}>Establecimiento Local</span>
                    <p style={{ margin: '0', fontSize: '9px', color: 'var(--fg2)' }}>
                      Atención directa al público, recepción y registro de solicitudes de clientes, garantizando una excelente experiencia y cuidado.
                    </p>
                  </div>
                </div>

                {/* Educación */}
                <div>
                  <span style={{ fontWeight: 700, fontSize: '10px', color: 'var(--fg1)', textTransform: 'uppercase', display: 'block', borderBottom: '1.5px solid var(--primary-subtle)', paddingBottom: '3px', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                    Educación
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '9.5px' }}>
                    <span>Bachillerato</span>
                    <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>Graduado</span>
                  </div>
                  <span style={{ fontStyle: 'italic', color: 'var(--fg3)', fontSize: '9px' }}>Institución Educativa del Estado de Yucatán</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
