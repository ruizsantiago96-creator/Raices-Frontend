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

// El modal "Nuevo mensaje" ya no depende de la lista de miembros destacados:
// consulta `GET /usuarios/buscar`. El servicio de comunidad queda fuera de esta suite.
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

/** Términos `q` con los que se disparó `GET /usuarios/buscar`, en orden. */
const searchCalls: string[] = []

/** Usuario de ejemplo devuelto por el buscador, tal como lo mapea el backend. */
const JOSE = {
  id: 'jose-1',
  nombreCompleto: 'José Ramírez',
  urlAvatar: null,
  rol: 'pcd',
  ciudad: 'Mérida',
  profesion: 'Diseñador',
}

function paginaUsuarios(datos: unknown[]) {
  return { datos, total: datos.length, pagina: 1, limite: 20, totalPaginas: 1 }
}

function mockGet(conversaciones: unknown[]) {
  state.conversaciones = conversaciones
  searchCalls.length = 0
  apiMock.get.mockImplementation((url: string, config?: { params?: { q?: string } }) => {
    if (url.includes('/usuarios/buscar')) {
      searchCalls.push(config?.params?.q ?? '')
      return Promise.resolve({ data: paginaUsuarios([JOSE]) })
    }
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

describe('DirectMessages — buscador de usuarios del modal "Nuevo mensaje"', () => {
  /** Abre el modal desde el botón "Nuevo chat" de la cabecera de la lista. */
  async function abrirModal(user: ReturnType<typeof userEvent.setup>) {
    renderChat()
    await user.click(screen.getByRole('button', { name: 'Nuevo chat' }))
    return screen.findByPlaceholderText('Buscar por nombre, ciudad o profesión...')
  }

  it('no consulta el buscador mientras el modal está cerrado', async () => {
    mockGet(conversacionActiva())

    renderChat()
    await screen.findByText('Ana Pérez')

    expect(searchCalls).toHaveLength(0)
  })

  it('consulta GET /usuarios/buscar y lista los usuarios devueltos', async () => {
    mockGet([])
    const user = userEvent.setup()

    const input = await abrirModal(user)

    await waitFor(() => expect(searchCalls).toHaveLength(1))
    expect(apiMock.get).toHaveBeenCalledWith('/usuarios/buscar', { params: { q: '', limite: 20 } })
    // Con el término vacío el backend devuelve la primera página de la comunidad.
    expect(await screen.findByText('José Ramírez')).toBeInTheDocument()
    // Ciudad y profesión también viajan en la respuesta y se muestran como contexto.
    expect(screen.getByText(/Mérida/)).toBeInTheDocument()
    expect(screen.getByText(/Diseñador/)).toBeInTheDocument()
    expect(input).toBeInTheDocument()
  })

  it('aplica debounce de ~300 ms: una sola petición con el término final', async () => {
    mockGet([])
    const user = userEvent.setup()

    await abrirModal(user)
    await waitFor(() => expect(searchCalls).toHaveLength(1))
    // A partir de aquí solo se cuentan las peticiones provocadas por la escritura.
    searchCalls.length = 0

    const input = screen.getByPlaceholderText('Buscar por nombre, ciudad o profesión...')
    // Escribir rápido reinicia el temporizador: no debe disparar una petición por tecla.
    await user.type(input, 'jose')

    await waitFor(() => expect(searchCalls.length).toBeGreaterThan(0))
    // Ninguna petición intermedia: todas llevan el término completo.
    expect(new Set(searchCalls)).toEqual(new Set(['jose']))
  })

  it('abre la conversación con el usuario seleccionado y permite enviarle', async () => {
    mockGet([])
    apiMock.post.mockResolvedValue({ data: { id: 'm1' } })
    const user = userEvent.setup()

    await abrirModal(user)
    await user.click(await screen.findByText('José Ramírez'))

    // El modal se cierra y el chat queda abierto con el socio elegido.
    await waitFor(() =>
      expect(screen.queryByPlaceholderText('Buscar por nombre, ciudad o profesión...')).not.toBeInTheDocument(),
    )
    expect(await screen.findByPlaceholderText('Escribe un mensaje...')).not.toBeDisabled()

    // GET /mensajes/con/:userId abre el hilo y POST /mensajes/enviar/:userId escribe.
    await waitFor(() => expect(apiMock.get).toHaveBeenCalledWith('/mensajes/con/jose-1'))

    await user.type(screen.getByPlaceholderText('Escribe un mensaje...'), 'hola')
    await user.click(screen.getByRole('button', { name: '' }))

    await waitFor(() =>
      expect(apiMock.post).toHaveBeenCalledWith('/mensajes/enviar/jose-1', { contenido: 'hola' }),
    )
  })

  it('filtra al usuario autenticado aunque el backend lo devuelva', async () => {
    mockGet([])
    const user = userEvent.setup()
    // El backend ya excluye la cuenta propia; se cubre la red de seguridad.
    apiMock.get.mockImplementation((url: string, config?: { params?: { q?: string } }) => {
      if (url.includes('/usuarios/buscar')) {
        searchCalls.push(config?.params?.q ?? '')
        return Promise.resolve({
          data: paginaUsuarios([
            { id: 'yo-1', nombreCompleto: 'Yo Mismo', urlAvatar: null, rol: 'pcd' },
            JOSE,
          ]),
        })
      }
      if (url.includes('/mensajes/conversaciones')) return Promise.resolve({ data: [] })
      if (url.includes('/mensajes/con/')) return Promise.resolve({ data: [] })
      return Promise.resolve({ data: 0 })
    })

    await abrirModal(user)

    expect(await screen.findByText('José Ramírez')).toBeInTheDocument()
    expect(screen.queryByText('Yo Mismo')).not.toBeInTheDocument()
  })

  it('no llama al DELETE si el chat recién iniciado no existe en el backend', async () => {
    mockGet([])
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Se abre un chat nuevo con José: todavía no hay mensajes ni conversación.
    await abrirModal(user)
    await user.click(await screen.findByText('José Ramírez'))
    await user.click(await screen.findByRole('button', { name: 'Opciones de la conversación' }))
    await user.click(await screen.findByRole('menuitem', { name: /Eliminar chat/ }))

    // El backend respondería 404, así que solo se descarta la vista local.
    expect(apiMock.delete).not.toHaveBeenCalled()
    expect(await screen.findByText('Conversación eliminada')).toBeInTheDocument()
  })
})