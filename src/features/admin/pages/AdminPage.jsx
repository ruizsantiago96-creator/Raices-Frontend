import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMe, useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import { Icons } from '@shared/components/shared'
import {
  useAdminStats, useNeedsIntelligence,
  useAllInstitutions, usePendingInstitutions, useApproveInstitution,
  useRejectInstitution, useToggleVerifyInstitution,
  useAdminUsers, useToggleUserActive, useChangeUserRole,
  useAdminReviews, useDeleteReview,
  useAdminSettings, useUpdateSettings,
  useAdminAlerts,
} from '../hooks/useAdmin'

/* ════════════════════ Paleta y helpers ════════════════════ */
const ROLE_META = {
  admin: { bg: '#8B6BAE', label: 'Admin' },
  institution: { bg: '#01ADFF', label: 'Institución' },
  tutor: { bg: '#D4944C', label: 'Tutor' },
  pcd: { bg: '#C4789A', label: 'Persona c/ disc.' },
  user: { bg: '#5A6C8C', label: 'Usuario' },
}
const STATUS_META = {
  critica: { color: '#D46A6A', label: 'Crítica' },
  media: { color: '#D4944C', label: 'Media' },
  adecuada: { color: '#7BA05B', label: 'Adecuada' },
  sin_demanda: { color: 'var(--fg3)', label: 'Sin demanda' },
}
const SEVERITY_META = {
  alta: { color: '#D46A6A', icon: Icons.shieldAlert },
  media: { color: '#D4944C', icon: Icons.target },
  info: { color: '#01ADFF', icon: Icons.sparkles },
}


