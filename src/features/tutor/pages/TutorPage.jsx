import { useState, useEffect } from 'react'
import { useMe, useAuthStore } from '@features/auth'
import { useUiStore } from '@shared/stores/uiStore'
import {
  useDependientes,
  useAddDependiente,
  useUpdateDependent,
  useDeleteDependent,
  useUpdateDependentFeaturesPatch,
  useUpdatePCDLinkedFeaturesPatch,
  useVincularPCD,
  useUnlinkPCD,
  useDependientesCount,
} from '../hooks/useDependientes'
import { useRegisterDependiente } from '../hooks/usePermisos'
import { useAIForDependent } from '../hooks/useAI'
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { AppSidebar, TopNav } from '@features/auth'
import AddDependienteModal from '../components/AddDependienteModal'
import PermissionsModal from '../components/PermissionsModal'
import { TUTOR_TOAST, TUTOR_UI } from '../constants/tutorMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { DEPENDENT_ENDPOINTS } from '@shared/constants/backendEndpoints'

function hashColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  const colors = ['var(--primary)', 'color-mix(in oklch, var(--primary) 85%, white)', 'color-mix(in oklch, var(--primary) 70%, white)', 'color-mix(in oklch, var(--primary) 55%, white)', 'color-mix(in oklch, var(--primary) 40%, white)', 'color-mix(in oklch, var(--primary) 25%, white)', 'var(--fg3)']
  return colors[Math.abs(h) % colors.length]
}

/* ── Minimalist design tokens (using project colors) ── */
const minimalCard = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)',
}
const minimalBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  background: 'var(--bg-cool)',
  color: 'var(--fg2)',
}
const minimalSectionTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--fg3)',
  margin: '0 0 12px 4px',
}

