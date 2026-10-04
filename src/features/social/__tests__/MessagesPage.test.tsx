import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@test/renderWithProviders'
import { DirectMessages } from '../pages/MessagesPage'
import { useUiStore } from '@shared/stores/uiStore'
import ToastContainer from '@shared/components/Toast'
import api from '@shared/lib/api'

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

// El selector de "nuevo chat" no es foco de esta prueba.
vi.mock('../hooks/useCommunity', () => ({
  useMiembrosDestacados: () => ({ data: [] }),
}))

vi.mock('../hooks/useMultimedia', () => ({
  useUploadMultimedia: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

/** Respuesta cruda del backend tal como la devuelve `GET /mensajes/conversaciones`. */
function conversacionFantasma() {
  return [
    {
      socio: { id: 'fantasma-1', nombreCompleto: 'Usuario Eliminado', urlAvatar: null },
      ultimoMensaje: '¿Sigues disponible?',
      ultimoEn: new Date().toISOString(),
      noLeidos: 0,
      isDeleted: true,
      destinatarioActivo: false,
    },
  ]
}

function conversacionActiva() {
  return [
    {
      socio: { id: 'ana-1', nombreCompleto: 'Ana Pérez', activo: true, rol: 'pcd' },
      ultimoMensaje: 'Hola',
      ultimoEn: new Date().toISOString(),
      noLeidos: 0,
      isDeleted: false,
      destinatarioActivo: true,
    },
  ]
}

/**
 * Rutea las llamadas de `api.get` según el endpoint.
 * `state.conversaciones` es mutable para poder simular que el backend ya aplicó
 * el borrado lógico al refetch que dispara la invalidación.
 */
const state = { conversaciones: [] as unknown[] }

function mockGet(conversaciones: unknown[]) {
  state.conversaciones = conversaciones
  apiMock.get.mockImplementation((url: string) => {
    if (url.includes('/mensajes/conversaciones')) {
      return Promise.resolve({ data: state.conversaciones })
    }
    if (url.includes('/mensajes/con/')) {
      return Promise.resolve({ data: [] })
    }
    return Promise.resolve({ data: 0 })
  })
}

/**
 * En la app real `<ToastContainer />` vive en App.tsx, por eso se monta junto al
 * chat para poder observar los avisos del store de UI.
 */
function renderChat() {
  return renderWithProviders(
    <>
      <DirectMessages currentUserId="yo-1" />
      <ToastContainer />
    </>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useUiStore.setState({ toasts: [], floatingChatPartnerId: null })
  apiMock.patch.mockResolvedValue({ data: { actualizados: 0 } })
  // jsdom no implementa scrollIntoView (lo usa el auto-scroll del chat).
  Element.prototype.scrollIntoView = vi.fn()
})

describe('DirectMessages — conversaciones con usuario fantasma', () => {
  it('muestra "Usuario Eliminado" en lugar del nombre real', async () => {
    // Aunque el backend enviara el nombre, la UI debe mostrar la etiqueta genérica.
    mockGet([
      {
        socio: { id: 'fantasma-1', nombreCompleto: 'Nombre Real', activo: false },
        ultimoMensaje: 'Mensaje histórico',
        ultimoEn: new Date().toISOString(),
        noLeidos: 0,
        isDeleted: true,
      },
    ])

    renderChat()

    expect(await screen.findByText('Usuario Eliminado')).toBeInTheDocument()
    expect(screen.queryByText('Nombre Real')).not.toBeInTheDocument()
    // El historial se conserva visible.
    expect(screen.getByText('Mensaje histórico')).toBeInTheDocument()
  })

  it('deshabilita el input y cambia el placeholder al abrir el chat', async () => {
    mockGet(conversacionFantasma())
    const user = userEvent.setup()

    renderChat()
    await user.click(await screen.findByText('Usuario Eliminado'))

    const input = await screen.findByPlaceholderText('No puedes responder a esta conversación')
    expect(input).toBeDisabled()
  })

  it('no permite enviar mensajes a un socio eliminado', async () => {
    mockGet(conversacionFantasma())
    const user = userEvent.setup()

    renderChat()
    await user.click(await screen.findByText('Usuario Eliminado'))

    const input = await screen.findByPlaceholderText('No puedes responder a esta conversación')
    await user.type(input, 'hola')

    expect(apiMock.post).not.toHaveBeenCalled()
  })

  it('permite escribir con un socio activo (sin regresión)', async () => {
    mockGet(conversacionActiva())
    apiMock.post.mockResolvedValue({ data: { id: 'm1' } })
    const user = userEvent.setup()

    renderChat()
    await user.click(await screen.findByText('Ana Pérez'))

    const input = await screen.findByPlaceholderText('Escribe un mensaje...')
    expect(input).not.toBeDisabled()
    await user.type(input, 'hola')
    await user.click(screen.getByRole('button', { name: '' }))

    await waitFor(() => expect(apiMock.post).toHaveBeenCalledWith('/mensajes/enviar/ana-1', { contenido: 'hola' }))
  })
})

describe('DirectMessages — manejo del 403 al enviar', () => {
  it('captura el 403, avisa y marca la conversación como eliminada sin romper la UI', async () => {
    mockGet(conversacionActiva())
    apiMock.post.mockRejectedValue({ response: { status: 403, data: { message: 'Usuario destinatario no existe' } } })
    const user = userEvent.setup()

    renderChat()
    await user.click(await screen.findByText('Ana Pérez'))

    const input = await screen.findByPlaceholderText('Escribe un mensaje...')
    await user.type(input, 'hola')
    await user.click(screen.getByRole('button', { name: '' }))

    // Toast de "usuario no disponible" (toasts del uiStore, auto-cierre a los 4 s).
    expect(await screen.findByText('El usuario ya no está disponible')).toBeInTheDocument()

    // La conversación se degrada a eliminada en el estado local, sin recargar.
    expect(await screen.findAllByText('Usuario Eliminado')).not.toHaveLength(0)

    // La UI sigue viva: el input pasa a modo deshabilitado.
    await waitFor(() =>
      expect(screen.getByPlaceholderText('No puedes responder a esta conversación')).toBeDisabled(),
    )
  })

  it('muestra un error genérico si el fallo no es un 403', async () => {
    mockGet(conversacionActiva())
    apiMock.post.mockRejectedValue({ response: { status: 500 } })
    const user = userEvent.setup()

    renderChat()
    await user.click(await screen.findByText('Ana Pérez'))

    const input = await screen.findByPlaceholderText('Escribe un mensaje...')
    await user.type(input, 'hola')
    await user.click(screen.getByRole('button', { name: '' }))

    expect(await screen.findByText('No pudimos enviar tu mensaje. Intenta de nuevo.')).toBeInTheDocument()
  })
})

describe('DirectMessages — menú "Eliminar chat"', () => {
  it('expone la opción en el menú ⋮ y llama al endpoint DELETE', async () => {
    mockGet(conversacionActiva())
    // El backend aplica el borrado lógico: el refetch posterior ya no la devuelve.
    apiMock.delete.mockImplementation(() => {
      state.conversaciones = []
      return Promise.resolve({ data: { ocultado: true, socioId: 'ana-1' } })
    })
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderChat()
    await user.click(await screen.findByText('Ana Pérez'))

    await user.click(screen.getByRole('button', { name: 'Opciones de la conversación' }))
    const menuItem = await screen.findByRole('menuitem', { name: /Eliminar chat/ })
    await user.click(menuItem)

    await waitFor(() =>
      expect(apiMock.delete).toHaveBeenCalledWith('/mensajes/conversaciones/ana-1'),
    )
    expect(await screen.findByText('Conversación eliminada')).toBeInTheDocument()

    // La conversación desaparece de la lista y se vuelve al estado inicial.
    await waitFor(() => expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument())
  })

  it('no llama al backend si el usuario cancela la confirmación', async () => {
    mockGet(conversacionActiva())
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderChat()
    await user.click(await screen.findByText('Ana Pérez'))
    await user.click(screen.getByRole('button', { name: 'Opciones de la conversación' }))
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar chat/ }))

    expect(apiMock.delete).not.toHaveBeenCalled()
    // Sigue en la lista (aparece en la fila y en la cabecera del chat abierto).
    expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0)
  })

  it('avisa si el backend no confirma la eliminación', async () => {
    mockGet(conversacionActiva())
    apiMock.delete.mockRejectedValue({ response: { status: 500 } })
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderChat()
    await user.click(await screen.findByText('Ana Pérez'))
    await user.click(screen.getByRole('button', { name: 'Opciones de la conversación' }))
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar chat/ }))

    expect(
      await screen.findByText('No pudimos eliminar la conversación. Intenta de nuevo.'),
    ).toBeInTheDocument()
    // La conversación sigue en la lista: no se optimizó de más.
    expect(screen.getAllByText('Ana Pérez').length).toBeGreaterThan(0)
  })
})