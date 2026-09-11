import React, { ReactNode } from 'react'

interface RestrictedProps {
  title?: string
  message?: string
}

/**
 * Muestra el contenido restringido con un blur superpuesto.
 * Ideal para ocultar tarjetas, secciones de feeds o bloques pequeños.
 */
export function RestrictedContent({
  isRestricted,
  title = "Contenido restringido",
  message = "Completa tu perfil para acceder a esta sección.",
  children
}: RestrictedProps & {
  isRestricted: boolean
  children: ReactNode
}) {
  if (!isRestricted) return <>{children}</>

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}>
      <div style={{ filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
        {children}
      </div>
      <RestrictedOverlay title={title} message={message} />
    </div>
  )
}

/**
 * Componente que renderiza SOLO el overlay del candado.
 * Se debe usar dentro de un contenedor con `position: relative`.
 */
export function RestrictedOverlay({
  title = "Contenido restringido",
  message = "Completa tu perfil para acceder a esta sección.",
}: RestrictedProps) {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(255,255,255,0.6)', 
      backdropFilter: 'blur(4px)', 
      WebkitBackdropFilter: 'blur(4px)',
      zIndex: 10, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      borderRadius: 'inherit' 
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M12 15V17M6 11V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="#073B4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div style={{ fontWeight: 800, color: '#073B4C', marginTop: 12, fontSize: 18, textAlign: 'center' }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--fg2)', textAlign: 'center', marginTop: 8, maxWidth: 280, fontWeight: 500 }}>
        {message}
      </div>
    </div>
  )
}

/**
 * Componente bloque estilo tarjeta para secciones donde no hay contenido debajo (ej. un formulario oculto).
 */
export function RestrictedBlock({
  title = "Contenido restringido",
  message = "Completa tu perfil para acceder a esta sección.",
  height = 300
}: RestrictedProps & { height?: number | string }) {
  return (
    <div className="animate-fade-in-up" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 16,
      padding: '48px 24px',
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)',
      height,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 16 }}>
        <path d="M12 15V17M6 11V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="#073B4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h2 style={{ fontWeight: 800, color: '#073B4C', margin: '0 0 8px', fontSize: 20 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, maxWidth: 300, fontWeight: 500 }}>
        {message}
      </p>
    </div>
  )
}
