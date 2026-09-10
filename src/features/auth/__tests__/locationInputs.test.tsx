import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LocationInputs } from '../components/WizardUI'
import { lookupPostalCode } from '@shared/lib/postalCodeLookup'

vi.mock('@shared/lib/postalCodeLookup', () => ({
  lookupPostalCode: vi.fn(),
  validatePostalCodeFormat: vi.fn(() => null),
}))

const mockLookup = vi.mocked(lookupPostalCode)

const emptyForm = { country: 'MX', postalCode: '', state: '', city: '' }
type FormState = typeof emptyForm

/** Harness con estado real: los onChange actualizan las props (como en los wizards). */
function Harness({ onState, initial = emptyForm }: { onState?: (s: FormState) => void; initial?: FormState }) {
  const [form, setForm] = useState<FormState>(initial)
  const update = (patch: Partial<FormState>) => {
    setForm(prev => {
      const next = { ...prev, ...patch }
      onState?.(next)
      return next
    })
  }
  return (
    <LocationInputs
      country={form.country}
      postalCode={form.postalCode}
      state={form.state}
      city={form.city}
      onCountryChange={country => update({ country })}
      onPostalCodeChange={postalCode => update({ postalCode })}
      onStateChange={state => update({ state })}
      onCityChange={city => update({ city })}
    />
  )
}

function renderHarness(onState?: (s: FormState) => void, initial?: FormState) {
  render(<Harness onState={onState} initial={initial} />)
  return {
    cp: screen.getByPlaceholderText('Ej. 97113') as HTMLInputElement,
    estado: () => screen.queryByPlaceholderText('Ej. Jalisco, Antioquia'),
    ciudad: () => screen.queryByPlaceholderText('Ej. Guadalajara, Medellín'),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LocationInputs — vista inicial compacta', () => {
  it('muestra solo País (MX preseleccionado) y Código Postal; Estado/Ciudad ocultos', () => {
    renderHarness()
    const select = screen.getByLabelText(/país/i) as HTMLSelectElement
    expect(select.value).toBe('MX')
    expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/estado \/ región/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/ciudad/i)).not.toBeInTheDocument()
  })

  it('ofrece los demás países del catálogo', () => {
    renderHarness()
    for (const name of ['México', 'Estados Unidos', 'Canadá', 'España', 'Argentina', 'Colombia', 'Chile']) {
      expect(screen.getByRole('option', { name })).toBeInTheDocument()
    }
  })
})

describe('LocationInputs — autocompletado exitoso', () => {
  it('rellena internamente estado/ciudad y muestra el chip 📍 con botón Editar', async () => {
    mockLookup.mockResolvedValue({ status: 'encontrado', location: { estado: 'Yucatán', ciudad: 'Mérida', zonas: [] } })
    const captured: FormState[] = []
    const { cp } = renderHarness(s => captured.push(s))

    fireEvent.change(cp, { target: { value: '97113' } })
    fireEvent.blur(cp)

    // Chip de éxito con la etiqueta "Ciudad, Estado"
    const chip = await screen.findByText(/📍 Mérida, Yucatán/)
    expect(chip).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()

    // Los datos se rellenaron internamente para el submit
    const last = captured.at(-1)!
    expect(last).toMatchObject({ country: 'MX', postalCode: '97113', state: 'Yucatán', city: 'Mérida' })

    // Los campos manuales siguen ocultos (no saturen la vista)
    expect(screen.queryByLabelText(/estado \/ región/i)).not.toBeInTheDocument()
  })

  it('el botón Editar despliega los campos manuales con los valores autocompletados', async () => {
    mockLookup.mockResolvedValue({ status: 'encontrado', location: { estado: 'Yucatán', ciudad: 'Mérida', zonas: [] } })
    const { cp } = renderHarness()

    fireEvent.change(cp, { target: { value: '97113' } })
    fireEvent.blur(cp)
    await screen.findByText(/📍 Mérida, Yucatán/)

    fireEvent.click(screen.getByRole('button', { name: /editar/i }))

    const estado = await screen.findByLabelText(/estado \/ región/i)
    expect(estado).toHaveValue('Yucatán')
    expect(screen.getByLabelText(/ciudad/i)).toHaveValue('Mérida')
  })

  it('autocompleta por debounce al teclear un CP de formato válido (sin blur)', async () => {
    mockLookup.mockResolvedValue({ status: 'encontrado', location: { estado: 'Jalisco', ciudad: 'Zapopan', zonas: [] } })
    const captured: FormState[] = []
    const { cp } = renderHarness(s => captured.push(s))

    // Sin blur: el debounce (450 ms) dispara el lookup al completar el formato
    fireEvent.change(cp, { target: { value: '45100' } })

    await waitFor(() => expect(mockLookup).toHaveBeenCalledWith('MX', '45100'), { timeout: 2500 })
    await screen.findByText(/📍 Zapopan, Jalisco/)
    expect(captured.at(-1)).toMatchObject({ state: 'Jalisco', city: 'Zapopan' })
  })
})

