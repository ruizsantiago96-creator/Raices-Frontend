import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmpresaOnboardingModal from '../components/EmpresaOnboardingModal'
import { useAuthStore } from '@features/auth/store/authStore'
import { renderWithProviders } from '@test/renderWithProviders'

const putMiInstitucion = vi.fn()

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    put: (...args: unknown[]) => putMiInstitucion(...args),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}))

vi.mock('@features/institutions', () => ({
  useMiInstitucion: () => ({ data: undefined, isLoading: false }),
  useUpdateMiInstitucion: () => ({ mutate: putMiInstitucion, isPending: false }),
}))

const EMPRESA = {
  id: 'e1',
  email: 'empresa@acme.mx',
  role: 'empresa' as const,
  full_name: 'Acme',
}

const PCD = { id: 'u1', email: 'pcd@mail.mx', role: 'pcd' as const, full_name: 'Ana' }

const CSF_INPUT = /Seleccionar archivo de la Constancia/i
const BTN_GUARDAR = /Guardar y enviar a verificaci/i

/** Adjunta un PDF válido en el input de la CSF. */
async function adjuntarCsf(usuario: ReturnType<typeof userEvent.setup>) {
  const input = screen.getByLabelText(CSF_INPUT) as HTMLInputElement
  const archivo = new File(['%PDF-1.4 fake'], 'csf-acme.pdf', { type: 'application/pdf' })
  await usuario.upload(input, archivo)
}

