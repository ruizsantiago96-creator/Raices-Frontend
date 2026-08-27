import { useState, useEffect } from 'react'
import { useMe } from '@features/auth'
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
import { useCatalogos } from '@shared/hooks/useCatalogos'
import { Icons } from '@shared/components/shared'
import PermissionsModal from '../components/PermissionsModal'
import DependentCard from '../components/DependentCard'
import DependentForm from '../components/DependentForm'
import ConfirmDialog from '../components/ConfirmDialog'
import VincularPCDModal from '../components/VincularPCDModal'
import FeaturesConfigModal from '../components/FeaturesConfigModal'
import { TUTOR_TOAST, TUTOR_UI } from '../constants/tutorMessages'
import BackendFallback from '@shared/components/BackendFallback'
import { DEPENDENT_ENDPOINTS } from '@shared/constants/backendEndpoints'

const minimalBadge = {
  display: 'inline-flex', alignItems: 'center', padding: '4px 10px',
  borderRadius: 6, fontSize: 12, fontWeight: 500,
  background: 'var(--bg-cool)', color: 'var(--fg2)',
}
const minimalSectionTitle = {
  fontSize: 13, fontWeight: 600, color: 'var(--fg3)', margin: '0 0 12px 4px',
}

export default function TutorPage() {
  useMe()
  const { addToast } = useUiStore()
  const { data: catalogos } = useCatalogos()
  const { data: dependents = [], isLoading, isError: dependentsError, refetch: refetchDependents } = useDependientes()
  const { data: countData } = useDependientesCount()
  const add = useAddDependiente()
  const register = useRegisterDependiente()
  const update = useUpdateDependent()
  const del = useDeleteDependent()

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
  const [permissionsFor, setPermissionsFor] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    const handleCloseMenu = () => setActiveMenuId(null)
    window.addEventListener('click', handleCloseMenu)
    return () => window.removeEventListener('click', handleCloseMenu)
  }, [])

  const managedDeps = dependents.filter(d => !d.esCuentaVinculada)
  const linkedDeps = dependents.filter(d => d.esCuentaVinculada)
  const totalDeps = dependents.length
  const countLimit = countData?.limite ?? null
  const limitReached = countLimit !== null && totalDeps >= countLimit

  const handleCreate = (payload) => {
    if (payload.crearCuenta && payload.email && payload.password) {
      add.mutate(payload, {
        onSuccess: (newDep) => {
          if (payload.birth_date && newDep?.id) localStorage.setItem(`raices_dep_birth_date_${newDep.id}`, payload.birth_date)
          register.mutate({ email: payload.email, password: payload.password, dependienteId: newDep?.id }, {
            onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_CREATED, 'success'); setShowCreate(false) },
            onError: (e) => addToast(TUTOR_TOAST.DEPENDENT_CREATED_WITH_ACCOUNT_WARNING + (e?.message ?? 'Error'), 'warning'),
          })
        },
        onError: (e) => addToast(e?.message ?? TUTOR_TOAST.SAVE_ERROR, 'error'),
      })
    } else {
      add.mutate(payload, {
        onSuccess: (newDep) => {
          if (payload.birth_date && newDep?.id) localStorage.setItem(`raices_dep_birth_date_${newDep.id}`, payload.birth_date)
          addToast(TUTOR_TOAST.DEPENDENT_ADDED, 'success'); setShowCreate(false)
        },
        onError: (e) => addToast(e?.message ?? TUTOR_TOAST.SAVE_ERROR, 'error'),
      })
    }
  }

  const handleUpdate = (form) => {
    if (form.birth_date && form.id) localStorage.setItem(`raices_dep_birth_date_${form.id}`, form.birth_date)
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
    const mutation = isLinked ? updatePCDFeatures : updateFeatures
    const params = isLinked ? { pcdId: id, features } : { id, features }
    mutation.mutate(params, {
      onSuccess: () => { addToast(TUTOR_TOAST.FEATURES_UPDATED, 'success'); setConfiguringFeatures(null) },
      onError: (e) => addToast(e?.message ?? TUTOR_TOAST.PERMISSIONS_ERROR, 'error'),
    })
  }

  const doUnlink = () => {
    const pcdUserId = confirmUnlink?.pcdUserId
    if (!pcdUserId) return
    unlinkPCD.mutate(pcdUserId, {
      onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_UNLINKED, 'success'); setConfirmUnlink(null) },
      onError: (e) => addToast(e?.response?.data?.mensaje ?? e?.message ?? TUTOR_TOAST.UNLINK_ERROR, 'error'),
    })
  }

  return (
    <>
      <main id="main" className="responsive-main" style={{ '--main-max-width': '960px' }}>
        <style>{`
          .tutor-dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border-radius: 8px; border: none; background: transparent; color: var(--fg1); font-size: 13.5px; font-weight: 500; cursor: pointer; text-align: left; font-family: var(--font-body); transition: all 0.15s ease; }
          .tutor-dropdown-item:hover { background: var(--bg-warm) !important; }
          .tutor-dropdown-item.danger { color: var(--color-error) !important; }
          .tutor-dropdown-item.danger:hover { background: color-mix(in oklch, var(--color-error) 10%, transparent) !important; }
        `}</style>
        <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 className="animate-title" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--fg1)', margin: 0 }}>Personas</h1>
            {!isLoading && !dependentsError && <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>{totalDeps} {totalDeps === 1 ? 'persona' : 'personas'} en tu cuidado{countLimit !== null ? ` · ${countLimit - totalDeps} espacios disponibles` : ''}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setShowVincular(true)} className="btn-secondary" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8 }}>{Icons.link({ s: 14 })} Vincular</button>
            <button className="btn-primary tutor-btn" onClick={() => setShowCreate(true)} disabled={limitReached} style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8 }} title={limitReached ? TUTOR_UI.COUNT_LIMIT_HINT : undefined}>{Icons.plus({ s: 14 })} Agregar</button>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          {dependentsError ? (
            <BackendFallback method={DEPENDENT_ENDPOINTS.LIST.method} endpoint={DEPENDENT_ENDPOINTS.LIST.path} onRetry={() => refetchDependents()} />
          ) : isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {[0, 1].map(i => <div key={i} className="card" style={{ padding: 20 }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} /><div style={{ flex: 1 }}><div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--border-color)', animation: 'pulse 1.5s infinite', marginBottom: 8 }} /><div style={{ width: '40%', height: 12, borderRadius: 4, background: 'var(--border-color)', animation: 'pulse 1.5s infinite' }} /></div></div></div>)}
            </div>
          ) : dependents.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{Icons.users({ s: 24 })}</div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg1)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>{TUTOR_UI.EMPTY_TITLE}</h2>
              <p style={{ fontSize: 14, color: 'var(--fg3)', marginBottom: 20, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>{TUTOR_UI.EMPTY_DESCRIPTION}</p>
              <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ fontSize: 14, padding: '10px 20px', borderRadius: 8 }}>{Icons.plus({ s: 14 })} {TUTOR_UI.ADD_FIRST_PERSON}</button>
            </div>
          ) : (
            <>
              {managedDeps.length > 0 && (
                <div style={{ marginBottom: linkedDeps.length > 0 ? 28 : 0 }}>
                  <h2 style={{ ...minimalSectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}>{TUTOR_UI.MANAGED_SECTION_TITLE}<span style={{ ...minimalBadge, fontSize: 11, padding: '2px 6px' }}>{managedDeps.length}</span></h2>
                  <div className="tutor-cards-grid stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                    {managedDeps.map(dep => <div key={dep?.id} className="animate-scale-in" style={{ position: 'relative', zIndex: activeMenuId === dep.id ? 10 : 1 }}><DependentCard dep={dep} lifeStages={LIFE_STAGES} onEdit={() => setEditing(dep)} onDelete={() => setConfirm(dep)} onConfigureFeatures={() => setConfiguringFeatures(dep)} onPermissions={(data) => setPermissionsFor(data)} activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId} /></div>)}
                  </div>
                </div>
              )}
              {linkedDeps.length > 0 && (
                <div>
                  <h2 style={{ ...minimalSectionTitle, display: 'flex', alignItems: 'center', gap: 6 }}>{TUTOR_UI.LINKED_SECTION_TITLE}<span style={{ ...minimalBadge, fontSize: 11, padding: '2px 6px' }}>{linkedDeps.length}</span></h2>
                  <div className="tutor-cards-grid stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                    {linkedDeps.map(dep => <div key={dep?.id || dep?.pcdUserId} className="animate-scale-in" style={{ position: 'relative', zIndex: activeMenuId === dep.id ? 10 : 1 }}><DependentCard dep={dep} lifeStages={LIFE_STAGES} isLinked={true} onEdit={() => setEditing(dep)} onDelete={() => setConfirm(dep)} onUnlink={() => setConfirmUnlink(dep)} onConfigureFeatures={() => setConfiguringFeatures({ ...dep, isLinked: true })} onPermissions={(data) => setPermissionsFor(data)} activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId} /></div>)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showCreate && <DependentForm initial={null} onCancel={() => setShowCreate(false)} onSave={handleCreate} saving={add.isPending} relationships={RELATIONSHIPS} lifeStages={LIFE_STAGES} disabilities={DISABILITIES} />}
      {editing !== null && <DependentForm initial={editing} onCancel={() => setEditing(null)} onSave={handleUpdate} saving={update.isPending} relationships={RELATIONSHIPS} lifeStages={LIFE_STAGES} disabilities={DISABILITIES} />}
      {confirm && <ConfirmDialog title={TUTOR_UI.CONFIRM_DELETE_TITLE} message={`¿Seguro que quieres eliminar a "${confirm?.nombreCompleto || 'esta persona'}"? Se borrarán sus datos guardados.`} onConfirm={doDelete} onCancel={() => setConfirm(null)} />}
      {confirmUnlink && <ConfirmDialog title={TUTOR_UI.CONFIRM_UNLINK_TITLE} message={TUTOR_UI.CONFIRM_UNLINK_MESSAGE(confirmUnlink?.nombreCompleto || 'esta persona')} onConfirm={doUnlink} onCancel={() => setConfirmUnlink(null)} confirmLabel={TUTOR_UI.UNLINK_BUTTON} />}
      {configuringFeatures && <FeaturesConfigModal dependent={configuringFeatures} features={AVAILABLE_FEATURES} onSave={handleFeaturesSave} onCancel={() => setConfiguringFeatures(null)} saving={updateFeatures.isPending || updatePCDFeatures.isPending} />}
      {showVincular && <VincularPCDModal onVincular={(email) => { vincularPCD.mutate(email, { onSuccess: () => { addToast(TUTOR_TOAST.DEPENDENT_LINKED, 'success'); setShowVincular(false) }, onError: (e) => addToast(e?.response?.data?.mensaje ?? e?.message ?? TUTOR_TOAST.LINK_ERROR, 'error') }) }} onCancel={() => setShowVincular(false)} saving={vincularPCD.isPending} />}
      {permissionsFor && <PermissionsModal dependienteId={permissionsFor.id} dependienteName={permissionsFor.nombreCompleto || 'esta persona'} onClose={() => setPermissionsFor(null)} />}
    </>
  )
}
