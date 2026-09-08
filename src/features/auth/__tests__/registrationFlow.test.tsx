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
const ESTADO = 'Yucatán'
const MUNICIPIO = 'Mérida'
const NOMBRE_COMPLETO = 'Ana Pérez Gómez'
const BIRTH_DATE = '1995-06-15'
const DEP_BIRTH_DATE = '2015-03-20'
const CURP_VALIDA = 'GARC850101HDFRLX09'

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
   Conducen cada wizard paso a paso haciendo clic/rellenando los
   campos reales. Los `await screen.findBy…` esperan a que el paso
   siguiente esté renderizado antes de interactuar. */

const clickButton = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }))

function fillStateCity() {
  const selects = screen.getAllByRole('combobox')
  fireEvent.change(selects[0], { target: { value: ESTADO } })
  fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: MUNICIPIO } })
}

async function fillIdentityStep(nombrePlaceholder: string) {
  fireEvent.change(screen.getByPlaceholderText(nombrePlaceholder), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByPlaceholderText('Ej. García'), { target: { value: 'Pérez' } })
  fireEvent.change(screen.getByPlaceholderText('Ej. López'), { target: { value: 'Gómez' } })
  const dateInput = document.querySelector('input[type="date"]')
  if (dateInput) fireEvent.change(dateInput, { target: { value: BIRTH_DATE } })
  fillStateCity()
  clickButton(/^continuar$/i)
}

async function fillSecurityStep() {
  await screen.findByPlaceholderText('correo@ejemplo.com')
  fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: EMAIL } })
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: PASSWORD } })
  clickButton(/^continuar$/i)
}

async function fillAccountStep(emailPlaceholder = 'contacto@organizacion.com') {
  await screen.findByPlaceholderText(emailPlaceholder)
  fireEvent.change(screen.getByPlaceholderText(emailPlaceholder), { target: { value: EMAIL } })
  fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'), { target: { value: PASSWORD } })
  fillStateCity()
  clickButton(/finalizar registro/i)
}

/* PCD: identity → security → accommodation → condition → origin → history
   → support → scales1 → scales2 → formats → interests → viability (submit) */
async function completePcdWizard() {
  await fillIdentityStep('Ej. Juan Carlos')
  await fillSecurityStep()

  await screen.findByText(/preferencia de acompañamiento/i)
  clickButton(/quiero explorar por mi cuenta/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/háblanos de tu condición/i)
  clickButton(/motriz o de movilidad física/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/origen y diagnóstico/i)
  clickButton(/^no$/i)
  clickButton(/desde el nacimiento/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/historial educativo y terapias/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/zonas y apoyos que te sirven/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/escalas de vida.*\(1\/2\)/i)
  clickButton(/tomo decisiones con autonomía/i)
  clickButton(/me desenvuelvo con autonomía/i)
  clickButton(/verbal fluida/i)
  clickButton(/^independiente$/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/escalas de vida.*\(2\/2\)/i)
  clickButton(/activamente en la mayoría de actividades/i)
  clickButton(/^independiente$/i)
  clickButton(/participo con facilidad/i)
  clickButton(/poco o nada/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/cómo prefieres recibir información/i)
  clickButton(/leyendo textos/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/qué caminos te gustaría explorar/i)
  clickButton(/^música$/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/viabilidad económica/i)
  clickButton(/gratuitas, con becas o apoyos/i)
  clickButton(/guardar y continuar/i)
}

/* Institución: subtype → org → category → services → community → account */
async function completeInstitutionWizard() {
  clickButton(/ong/i)
  clickButton(/^continuar$/i)

  await screen.findByPlaceholderText('Ej. Fundación Inclusión México')
  fireEvent.change(screen.getByPlaceholderText('Ej. Fundación Inclusión México'), { target: { value: 'Fundación Inclusión México' } })
  fireEvent.change(screen.getByPlaceholderText(/describe brevemente los servicios o programas que ofrecen/i), { target: { value: 'Apoyo educativo y terapéutico' } })
  fireEvent.change(screen.getByPlaceholderText('18 caracteres alfanuméricos'), { target: { value: CURP_VALIDA } })
  clickButton(/continuar a servicios/i)

  await screen.findByText(/cuál es la categoría principal/i)
  clickButton(/educativo/i)
  clickButton(/continuar a servicios/i)

  await screen.findByText(/cómo ayudas a la comunidad/i)
  clickButton(/^terapias$/i)
  clickButton(/continuar a comunidad/i)

  await screen.findByText(/con quién quieres conectar/i)
  clickButton(/personas con discapacidad/i)
  clickButton(/continuar a cuenta/i)

  await fillAccountStep('contacto@institucion.org')
}

