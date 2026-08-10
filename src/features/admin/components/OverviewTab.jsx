import { useState, useEffect } from 'react'
import { Icons } from '@shared/components/shared'
import { useAdminStats, useAdminDetailedAnalytics, useAdminActiveUsersDetail } from '../hooks/useAdmin'
import { Card, Skeleton, AnimatedCounter } from './AdminUI'

export default function OverviewTab({ onNavigate: _onNavigate }) {
  const { data: stats, isLoading } = useAdminStats()
  const { data: rawAnalytics, isLoading: isAnalyticsLoading } = useAdminDetailedAnalytics()
  const { data: activeUsersDetail, isLoading: isActiveUsersLoading } = useAdminActiveUsersDetail()

  const c1 = 'var(--chart-1, var(--primary))'     // Usuarios
  const c2 = 'var(--chart-2, color-mix(in oklch, var(--primary) 65%, var(--secondary)))' // Instituciones
  const c3 = 'var(--chart-3, color-mix(in oklch, var(--secondary) 40%, black))'         // Reseñas
  const c4 = 'var(--chart-4, color-mix(in oklch, var(--secondary) 40%, white))'         // Publicaciones

  const [waveOffset, setWaveOffset] = useState(0)
  useEffect(() => {
    let animationFrameId
    const animate = () => {
      const liveCount = activeUsersDetail?.live ?? stats?.usuariosActivos ?? 0
      const speed = Math.max(1.5, Math.min(8, liveCount * 0.9))
      setWaveOffset(prev => (prev + speed) % 360)
      animationFrameId = requestAnimationFrame(animate)
    }
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [activeUsersDetail, stats])

  const pendingApproval = stats?.aprobacionPendiente ?? 0
  const pendingVerification = Math.max(0, (stats?.totalInstituciones ?? 0) - (stats?.institucionesVerificadas ?? 0) - (stats?.aprobacionPendiente ?? 0))
  const totalPending = pendingApproval + pendingVerification

  const getPendingSubtext = () => {
    if (pendingApproval > 0 && pendingVerification > 0) return `${pendingApproval} por aprobar · ${pendingVerification} por verificar`
    if (pendingApproval > 0) return `${pendingApproval} por aprobar`
    if (pendingVerification > 0) return `${pendingVerification} por verificar`
    return 'Al día'
  }

  const pendingColor = totalPending > 0 ? 'var(--color-error)' : c1

  const statCards = [
    { label: 'Usuarios', value: stats?.totalUsuarios, sub: `${stats?.usuariosActivos ?? 0} activos`, icon: Icons.users, color: c1 },
    { label: 'Instituciones', value: stats?.totalInstituciones, sub: `${stats?.institucionesVerificadas ?? 0} verificadas`, icon: Icons.building, color: c1 },
    { label: 'Pendientes', value: totalPending, sub: getPendingSubtext(), icon: Icons.shieldAlert, color: pendingColor },
    { label: 'Reseñas', value: stats?.totalResenas, sub: stats?.calificacionPromedio != null ? `${stats.calificacionPromedio}★ promedio` : 'Sin calificaciones', icon: Icons.star, color: c1 },
    { label: 'Publicaciones', value: stats?.totalPublicaciones, sub: `${stats?.totalGrupos ?? 0} grupos`, icon: Icons.message, color: c1 },
    { label: 'Perfiles completos', value: stats?.perfilesCompletados, sub: 'con datos de necesidades', icon: Icons.target, color: c1 },
  ]

  const parseAnalytics = () => {
    if (!rawAnalytics) return []

    // Extract the array from various possible response formats
    let arr = null
    if (Array.isArray(rawAnalytics)) {
      arr = rawAnalytics
    } else if (Array.isArray(rawAnalytics?.datos)) {
      arr = rawAnalytics.datos
    } else if (Array.isArray(rawAnalytics?.data)) {
      arr = rawAnalytics.data
    } else if (Array.isArray(rawAnalytics?.historialMensual)) {
      arr = rawAnalytics.historialMensual
    } else if (Array.isArray(rawAnalytics?.meses)) {
      arr = rawAnalytics.meses
    } else if (Array.isArray(rawAnalytics?.periodos)) {
      arr = rawAnalytics.periodos
    } else if (rawAnalytics && typeof rawAnalytics === 'object') {
      // Try to find any array property in the response
      const arrayKey = Object.keys(rawAnalytics).find(k => Array.isArray(rawAnalytics[k]) && rawAnalytics[k].length > 0)
      if (arrayKey) arr = rawAnalytics[arrayKey]
    }

    if (!arr || arr.length === 0) return []

    const val = (item, m) => {
      // Try multiple possible field names for each metric
      const fieldMap = {
        usuarios: ['usuarios', 'users', 'usuariosTotal', 'totalUsuarios'],
        instituciones: ['instituciones', 'institutions', 'institucionesTotal', 'totalInstituciones'],
        resenas: ['resenas', 'reviews', 'reseñas', 'totalResenas'],
        publicaciones: ['publicaciones', 'posts', 'comunidades', 'totalPublicaciones'],
      }
      const fields = fieldMap[m] ?? [m]
      for (const f of fields) {
        const key = item[f]
        if (key != null) {
          return typeof key === 'number' ? key : parseInt(key, 10) || 0
        }
      }
      return 0
    }

    return arr.map(item => ({
      label: item.mes ?? item.month ?? item.periodo ?? item.label ?? item.nombre ?? `Mes ${arr.indexOf(item) + 1}`,
      usuarios: val(item, 'usuarios'),
      instituciones: val(item, 'instituciones'),
      resenas: val(item, 'resenas'),
      publicaciones: val(item, 'publicaciones'),
    }))
  }

  const chartPoints = parseAnalytics()

  // If no analytics data, generate a single bar from current stats
  const displayPoints = chartPoints.length > 0 ? chartPoints : [
    {
      label: 'Actual',
      usuarios: stats?.totalUsuarios ?? 0,
      instituciones: stats?.totalInstituciones ?? 0,
      resenas: stats?.totalResenas ?? 0,
      publicaciones: stats?.totalPublicaciones ?? 0,
    }
  ]

  const peakVal = displayPoints.length > 0 ? Math.max(...displayPoints.map(p => p.usuarios + p.instituciones + p.resenas + p.publicaciones)) : 10
  const yMax = Math.ceil(peakVal / 10) * 10 || 100
  const yTicks = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0]

  const uVal = stats?.totalUsuarios ?? 0
  const iVal = stats?.totalInstituciones ?? 0
  const rVal = stats?.totalResenas ?? 0
  const pVal = stats?.totalPublicaciones ?? 0
  const donutTotal = uVal + iVal + rVal + pVal

  const [hoveredDonut, setHoveredDonut] = useState(null)
  let centerVal = donutTotal
  let centerLabel = 'Registros'
  if (hoveredDonut === 'usuarios') { centerVal = uVal; centerLabel = 'Usuarios' }
  else if (hoveredDonut === 'instituciones') { centerVal = iVal; centerLabel = 'Insts.' }
  else if (hoveredDonut === 'resenas') { centerVal = rVal; centerLabel = 'Reseñas' }
  else if (hoveredDonut === 'publicaciones') { centerVal = pVal; centerLabel = 'Pubs.' }

  const getBezierPath = (points) => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]
      const cpX1 = curr.x + (next.x - curr.x) / 3
      const cpY2 = next.y
      d += ` C ${cpX1} ${curr.y}, ${curr.x + 2 * (next.x - curr.x) / 3} ${cpY2}, ${next.x} ${next.y}`
    }
    return d
  }

  const rawPts = activeUsersDetail?.historialMinutos ?? []
  const pts = rawPts.map((val, idx) => {
    const liveCount = activeUsersDetail?.live ?? stats?.usuariosActivos ?? 0
    const amplitude = Math.max(1.8, Math.min(4.5, liveCount * 0.85))
    const sineOffset = Math.sin((idx * 32 + waveOffset) * (Math.PI / 180)) * amplitude
    return { x: (idx / (rawPts.length - 1 || 1)) * 100, y: 50 - (Math.min(48, Math.max(0.5, (val + (val > 0 ? sineOffset : 0)) * 0.8))) }
  })
  const lineD = getBezierPath(pts)

  const cardStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* KPIs */}
      <div className="admin-kpi-grid">
        {statCards.map((c, idx) => (
          <div key={c.label} className={`admin-kpi-card animate-fade-in-up delay-${idx + 1}`}
            style={{ ...cardStyle, padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}>
            <div className="kpi-icon-container" style={{ width: 52, height: 52, borderRadius: '16px', background: `color-mix(in oklch, ${c.color} 8%, var(--bg-surface))`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {c.icon({ s: 24 })}
            </div>
            <div>
              <div className="kpi-value" style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--fg1)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {isLoading ? <Skeleton w={50} h={30} /> : <AnimatedCounter value={c.value} />}
              </div>
              <div className="kpi-label" style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg2)', marginTop: 4 }}>{c.label}</div>
              <div className="kpi-sub" style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2, fontWeight: 500 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="analytics-grid">
        {/* Bar Chart */}
        <Card className="animate-fade-in-up delay-4" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Métricas del Ecosistema</h3>
            <div style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 4 }}>Distribución de registros por canal y tipo</div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', height: 200, marginTop: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--fg3)', fontSize: 11, fontWeight: 600, width: 28, textAlign: 'right', paddingRight: 4, boxSizing: 'border-box' }}>
              {yTicks.map(t => <span key={t}>{t}</span>)}
            </div>
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                {[0, 1, 2, 3, 4].map(idx => (<div key={idx} style={{ width: '100%', borderTop: '1px dashed var(--border-color)', height: 0 }} />))}
              </div>
              {isAnalyticsLoading ? (
                <div style={{ display: 'flex', alignItems: 'end', gap: 16, height: '100%', padding: '0 8px' }}>
                  {[60, 80, 45, 90, 70, 85].map((h, i) => <Skeleton key={i} h={`${h}%`} style={{ flex: 1 }} />)}
                </div>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'end', gap: 16, padding: '0 8px', justifyContent: 'space-around' }}>
                  {displayPoints.map((p, idx) => {
                    const total = p.usuarios + p.instituciones + p.resenas + p.publicaciones
                    const barHeightPct = yMax > 0 ? (total / yMax) * 100 : 0
                    return (
                      <div key={idx} className="bar-container" style={{ position: 'relative', flex: 1, height: '100%', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'end', cursor: 'pointer' }}>
                        {/* Tooltip */}
                        <div className="bar-tooltip" style={{
                          position: 'absolute',
                          bottom: `${barHeightPct + 10}%`,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 12px',
                          boxShadow: 'var(--shadow-md)',
                          zIndex: 10,
                          opacity: 0,
                          visibility: 'hidden',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          minWidth: 155,
                          pointerEvents: 'none',
                          transform: 'translateY(0)'
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--fg1)', borderBottom: '1px solid var(--border-color)', paddingBottom: 4, marginBottom: 2 }}>{p.label}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg2)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c1 }} />
                            <span>Usuarios: <strong>{p.usuarios}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg2)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c2 }} />
                            <span>Instituciones: <strong>{p.instituciones}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg2)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c3 }} />
                            <span>Reseñas: <strong>{p.resenas}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--fg2)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c4 }} />
                            <span>Publicaciones: <strong>{p.publicaciones}</strong></span>
                          </div>
                        </div>

                        <div className="bar-inner-stacked" style={{ width: '45%', height: `${barHeightPct}%`, borderRadius: '6px 6px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse', transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                          {total > 0 && (<>
                            <div style={{ height: `${(p.usuarios / total) * 100}%`, background: c1 }} />
                            <div style={{ height: `${(p.instituciones / total) * 100}%`, background: c2 }} />
                            <div style={{ height: `${(p.resenas / total) * 100}%`, background: c3 }} />
                            <div style={{ height: `${(p.publicaciones / total) * 100}%`, background: c4 }} />
                          </>)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg3)', marginTop: 6, fontWeight: 600 }}>{p.label}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="animate-fade-in-up delay-5" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Distribución</h3>
          {isLoading ? (
            <Skeleton w={120} h={120} style={{ borderRadius: '50%' }} />
          ) : (
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {donutTotal > 0 && (<>
                  <circle cx="50" cy="50" r="36" fill="none" stroke={c1} strokeWidth="12" strokeDasharray={`${(uVal/donutTotal)*226.19} 226.19`} strokeDashoffset="0" onMouseEnter={() => setHoveredDonut('usuarios')} onMouseLeave={() => setHoveredDonut(null)} style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: hoveredDonut && hoveredDonut !== 'usuarios' ? 0.4 : 1 }} />
                  <circle cx="50" cy="50" r="36" fill="none" stroke={c2} strokeWidth="12" strokeDasharray={`${(iVal/donutTotal)*226.19} 226.19`} strokeDashoffset={`${-(uVal/donutTotal)*226.19}`} onMouseEnter={() => setHoveredDonut('instituciones')} onMouseLeave={() => setHoveredDonut(null)} style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: hoveredDonut && hoveredDonut !== 'instituciones' ? 0.4 : 1 }} />
                  <circle cx="50" cy="50" r="36" fill="none" stroke={c3} strokeWidth="12" strokeDasharray={`${(rVal/donutTotal)*226.19} 226.19`} strokeDashoffset={`${-((uVal+iVal)/donutTotal)*226.19}`} onMouseEnter={() => setHoveredDonut('resenas')} onMouseLeave={() => setHoveredDonut(null)} style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: hoveredDonut && hoveredDonut !== 'resenas' ? 0.4 : 1 }} />
                  <circle cx="50" cy="50" r="36" fill="none" stroke={c4} strokeWidth="12" strokeDasharray={`${(pVal/donutTotal)*226.19} 226.19`} strokeDashoffset={`${-((uVal+iVal+rVal)/donutTotal)*226.19}`} onMouseEnter={() => setHoveredDonut('publicaciones')} onMouseLeave={() => setHoveredDonut(null)} style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: hoveredDonut && hoveredDonut !== 'publicaciones' ? 0.4 : 1 }} />
                </>)}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--fg1)' }}>{centerVal}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg3)' }}>{centerLabel}</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {[{ k: 'usuarios', c: c1, l: 'Usuarios' }, { k: 'instituciones', c: c2, l: 'Instituciones' }, { k: 'resenas', c: c3, l: 'Reseñas' }, { k: 'publicaciones', c: c4, l: 'Publicaciones' }].map(item => (
              <div
                key={item.k}
                onMouseEnter={() => setHoveredDonut(item.k)}
                onMouseLeave={() => setHoveredDonut(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--fg2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: hoveredDonut && hoveredDonut !== item.k ? 0.5 : 1
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.c }} />
                <span>{item.l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Visitors Wave */}
        <Card className="animate-fade-in-up delay-6" style={{ padding: 28, gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card Header: Title & Menu */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Visitantes en Vivo</h3>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg3)' }}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </span>
          </div>

          {isActiveUsersLoading ? (
            <Skeleton h={180} style={{ borderRadius: 8 }} />
          ) : (
            <>
              {/* Active Users Live Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Pulsing Salmon Indicator */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                  <span style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'var(--secondary)',
                    opacity: 0.8,
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }} />
                  <span style={{
                    position: 'relative',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#B0434B' // Vibrant red/salmon from global.css
                  }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--fg1)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {activeUsersDetail?.live ?? stats?.usuariosActivos ?? 0}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg3)' }}>
                    visitantes en vivo
                  </span>
                </div>
              </div>

              {/* Graph Container (Full Width) */}
              <div style={{ position: 'relative', height: 140, overflow: 'hidden', borderRadius: 8, background: 'var(--bg-cool)', width: '100%' }}>
                {rawPts.length > 0 ? (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={`${lineD} L 100 100 L 0 100 Z`} fill="url(#waveGradient)" />
                    <path d={lineD} fill="none" stroke="var(--primary)" strokeWidth="0.8" />
                  </svg>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--fg3)', fontSize: 13, fontWeight: 600 }}>
                    Sin datos de actividad de visitantes
                  </div>
                )}
              </div>

              {/* Averages Panel (Horizontal, separated by thin vertical lines) */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                <div style={{ display: 'flex', width: '100%', maxWidth: 600, justifyContent: 'space-around' }}>
                  
                  {/* Daily Average */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, borderRight: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg1)', fontFamily: 'var(--font-display)' }}>
                      {activeUsersDetail?.promedioDiario ?? 0}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                      Prom. Diario
                    </span>
                  </div>

                  {/* Weekly Average */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, borderRight: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg1)', fontFamily: 'var(--font-display)' }}>
                      {activeUsersDetail?.promedioSemanal ?? 0}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                      Prom. Semanal
                    </span>
                  </div>

                  {/* Monthly Average */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--fg1)', fontFamily: 'var(--font-display)' }}>
                      {activeUsersDetail?.promedioMensual ?? 0}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                      Prom. Mensual
                    </span>
                  </div>

                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
