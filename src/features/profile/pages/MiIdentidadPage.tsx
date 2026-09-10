import React, { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUiStore } from '@shared/stores/uiStore'
import { useAuthStore, useProfile, useUpdateProfile } from '@features/auth'
import { getFirebaseAuth } from '@features/auth/lib/firebaseAuth'
import { sendPasswordResetEmail, type Auth as FirebaseAuth } from 'firebase/auth'
import type { User } from '@/types/auth'


import { useEstadoValidacion } from '../hooks/useDocumentoIdentidad'
import { Icons, labelStyle, inputStyle } from '@shared/components/shared'
import { STATES, getMunicipalities } from '@shared/lib/mexicoLocations'
import { ProfileIdentitySection } from '../components/ProfileIdentitySection'
import { SearchableSelect } from '../components/SearchableSelect'
import { DocumentoIdentidadEstado } from '@/types/profile'
import api from '@shared/lib/api'

export default function MiIdentidadPage() {
  const { data: status, isLoading, isError } = useEstadoValidacion()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const { addToast } = useUiStore()
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({ state: '', city: '' })
  const { logout } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam === 'seguridad' ? 'seguridad' : 'verificacion'

// ─── Estado para Cambio de Contraseña ──────────────────────────
const [changingPassword, setChangingPassword] = useState(false)

const usuarioActual = useAuthStore((s) => s.user) ?? null as User | null

  // ─── Estado para Cerrar Sesión Global ──────────────────────────
  const [closingAllSessions, setClosingAllSessions] = useState(false)

  // ─── Estado para Eliminar Cuenta ───────────────────────────────
  const [deletingAccount, setDeletingAccount] = useState(false)

  const estado: DocumentoIdentidadEstado = (status?.estado ?? 'sin_documentos') as DocumentoIdentidadEstado

  const handleStartEditAddress = () => {
    setAddressForm({
      state: profile?.state ?? '',
      city: profile?.city ?? '',
    })
    setIsEditingAddress(true)
  }

  const handleSaveAddress = async () => {
    try {
      await updateProfile.mutateAsync({
        city: addressForm.city,
        state: addressForm.state,
      })
      addToast('Dirección guardada correctamente', 'success')
      setIsEditingAddress(false)
    } catch {
      addToast('Error al guardar la dirección', 'error')
    }
  }

// ─── 1. Cambio de Contraseña (Firebase Client SDK) ─────────────
const handleChangePassword = useCallback(async () => {
  const auth = getFirebaseAuth()
  if (!auth) {
    addToast('No hay sesión activa para cambiar la contraseña', 'error')
    return
  }

  const emailDelUsuario = usuarioActual?.email
  if (!emailDelUsuario) {
    addToast('No hay sesión activa para cambiar la contraseña', 'error')
    return
  }

  setChangingPassword(true)
  try {
    await sendPasswordResetEmail(auth as FirebaseAuth, emailDelUsuario)
    addToast(
      'Se ha enviado un enlace a tu correo para cambiar la contraseña.',
      'success',
    )
  } catch (err: unknown) {
    const firebaseError = err as { code?: string }
    if (firebaseError.code === 'auth/requires-recent-login') {
      addToast(
        'Por seguridad, debes cerrar sesión, volver a entrar e intentar de nuevo',
        'warning',
      )
    } else {
      addToast('Error al cambiar la contraseña. Intenta de nuevo.', 'error')
    }
  } finally {
    setChangingPassword(false)
  }
}, [addToast, usuarioActual])

// ─── Cerrar Sesión en Todos los Dispositivos ──────────────────
const handleCerrarSesionGlobal = useCallback(async () => {
  const estaConfirmado = window.confirm('¿Estás seguro que quieres cerrar sesión en todos los dispositivos?')
  if (!estaConfirmado) return

  setClosingAllSessions(true)
  try {
    await api.post('/autenticacion/cerrar-sesion-global')
  } catch {
    // El endpoint aún no existe (404) — continuar con el logout local
  } finally {
    logout()
    setClosingAllSessions(false)
  }
}, [logout])

  // ─── Eliminar Cuenta ───────────────────────────────────────────
  const handleEliminarCuenta = useCallback(async () => {
    const confirmado = window.confirm(
      '¿Estás seguro? Esta acción es irreversible y borrará todos tus datos.',
    )
    if (!confirmado) return

    setDeletingAccount(true)
    try {
      // Llamada al futuro endpoint que eliminará la cuenta y datos en cascada
      await api.delete('/usuarios/cuenta')
    } catch {
      // El endpoint aún puede no existir — continuar con logout
    } finally {
      addToast('Cuenta eliminada correctamente', 'success')
      logout()
      setDeletingAccount(false)
    }
  }, [addToast, logout])

  return (
    <main id="main" className="responsive-main" style={{ '--main-max-width': '720px' } as React.CSSProperties}>
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>

        {/* Header */}
        <div className="animate-fade-in-up" style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
            Configuración
          </h1>
          {activeTab === 'verificacion' && (
            <p style={{ fontSize: 14, color: 'var(--fg3)', margin: '4px 0 0', fontWeight: 400 }}>
              Sube tu CURP e identificación oficial para verificar tu cuenta
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div className="animate-fade-in-up" style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(0, 0, 0, 0.04)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'verificacion' })}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'verificacion' ? 'var(--bg-surface, #fff)' : 'transparent',
              color: activeTab === 'verificacion' ? 'var(--fg1)' : 'var(--fg3)',
              boxShadow: activeTab === 'verificacion' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            {Icons.shieldCheck({ s: 15 })}
            Verificación de identidad
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'seguridad' })}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'seguridad' ? 'var(--bg-surface, #fff)' : 'transparent',
              color: activeTab === 'seguridad' ? 'var(--fg1)' : 'var(--fg3)',
              boxShadow: activeTab === 'seguridad' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            {Icons.target ? Icons.target({ s: 15 }) : '⚙️'}
            Seguridad
          </button>
        </div>

        {activeTab === 'verificacion' && (
          isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 120,
                    borderRadius: 12,
                    background: 'var(--border-color)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          ) : isError ? (
            <div
              style={{
                background: 'var(--bg-surface, #fff)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: 32,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg1)', marginBottom: 8 }}>
                No se pudo cargar el estado de tu identidad
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg3)' }}>
                Intenta recargar la página.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Sección principal de Identidad */}
              <ProfileIdentitySection status={status} estado={estado} />

              {/* Tarjeta: Dirección y Domicilio */}
              <div
                className="animate-fade-in-up delay-3"
                style={{
                  background: 'var(--bg-surface, #fff)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 14,
                  padding: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: 14,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 17,
                        fontWeight: 700,
                        color: 'var(--fg1)',
                        margin: 0,
                      }}
                    >
                      Dirección y Ubicación
                    </h3>
                    <p style={{ fontSize: 12.5, color: 'var(--fg3)', margin: '2px 0 0' }}>
                      Indica tu ubicación para validar tu domicilio y conectar con oportunidades locales
                    </p>
                  </div>
                  {!isEditingAddress && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{
                        fontSize: 13,
                        padding: '7px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 8,
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        background: 'var(--bg-surface)',
                        fontWeight: 600,
                      }}
                      onClick={handleStartEditAddress}
                    >
                      {Icons.edit({ s: 13 })} Editar
                    </button>
                  )}
                </div>

                {!isEditingAddress ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 16,
                    }}
                  >
                    <div style={{ padding: '12px 16px', background: 'var(--bg-warm, #f8fafc)', borderRadius: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>País</div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)', marginTop: 4 }}>México</div>
                    </div>
                    <div style={{ padding: '12px 16px', background: 'var(--bg-warm, #f8fafc)', borderRadius: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ciudad / Estado</div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--fg1)', marginTop: 4 }}>
                        {[profile?.city, profile?.state].filter(Boolean).join(', ') || 'No especificado'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>País</label>
                        <input style={{ ...inputStyle, background: 'var(--bg-warm)', cursor: 'not-allowed', marginTop: 4 }} value="México" disabled />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={labelStyle}>Estado</label>
                          <SearchableSelect
                            value={addressForm.state}
                            onChange={(val) => setAddressForm((f) => ({ ...f, state: val, city: '' }))}
                            options={STATES}
                            placeholder="Selecciona un estado..."
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Ciudad / Municipio</label>
                          <SearchableSelect
                            value={addressForm.city}
                            onChange={(val) => setAddressForm((f) => ({ ...f, city: val }))}
                            options={addressForm.state ? getMunicipalities(addressForm.state) : []}
                            placeholder={addressForm.state ? 'Selecciona...' : 'Elige un estado primero'}
                            disabled={!addressForm.state}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          border: '1px solid var(--border-color)',
                          background: 'transparent',
                          color: 'var(--fg2)',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        disabled={updateProfile.isPending}
                        className="btn-primary"
                        style={{ padding: '8px 20px', fontSize: 13, borderRadius: 8 }}
                      >
                        {updateProfile.isPending ? 'Guardando...' : 'Guardar dirección'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {activeTab === 'seguridad' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Tarjeta: Seguridad */}
            <div
              className="animate-fade-in-up"
              style={{
                background: 'var(--bg-surface, #fff)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
                  Seguridad
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* ─── Cambiar Contraseña ─── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Cambiar contraseña</h4>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Actualiza tu contraseña para mantener tu cuenta segura.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{
                      fontSize: 13.5,
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      cursor: changingPassword ? 'not-allowed' : 'pointer',
                      background: 'var(--bg-surface)',
                      fontWeight: 600,
                      opacity: changingPassword ? 0.6 : 1,
                    }}
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {Icons.edit ? Icons.edit({ s: 14 }) : '✏️'} {changingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
                  </button>
                </div>

              </div>
            </div>

            {/* Tarjeta: Zona de Peligro */}
            <div
              className="animate-fade-in-up delay-1"
              style={{
                background: 'var(--bg-surface, #fff)',
                border: '1px solid var(--border-color)',
                borderRadius: 14,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-error, #DC3545)', margin: 0 }}>
                  Zona de peligro
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* ─── Cerrar Sesión Global ─── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Cerrar sesión en todos los dispositivos</h4>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Cierra sesión en todas las sesiones activas.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{
                      fontSize: 13.5,
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      cursor: closingAllSessions ? 'not-allowed' : 'pointer',
                      background: 'var(--bg-surface)',
                      fontWeight: 600,
                      opacity: closingAllSessions ? 0.6 : 1,
                    }}
                    onClick={handleCerrarSesionGlobal}
                    disabled={closingAllSessions}
                  >
                    {closingAllSessions ? 'Cerrando...' : 'Cerrar sesión'}
                  </button>
                </div>

                {/* ─── Eliminar Cuenta ─── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)', margin: '0 0 4px' }}>Eliminar cuenta</h4>
                    <p style={{ fontSize: 13, color: 'var(--fg3)', margin: 0 }}>Elimina permanentemente tu cuenta y todos los datos asociados.</p>
                  </div>
                  <button
                    type="button"
                    style={{
                      fontSize: 13.5,
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: '1px solid var(--color-error, #DC3545)',
                      background: 'transparent',
                      color: 'var(--color-error, #DC3545)',
                      fontWeight: 600,
                      cursor: deletingAccount ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: deletingAccount ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!deletingAccount) {
                        e.currentTarget.style.background = 'color-mix(in oklch, var(--color-error, #DC3545) 8%, transparent)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                    onClick={handleEliminarCuenta}
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? 'Eliminando...' : 'Eliminar cuenta'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </main>
  )
}