/* Empresa: subtype → org → services → community → account */
async function completeEnterpriseWizard() {
  clickButton(/centro terapéutico/i)
  clickButton(/^continuar$/i)

  await screen.findByPlaceholderText('Ej. Centro Terapéutico Raíces')
  fireEvent.change(screen.getByPlaceholderText('Ej. Centro Terapéutico Raíces'), { target: { value: 'Centro Terapéutico Raíces' } })
  fireEvent.change(screen.getByPlaceholderText(/describe brevemente tus servicios o especialidades/i), { target: { value: 'Terapias de rehabilitación' } })
  clickButton(/continuar a servicios/i)

  await screen.findByText(/qué servicios ofreces/i)
  clickButton(/^fisioterapia$/i)
  clickButton(/continuar a comunidad/i)

  await screen.findByText(/con quién quieres conectar/i)
  clickButton(/personas con discapacidad/i)
  clickButton(/continuar a cuenta/i)

  await fillAccountStep()
}

/* Tutor: identity → security → relationship → accommodation → condition
   → origin → history → support → scales1 → scales2 → formats → interests
   → viability (submit) */
async function completeTutorWizard() {
  await fillIdentityStep('Ej. Ana Laura')
  await fillSecurityStep()

  await screen.findByText(/para quién es el perfil/i)
  fireEvent.change(screen.getByPlaceholderText('Ej. Mateo'), { target: { value: 'Mateo' } })
  const depDateInput = document.querySelector('input[type="date"]')
  if (depDateInput) fireEvent.change(depDateInput, { target: { value: DEP_BIRTH_DATE } })
  clickButton(/^continuar$/i)

  await screen.findByText(/preferencia de acompañamiento/i)
  clickButton(/^continuar a condición$/i)

  await screen.findByText(/condición de/i)
  clickButton(/motriz o de movilidad física/i)
  clickButton(/^continuar a diagnóstico$/i)

  // tieneDiagnostico y temporalidad vienen con defaults ('si', 'nacimiento')
  await screen.findByText(/origen y diagnóstico/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/historial educativo y terapias/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/zonas y apoyos/i)
  clickButton(/^continuar$/i)

  // Las escalas vienen con defaults (3/3/4/3…), solo hay que avanzar
  await screen.findByText(/escalas de vida.*\(1\/2\)/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/escalas de vida.*\(2\/2\)/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/formatos de información/i)
  clickButton(/^continuar a intereses$/i)

  await screen.findByText(/intereses y actividades de/i)
  clickButton(/^música$/i)
  clickButton(/^continuar$/i)

  await screen.findByText(/viabilidad económica familiar/i)
  clickButton(/finalizar registro/i)
}

/* ═══════════════════════════════════════════════════════════════════
   TESTS
   ═══════════════════════════════════════════════════════════════════ */

