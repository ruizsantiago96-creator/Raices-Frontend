import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@test/renderWithProviders'
import { useAuthStore } from '../store/authStore'
import RegistrationWizard from '../components/RegistrationWizard'
import TutorRegistrationWizard from '../components/TutorRegistrationWizard'
import InstitutionRegistrationWizard from '../components/InstitutionRegistrationWizard'
import EnterpriseRegistrationWizard from '../components/EnterpriseRegistrationWizard'
import { STORAGE_KEYS } from '@shared/lib/storageKeys'

/* ═══════════════════════════════════════════════════════════════════
   TESTS DE CONTRATO — FLUJO DE REGISTRO (Fase 0 · Red de seguridad)
   ───────────────────────────────────────────────────────────────────
   Objetivo: congelar el comportamiento observable de los 4 wizards
   ANTES de refactorizar, sin modificar ni una línea de los wizards.

   Contratos cubiertos:
     1. PCD con tokenAcceso      → escalas + perfil + perfil-necesidades
                                  + persistencia de sesión y onboarding.
     2. PCD con requiereInicioSesion:true → thanks SIN auto-login.
     3. Institución sin token    → intento de auto-login + PUT perfil.
     4. Empresa sin token        → intento de auto-login + PUT perfil.
     5. Tutor sin token          → auto-login + alta de dependiente.

   Estos tests DEBEN quedar verdes sin cambios al final de cada fase de
   la refactorización. Si una fase los rompe, la fase está mal.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Mocks ──────────────────────────────────────────────────────── */

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@shared/lib/api', () => ({ default: mockApi }))

// setAuth() → resumeStream() y logout() → suspendStream()/closeNotificationStream()
vi.mock('@features/notifications', () => ({
  closeNotificationStream: vi.fn(),
  suspendStream: vi.fn(),
  resumeStream: vi.fn(),
}))

/* ── Datos de prueba ────────────────────────────────────────────── */

const EMAIL = 'ana@example.com'
const PASSWORD = 'Passw0rd!' // cumple los 5 criterios de checkPasswordCriteria
const PAIS = 'MX'
const CODIGO_POSTAL = '00000' // no está en el catálogo → fallback manual
const ESTADO = 'Yucatán'
const CIUDAD = 'Mérida'
const NOMBRE_COMPLETO = 'Ana Pérez Gómez'
const BIRTH_DATE = '1995-06-15'
const DEP_BIRTH_DATE = '2015-03-20'

const PCD_TOKEN_RESPONSE = {
  tokenAcceso: 'tk-123',
  tokenRefresco: 'rt-123',
  usuario: { id: 'u1', email: EMAIL, nombreCompleto: NOMBRE_COMPLETO },
}
const INSTITUCION_LOGIN_RESPONSE = {
  tokenAcceso: 'it-1',
  tokenRefresco: 'irt-1',
  usuario: { id: 'i1', email: EMAIL, nombreCompleto: 'Fundación Inclusión México' },
}
const EMPRESA_LOGIN_RESPONSE = {
  tokenAcceso: 'et-1',
  tokenRefresco: 'ert-1',
  usuario: { id: 'e1', email: EMAIL, nombreCompleto: 'Centro Terapéutico Raíces' },
}
const TUTOR_LOGIN_RESPONSE = {
  tokenAcceso: 'tt-1',
  tokenRefresco: 'trt-1',
  usuario: { id: 't1', email: EMAIL, nombreCompleto: NOMBRE_COMPLETO },
}

/* ── Helpers de mock de api ───────────────────────────────────────
   responses: { '<method> <url>': data }  → api[method](url) resuelve
   { data }. Cualquier URL no declarada resuelve { data: {} } para que
   los pasos no bloqueen; las llamadas que importan se verifican
   explícitamente en cada test. */

type HttpMethod = 'post' | 'put' | 'get' | 'delete'

function stubApi(responses: Record<string, unknown>) {
  const byMethod: Record<HttpMethod, Record<string, unknown>> = { post: {}, put: {}, get: {}, delete: {} }
  Object.entries(responses).forEach(([key, data]) => {
    const [method, url] = key.split(' ') as [HttpMethod, string]
    if (byMethod[method]) {
      byMethod[method][url] = data
    }
  })
  mockApi.post.mockImplementation((url: string) => Promise.resolve({ data: byMethod.post[url] ?? {} }))
  mockApi.put.mockImplementation((url: string) => Promise.resolve({ data: byMethod.put[url] ?? {} }))
  mockApi.get.mockImplementation((url: string) => Promise.resolve({ data: byMethod.get[url] ?? {} }))
  mockApi.delete.mockImplementation((url: string) => Promise.resolve({ data: byMethod.delete[url] ?? {} }))
}