export default function AdminPage() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const [tab, setTab] = useState(() => localStorage.getItem('admin-tab') ?? 'overview')
  const onTab = (t) => { setTab(t); localStorage.setItem('admin-tab', t) }
  const { data: pending = [] } = usePendingInstitutions()
  const { data: alerts = [] } = useAdminAlerts()

  const criticalCount = alerts.filter(a => a.severity === 'critica').length

  const TAB_TITLES = {
    overview: 'Resumen del ecosistema',
    intelligence: 'Inteligencia de necesidades',
    institutions: 'Gestión de instituciones',
    users: 'Gestión de usuarios',
    reviews: 'Moderación de reseñas',
    alerts: 'Alertas de riesgo',
    settings: 'Configuración de plataforma',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)', display: 'flex' }}>
      <AdminSidebar tab={tab} onTab={onTab} pendingCount={pending.length} alertCritical={criticalCount} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top bar */}
        <header className="admin-topbar" style={{
          position: 'sticky', top: 0, zIndex: 50, height: 64,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', fontFamily: 'var(--font-body)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50% 50% 50% 10%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons.shield({ s: 16 })}
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--fg1)' }}>
                Panel de administración
              </span>
              <span style={{ fontSize: 13, color: 'var(--fg3)', marginLeft: 12 }}>
                {TAB_TITLES[tab]}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {criticalCount > 0 && (
              <button onClick={() => onTab('alerts')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: '1.5px solid #D46A6A', background: 'color-mix(in oklch, #D46A6A 10%, transparent)', color: '#D46A6A', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                {Icons.shieldAlert({ s: 15 })} {criticalCount} alerta{criticalCount !== 1 ? 's' : ''} crítica{criticalCount !== 1 ? 's' : ''}
              </button>
            )}
            <span style={{ fontSize: 14, color: 'var(--fg2)', fontWeight: 600 }}>{user?.full_name ?? user?.email}</span>
            <button onClick={logout} style={{ fontSize: 13, padding: '8px 16px', minHeight: 36, borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--border-strong)', background: 'transparent', color: 'var(--fg3)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main id="main" className="responsive-main" style={{ '--main-max-width': '1200px' }}>
          {tab === 'overview' && <OverviewTab onNavigate={onTab} />}
          {tab === 'intelligence' && <IntelligenceTab />}
          {tab === 'institutions' && <InstitutionsTab />}
          {tab === 'users' && <UsersTab currentUserId={user?.id} />}
          {tab === 'reviews' && <ReviewsTab />}
          {tab === 'alerts' && <AlertsTab alerts={alerts} onNavigate={onTab} />}
          {tab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  )
}

/* ════════════════════ Admin Sidebar ════════════════════ */
function AdminSidebar({ tab, onTab, pendingCount, alertCritical }) {
  const NAV = [
    { key: 'overview',      label: 'Inicio',         icon: Icons.home },
    { key: 'intelligence',  label: 'Inteligencia',   icon: Icons.brain },
    { key: 'institutions',  label: 'Instituciones',  icon: Icons.building,   badge: pendingCount,  badgeColor: '#D4944C' },
    { key: 'users',         label: 'Usuarios',       icon: Icons.users },
    { key: 'reviews',       label: 'Reseñas',        icon: Icons.star },
    { key: 'alerts',        label: 'Alertas',        icon: Icons.shieldAlert, badge: alertCritical, badgeColor: '#D46A6A' },
    { key: 'settings',      label: 'Config',         icon: Icons.target },
  ]

  return (
    <nav aria-label="Panel de administración" className="responsive-sidebar" style={{
      background: '#001D26',
      display: 'flex', flexDirection: 'column',
      padding: '20px 12px', gap: 4,
    }}>
      {/* Brand logo at top */}
      <div style={{ padding: '8px 12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icons.shield({ s: 18 })}
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Admin</span>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map(item => {
          const active = tab === item.key
          return (
            <button key={item.key} onClick={() => onTab(item.key)}
              aria-current={active ? 'page' : undefined}
              style={{
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                transition: 'all 0.2s ease', padding: '10px 12px',
                fontFamily: 'var(--font-body)', fontWeight: active ? 700 : 500,
                fontSize: 14, textAlign: 'left', position: 'relative',
              }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{item.icon({ s: 20 })}</span>
              <span style={{ lineHeight: 1.2 }}>{item.label}</span>
              {(item.badge > 0) && (
                <span aria-label={`${item.badge} pendientes`} style={{
                  marginLeft: 'auto',
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: item.badgeColor, color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '0 4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{item.badge > 9 ? '9+' : item.badge}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Volver a la app */}
      <div style={{ padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>
        <Link to="/dashboard" style={{
          textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
          transition: 'all 0.15s',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>{Icons.arrowRight({ s: 20 })}</span>
          <span>Ir a app</span>
        </Link>
      </div>
    </nav>
  )
}

/* ════════════════════ Componentes UI base ════════════════════ */
const card = { background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }

function Card({ children, style }) {
  return <div style={{ ...card, padding: 24, ...style }}>{children}</div>
}

function SectionTitle({ icon, children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon && <span style={{ color: 'var(--primary)' }}>{icon}</span>}
        {children}
      </h2>
      {right}
    </div>
  )
}

function Skeleton({ w = '100%', h = 16, r = 6, style }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite', ...style }} />
}

function EmptyState({ icon, title, sub }) {
  return (
    <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ color: 'var(--fg3)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 4 }}>{sub}</p>}
    </Card>
  )
}

/* ── Barra horizontal con etiqueta ── */
function HBar({ label, value, max, color = '#01ADFF', suffix }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'var(--fg2)', fontWeight: 600, textTransform: 'capitalize' }}>{label}</span>
        <span style={{ color: 'var(--fg1)', fontWeight: 700 }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

/* ════════════════════ TAB: Resumen ════════════════════ */
function OverviewTab({ onNavigate: _onNavigate }) {
  const { data: stats, isLoading } = useAdminStats()

  const statCards = [
    { label: 'Usuarios', value: stats?.totalUsuarios, sub: `${stats?.usuariosActivos ?? 0} activos`, icon: Icons.users, color: '#8B6BAE' },
    { label: 'Instituciones', value: stats?.totalInstituciones, sub: `${stats?.institucionesVerificadas ?? 0} verificadas`, icon: Icons.building, color: '#01ADFF' },
    { label: 'Pendientes', value: stats?.aprobacionPendiente, sub: 'por aprobar', icon: Icons.shieldAlert, color: '#D4944C' },
    { label: 'Reseñas', value: stats?.totalResenas, sub: stats?.calificacionPromedio != null ? `${stats.calificacionPromedio}★ promedio` : 'Sin calificaciones', icon: Icons.star, color: '#C4789A' },
    { label: 'Publicaciones', value: stats?.totalPublicaciones, sub: `${stats?.totalGrupos ?? 0} grupos`, icon: Icons.message, color: '#7BA05B' },
    { label: 'Perfiles completos', value: stats?.perfilesCompletados, sub: 'con datos de necesidades', icon: Icons.target, color: '#4BA3A3' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI grid */}
      <div className="grid-3-responsive">
        {statCards.map(c => (
          <div key={c.label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50% 50% 50% 14%', background: `color-mix(in oklch, ${c.color} 15%, transparent)`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {c.icon({ s: 22 })}
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--fg1)', lineHeight: 1 }}>
                {isLoading ? <Skeleton w={40} h={26} /> : (c.value ?? 0)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg2)', marginTop: 4 }}>{c.label}</div>
              <div style={{ fontSize: 11, color: 'var(--fg3)' }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen rápido */}
      <Card>
        <SectionTitle icon={Icons.activity({ s: 18 })}>Resumen del ecosistema</SectionTitle>
          {isLoading ? <Skeleton h={100} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#8B6BAE' }}>{Icons.users({ s: 16 })}</span>
                <span style={{ fontSize: 14, color: 'var(--fg2)' }}><b style={{ color: 'var(--fg1)' }}>{stats?.totalUsuarios ?? 0}</b> usuarios registrados ({stats?.usuariosActivos ?? 0} activos)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#01ADFF' }}>{Icons.building({ s: 16 })}</span>
                <span style={{ fontSize: 14, color: 'var(--fg2)' }}><b style={{ color: 'var(--fg1)' }}>{stats?.totalInstituciones ?? 0}</b> instituciones ({stats?.institucionesVerificadas ?? 0} verificadas, {stats?.aprobacionPendiente ?? 0} pendientes)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#7BA05B' }}>{Icons.message({ s: 16 })}</span>
                <span style={{ fontSize: 14, color: 'var(--fg2)' }}><b style={{ color: 'var(--fg1)' }}>{stats?.totalPublicaciones ?? 0}</b> publicaciones en {stats?.totalGrupos ?? 0} grupos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#C4789A' }}>{Icons.star({ s: 16 })}</span>
                <span style={{ fontSize: 14, color: 'var(--fg2)' }}><b style={{ color: 'var(--fg1)' }}>{stats?.totalResenas ?? 0}</b> reseñas{stats?.calificacionPromedio != null ? ` · ${stats.calificacionPromedio}★ promedio` : ''}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#4BA3A3' }}>{Icons.target({ s: 16 })}</span>
                <span style={{ fontSize: 14, color: 'var(--fg2)' }}><b style={{ color: 'var(--fg1)' }}>{stats?.perfilesCompletados ?? 0}</b> perfiles con necesidades completadas</span>
              </div>
            </div>
          )}
      </Card>
    </div>
  )
}

/* ════════════════════ TAB: Inteligencia de necesidades ════════════════════ */
function IntelligenceTab() {
  const { data, isLoading } = useNeedsIntelligence()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card><Skeleton h={24} w="40%" style={{ marginBottom: 16 }} /><Skeleton h={100} /></Card>
        <Card><Skeleton h={140} /></Card>
      </div>
    )
  }

  const maxDemand = Math.max(...(data?.coverage ?? []).map(c => c.demand), 1)
  const maxSupply = Math.max(...(data?.coverage ?? []).map(c => c.supply), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Banner intro */}
      <div style={{ ...card, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 10%, var(--bg-surface)), var(--bg-surface))' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50% 50% 50% 14%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {Icons.brain({ s: 22 })}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>Motor de inteligencia de necesidades</h2>
          <p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>
            Cruza la <b>demanda</b> (perfiles de {data?.total_profiles ?? 0} usuarios) contra la <b>oferta</b> ({data?.total_institutions ?? 0} instituciones) para detectar brechas de cobertura.
          </p>
        </div>
      </div>

      {/* Insights generados */}
      <Card>
        <SectionTitle icon={Icons.sparkles({ s: 18 })}>Hallazgos automáticos</SectionTitle>
        {(data?.insights?.length ?? 0) === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--fg3)' }}>No hay hallazgos — se necesitan más perfiles de usuario para generar inteligencia.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.insights.map((ins, i) => {
              const meta = SEVERITY_META[ins.severity] ?? SEVERITY_META.info
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 'var(--radius-md)', background: `color-mix(in oklch, ${meta.color} 8%, transparent)`, border: `1px solid color-mix(in oklch, ${meta.color} 25%, transparent)` }}>
                  <span style={{ color: meta.color, flexShrink: 0, paddingTop: 1 }}>{meta.icon({ s: 18 })}</span>
                  <p style={{ fontSize: 13.5, color: 'var(--fg1)', margin: 0, lineHeight: 1.5 }}>{ins.text}</p>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Matriz de cobertura demanda vs oferta */}
      <Card>
        <SectionTitle icon={Icons.barChart({ s: 18 })}>Matriz de cobertura · demanda vs oferta</SectionTitle>
        {(data?.coverage?.length ?? 0) === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--fg3)' }}>Sin perfiles de necesidades registrados aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.coverage.map((c) => {
              const st = STATUS_META[c.status] ?? STATUS_META.sin_demanda
              return (
                <div key={c.type}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{c.label}</span>
                    <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 11.5, fontWeight: 700, background: `color-mix(in oklch, ${st.color} 18%, transparent)`, color: st.color }}>
                      {st.label}{c.ratio != null && ` · ${c.ratio}x`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--fg3)', marginBottom: 3 }}>Demanda · {c.demand}</div>
                      <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(c.demand / maxDemand) * 100}%`, height: '100%', background: '#C4789A', borderRadius: 4 }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--fg3)', marginBottom: 3 }}>Oferta · {c.supply}</div>
                      <div style={{ height: 8, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(c.supply / maxSupply) * 100}%`, height: '100%', background: '#01ADFF', borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Demanda agregada */}
      <div className="grid-2-responsive">
        <Card>
          <SectionTitle icon={Icons.heart({ s: 18 })}>Necesidades más reportadas</SectionTitle>
          {(data?.demand?.needs?.length ?? 0) === 0 ? <p style={{ fontSize: 13, color: 'var(--fg3)' }}>Sin datos</p> : (
            data.demand.needs.slice(0, 6).map((n, i) => {
              const max = Math.max(...data.demand.needs.map(x => x.count), 1)
              return <HBar key={i} label={n.need} value={n.count} max={max} color="#C4789A" />
            })
          )}
        </Card>
        <Card>
          <SectionTitle icon={Icons.compass({ s: 18 })}>Objetivos de los usuarios</SectionTitle>
          {(data?.demand?.goals?.length ?? 0) === 0 ? <p style={{ fontSize: 13, color: 'var(--fg3)' }}>Sin datos</p> : (
            data.demand.goals.slice(0, 6).map((g, i) => {
              const max = Math.max(...data.demand.goals.map(x => x.count), 1)
              return <HBar key={i} label={g.goal} value={g.count} max={max} color="#8B6BAE" />
            })
          )}
        </Card>
      </div>
    </div>
  )
}

/* ════════════════════ TAB: Instituciones ════════════════════ */
function InstitutionsTab() {
  const { addToast } = useUiStore()
  const [filter, setFilter] = useState('pending')
  const { data: pending = [], isLoading: pLoad } = usePendingInstitutions()
  const { data: all = [], isLoading: aLoad } = useAllInstitutions()
  const approve = useApproveInstitution()
  const reject = useRejectInstitution()
  const verify = useToggleVerifyInstitution()
  const [confirm, setConfirm] = useState(null)

  const rows = filter === 'pending' ? pending : all
  const isLoading = filter === 'pending' ? pLoad : aLoad

  const doApprove = (id) => approve.mutate(id, { onSuccess: () => addToast('Institución aprobada', 'success') })
  const doVerify = (id) => verify.mutate(id, { onSuccess: (d) => addToast(d.is_verified ? 'Marcada como verificada' : 'Verificación retirada', 'success') })
  const doReject = () => {
    reject.mutate(confirm.id, { onSuccess: () => { addToast('Institución eliminada', 'success'); setConfirm(null) } })
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[{ k: 'pending', l: `Pendientes (${pending.length})` }, { k: 'all', l: `Todas (${all.length})` }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            style={{ padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              background: filter === f.k ? 'var(--primary)' : 'var(--bg-surface)', color: filter === f.k ? '#fff' : 'var(--fg2)' }}>
            {f.l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} /></Card>
      ) : rows.length === 0 ? (
        <EmptyState icon={Icons.check({ s: 32 })} title={filter === 'pending' ? 'Sin instituciones pendientes' : 'No hay instituciones'} sub={filter === 'pending' ? 'Todas las solicitudes han sido procesadas' : null} />
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))' }}>
                {['Nombre', 'Categoría', 'Ciudad', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((inst, i) => (
                <tr key={inst.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {inst.name}
                      {inst.is_verified ? <span style={{ color: '#7BA05B' }} title="Verificada">{Icons.shield({ s: 14 })}</span> : null}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--fg2)' }}>{inst.category ?? '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--fg2)' }}>{inst.city ?? '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: inst.is_active ? 'color-mix(in oklch, #7BA05B 18%, transparent)' : 'color-mix(in oklch, #D4944C 18%, transparent)',
                      color: inst.is_active ? '#5f8043' : '#b07636' }}>
                      {inst.is_active ? 'Activa' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!inst.is_active && (
                        <button onClick={() => doApprove(inst.id)} disabled={approve.isPending}
                          style={btn('#22c55e')}>{Icons.check({ s: 14 })} Aprobar</button>
                      )}
                      {inst.is_active && (
                        <button onClick={() => doVerify(inst.id)} disabled={verify.isPending}
                          style={btn(inst.is_verified ? '#5A6C8C' : '#01ADFF')}>
                          {Icons.shield({ s: 14 })} {inst.is_verified ? 'Quitar verif.' : 'Verificar'}
                        </button>
                      )}
                      <button onClick={() => setConfirm(inst)} disabled={reject.isPending}
                        style={btn('#ef4444')}>{Icons.x({ s: 14 })} Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar institución"
          message={`¿Seguro que quieres eliminar "${confirm.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={doReject}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

/* ════════════════════ TAB: Usuarios ════════════════════ */
function UsersTab({ currentUserId }) {
  const { addToast } = useUiStore()
  const { data: users = [], isLoading } = useAdminUsers()
  const toggleActive = useToggleUserActive()
  const changeRole = useChangeUserRole()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const onToggle = (u) => toggleActive.mutate(u.id, {
    onSuccess: (d) => addToast(d.is_active ? 'Usuario activado' : 'Usuario desactivado', 'success'),
    onError: (e) => addToast(e.response?.data?.message ?? 'Error', 'error'),
  })
  const onRole = (id, role) => changeRole.mutate({ id, role }, {
    onSuccess: () => addToast('Rol actualizado', 'success'),
    onError: (e) => addToast(e.response?.data?.message ?? 'Error', 'error'),
  })

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg3)' }}>{Icons.search({ s: 16 })}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
            style={{ width: '100%', height: 40, padding: '0 12px 0 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)' }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ height: 40, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg2)', background: 'var(--bg-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          <option value="all">Todos los roles</option>
          <option value="pcd">Persona c/ disc.</option>
          <option value="tutor">Tutor</option>
          <option value="institution">Institución</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <Card><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} style={{ marginBottom: 12 }} /><Skeleton h={40} /></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Icons.users({ s: 32 })} title="No se encontraron usuarios" />
      ) : (
        <div className="responsive-table-wrap" style={{ ...card, overflow: 'hidden' }}>
          <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))' }}>
                {['Usuario', 'Rol', 'Estado', 'Registrado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const isSelf = u.id === currentUserId
                const meta = ROLE_META[u.role] ?? ROLE_META.user
                return (
                  <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 34, height: 34, borderRadius: '50% 50% 50% 12%', background: meta.bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {(u.full_name ?? u.email ?? '?')[0]?.toUpperCase()}
                        </span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{u.full_name ?? '—'} {isSelf && <span style={{ fontSize: 11, color: 'var(--fg3)' }}>(tú)</span>}</div>
                          <div style={{ fontSize: 12, color: 'var(--fg3)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={u.role} disabled={isSelf || changeRole.isPending} onChange={e => onRole(u.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-color)', fontSize: 12.5, fontWeight: 600, color: meta.bg, background: `color-mix(in oklch, ${meta.bg} 12%, transparent)`, cursor: isSelf ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', opacity: isSelf ? 0.6 : 1 }}>
                        <option value="pcd">Persona c/ disc.</option>
                        <option value="tutor">Tutor</option>
                        <option value="institution">Institución</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: u.is_active ? 'color-mix(in oklch, #7BA05B 18%, transparent)' : 'color-mix(in oklch, #D46A6A 18%, transparent)',
                        color: u.is_active ? '#5f8043' : '#c0524f' }}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--fg3)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX') : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => onToggle(u)} disabled={isSelf || toggleActive.isPending}
                        style={{ ...btn(u.is_active ? '#D46A6A' : '#7BA05B'), opacity: isSelf ? 0.5 : 1, cursor: isSelf ? 'not-allowed' : 'pointer' }}>
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ════════════════════ TAB: Reseñas ════════════════════ */
function ReviewsTab() {
  const { addToast } = useUiStore()
  const { data: reviews = [], isLoading } = useAdminReviews()
  const del = useDeleteReview()
  const [confirm, setConfirm] = useState(null)

  const doDelete = () => del.mutate(confirm.id, { onSuccess: () => { addToast('Reseña eliminada', 'success'); setConfirm(null) } })

  return (
    <div>
      {isLoading ? (
        <Card><Skeleton h={60} style={{ marginBottom: 12 }} /><Skeleton h={60} /></Card>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Icons.star({ s: 32 })} title="No hay reseñas" sub="Cuando los usuarios califiquen instituciones aparecerán aquí" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ ...card, padding: 18, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ display: 'flex', gap: 1, color: '#D4944C' }}>
                    {[1, 2, 3, 4, 5].map(n => Icons.star({ s: 14, filled: n <= r.rating }))}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>{r.institution_name ?? 'Institución eliminada'}</span>
                </div>
                {r.comment && <p style={{ fontSize: 14, color: 'var(--fg2)', margin: '0 0 8px', lineHeight: 1.5 }}>"{r.comment}"</p>}
                <div style={{ fontSize: 12, color: 'var(--fg3)' }}>
                  {r.user_name ?? 'Anónimo'} · {r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX') : ''}
                </div>
              </div>
              <button onClick={() => setConfirm(r)} style={btn('#ef4444')}>{Icons.x({ s: 14 })} Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title="Eliminar reseña"
          message="¿Eliminar esta reseña? El rating de la institución se recalculará automáticamente."
          confirmLabel="Sí, eliminar"
          danger
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

/* ════════════════════ TAB: Configuración ════════════════════ */
const SETTING_FIELDS = [
  { key: 'platform_name', label: 'Nombre de la plataforma', type: 'text' },
  { key: 'support_email', label: 'Email de soporte', type: 'text' },
  { key: 'default_city', label: 'Ciudad por defecto', type: 'text' },
  { key: 'max_reviews_per_user', label: 'Máx. reseñas por usuario', type: 'number' },
  { key: 'allow_registration', label: 'Permitir nuevos registros', type: 'toggle' },
  { key: 'require_institution_approval', label: 'Requerir aprobación de instituciones', type: 'toggle' },
  { key: 'ai_enabled', label: 'Motor de IA activo', type: 'toggle' },
  { key: 'maintenance_mode', label: 'Modo mantenimiento', type: 'toggle' },
]

function SettingsTab() {
  const { addToast } = useUiStore()
  const { data: settings, isLoading } = useAdminSettings()
  const update = useUpdateSettings()
  const [form, setForm] = useState(null)

  const current = form ?? settings ?? {}
  const set = (k, v) => setForm({ ...current, [k]: v })
  const isOn = (v) => v === 'true' || v === true

  const save = () => update.mutate(current, { onSuccess: () => { addToast('Configuración guardada', 'success'); setForm(null) } })

  if (isLoading) return <Card><Skeleton h={40} style={{ marginBottom: 16 }} /><Skeleton h={40} style={{ marginBottom: 16 }} /><Skeleton h={40} /></Card>

  return (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <SectionTitle icon={Icons.target({ s: 18 })}>Configuración de la plataforma</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {SETTING_FIELDS.map(f => (
            <div key={f.key} className="admin-settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)' }}>{f.label}</div>
              </div>
              {f.type === 'toggle' ? (
                <button onClick={() => set(f.key, isOn(current[f.key]) ? 'false' : 'true')}
                  style={{ width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                    background: isOn(current[f.key]) ? 'var(--primary)' : 'var(--border-color)', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: 3, left: isOn(current[f.key]) ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              ) : (                  <input type={f.type} value={current[f.key] ?? ''} onChange={e => set(f.key, e.target.value)}
                  className="admin-settings-input"
                  style={{ height: 38, padding: '0 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--fg1)', background: 'var(--bg-surface)', outline: 'none', fontFamily: 'var(--font-body)' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
          {form && <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={() => setForm(null)}>Descartar</button>}
          <button className="btn-primary" style={{ fontSize: 14, padding: '10px 24px' }} onClick={save} disabled={!form || update.isPending}>
            {update.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ════════════════════ Helpers compartidos ════════════════════ */
function btn(color) {
  return {
    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
    background: color, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap', transition: 'opacity 0.2s',
  }
}

/* ════════════════════ TAB: Alertas de riesgo ════════════════════ */
const ALERT_SEVERITY = {
  critica: { color: '#D46A6A', bg: 'color-mix(in oklch, #D46A6A 10%, transparent)', border: 'color-mix(in oklch, #D46A6A 30%, transparent)', label: 'Crítica', icon: Icons.shieldAlert },
  media:   { color: '#D4944C', bg: 'color-mix(in oklch, #D4944C 10%, transparent)', border: 'color-mix(in oklch, #D4944C 30%, transparent)', label: 'Media',   icon: Icons.target },
  info:    { color: '#01ADFF', bg: 'color-mix(in oklch, #01ADFF 10%, transparent)', border: 'color-mix(in oklch, #01ADFF 30%, transparent)', label: 'Info',    icon: Icons.sparkles },
}
const ALERT_ACTION_TAB = {
  institution: 'institutions', institutions: 'institutions', institutions_pending: 'institutions',
  reviews: 'reviews', users: 'users', intelligence: 'intelligence', settings: 'settings',
}

function AlertsTab({ alerts: initialAlerts, onNavigate }) {
  const [filter, setFilter] = useState('all')
  const { data: freshAlerts, refetch, isFetching } = useAdminAlerts()
  const alerts = freshAlerts ?? initialAlerts ?? []

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)
  const critCount = alerts.filter(a => a.severity === 'critica').length
  const medCount  = alerts.filter(a => a.severity === 'media').length
  const infoCount = alerts.filter(a => a.severity === 'info').length

  return (
    <div>
      <SectionTitle icon={Icons.shieldAlert({ s: 20 })} right={
        <button onClick={refetch} disabled={isFetching} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isFetching ? '…' : Icons.sparkles({ s: 14 })} {isFetching ? 'Actualizando…' : 'Actualizar'}
        </button>
      }>
        Alertas de riesgo
      </SectionTitle>

      {/* Resumen de severidades */}
      <div className="grid-3-responsive" style={{ marginBottom: 24 }}>
        {[
          { label: 'Críticas',      count: critCount, sev: 'critica' },
          { label: 'Medias',        count: medCount,  sev: 'media' },
          { label: 'Informativas',  count: infoCount, sev: 'info' },
        ].map(({ label, count, sev }) => {
          const s = ALERT_SEVERITY[sev]
          return (
            <div key={sev} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon({ s: 20 })}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 2, fontWeight: 600 }}>{label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { k: 'all', label: `Todas (${alerts.length})` },
          { k: 'critica', label: `Críticas (${critCount})` },
          { k: 'media', label: `Medias (${medCount})` },
          { k: 'info', label: `Info (${infoCount})` },
        ].map(({ k, label }) => {
          const active = filter === k
          const sev = ALERT_SEVERITY[k]
          return (
            <button key={k} onClick={() => setFilter(k)} aria-pressed={active}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                background: active && sev ? sev.bg : active ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                color: active && sev ? sev.color : active ? 'var(--primary)' : 'var(--fg3)',
                border: active && sev ? `1.5px solid ${sev.border}` : active ? '1.5px solid var(--primary)' : '1.5px solid var(--border-color)',
              }}>
              {label}
            </button>
          )
        })}
      </div>

      {/* Lista de alertas */}
      {filtered.length === 0 ? (
        <EmptyState icon={Icons.sparkles({ s: 32 })} title="Sin alertas activas" sub="El ecosistema está operando sin problemas detectados" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(alert => {
            const s = ALERT_SEVERITY[alert.severity] ?? ALERT_SEVERITY.info
            const targetTab = ALERT_ACTION_TAB[alert.entity_type]
            return (
              <div key={alert.id} style={{ ...card, padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: `4px solid ${s.color}` }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  {s.icon({ s: 20 })}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', fontFamily: 'var(--font-display)' }}>{alert.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10, background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0, lineHeight: 1.5 }}>{alert.description}</p>
                </div>
                {alert.action && targetTab && (
                  <button onClick={() => onNavigate(targetTab)} className="btn-secondary"
                    style={{ fontSize: 13, padding: '8px 16px', minHeight: 38, flexShrink: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {alert.action} {Icons.arrowRight({ s: 13 })}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Nota de auditoría */}
      <p style={{ fontSize: 12, color: 'var(--fg3)', marginTop: 24, textAlign: 'center', fontStyle: 'italic' }}>
        Las alertas se calculan en tiempo real sobre los datos actuales de la plataforma. Se actualizan cada 2 minutos.
      </p>
    </div>
  )
}

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: danger ? 'color-mix(in oklch, #ef4444 15%, transparent)' : 'var(--primary-subtle)', color: danger ? '#ef4444' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {Icons.shieldAlert({ s: 20 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" style={{ fontSize: 14, padding: '10px 20px' }} onClick={onCancel}>Cancelar</button>
          <button onClick={onConfirm} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-body)', background: danger ? '#ef4444' : 'var(--primary)', color: '#fff' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