export default function TutorPage() {
  const { logout } = useAuthStore()
  const { data: user } = useMe()
  const { addToast } = useUiStore()
  const { data: catalogos } = useCatalogos()
  const { data: dependents = [], isLoading, isError: dependentsError, refetch: refetchDependents } = useDependientes()
  const { data: countData } = useDependientesCount()
  const add = useAddDependiente()
  const register = useRegisterDependiente()
  const update = useUpdateDependent()
  const del = useDeleteDependent()

  // Catálogos del backend
  const RELATIONSHIPS = catalogos?.parentescos ?? []
  const DISABILITIES = catalogos?.tiposDiscapacidad?.map(d => d.label ?? d) ?? []
  const LIFE_STAGES = catalogos?.etapasVida ?? []
  const AVAILABLE_FEATURES = catalogos?.features ?? []

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [confirmUnlink, setConfirmUnlink] = useState(null)
  const [configuringFeatures, setConfiguringFeatures] = useState(null)
  const updateFeatures = useUpdateDependentFeaturesPatch()
  const updatePCDFeatures = useUpdatePCDLinkedFeaturesPatch()
  const vincularPCD = useVincularPCD()
  const unlinkPCD = useUnlinkPCD()
  const [showVincular, setShowVincular] = useState(false)
  const [permissionsFor, setPermissionsFor] = useState(null) // { id, nombreCompleto } para modal de permisos
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null)
    window.addEventListener('click', handleCloseMenu)
    return () => window.removeEventListener('click', handleCloseMenu)
  }, [])

  // Separar dependientes en dos grupos: planos (gestionados) y vinculados (PCD)
  const managedDeps = dependents.filter(d => !d.esCuentaVinculada)
  const linkedDeps = dependents.filter(d => d.esCuentaVinculada)
  const totalDeps = dependents.length
  const countLimit = countData?.limite ?? null
  const countRemaining = countData?.restantes ?? null
  const limitReached = countLimit !== null && totalDeps >= countLimit

  const handleCreate = (payload) => {
    // Si se solicita crear cuenta, registrar primero
    if (payload.crearCuenta && payload.email && payload.password) {
      add.mutate(payload, {
        onSuccess: (newDep) => {
          if (payload.birth_date && newDep?.id) {
            localStorage.setItem(`raices_dep_birth_date_${newDep.id}`, payload.birth_date)
          }
          // Crear la cuenta Firebase para el dependiente recién creado
          register.mutate(
            { email: payload.email, password: payload.password, dependienteId: newDep?.id },
            {
              onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_CREATED, 'success'); setShowCreate(false) },
              onError: (e) => addToast(TUTOR_TOAST.DEPENDENT_CREATED_WITH_ACCOUNT_WARNING + (e?.message ?? 'Error'), 'warning'),
            }
          )
        },
        onError: (e) => addToast(e?.message ?? TUTOR_TOAST.SAVE_ERROR, 'error'),
      })
    } else {
      add.mutate(payload, {
        onSuccess: (newDep) => {
          if (payload.birth_date && newDep?.id) {
            localStorage.setItem(`raices_dep_birth_date_${newDep.id}`, payload.birth_date)
          }
          addToast(TUTOR_TOAST.DEPENDENT_ADDED, 'success')
          setShowCreate(false)
        },
        onError: (e) => addToast(e?.message ?? TUTOR_TOAST.SAVE_ERROR, 'error'),
      })
    }
  }

  const handleUpdate = (form) => {
    if (form.birth_date && form.id) {
      localStorage.setItem(`raices_dep_birth_date_${form.id}`, form.birth_date)
    }
    update.mutate(form, {
      onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_UPDATED, 'success'); setEditing(null) },
      onError: (e) => addToast(e?.message ?? TUTOR_TOAST.SAVE_ERROR, 'error'),
    })
  }
  const doDelete = () => del.mutate(confirm.id, {
    onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_DELETED, 'success'); setConfirm(null) },
    onError: () => addToast(TUTOR_TOAST.DELETE_ERROR, 'error'),
  })

  const handleFeaturesSave = ({ id, features, isLinked }) => {
    // Dispatch to the correct mutation based on whether this is a linked PCD account
    const mutation = isLinked ? updatePCDFeatures : updateFeatures
    const params = isLinked ? { pcdId: id, features } : { id, features }
    mutation.mutate(params, {
      onSuccess: () => { addToast(TUTOR_TOAST.FEATURES_UPDATED, 'success'); setConfiguringFeatures(null) },
      onError: (e) => addToast(e?.message ?? TUTOR_TOAST.PERMISSIONS_ERROR, 'error'),
    })
  }

  const doUnlink = () => {
    // For linked PCD accounts, use pcdUserId (the PCD user's ID)
    const pcdUserId = confirmUnlink?.pcdUserId
    if (!pcdUserId) return
    unlinkPCD.mutate(pcdUserId, {
      onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_UNLINKED, 'success'); setConfirmUnlink(null) },
      onError: (e) => addToast(e?.response?.data?.mensaje ?? e?.message ?? TUTOR_TOAST.UNLINK_ERROR, 'error'),
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-warm)', fontFamily: 'var(--font-body)' }}>
      <style>{`
        .tutor-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--fg1);
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-body);
          transition: all 0.15s ease;
        }
        .tutor-dropdown-item:hover {
          background: var(--bg-warm) !important;
        }
        .tutor-dropdown-item.danger {
          color: var(--color-error) !important;
        }
        .tutor-dropdown-item.danger:hover {
          background: color-mix(in oklch, var(--color-error) 10%, transparent) !important;
        }
      `}</style>
      <AppSidebar currentPage="tutor" />
      <TopNav user={user} onLogout={logout} currentPage="tutor" />

      <main id="main" className="responsive-main" style={{ '--main-max-width': '960px' }}>
        {/* ── Header: Title Left, Actions Right ── */}
        <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>
              Personas
            </h1>
            {!isLoading && !dependentsError && (
              <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>
                {totalDeps} {totalDeps === 1 ? 'persona' : 'personas'} en tu cuidado{countLimit !== null ? ` · ${countLimit - totalDeps} espacios disponibles` : ''}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              onClick={() => setShowVincular(true)} 
              className="btn-secondary"
              style={{ 
                fontSize: 14, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
              }} 
            >
              {Icons.link({ s: 14 })} Vincular
            </button>
            <button 
              className="btn-primary tutor-btn"
              onClick={() => setShowCreate(true)} 
              disabled={limitReached}
              style={{ 
                fontSize: 14, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
              }}
              title={limitReached ? TUTOR_UI.COUNT_LIMIT_HINT : undefined}
            >
              {Icons.plus({ s: 14 })} Agregar
            </button>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {dependentsError ? (
            <BackendFallback method={DEPENDENT_ENDPOINTS.LIST.method} endpoint={DEPENDENT_ENDPOINTS.LIST.path} onRetry={() => refetchDependents()} />
          ) : isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {[0, 1].map(i => (
                <div key={i} style={{ ...minimalCard, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--border-color)', animation: 'pulse 1.5s infinite', marginBottom: 8 }} />
                      <div style={{ width: '40%', height: 12, borderRadius: 4, background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : dependents.length === 0 ? (
            <div style={{ ...minimalCard, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {Icons.users({ s: 24 })}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg1)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>{TUTOR_UI.EMPTY_TITLE}</h2>
              <p style={{ fontSize: 14, color: 'var(--fg3)', marginBottom: 20, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                {TUTOR_UI.EMPTY_DESCRIPTION}
              </p>
              <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 8 }}>
                {Icons.plus({ s: 14 })} {TUTOR_UI.ADD_FIRST_PERSON}
              </button>
            </div>
          ) : (
            <>
              {/* ── Sección: Registradas ── */}
              {managedDeps.length > 0 && (
                <div style={{ marginBottom: linkedDeps.length > 0 ? 28 : 0 }}>
                  <h2 style={{ ...minimalSectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {TUTOR_UI.MANAGED_SECTION_TITLE}
                    <span style={{ ...minimalBadge, fontSize: 11, padding: '2px 6px' }}>{managedDeps.length}</span>
                  </h2>
                  <div className="tutor-cards-grid stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                    {managedDeps.map(dep => {
                      const isMenuOpen = activeMenuId === dep.id
                      return (
                        <div 
                          key={dep?.id} 
                          className="animate-scale-in"
                          style={{ position: 'relative', zIndex: isMenuOpen ? 10 : 1 }}
                        >
                          <DependentCard 
                            dep={dep} 
                            lifeStages={LIFE_STAGES} 
                            onEdit={() => setEditing(dep)} 
                            onDelete={() => setConfirm(dep)} 
                            onConfigureFeatures={() => setConfiguringFeatures(dep)} 
                            onPermissions={(data) => setPermissionsFor(data)} 
                            activeMenuId={activeMenuId}
                            setActiveMenuId={setActiveMenuId}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Sección: Cuentas vinculadas ── */}
              {linkedDeps.length > 0 && (
                <div>
                  <h2 style={{ ...minimalSectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {TUTOR_UI.LINKED_SECTION_TITLE}
                    <span style={{ ...minimalBadge, fontSize: 11, padding: '2px 6px' }}>{linkedDeps.length}</span>
                  </h2>
                  <div className="tutor-cards-grid stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                    {linkedDeps.map(dep => {
                      const isMenuOpen = activeMenuId === dep.id
                      return (
                        <div 
                          key={dep?.id || dep?.pcdUserId} 
                          className="animate-scale-in"
                          style={{ position: 'relative', zIndex: isMenuOpen ? 10 : 1 }}
                        >
                          <DependentCard 
                            dep={dep} 
                            lifeStages={LIFE_STAGES} 
                            isLinked={true}
                            onEdit={() => setEditing(dep)} 
                            onDelete={() => setConfirm(dep)} 
                            onUnlink={() => setConfirmUnlink(dep)}
                            onConfigureFeatures={() => setConfiguringFeatures({ ...dep, isLinked: true })} 
                            onPermissions={(data) => setPermissionsFor(data)} 
                            activeMenuId={activeMenuId}
                            setActiveMenuId={setActiveMenuId}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showCreate && (
        <AddDependienteModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} saving={add.isPending} catalogos={catalogos} />
      )}
      {editing !== null && (
        <DependentForm initial={editing} onCancel={() => setEditing(null)} onSave={handleUpdate} saving={update.isPending} relationships={RELATIONSHIPS} lifeStages={LIFE_STAGES} disabilities={DISABILITIES} />
      )}
      {confirm && (
        <ConfirmDialog
          title={TUTOR_UI.CONFIRM_DELETE_TITLE}
          message={`¿Seguro que quieres eliminar a "${confirm?.nombreCompleto || 'esta persona'}"? Se borrarán sus datos guardados.`}
          onConfirm={doDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirmUnlink && (
        <ConfirmDialog
          title={TUTOR_UI.CONFIRM_UNLINK_TITLE}
          message={TUTOR_UI.CONFIRM_UNLINK_MESSAGE(confirmUnlink?.nombreCompleto || 'esta persona')}
          onConfirm={doUnlink}
          onCancel={() => setConfirmUnlink(null)}
          confirmLabel={TUTOR_UI.UNLINK_BUTTON}
        />
      )}
      {configuringFeatures && (
        <FeaturesConfigModal dependent={configuringFeatures} features={AVAILABLE_FEATURES} onSave={handleFeaturesSave} onCancel={() => setConfiguringFeatures(null)} saving={updateFeatures.isPending || updatePCDFeatures.isPending} />
      )}
      {showVincular && (
        <VincularPCDModal onVincular={(email) => {
          vincularPCD.mutate(email, {
            onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_LINKED, 'success'); setShowVincular(false) },
            onError: (e) => addToast(e?.response?.data?.mensaje ?? e?.message ?? TUTOR_TOAST.LINK_ERROR, 'error'),
          })
        }} onCancel={() => setShowVincular(false)} saving={vincularPCD.isPending} />
      )}
      {permissionsFor && (
        <PermissionsModal
          dependienteId={permissionsFor.id}
          dependienteName={permissionsFor.nombreCompleto || 'esta persona'}
          onClose={() => setPermissionsFor(null)}
        />
      )}
    </div>
  )
}

/* ── Icono de elipsis horizontal ── */
const EllipsisHorizontalIcon = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <circle cx="5" cy="12" r="1.5"/>
    <circle cx="12" cy="12" r="1.5"/>
    <circle cx="19" cy="12" r="1.5"/>
  </svg>
)

/* ── Tarjeta de dependiente ── */
function DependentCard({ dep, lifeStages = [], isLinked = false, onEdit, onDelete, onUnlink, onConfigureFeatures, onPermissions, activeMenuId, setActiveMenuId }) {
  const nombre = dep?.nombreCompleto || dep?.nombre || TUTOR_UI.NO_NAME
  const color = hashColor(nombre)
  const initials = nombre.split(' ').map(w => w?.[0]).filter(Boolean).join('').toUpperCase().slice(0, 2)
  const stage = lifeStages.find(l => l.id === dep?.etapaVida)
  
  const localBirthDate = localStorage.getItem(`raices_dep_birth_date_${dep?.id}`)
  let dependentAge = ''
  if (localBirthDate) {
    const birthDate = new Date(localBirthDate)
    if (!isNaN(birthDate.getTime())) {
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      dependentAge = `${age} años`
    }
  }

  const [showAI, setShowAI] = useState(false)
  const aiRec = useAIForDependent()

  const handleAIToggle = () => {
    if (!showAI && !aiRec.data && !aiRec.isPending) aiRec.mutate(dep?.id)
    setShowAI(s => !s)
  }

  const isMenuOpen = activeMenuId === (dep?.id || dep?.pcdUserId)

  const handleMenuClick = (e) => {
    e.stopPropagation()
    setActiveMenuId(isMenuOpen ? null : (dep?.id || dep?.pcdUserId))
  }

  // Derivar el nombre desde la fotoUrl si existe avatar
  const hasPhoto = dep?.fotoUrl

  return (
    <div style={{ ...minimalCard, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', transition: 'box-shadow 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={e => e.currentTarget.style.boxShadow = minimalCard.boxShadow}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {hasPhoto ? (
          <img 
            src={dep.fotoUrl} 
            alt={nombre} 
            aria-hidden="true" 
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div aria-hidden="true" style={{ width: 44, height: 44, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
        )}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>{nombre}</h3>
            {isLinked && (
              <span style={{ ...minimalBadge, fontSize: 10, padding: '2px 6px' }}>
                {TUTOR_UI.LINKED_BADGE}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg3)', margin: '2px 0 0' }}>{dep?.parentesco || TUTOR_UI.FAMILY_RELATION}{stage ? ` · ${stage.label}` : ''}{dependentAge ? ` · ${dependentAge}` : ''}</p>
        </div>

        {/* Menu de tres puntos */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button 
            type="button"
            onClick={handleMenuClick}
            aria-label="Acciones de persona"
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--fg3)', 
              cursor: 'pointer', 
              width: 28, 
              height: 28, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-cool)'; e.currentTarget.style.color = 'var(--fg1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg3)' }}
          >
            <EllipsisHorizontalIcon s={16} />
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div 
              style={{
                position: 'absolute',
                top: 34,
                right: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '4px',
                zIndex: 100,
                width: 200,
                animation: 'fade-in 0.1s ease-out'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                className="tutor-dropdown-item"
                onClick={() => { handleAIToggle(); setActiveMenuId(null) }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.sparkles({ s: 14 })}</span>
                <span>{showAI ? 'Ocultar recomendaciones' : 'Recomendaciones IA'}</span>
              </button>
              
              <button
                type="button"
                className="tutor-dropdown-item"
                onClick={() => { onConfigureFeatures(); setActiveMenuId(null) }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.shield({ s: 14 })}</span>
                <span>Opciones</span>
              </button>
              
              <button
                type="button"
                className="tutor-dropdown-item"
                onClick={() => { onPermissions({ id: dep?.id, nombreCompleto: dep?.nombreCompleto || dep?.nombre }); setActiveMenuId(null) }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.shieldCheck({ s: 14 })}</span>
                <span>Permisos</span>
              </button>
              
              <button
                type="button"
                className="tutor-dropdown-item"
                onClick={() => { onEdit(); setActiveMenuId(null) }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.edit({ s: 14 })}</span>
                <span>Editar</span>
              </button>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
              
              {isLinked && onUnlink && (
                <button
                  type="button"
                  className="tutor-dropdown-item danger"
                  onClick={() => { onUnlink(); setActiveMenuId(null) }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.link({ s: 14 })}</span>
                  <span>{TUTOR_UI.UNLINK_BUTTON}</span>
                </button>
              )}
              
              <button
                type="button"
                className="tutor-dropdown-item danger"
                onClick={() => { onDelete(); setActiveMenuId(null) }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 16 }}>{Icons.x({ s: 14 })}</span>
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {dep?.tiposDiscapacidad?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {dep.tiposDiscapacidad.map((d, i) => (<span key={i} style={{ ...minimalBadge, fontSize: 11, padding: '3px 8px' }}>{d}</span>))}
        </div>
      )}
      {dep?.notas && (<p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0, lineHeight: 1.5, background: 'var(--bg-cool)', padding: '10px 12px', borderRadius: 8 }}>{dep.notas}</p>)}
      {showAI && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>{Icons.sparkles({ s: 12 })} {TUTOR_UI.AI_STEPS_TITLE} {nombre}</p>
          {aiRec.isPending && (<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{[100, 85, 90].map((w, i) => (<div key={i} style={{ height: 12, width: `${w}%`, borderRadius: 4, background: 'var(--border-color)', animation: 'pulse 1.5s ease-in-out infinite' }} />))}</div>)}
          {aiRec.isError && (<p style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}>{TUTOR_UI.AI_ERROR}</p>)}
          {aiRec.data && (<><ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>{aiRec.data.next_steps?.map((step, i) => (<li key={i} style={{ fontSize: 13, color: 'var(--fg1)', lineHeight: 1.5 }}>{step}</li>))}</ol>{aiRec.data.reasoning && (<p style={{ fontSize: 11, color: 'var(--fg3)', margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>{aiRec.data.reasoning}{aiRec.data.mock && ' (modo demo)'}</p>)}</>)}
        </div>
      )}
    </div>
  )
}

/* ── Formulario (modal) ── */
function DependentForm({ initial, onCancel, onSave, saving, relationships = [], lifeStages = [], disabilities = [] }) {
  const [form, setForm] = useState({
    id: initial?.id,
    nombreCompleto: initial?.nombreCompleto ?? initial?.nombre ?? '',
    parentesco: initial?.parentesco ?? relationships[0] ?? '',
    tiposDiscapacidad: initial?.tiposDiscapacidad ?? [],
    etapaVida: initial?.etapaVida ?? '',
    notas: initial?.notas ?? '',
    birth_date: initial?.id ? localStorage.getItem(`raices_dep_birth_date_${initial.id}`) || '' : '',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleDis = (d) => setForm(f => ({ ...f, tiposDiscapacidad: f.tiposDiscapacidad.includes(d) ? f.tiposDiscapacidad.filter(x => x !== d) : [...f.tiposDiscapacidad, d] }))
  const submit = (e) => { e.preventDefault(); if (!form.nombreCompleto.trim()) return; onSave(form) }

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={form.id ? 'Editar persona' : 'Agregar persona'} style={{ ...minimalCard, padding: 28, maxWidth: 540, width: '100%', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{form.id ? TUTOR_UI.EDIT_TITLE : TUTOR_UI.CREATE_TITLE}</h2>
          <button onClick={onCancel} aria-label="Cerrar" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.x({ s: 18 })}</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}><label htmlFor="dep-name" style={labelStyle}>{TUTOR_UI.NAME_LABEL}</label><input id="dep-name" style={inputStyle} value={form.nombreCompleto} onChange={set('nombreCompleto')} required placeholder={TUTOR_UI.NAME_PLACEHOLDER} autoFocus /></div>
          <div style={{ marginBottom: 18 }}><label htmlFor="dep-rel" style={labelStyle}>{TUTOR_UI.RELATION_LABEL}</label><select id="dep-rel" style={{ ...inputStyle, cursor: 'pointer' }} value={form.parentesco} onChange={set('parentesco')}>{relationships.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          
          <div style={{ marginBottom: 18 }}>
            <label htmlFor="dep-birth-date" style={labelStyle}>Fecha de nacimiento</label>
            <input
              type="date"
              id="dep-birth-date"
              style={inputStyle}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              value={form.birth_date || ''}
              onChange={e => {
                const bdate = e.target.value
                let calculatedStage = ''
                if (bdate) {
                  const birthDate = new Date(bdate)
                  if (!isNaN(birthDate.getTime())) {
                    const today = new Date()
                    let age = today.getFullYear() - birthDate.getFullYear()
                    const m = today.getMonth() - birthDate.getMonth()
                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                      age--
                    }
                    if (age <= 12) calculatedStage = 'infancia'
                    else if (age <= 17) calculatedStage = 'adolescencia'
                    else if (age <= 29) calculatedStage = 'adultoJoven'
                    else if (age <= 59) calculatedStage = 'adulto'
                    else calculatedStage = 'mayor'
                  }
                }
                setForm(f => ({ ...f, birth_date: bdate, etapaVida: calculatedStage }))
              }}
            />
          </div>
          {(() => {
            const listDis = disabilities.filter(d => {
              const name = d.toLowerCase()
              return name.includes('motriz') || name.includes('visual') || name.includes('auditiva') || 
                     name.includes('intelectual') || name.includes('psicosocial') || 
                     name.includes('múltiple') || name.includes('multiple') || name.includes('otra')
            })
            const listCond = disabilities.filter(d => !listDis.includes(d))

            return (
              <>
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 18px' }}>
                  <legend style={{ ...labelStyle, padding: 0 }}>{TUTOR_UI.DISABILITY_LABEL}</legend>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {listDis.map(d => { const on = form.tiposDiscapacidad.includes(d); return (<button key={d} type="button" onClick={() => toggleDis(d)} aria-pressed={on} style={{ padding: '8px 14px', minHeight: 44, borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, border: on ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: on ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: on ? 'var(--primary)' : 'var(--fg2)' }}>{on && <span aria-hidden="true">✓ </span>}{d}</button>) })}
                  </div>
                </fieldset>

                {listCond.length > 0 && (
                  <fieldset style={{ border: 'none', padding: 0, margin: '0 0 18px' }}>
                    <legend style={{ ...labelStyle, padding: 0 }}>Condición</legend>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {listCond.map(d => { const on = form.tiposDiscapacidad.includes(d); return (<button key={d} type="button" onClick={() => toggleDis(d)} aria-pressed={on} style={{ padding: '8px 14px', minHeight: 44, borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, border: on ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: on ? 'var(--primary-subtle)' : 'var(--bg-surface)', color: on ? 'var(--primary)' : 'var(--fg2)' }}>{on && <span aria-hidden="true">✓ </span>}{d}</button>) })}
                    </div>
                  </fieldset>
                )}
              </>
            )
          })()}
          <div style={{ marginBottom: 24 }}><label htmlFor="dep-notes" style={labelStyle}>{TUTOR_UI.NOTES_LABEL}</label><textarea id="dep-notes" value={form.notas} onChange={set('notas')} rows={3} placeholder={TUTOR_UI.NOTES_PLACEHOLDER} style={{ ...inputStyle, height: 'auto', paddingTop: 12, paddingBottom: 12, resize: 'vertical', lineHeight: 1.5 }} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button 
              type="button" 
              onClick={onCancel}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#F3D6E1',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E8BCCF'}
              onMouseLeave={e => e.currentTarget.style.background = '#F3D6E1'}
            >
              {TUTOR_UI.CANCEL_BUTTON}
            </button>
            <button 
              type="submit" 
              disabled={saving || !form.nombreCompleto.trim()}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                opacity: (saving || !form.nombreCompleto.trim()) ? 0.6 : 1,
              }}
            >
              {saving ? TUTOR_UI.SAVE_BUTTON_LOADING : form.id ? TUTOR_UI.SAVE_BUTTON : TUTOR_UI.ADD_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Confirmación ── */
function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-label={title} style={{ ...minimalCard, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'color-mix(in oklch, var(--color-error) 15%, transparent)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.shieldAlert({ s: 20 })}</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: 15, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" onClick={onCancel}>{TUTOR_UI.CANCEL_BUTTON}</button>
          <button onClick={onConfirm} style={{ fontSize: 17, padding: '12px 24px', minHeight: 48, borderRadius: 'var(--radius-pill)', border: '2px solid var(--color-error)', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)', background: 'var(--color-error)', color: '#fff' }}>{confirmLabel || TUTOR_UI.CONFIRM_DELETE_BUTTON}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Modal para vincular cuenta PCD ── */
function VincularPCDModal({ onVincular, onCancel, saving }) {
  const [pcdEmail, setPcdEmail] = useState('')
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pcdEmail)
  const submit = (e) => { e.preventDefault(); if (!isValidEmail) return; onVincular(pcdEmail.trim()) }

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Vincular persona" style={{ ...minimalCard, padding: 28, maxWidth: 440, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.link({ s: 20 })}</div>
          <div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{TUTOR_UI.LINK_TITLE}</h2><p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>{TUTOR_UI.LINK_MODAL_SUBTITLE}</p></div>
        </div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 20 }}><label htmlFor="pcd-email" style={labelStyle}>{TUTOR_UI.PCD_EMAIL_LABEL}</label><input id="pcd-email" type="email" style={{ ...inputStyle, opacity: saving ? 0.6 : 1 }} value={pcdEmail} onChange={e => setPcdEmail(e.target.value)} required placeholder={TUTOR_UI.PCD_EMAIL_PLACEHOLDER} autoFocus disabled={saving} /><p style={{ fontSize: 12, color: 'var(--fg3)', margin: '6px 0 0' }}>{TUTOR_UI.PCD_EMAIL_HINT}</p></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button 
              type="button" 
              onClick={onCancel}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#F3D6E1',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E8BCCF'}
              onMouseLeave={e => e.currentTarget.style.background = '#F3D6E1'}
            >
              {TUTOR_UI.CANCEL_BUTTON}
            </button>
            <button 
              type="submit" 
              disabled={saving || !isValidEmail}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                opacity: (saving || !isValidEmail) ? 0.6 : 1,
              }}
            >
              {saving ? TUTOR_UI.LINK_BUTTON_LOADING : TUTOR_UI.LINK_BUTTON}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal de configuración de features ── */
function FeaturesConfigModal({ dependent, features = [], onSave, onCancel, saving }) {
  const nombre = dependent?.nombreCompleto || dependent?.nombre || 'esta persona'
  const depFeatures = dependent?.features || {}
  const [form, setForm] = useState(() => { const initial = {}; features.forEach(f => { initial[f.id] = depFeatures[f.id] ?? true }); return initial })
  const toggleFeature = (id) => setForm(f => ({ ...f, [id]: !f[id] }))
  const submit = (e) => { e.preventDefault(); onSave({ id: dependent.isLinked ? (dependent.pcdUserId || dependent.id) : dependent.id, features: form, isLinked: !!dependent.isLinked }) }

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Configurar features" style={{ ...minimalCard, padding: 28, maxWidth: 480, width: '100%', margin: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icons.shield({ s: 22 })}</div>
            <div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>{TUTOR_UI.FEATURES_TITLE} {nombre}</h2><p style={{ fontSize: 13, color: 'var(--fg2)', margin: '2px 0 0' }}>{TUTOR_UI.FEATURES_MODAL_DESC}</p></div>
          </div>
          <button onClick={onCancel} aria-label="Cerrar" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.x({ s: 18 })}</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, maxHeight: '260px', overflowY: 'auto', paddingRight: '6px' }}>
            {features.map(f => {
              const enabled = form[f.id]; 
              return (
                <button 
                  key={f.id} 
                  type="button" 
                  onClick={() => toggleFeature(f.id)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 14, 
                    padding: '14px 16px', 
                    borderRadius: '12px', 
                    border: enabled ? '2px solid var(--primary)' : '1.5px solid var(--border-color)', 
                    background: enabled ? 'var(--primary-subtle)' : 'var(--bg-surface)', 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    transition: 'all 0.15s ease' 
                  }}
                >
                  <div 
                    style={{ 
                      width: 22, 
                      height: 22, 
                      borderRadius: '50%', 
                      border: enabled ? '2.5px solid var(--primary)' : '2.5px solid var(--border-color)', 
                      background: enabled ? 'var(--primary)' : 'transparent', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0, 
                      transition: 'all 0.15s ease',
                      color: '#fff'
                    }}
                  >
                    {enabled && <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: enabled ? 'var(--primary)' : 'var(--fg1)', margin: 0 }}>{f.label}</p>
                    <p style={{ fontSize: 12.5, color: 'var(--fg2)', margin: '2px 0 0' }}>{f.description}</p>
                  </div>
                </button>
              ) 
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button 
              type="button" 
              onClick={onCancel}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#F3D6E1',
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E8BCCF'}
              onMouseLeave={e => e.currentTarget.style.background = '#F3D6E1'}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving}
              style={{
                fontSize: 14.5,
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? TUTOR_UI.SAVE_BUTTON_LOADING : 'Guardar permisos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