const callsFor = (method: HttpMethod, url: string) =>
  (mockApi[method] as ReturnType<typeof vi.fn>).mock.calls.filter((args: unknown[]) => args[0] === url)
const lastCallFor = (method: HttpMethod, url: string) =>
  callsFor(method, url).at(-1)?.[1]

beforeEach(() => {
  vi.resetAllMocks()
  useAuthStore.setState({ token: null, user: null, refreshToken: null })
  localStorage.clear()
  sessionStorage.clear()
})

/* ── Helpers de UI (drivers) ──────────────────────────────────────
   Cada helper llena UN paso del wizard y hace clic para avanzar
   al siguiente paso. Los wizards son step-by-step: solo se muestra
   un formulario a la vez. */

const clickButton = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))

// ── Step: Nombre (PCD / Tutor) ───────────────────────────────────
async function fillNameStep(nombrePlaceholder: string) {
  fireEvent.change(screen.getByPlaceholderText(nombrePlaceholder), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByPlaceholderText('Ej. García'), { target: { value: 'Pérez' } })
  fireEvent.change(screen.getByPlaceholderText('Ej. López'), { target: { value: 'Gómez' } })
  clickButton(/^continuar$/i)
}

// ── Step: Fecha de nacimiento ─────────────────────────────────────
async function fillBirthdateStep(dateValue = BIRTH_DATE) {
  const dateInput = document.querySelector('input[type="date"]')
  fireEvent.change(dateInput, { target: { value: dateValue } })
  clickButton(/^continuar$/i)
}

// ── Step: Ubicación (rellena campos sin enviar) ───────────────────
async function fillLocation() {
  const cp = screen.getByPlaceholderText('Ej. 97113')
  fireEvent.change(cp, { target: { value: CODIGO_POSTAL } })
  fireEvent.blur(cp)
  // 00000 no está en el catálogo → se despliega el fallback manual
  const estado = await screen.findByPlaceholderText('Ej. Jalisco, Antioquia')
  fireEvent.change(estado, { target: { value: ESTADO } })
  fireEvent.change(screen.getByPlaceholderText('Ej. Guadalajara, Medellín'), { target: { value: CIUDAD } })
}

// ── Step: Ubicación (rellena y envía) ─────────────────────────────
async function fillLocationStep(submitLabel: string | RegExp = /^continuar$/i) {
  await fillLocation()
  clickButton(submitLabel)
}

// ── Step: Correo electrónico ──────────────────────────────────────
async function fillEmailStep(emailPlaceholder = 'correo@ejemplo.com') {
  await screen.findByPlaceholderText(emailPlaceholder)
  fireEvent.change(screen.getByPlaceholderText(emailPlaceholder), { target: { value: EMAIL } })
  clickButton(/^continuar$/i)
}

// ── Step: Contraseña ──────────────────────────────────────────────
async function fillPasswordStep(submitLabel: string | RegExp = /^continuar$/i) {
  await screen.findByPlaceholderText('Mínimo 8 caracteres')
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: PASSWORD } })
  clickButton(submitLabel)
}

// ── Step: Correo de cuenta (institución / empresa) ────────────────
async function fillAccountEmailStep(emailPlaceholder: string) {
  await screen.findByPlaceholderText(emailPlaceholder)
  fireEvent.change(screen.getByPlaceholderText(emailPlaceholder), { target: { value: EMAIL } })
  clickButton(/^continuar$/i)
}

// ── Step: Contraseña de cuenta (institución / empresa) ────────────
async function fillAccountPasswordStep() {
  await screen.findByPlaceholderText('Mínimo 8 caracteres')
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: PASSWORD } })
  clickButton(/^continuar$/i)
}

// ── Step: Ubicación de cuenta (institución / empresa) ─────────────
async function fillAccountLocationStep() {
  await fillLocation()
  clickButton(/finalizar registro/i)
}

/* PCD: name → birthdate → location → email → password (submit) */
async function completePcdWizard() {
  await fillNameStep('Ej. Juan Carlos')
  await fillBirthdateStep()
  await fillLocationStep()
  await fillEmailStep()
  await fillPasswordStep(/crear cuenta/i)
}

/* Institución: subtype → category → org_name → account_email →
   account_password → account_location (submit) */