describe('LocationInputs — fallback manual', () => {
  it('CP no catalogado: aviso sutil + campos Estado/Ciudad editables', async () => {
    mockLookup.mockResolvedValue({ status: 'no_encontrado' })
    const { cp } = renderHarness()

    fireEvent.change(cp, { target: { value: '00000' } })
    fireEvent.blur(cp)

    expect(await screen.findByText(/Código no detectado en el catálogo\. Por favor completa tu estado y ciudad manualmente\./i)).toBeInTheDocument()

    const estado = screen.getByLabelText(/estado \/ región/i)
    const ciudad = screen.getByLabelText(/ciudad/i)
    expect(estado).toBeEnabled()
    expect(ciudad).toBeEnabled()

    fireEvent.change(estado, { target: { value: 'Yucatán' } })
    fireEvent.change(ciudad, { target: { value: 'Mérida' } })
    expect(estado).toHaveValue('Yucatán')
    expect(ciudad).toHaveValue('Mérida')
  })

  it('país sin catálogo local también cae al fallback manual', async () => {
    mockLookup.mockResolvedValue({ status: 'catalogo_no_disponible' })
    const { cp } = renderHarness()

    fireEvent.change(cp, { target: { value: 'EC1A 1BB' } })
    fireEvent.blur(cp)

    expect(await screen.findByText(/Sin catálogo local/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estado \/ región/i)).toBeEnabled()
  })

  it('CP con formato inválido muestra error y no abre el fallback', async () => {
    mockLookup.mockResolvedValue({ status: 'formato_invalido', mensaje: 'Postal code 12 is not valid for country MX' })
    const { cp } = renderHarness()

    fireEvent.change(cp, { target: { value: '12' } })
    fireEvent.blur(cp)

    expect(await screen.findByText(/Formato de código postal no válido/i)).toBeInTheDocument()
    expect(cp).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByLabelText(/estado \/ región/i)).not.toBeInTheDocument()
  })
})

describe('LocationInputs — validación y conservación de datos', () => {
  it('abre el modo manual cuando hay estado/ciudad preexistentes (edición de perfil)', () => {
    renderHarness(undefined, { country: 'MX', postalCode: '97113', state: 'Yucatán', city: 'Mérida' })
    expect(screen.getByLabelText(/estado \/ región/i)).toHaveValue('Yucatán')
    expect(screen.getByLabelText(/ciudad/i)).toHaveValue('Mérida')
  })

  it('estado y ciudad son required para el submit', () => {
    renderHarness(undefined, { country: 'MX', postalCode: '00000', state: '', city: '' })
    // fallback abierto por estado/ciudad vacíos + lookup pendiente: verificamos el CP
    expect(screen.getByLabelText(/código postal/i)).toBeRequired()
  })

  it('cambiar de país reconsulta el CP actual', async () => {
    mockLookup.mockResolvedValue({ status: 'no_encontrado' })
    const { cp } = renderHarness()

    fireEvent.change(cp, { target: { value: '97113' } })
    fireEvent.blur(cp)
    await screen.findByText(/Código no detectado/i)

    fireEvent.change(screen.getByLabelText(/país/i), { target: { value: 'US' } })
    await waitFor(() => expect(mockLookup).toHaveBeenCalledWith('US', '97113'))
  })
})