describe('EmpresaOnboardingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Por defecto el guardado responde bien.
    putMiInstitucion.mockImplementation((_payload, opts) => opts?.onSuccess?.({ ok: true }))
    useAuthStore.setState({ token: 'token', user: EMPRESA, refreshToken: null })
  })

  it('no renderiza nada si open es false', () => {
    renderWithProviders(<EmpresaOnboardingModal open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('se suprime por completo para una cuenta que no es empresa', () => {
    useAuthStore.setState({ token: 'token', user: PCD, refreshToken: null })
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no ofrece ningún campo de captura de CURP ni de identificación oficial', () => {
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    // No existe ningún control de entrada para la identidad individual:
    // ni un campo de texto CURP, ni un cargador de "CURP" / "Identificación oficial".
    expect(screen.queryByLabelText(/n[uú]mero de CURP/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Seleccionar archivo de CURP/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Seleccionar archivo de Identificaci/i)).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/[A-Z]{4}\d{6}/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Sube tu CURP/i)).not.toBeInTheDocument()
  })

  it('sí pide los tres bloques: categoría, políticas de inclusión y CSF', () => {
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    expect(screen.getByText(/Tipo de categor[ií]a empresarial/i)).toBeInTheDocument()
    expect(screen.getByText(/Pol[ií]ticas y adaptaciones de inclusi[oó]n/i)).toBeInTheDocument()
    expect(screen.getByText(/Constancia de Situaci[oó]n Fiscal \(CSF\)/i)).toBeInTheDocument()
    // Una política de inclusión en forma de checkbox
    expect(screen.getByLabelText(/Infraestructura accesible/i)).toHaveAttribute('type', 'checkbox')
  })

  it('ofrece el enum de categoría que valida el backend', () => {
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)
    const opciones = Array.from(screen.getByRole('combobox').querySelectorAll('option'))
      .map(o => o.getAttribute('value'))
      .filter(Boolean)
    expect(opciones).toEqual(expect.arrayContaining(['laboral', 'educativo', 'social', 'funcional']))
  })

  it('exige la CSF antes de dejar guardar', async () => {
    const usuario = userEvent.setup()
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    await usuario.selectOptions(screen.getByRole('combobox'), 'laboral')
    await usuario.click(screen.getByLabelText(/Infraestructura accesible/i))
    await usuario.click(screen.getByRole('button', { name: BTN_GUARDAR }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/Adjunta tu Constancia de Situaci[oó]n Fiscal/i)
    expect(putMiInstitucion).not.toHaveBeenCalled()
  })

  it('exige la categoría antes de dejar guardar', async () => {
    const usuario = userEvent.setup()
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    await usuario.click(screen.getByLabelText(/Infraestructura accesible/i))
    await adjuntarCsf(usuario)
    await usuario.click(screen.getByRole('button', { name: BTN_GUARDAR }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/categor[ií]a de tu empresa/i)
    expect(putMiInstitucion).not.toHaveBeenCalled()
  })

  it('exige al menos una política de inclusión antes de dejar guardar', async () => {
    const usuario = userEvent.setup()
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    await usuario.selectOptions(screen.getByRole('combobox'), 'laboral')
    await adjuntarCsf(usuario)
    await usuario.click(screen.getByRole('button', { name: BTN_GUARDAR }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/pol[ií]tica o adaptaci[oó]n/i)
    expect(putMiInstitucion).not.toHaveBeenCalled()
  })

  it('envía el payload a la actualización del perfil de la institución', async () => {
    const usuario = userEvent.setup()
    const onSaved = vi.fn()
    const onClose = vi.fn()
    renderWithProviders(<EmpresaOnboardingModal open onClose={onClose} onSaved={onSaved} />)

    await usuario.selectOptions(screen.getByRole('combobox'), 'educativo')
    await usuario.click(screen.getByLabelText(/Infraestructura accesible/i))
    await usuario.click(screen.getByLabelText(/Flexibilidad laboral/i))
    await usuario.type(screen.getByLabelText(/Otra pol[ií]tica/i), 'Becas de practicas')
    await adjuntarCsf(usuario)

    await usuario.click(screen.getByRole('button', { name: BTN_GUARDAR }))

    await waitFor(() => expect(putMiInstitucion).toHaveBeenCalledTimes(1))
    const [payload] = putMiInstitucion.mock.calls[0]

    expect(payload).toEqual({
      categoria: 'educativo',
      servicios: [
        'Infraestructura accesible',
        'Flexibilidad laboral',
        'Becas de practicas',
      ],
      csfNombreArchivo: 'csf-acme.pdf',
    })
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it('rechaza un archivo que no es PDF ni imagen', async () => {
    // applyAccept: false para poder inyectar un .exe y ejercitar la validación propia
    const usuario = userEvent.setup({ applyAccept: false })
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    const input = screen.getByLabelText(CSF_INPUT) as HTMLInputElement
    const exe = new File(['MZ'], 'malware.exe', { type: 'application/x-msdownload' })
    await usuario.upload(input, exe)

    expect(await screen.findByRole('alert')).toHaveTextContent(/PDF o una imagen/i)
  })

  it('rechaza una CSF que supera los 10 MB', async () => {
    const usuario = userEvent.setup()
    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    const input = screen.getByLabelText(CSF_INPUT) as HTMLInputElement
    const grande = new File(['x'], 'csf-enorme.pdf', { type: 'application/pdf' })
    Object.defineProperty(grande, 'size', { value: 11 * 1024 * 1024 })
    await usuario.upload(input, grande)

    expect(await screen.findByRole('alert')).toHaveTextContent(/10 MB/i)
  })

  it('explica con lenguaje claro el 403 por rol en vez de mostrar un error técnico', async () => {
    const usuario = userEvent.setup()
    putMiInstitucion.mockImplementation((_payload, opts) =>
      opts?.onError?.({ response: { status: 403, data: {} } }),
    )

    renderWithProviders(<EmpresaOnboardingModal open onClose={vi.fn()} />)

    await usuario.selectOptions(screen.getByRole('combobox'), 'laboral')
    await usuario.click(screen.getByLabelText(/Infraestructura accesible/i))
    await adjuntarCsf(usuario)
    await usuario.click(screen.getByRole('button', { name: BTN_GUARDAR }))

    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent(/no est[aá] autorizada por el servidor/i)
    expect(alerta).not.toHaveTextContent(/403/)
  })
})