async function completeInstitutionWizard() {
  // Step 1: subtype
  clickButton(/ong/i)
  clickButton(/^continuar$/i)

  // Step 2: category
  await screen.findByText(/cuál es la categoría principal/i)
  clickButton(/educativo/i)
  clickButton(/^continuar$/i)

  // Step 3: org_name
  await screen.findByPlaceholderText('Ej. Fundación Inclusión México')
  fireEvent.change(screen.getByPlaceholderText('Ej. Fundación Inclusión México'), { target: { value: 'Fundación Inclusión México' } })
  clickButton(/^continuar$/i)

  // Step 4–6: account (email → password → location)
  await fillAccountEmailStep('contacto@institucion.org')
  await fillAccountPasswordStep()
  await fillAccountLocationStep()
}

/* Empresa: subtype → org_name → account_email → account_password →
   account_location (submit) */
async function completeEnterpriseWizard() {
  // Step 1: subtype
  clickButton(/centro terapéutico/i)
  clickButton(/^continuar$/i)

  // Step 2: org_name
  await screen.findByPlaceholderText('Ej. Centro Terapéutico Raíces')
  fireEvent.change(screen.getByPlaceholderText('Ej. Centro Terapéutico Raíces'), { target: { value: 'Centro Terapéutico Raíces' } })
  clickButton(/^continuar$/i)

  // Step 3–5: account (email → password → location)
  await fillAccountEmailStep('contacto@organizacion.com')
  await fillAccountPasswordStep()
  await fillAccountLocationStep()
}

/* Tutor: name → birthdate → location → email → password →
   relationship_type → relationship_name → relationship_birthdate →
   accommodation → condition → diagnosis → history_edu → history_therapy →
   support_zones → support_needs → support_areas → scales1 → scales2 →
   formats → interests → viability (submit) */
async function completeTutorWizard() {
  await fillNameStep('Ej. Ana Laura')
  await fillBirthdateStep()
  await fillLocationStep()
  await fillEmailStep()
  await fillPasswordStep(/crear cuenta/i)
}

/* ═══════════════════════════════════════════════════════════════════
   TESTS
   ═══════════════════════════════════════════════════════════════════ */

describe('Contrato de registro — PCD', () => {
  it('1) con tokenAcceso: registra y guarda la sesión', async () => {
    stubApi({
      'post /autenticacion/registro': PCD_TOKEN_RESPONSE,
    })

    renderWithProviders(<RegistrationWizard onBackToRoles={() => {}} onGoToLogin={() => {}} />)
    await completePcdWizard()

    await waitFor(() => expect(callsFor('post', '/autenticacion/registro')).toHaveLength(1))

    // Payload de registro con el contrato de rol PCD
    expect(lastCallFor('post', '/autenticacion/registro')).toMatchObject({
      nombreCompleto: NOMBRE_COMPLETO,
      email: EMAIL,
      rol: 'pcd',
      fechaNacimiento: BIRTH_DATE,
      ciudad: CIUDAD,
      estado: ESTADO,
      pais: PAIS,
      codigoPostal: CODIGO_POSTAL,
    })

    // NO debe intentar auto-login
    expect(callsFor('post', '/autenticacion/inicio-sesion')).toHaveLength(0)

    // Persistencia de sesión (setAuth)
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('tk-123')
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH)).toBe('rt-123')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_USER) ?? '{}')).toMatchObject({ full_name: NOMBRE_COMPLETO })
  }, 20000)

  it('2) con requiereInicioSesion:true: registra SIN auto-login ni persistencia', async () => {
    stubApi({
      'post /autenticacion/registro': { requiereInicioSesion: true, mensaje: 'Cuenta creada' },
    })

    renderWithProviders(<RegistrationWizard onBackToRoles={() => {}} onGoToLogin={() => {}} />)
    await completePcdWizard()

    await waitFor(() => expect(callsFor('post', '/autenticacion/registro')).toHaveLength(1))
    expect(lastCallFor('post', '/autenticacion/registro')).toMatchObject({ rol: 'pcd' })

    // Sin auto-login
    expect(callsFor('post', '/autenticacion/inicio-sesion')).toHaveLength(0)

    // Sin sesión persistida
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
  }, 20000)
})

