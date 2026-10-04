import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@test/renderWithProviders'
import { EmpresaIdentitySection } from '../components/ProfileIdentitySection'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

const mockGet = vi.mocked(api.get)
const mockPost = vi.mocked(api.post)

const CSF = new File(['contenido-csf'], 'csf.pdf', { type: 'application/pdf' })

/** Estado de verificación tal como lo devuelve el backend para una empresa. */
function estadoVerificacion(overrides?: { csfCompletado?: boolean }) {
  const csfCompletado = overrides?.csfCompletado ?? false
  return {
    institucionId: 'uid-empresa',
    nombre: 'Centro Terapéutico Raíces',
    verificada: false,
    porcentaje: csfCompletado ? 50 : 0,
    pasos: [
      { clave: 'csf', titulo: 'CSF', obligatorio: true, completado: csfCompletado },
      { clave: 'aprobacion_admin', titulo: 'Aprobación', obligatorio: true, completado: false },
      {
        clave: 'identificacion_representante',
        titulo: 'INE',
        obligatorio: false,
        completado: false,
      },
    ],
    pasosPendientes: csfCompletado ? ['aprobacion_admin'] : ['csf', 'aprobacion_admin'],
    documentosFaltantes: csfCompletado ? [] : ['csf'],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    token: 'test-token',
    user: { id: 'uid-empresa', email: 'empresa@correo.com', role: 'empresa' },
  } as never)
  mockGet.mockResolvedValue({ data: estadoVerificacion() } as never)
  mockPost.mockResolvedValue({ data: { estado: 'pendiente' } } as never)
})

const ETIQUETA_BOTON: Record<string, RegExp> = {
  csf: /subir constancia de situación fiscal/i,
  identificacion_oficial: /subir identificación oficial/i,
}

async function subir(documento: string, archivo: File) {
  const user = userEvent.setup()
  const input = await screen.findByLabelText(
    documento === 'csf'
      ? /seleccionar archivo de constancia de situación fiscal/i
      : /seleccionar archivo de identificación oficial/i,
  )
  await user.upload(input, archivo)
  await user.click(screen.getByRole('button', { name: ETIQUETA_BOTON[documento] }))
}

describe('Carga de CSF de la empresa', () => {
  // ── Regresión del 400 ────────────────────────────────────────────────
  // La CSF se mandaba a POST /usuarios/documento-identidad con tipo=csf, y ese
  // endpoint solo admite curp | identificacion_oficial | certificado_discapacidad
  // → 400 "Tipo de documento inválido".
  it('sube la CSF a /instituciones/verificacion/documentos, no al endpoint de identidad', async () => {
    renderWithProviders(<EmpresaIdentitySection />)

    await subir('csf', CSF)

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1)
    })
    const [url, body] = mockPost.mock.calls[0]
    expect(url).toBe('/instituciones/verificacion/documentos')
    expect(body).toBeInstanceOf(FormData)
    const fd = body as FormData
    expect(fd.get('tipo')).toBe('csf')
    expect(fd.get('documento')).toBeInstanceOf(File)
    // El campo del archivo NO es `documentoCsf` ni `tipo_documento`.
    expect(fd.get('documentoCsf')).toBeNull()

    // Y, sobre todo, no debe tocar el endpoint que devolvía el 400.
    expect(mockPost.mock.calls.some(c => c[0] === '/usuarios/documento-identidad')).toBe(false)
  })

  // El INE del representante legal sí es un documento de identidad: sigue yendo
  // por su endpoint original.
  it('mantiene el INE del representante legal en /usuarios/documento-identidad', async () => {
    renderWithProviders(<EmpresaIdentitySection />)

    await subir('identificacion_oficial', new File(['ine'], 'ine.pdf', { type: 'application/pdf' }))

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1)
    })
    const [url, body] = mockPost.mock.calls[0]
    expect(url).toBe('/usuarios/documento-identidad')
    const fd = body as FormData
    expect(fd.get('tipo')).toBe('identificacion_oficial')
    expect(fd.get('documento')).toBeInstanceOf(File)
  })

  // ── El estado de la CSF se lee del endpoint correcto ─────────────────
  // Antes se leía `status.tieneCsf` de /usuarios/estado-validacion-identidad,
  // campo que ese endpoint nunca devuelve (la CSF no aplica a personas
  // morales), así que la tarjeta nunca se marcaba como subida.
  it('marca la CSF como subida leyendo el estado de verificación de la institución', async () => {
    mockGet.mockResolvedValue({ data: estadoVerificacion({ csfCompletado: true }) } as never)

    renderWithProviders(<EmpresaIdentitySection />)

    expect(
      await screen.findByText(/constancia de situación fiscal \(csf\) subido/i),
    ).toBeInTheDocument()
    // Y con la CSF cargada la empresa entra en revisión, no en verificación inicial.
    expect(screen.getByText(/documentos corporativos en revisión/i)).toBeInTheDocument()
  })

  it('ofrece subir la CSF cuando el estado de verificación la marca pendiente', async () => {
    renderWithProviders(<EmpresaIdentitySection />)

    expect(await screen.findByText(/verificación de la empresa/i)).toBeInTheDocument()
    expect(screen.queryByText(/constancia de situación fiscal \(csf\) subido/i)).not.toBeInTheDocument()
  })

  it('no rompe si el usuario no tiene institución registrada (404)', async () => {
    mockGet.mockRejectedValue({ response: { status: 404 } } as never)

    renderWithProviders(<EmpresaIdentitySection />)

    expect(await screen.findByText(/verificación de la empresa/i)).toBeInTheDocument()
  })

  // Una vez que la empresa está aprobada por el admin, lo que manda es
  // `instituciones/{id}.verificada`, no el estado de sus documentos.
  it('muestra "Empresa Verificada" cuando la institución está verificada', async () => {
    const data = estadoVerificacion({ csfCompletado: true })
    mockGet.mockResolvedValue({ data: { ...data, verificada: true, porcentaje: 100 } } as never)

    renderWithProviders(<EmpresaIdentitySection />)

    expect(await screen.findByText(/empresa verificada/i)).toBeInTheDocument()
  })
})