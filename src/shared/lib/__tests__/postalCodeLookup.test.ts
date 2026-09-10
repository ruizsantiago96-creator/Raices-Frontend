import { describe, it, expect } from 'vitest'
import { lookupPostalCode, validatePostalCodeFormat } from '../postalCodeLookup'

describe('postalCodeLookup — validatePostalCodeFormat', () => {
  it('acepta formatos válidos', () => {
    expect(validatePostalCodeFormat('MX', '97113')).toBeNull()
    expect(validatePostalCodeFormat('US', '91746-2302')).toBeNull()
    expect(validatePostalCodeFormat('CA', 'M5V 2T6')).toBeNull()
    expect(validatePostalCodeFormat('GB', 'EC1A 1BB')).toBeNull()
  })

  it('rechaza formatos inválidos con mensaje', () => {
    expect(validatePostalCodeFormat('MX', '1234')).toMatch(/not valid/i)
    expect(validatePostalCodeFormat('MX', '')).toBe('Missing postal code.')
  })
})

describe('postalCodeLookup — lookupPostalCode', () => {
  it('encuentra un CP mexicano y devuelve estado/ciudad/zonas', async () => {
    const result = await lookupPostalCode('MX', '97113')
    expect(result.status).toBe('encontrado')
    if (result.status === 'encontrado') {
      expect(result.location.estado).toBe('Yucatán')
      expect(result.location.ciudad).toBe('Mérida')
      expect(result.location.zonas.length).toBeGreaterThan(0)
    }
  })

  it('encuentra un CP español con formato "12 345"', async () => {
    const result = await lookupPostalCode('ES', '28001')
    expect(result.status).toBe('encontrado')
  })

  it('formato inválido no consulta el catálogo', async () => {
    const result = await lookupPostalCode('MX', '1234')
    expect(result.status).toBe('formato_invalido')
  })

  it('formato válido ausente del catálogo → fallback manual', async () => {
    const result = await lookupPostalCode('MX', '00000')
    expect(result.status).toBe('no_encontrado')
  })

  it('país sin catálogo local → fallback manual', async () => {
    const result = await lookupPostalCode('GB', 'EC1A 1BB')
    expect(result.status).toBe('catalogo_no_disponible')
  })

  it('país o CP vacíos → no_encontrado (sin lanzar)', async () => {
    expect((await lookupPostalCode('', '97113')).status).toBe('no_encontrado')
    expect((await lookupPostalCode('MX', '')).status).toBe('no_encontrado')
  })
})