describe('Contrato de registro — PCD', () => {
  it('1) con tokenAcceso: guarda escalas, perfil, perfil-necesidades y persiste sesión + onboarding', async () => {
    stubApi({
      'post /autenticacion/registro': PCD_TOKEN_RESPONSE,
      'post /usuarios/escalas-vida': { mensaje: 'ok' },
      'post /usuarios/perfil-necesidades': { mensaje: 'ok' },
      'put /usuarios/perfil': { id: 'u1', nombreCompleto: NOMBRE_COMPLETO },
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
      ciudad: MUNICIPIO,
      estado: ESTADO,
    })

    // Perfilado: escalas → perfil → perfil-necesidades
    // NOTA: useUpdateProfile/useUpdateNeedsProfile mapean a español antes de enviar
    expect(callsFor('post', '/usuarios/escalas-vida')).toHaveLength(1)
    expect(callsFor('put', '/usuarios/perfil')).toHaveLength(1)
    expect(lastCallFor('put', '/usuarios/perfil')).toMatchObject({ nombreCompleto: NOMBRE_COMPLETO, ciudad: MUNICIPIO, estado: ESTADO })
    expect(callsFor('post', '/usuarios/perfil-necesidades')).toHaveLength(1)
    expect(lastCallFor('post', '/usuarios/perfil-necesidades')).toMatchObject({
      tiposDiscapacidad: ['Motriz o de movilidad física'],
      etapaVida: 'adultez',
      fechaNacimiento: BIRTH_DATE,
    })

    // NO debe intentar auto-login
    expect(callsFor('post', '/autenticacion/inicio-sesion')).toHaveLength(0)

    // Persistencia de sesión (setAuth) + onboarding
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('tk-123')
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_REFRESH)).toBe('rt-123')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH_USER) ?? '{}')).toMatchObject({ full_name: NOMBRE_COMPLETO })
    expect(localStorage.getItem(STORAGE_KEYS.USER_INTERESTS)).toBe(JSON.stringify(['Música']))
    expect(localStorage.getItem(STORAGE_KEYS.USER_VIABILITY)).toBe('gratuita_becas')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_NARRATIVE) ?? '{}')).toHaveProperty('quienEres')

    // Llega a la pantalla de agradecimiento
    expect(await screen.findByText(/muchas gracias por tu confianza/i)).toBeInTheDocument()
  }, 20000)

  it('2) con requiereInicioSesion:true: llega a thanks SIN auto-login ni perfilado', async () => {
    stubApi({
      'post /autenticacion/registro': { requiereInicioSesion: true, mensaje: 'Cuenta creada' },
    })

    renderWithProviders(<RegistrationWizard onBackToRoles={() => {}} onGoToLogin={() => {}} />)
    await completePcdWizard()

    await waitFor(() => expect(callsFor('post', '/autenticacion/registro')).toHaveLength(1))
    expect(lastCallFor('post', '/autenticacion/registro')).toMatchObject({ rol: 'pcd' })

    // Sin auto-login, sin escalas, sin perfil
    expect(callsFor('post', '/autenticacion/inicio-sesion')).toHaveLength(0)
    expect(callsFor('post', '/usuarios/escalas-vida')).toHaveLength(0)
    expect(callsFor('put', '/usuarios/perfil')).toHaveLength(0)

    // Sin sesión persistida, pero con onboarding local (narrativa)
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEYS.USER_INTERESTS)).toBe(JSON.stringify(['Música']))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_NARRATIVE) ?? '{}')).toHaveProperty('quienEres')

    expect(await screen.findByText(/muchas gracias por tu confianza/i)).toBeInTheDocument()
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
      curp: CURP_VALIDA,
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
  it('5) sin token en registro: auto-login y alta del dependiente con su fecha de nacimiento', async () => {
    stubApi({
      'post /autenticacion/registro': { uid: 't1', mensaje: 'ok' },
      'post /autenticacion/inicio-sesion': TUTOR_LOGIN_RESPONSE,
      'post /usuarios/escalas-vida': { mensaje: 'ok' },
      'post /usuarios/perfil-necesidades': { mensaje: 'ok' },
      'put /usuarios/perfil': { id: 't1', nombreCompleto: NOMBRE_COMPLETO },
      'get /catalogos': { parentescos: ['Hijo/a', 'Familiar'] },
      'post /usuarios/dependientes': { id: 'dep1' },
    })

    renderWithProviders(<TutorRegistrationWizard onBackToRoles={() => {}} onGoToLogin={() => {}} />)
    await completeTutorWizard()

    await waitFor(() => expect(callsFor('post', '/autenticacion/registro')).toHaveLength(1))
    expect(lastCallFor('post', '/autenticacion/registro')).toMatchObject({
      rol: 'padre_tutor',
      destinatarioRegistro: 'para_hijo',
      email: EMAIL,
    })

    // Auto-login una vez
    expect(callsFor('post', '/autenticacion/inicio-sesion')).toHaveLength(1)

    // Perfilado completo
    expect(callsFor('post', '/usuarios/escalas-vida')).toHaveLength(1)
    expect(callsFor('put', '/usuarios/perfil')).toHaveLength(1)
    expect(callsFor('post', '/usuarios/perfil-necesidades')).toHaveLength(1)

    // Alta del dependiente: parentesco resuelto desde el catálogo + DOB cacheada
    expect(callsFor('post', '/usuarios/dependientes')).toHaveLength(1)
    expect(lastCallFor('post', '/usuarios/dependientes')).toMatchObject({
      nombreCompleto: 'Mateo',
      parentesco: 'Hijo/a',
    })
    expect(localStorage.getItem(STORAGE_KEYS.depBirthDate('dep1'))).toBe(DEP_BIRTH_DATE)

    // Sesión persistida con el token del auto-login
    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBe('tt-1')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.AI_NARRATIVE) ?? '{}')).toHaveProperty('quienEres')

    expect(await screen.findByText(/gracias por ser el apoyo de/i)).toBeInTheDocument()
  }, 20000)
})