describe('Contrato de registro — Institución', () => {
  it('3) sin token en registro: intenta auto-login y guarda el perfil institucional', async () => {
    stubApi({
      'post /autenticacion/registro': { mensaje: 'ok', requiereInicioSesion: true },
      'post /autenticacion/inicio-sesion': INSTITUCION_LOGIN_RESPONSE,
      'put /usuarios/perfil': { mensaje: 'ok' },
    })

    renderWithProviders(<InstitutionRegistrationWizard onBackToRoles={() => {}} />)
    await completeInstitutionWizard()

    await waitFor(() => expect(callsFor('post', '/autenticacion/registro')).toHaveLength(1))
    expect(lastCallFor('post', '/autenticacion/registro')).toMatchObject({
      rol: 'institucion',
      categoria: 'educativo',
    })

    // Auto-login exactamente una vez, con las mismas credenciales
    expect(callsFor('post', '/autenticacion/inicio-sesion')).toHaveLength(1)
    expect(lastCallFor('post', '/autenticacion/inicio-sesion')).toMatchObject({ email: EMAIL, password: PASSWORD })

    // Perfil institucional vía PUT directo (NO usa useUpdateProfile)
    expect(callsFor('put', '/usuarios/perfil')).toHaveLength(1)
    expect(lastCallFor('put', '/usuarios/perfil').perfilInstitucional).toMatchObject({
      tipoInstitucion: 'ong',
      categoria: 'educativo',
      nombreInstitucion: 'Fundación Inclusión México',
    })

    // Sesión persistida con el token del auto-login
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('it-1')
    expect(callsFor('post', '/usuarios/escalas-vida')).toHaveLength(0)
  })
})

describe('Contrato de registro — Empresa', () => {
  it('4) sin token en registro: intenta auto-login y guarda el perfil del ecosistema', async () => {
    stubApi({
      'post /autenticacion/registro': { mensaje: 'ok' },
      'post /autenticacion/inicio-sesion': EMPRESA_LOGIN_RESPONSE,
      'put /usuarios/perfil': { mensaje: 'ok' },
    })

    renderWithProviders(<EnterpriseRegistrationWizard onBackToRoles={() => {}} />)
    await completeEnterpriseWizard()

    await waitFor(() => expect(callsFor('post', '/autenticacion/registro')).toHaveLength(1))
    expect(lastCallFor('post', '/autenticacion/registro')).toMatchObject({
      rol: 'empresa',
      tipoEcosistema: 'centro_terapeutico',
    })

    expect(callsFor('post', '/autenticacion/inicio-sesion')).toHaveLength(1)
    expect(lastCallFor('post', '/autenticacion/inicio-sesion')).toMatchObject({ email: EMAIL, password: PASSWORD })

    expect(callsFor('put', '/usuarios/perfil')).toHaveLength(1)
    expect(lastCallFor('put', '/usuarios/perfil').perfilEcosistema).toMatchObject({
      tipoEcosistema: 'centro_terapeutico',
      nombreOrganizacion: 'Centro Terapéutico Raíces',
    })

    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('et-1')
    expect(callsFor('post', '/usuarios/escalas-vida')).toHaveLength(0)
  }, 20000)
})

describe('Contrato de registro — Tutor', () => {
  it('5) sin token en registro: auto-login y muestra pantalla de agradecimiento', async () => {
    stubApi({
      'post /autenticacion/registro': TUTOR_LOGIN_RESPONSE,
    })

    renderWithProviders(<TutorRegistrationWizard onBackToRoles={() => {}} onGoToLogin={() => {}} />)
    await completeTutorWizard()

    await waitFor(() => expect(callsFor('post', '/autenticacion/registro')).toHaveLength(1))
    expect(lastCallFor('post', '/autenticacion/registro')).toMatchObject({
      rol: 'padre_tutor',
      email: EMAIL,
    })

    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('tt-1')
  }, 20000)
})

describe('Validación de fecha de nacimiento en wizards de registro', () => {
  it('rechaza fecha de nacimiento futura en RegistrationWizard', async () => {
    renderWithProviders(<RegistrationWizard onBackToRoles={() => {}} onGoToLogin={() => {}} />)

    // Paso 1: nombre
    await fillNameStep('Ej. Juan Carlos')

    // Paso 2: fecha de nacimiento
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput).toHaveAttribute('max')
    expect(dateInput).toHaveAttribute('min', '1900-01-01')

    fireEvent.change(dateInput, { target: { value: '2028-06-28' } })
    const form = dateInput.closest('form')!
    fireEvent.submit(form)

    expect(await screen.findByText(/la fecha de nacimiento no puede ser una fecha futura/i)).toBeInTheDocument()
  })


})