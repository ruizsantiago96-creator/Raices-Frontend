import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#0f172a'
        }}>
          <div style={{
            maxWidth: 640,
            width: '100%',
            background: '#ffffff',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: '#b91c1c' }}>
              Algo no salió como esperábamos
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Ocurrió un error al cargar la vista. Puedes intentar recargar la página o volver al inicio.
            </p>

            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 16,
              fontSize: 13,
              fontFamily: 'monospace',
              color: '#991b1b',
              overflowX: 'auto',
              marginBottom: 20,
              whiteSpace: 'pre-wrap',
              maxHeight: 200
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: '#229B58',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Recargar página
              </button>
              <button
                onClick={() => {
                  window.location.href = '/dashboard'
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Ir a Inicio
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
