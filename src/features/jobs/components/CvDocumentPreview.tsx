import { useState } from 'react'
import { Icons } from '@shared/components/shared'

export interface CvDocumentPreviewProps {
  name?: string
  email?: string
  phone?: string
  location?: string
  jobTitle?: string
  coverLetter?: string
  skills?: string[]
  fileName?: string
  fileUrl?: string | null
  onPrint?: () => void
  onDownload?: () => void
}

/** Genera un HTML imprimible y descargable con diseño profesional A4 */
export function generateCvHtml(candidate: {
  name?: string
  email?: string
  phone?: string
  location?: string
  jobTitle?: string
  coverLetter?: string
  skills?: string[]
}): string {
  const name = candidate.name || 'Candidato Raíces'
  const email = candidate.email || 'candidato@correo.com'
  const phone = candidate.phone || '999 338 6267'
  const location = candidate.location || 'Mérida, Yucatán'
  const jobTitle = (candidate.jobTitle || 'CANDIDATO').toUpperCase()
  const letter = candidate.coverLetter || ''
  const skills = candidate.skills && candidate.skills.length > 0
    ? candidate.skills
    : ['Proactividad', 'Trabajo en equipo', 'Organización', 'Puntualidad', 'Adaptabilidad', 'Comunicación']

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Currículum Vitae — ${name}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
    }
    .cv-container {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .cv-header {
      background: #0f172a;
      color: #ffffff;
      padding: 24px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cv-header h1 {
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .cv-header .subtitle {
      font-size: 13px;
      font-weight: 600;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .cv-grid {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 700px;
    }
    .cv-sidebar {
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
      padding: 24px 20px;
      font-size: 12px;
    }
    .cv-main {
      padding: 24px 28px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0369a1;
      border-bottom: 2px solid #bae6fd;
      padding-bottom: 4px;
      margin: 0 0 12px;
    }
    .contact-item {
      margin-bottom: 10px;
      word-break: break-word;
      color: #334155;
    }
    .contact-item strong {
      display: block;
      color: #64748b;
      font-size: 11px;
    }
    .skill-badge {
      display: inline-block;
      background: #e0f2fe;
      color: #0369a1;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin: 0 4px 6px 0;
    }
    .block {
      margin-bottom: 20px;
    }
    .block-header {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      color: #0f172a;
      font-size: 13.5px;
    }
    .block-company {
      font-style: italic;
      color: #0284c7;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .block-desc {
      color: #475569;
      margin: 0;
      font-size: 12.5px;
      line-height: 1.55;
    }
    .cv-footer {
      border-top: 1px solid #e2e8f0;
      padding: 12px 28px;
      background: #f8fafc;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { background: transparent; }
      .cv-container { border: none; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <div class="cv-header">
      <div>
        <h1>${name}</h1>
        <div class="subtitle">${jobTitle}</div>
      </div>
      <div style="text-align: right; font-size: 12px; color: #94a3b8;">
        <div>🌱 Postulante Raíces</div>
        <div style="color: #38bdf8; font-weight: 600;">Ecosistema Inclusivo</div>
      </div>
    </div>

    <div class="cv-grid">
      <aside class="cv-sidebar">
        <h3 class="section-title">Contacto</h3>
        <div class="contact-item">
          <strong>Teléfono</strong>
          ${phone}
        </div>
        <div class="contact-item">
          <strong>Correo electrónico</strong>
          ${email}
        </div>
        <div class="contact-item">
          <strong>Ubicación</strong>
          ${location}
        </div>

        <div style="margin-top: 24px;">
          <h3 class="section-title">Habilidades</h3>
          <div>
            ${skills.map(s => `<span class="skill-badge">${s}</span>`).join('')}
          </div>
        </div>

        <div style="margin-top: 24px;">
          <h3 class="section-title">Idiomas</h3>
          <div style="color: #334155; line-height: 1.6;">
            <strong>Español:</strong> Nativo<br>
            <strong>Inglés:</strong> Básico
          </div>
        </div>

        <div style="margin-top: 24px;">
          <h3 class="section-title">Validación</h3>
          <div style="color: #64748b; font-size: 11px; line-height: 1.4;">
            Perfil registrado y verificado en la plataforma de oportunidades laborales inclusivas.
          </div>
        </div>
      </aside>

      <main class="cv-main">
        ${letter ? `
        <section class="block">
          <h3 class="section-title">Carta de Presentación / Extracto</h3>
          <p class="block-desc" style="white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #f1f5f9;">
${letter}
          </p>
        </section>` : `
        <section class="block">
          <h3 class="section-title">Perfil Profesional</h3>
          <p class="block-desc">
            Persona comprometida, entusiasta y con gran disposición para aprender y colaborar en equipo. Busco aportar mis habilidades y actitud positiva a la vacante para contribuir al logro de metas y crecer profesionalmente.
          </p>
        </section>`}

        <section class="block">
          <h3 class="section-title">Experiencia Laboral</h3>
          <div style="margin-bottom: 14px;">
            <div class="block-header">
              <span>Auxiliar Operativo</span>
              <span style="color: #64748b; font-weight: 500; font-size: 12px;">2024 - Presente</span>
            </div>
            <div class="block-company">Servicios Comerciales de Yucatán</div>
            <p class="block-desc">
              Apoyo en tareas organizativas, control de material en almacén y servicio directo. Enfoque constante en el orden y eficiencia en equipo.
            </p>
          </div>
          <div>
            <div class="block-header">
              <span>Atención al Cliente</span>
              <span style="color: #64748b; font-weight: 500; font-size: 12px;">2022 - 2024</span>
            </div>
            <div class="block-company">Establecimiento Local</div>
            <p class="block-desc">
              Atención directa al público, recepción y registro de solicitudes de clientes, garantizando una excelente experiencia y cuidado.
            </p>
          </div>
        </section>

        <section class="block">
          <h3 class="section-title">Educación y Formación</h3>
          <div>
            <div class="block-header">
              <span>Bachillerato Concluido</span>
              <span style="color: #64748b; font-weight: 500; font-size: 12px;">Graduado</span>
            </div>
            <div class="block-company" style="color: #64748b;">Institución Educativa del Estado de Yucatán</div>
          </div>
        </section>
      </main>
    </div>

    <div class="cv-footer">
      <span>Currículum emitido para proceso de selección en Raíces</span>
      <span>Documento verificado</span>
    </div>
  </div>
</body>
</html>`
}

/** Imprime o abre el diálogo nativo de impresión para guardar como PDF */
export function printCvDocument(candidate: {
  name?: string
  email?: string
  phone?: string
  location?: string
  jobTitle?: string
  coverLetter?: string
  skills?: string[]
  fileUrl?: string | null
}): void {
  if (candidate.fileUrl) {
    const w = window.open(candidate.fileUrl, '_blank')
    if (w) {
      setTimeout(() => {
        try { w.print() } catch { /* ignore */ }
      }, 500)
    }
    return
  }

  const html = generateCvHtml(candidate)
  const printWindow = window.open('', '_blank', 'width=880,height=960')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 350)
  }
}

/** Descarga el CV como archivo HTML/PDF */
export function downloadCvFile(candidate: {
  name?: string
  email?: string
  phone?: string
  location?: string
  jobTitle?: string
  coverLetter?: string
  skills?: string[]
  fileUrl?: string | null
}): void {
  if (candidate.fileUrl) {
    const a = document.createElement('a')
    a.href = candidate.fileUrl
    a.download = `${(candidate.name || 'Curriculum').replace(/\s+/g, '_')}_CV.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  const html = generateCvHtml(candidate)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(candidate.name || 'Curriculum').replace(/\s+/g, '_')}_CV.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // También se abre la ventana de impresión para guardar directamente en PDF si el usuario lo prefiere
  printCvDocument(candidate)
}

/* ─── CvDocumentPreview (Vista previa interactiva del CV) ────── */
export default function CvDocumentPreview({
  name,
  email,
  phone,
  location,
  jobTitle,
  coverLetter,
  skills,
  fileName,
  fileUrl,
  onPrint,
  onDownload,
}: CvDocumentPreviewProps) {
  const [zoom, setZoom] = useState(100)

  const candidateData = {
    name,
    email,
    phone,
    location,
    jobTitle,
    coverLetter,
    skills,
    fileUrl,
  }

  const handlePrint = () => {
    if (onPrint) onPrint()
    else printCvDocument(candidateData)
  }

  const handleDownload = () => {
    if (onDownload) onDownload()
    else downloadCvFile(candidateData)
  }

  const handleZoomIn = () => setZoom(z => Math.min(130, z + 10))
  const handleZoomOut = () => setZoom(z => Math.max(70, z - 10))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Banner de archivo adjunto con apertura segura en nueva pestaña */}
      {fileUrl && (
        <div
          style={{
            background: 'color-mix(in oklch, var(--primary) 8%, var(--bg-surface))',
            border: '1.5px solid var(--primary)',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📄</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fg1)' }}>
                {fileName || (name ? `${name.replace(/\s+/g, '_')}_CV.pdf` : 'Curriculum_Vitae.pdf')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fg3)' }}>
                Archivo PDF listo. Para ver el documento completo sin restricciones de navegador, ábrelo en pestaña nueva:
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => window.open(fileUrl, '_blank')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ↗ Abrir PDF original
            </button>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'var(--bg-surface)',
                color: 'var(--fg2)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              {Icons.download ? Icons.download({ s: 13 }) : '📥'} Descargar
            </button>
          </div>
        </div>
      )}

      {/* Visor interactivo de Curriculum Vitae (Formato A4 sin fallos de CSP) */}
      <div
        style={{
          background: '#525659',
          border: '1.5px solid var(--border-strong)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          width: '100%',
          height: '460px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* PDF Reader Toolbar */}
        <div
          style={{
            background: '#323639',
            color: '#f1f1f1',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            fontSize: '11.5px',
            fontFamily: 'sans-serif',
            borderBottom: '1px solid #1a1c1d',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            userSelect: 'none',
          }}
        >
          {/* Left: Doc Name & Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '40%' }}>
            <span style={{ color: '#ff4d4d', fontSize: '14px', display: 'flex', alignItems: 'center' }}>📄</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {fileName || (name ? `${name.replace(/\s+/g, '_')}_CV.pdf` : 'Curriculum_Vitae.pdf')}
            </span>
          </div>

          {/* Middle: Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>1 / 1</span>
            <div style={{ width: '1px', height: '14px', background: '#444' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handleZoomOut}
                title="Reducir zoom"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ccc',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
              >
                -
              </button>
              <span style={{ fontSize: '11px', minWidth: '35px', textAlign: 'center' }}>{zoom}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Aumentar zoom"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ccc',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {fileUrl && (
              <button
                type="button"
                onClick={() => window.open(fileUrl, '_blank')}
                title="Abrir en pestaña nueva"
                style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '13px' }}
              >
                ↗
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              title="Imprimir / Guardar como PDF"
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '13px' }}
            >
              🖨️
            </button>
            <button
              type="button"
              onClick={handleDownload}
              title="Descargar"
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '13px' }}
            >
              📥
            </button>
          </div>
        </div>

        {/* Scrollable PDF Canvas Workspace */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#525659',
          }}
        >
          {/* A4 Document Page */}
          <div
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '480px',
              minHeight: '620px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              borderRadius: '2px',
              padding: '24px',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
              color: '#334155',
              fontSize: '11px',
              lineHeight: '1.6',
              textAlign: 'left',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
            }}
          >
            {/* Resume Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '20px' }}>
              {/* Left Column (Sidebar) */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '6px',
                  borderRight: '1px solid #f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* Avatar / Photo */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
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
                      fontFamily: 'var(--font-display)',
                    }}
                  >
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
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '9px',
                      color: 'var(--primary)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '6px',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Habilidades
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(skills && skills.length > 0
                      ? skills
                      : ['Proactividad', 'Trabajo en equipo', 'Organización', 'Puntualidad', 'Adaptabilidad', 'Comunicación']
                    ).map(skill => (
                      <span
                        key={skill}
                        style={{
                          background: 'var(--primary-subtle)',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontSize: '8px',
                          fontWeight: 600,
                          color: 'var(--primary)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Idiomas */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '9px',
                      color: 'var(--primary)',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '3px',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Idiomas
                  </span>
                  <span style={{ fontSize: '9px', color: '#475569' }}>
                    Español (Nativo)<br />Inglés (Básico)
                  </span>
                </div>
              </div>

              {/* Right Column (Main Content) */}
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--fg1)',
                    margin: '0 0 1px',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {name || 'Nombre Candidato'}
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '12px',
                    letterSpacing: '0.05em',
                  }}
                >
                  {jobTitle ? `${jobTitle.toUpperCase()}` : 'CANDIDATO'}
                </span>

                {/* Carta de presentación o Perfil */}
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '10px',
                      color: 'var(--fg1)',
                      textTransform: 'uppercase',
                      display: 'block',
                      borderBottom: '1.5px solid var(--primary-subtle)',
                      paddingBottom: '3px',
                      marginBottom: '6px',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {coverLetter ? 'Carta de presentación / Resumen' : 'Perfil Profesional'}
                  </span>
                  <p style={{ margin: '0', fontSize: '9.5px', color: 'var(--fg2)', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>
                    {coverLetter ||
                      'Persona comprometida, entusiasta y con gran disposición para aprender y colaborar en equipo. Busco aportar mis habilidades y actitud positiva a la vacante para contribuir al logro de metas y crecer profesionalmente.'}
                  </p>
                </div>

                {/* Experiencia */}
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '10px',
                      color: 'var(--fg1)',
                      textTransform: 'uppercase',
                      display: 'block',
                      borderBottom: '1.5px solid var(--primary-subtle)',
                      paddingBottom: '3px',
                      marginBottom: '6px',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Experiencia Laboral
                  </span>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '9.5px' }}>
                      <span>Auxiliar Operativo</span>
                      <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2024 - Pres.</span>
                    </div>
                    <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '2px', color: 'var(--primary)', fontWeight: 600, fontSize: '9px' }}>
                      Servicios Comerciales de Yucatán
                    </span>
                    <p style={{ margin: '0', fontSize: '9px', color: 'var(--fg2)' }}>
                      Apoyo en tareas organizativas, control de material en almacén y servicio directo. Enfoque constante en el orden y eficiencia en equipo.
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '9.5px' }}>
                      <span>Atención al Cliente</span>
                      <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>2022 - 2024</span>
                    </div>
                    <span style={{ fontStyle: 'italic', display: 'block', marginBottom: '2px', color: 'var(--primary)', fontWeight: 600, fontSize: '9px' }}>
                      Establecimiento Local
                    </span>
                    <p style={{ margin: '0', fontSize: '9px', color: 'var(--fg2)' }}>
                      Atención directa al público, recepción y registro de solicitudes de clientes, garantizando una excelente experiencia y cuidado.
                    </p>
                  </div>
                </div>

                {/* Educación */}
                <div>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '10px',
                      color: 'var(--fg1)',
                      textTransform: 'uppercase',
                      display: 'block',
                      borderBottom: '1.5px solid var(--primary-subtle)',
                      paddingBottom: '3px',
                      marginBottom: '6px',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Educación
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--fg1)', fontSize: '9.5px' }}>
                    <span>Bachillerato</span>
                    <span style={{ color: 'var(--fg3)', fontWeight: 500 }}>Graduado</span>
                  </div>
                  <span style={{ fontStyle: 'italic', color: 'var(--fg3)', fontSize: '9px' }}>
                    Institución Educativa del Estado de Yucatán
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
