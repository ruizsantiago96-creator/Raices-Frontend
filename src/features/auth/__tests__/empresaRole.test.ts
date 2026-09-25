import { describe, it, expect } from 'vitest'
import { esEmpresa, esRutaEmpresa, tieneRol, EMPRESA_HOME, EMPRESA_EDITAR, RUTAS_EMPRESA } from '../lib/empresaRole'
import { getCamposOnboardingFaltantes } from '../../empresa/components/EmpresaOnboardingModal'
import type { Institution } from '../../../types/institutions'

describe('esEmpresa', () => {
  it('detecta el rol normalizado `empresa`', () => {
    expect(esEmpresa({ role: 'empresa' })).toBe(true)
  })

  it('detecta el rol crudo del backend `rol: "empresa"`', () => {
    expect(esEmpresa({ rol: 'empresa' })).toBe(true)
  })

  it('detecta institution con tipo=empresa (persona moral)', () => {
    expect(esEmpresa({ role: 'institution', tipo: 'empresa' })).toBe(true)
    expect(esEmpresa({ role: 'institucion', tipo: 'empresa' })).toBe(true)
  })

  it('es insensible a mayúsculas y espacios', () => {
    expect(esEmpresa({ role: '  Empresa ' })).toBe(true)
    expect(esEmpresa({ rol: 'EMPRESA' })).toBe(true)
  })

  it('no confunde una institución sin tipo=empresa', () => {
    expect(esEmpresa({ role: 'institution' })).toBe(false)
    expect(esEmpresa({ role: 'institution', tipo: 'educativo' })).toBe(false)
  })

  it('no marca a las personas físicas', () => {
    expect(esEmpresa({ role: 'pcd' })).toBe(false)
    expect(esEmpresa({ role: 'tutor' })).toBe(false)
    expect(esEmpresa({ role: 'admin' })).toBe(false)
  })

  it('es false con usuario ausente o vacío', () => {
    expect(esEmpresa(null)).toBe(false)
    expect(esEmpresa(undefined)).toBe(false)
    expect(esEmpresa({})).toBe(false)
  })
})

describe('esRutaEmpresa', () => {
  it('permite la superficie propia de la empresa', () => {
    expect(esRutaEmpresa(EMPRESA_HOME)).toBe(true)
    expect(esRutaEmpresa(EMPRESA_EDITAR)).toBe(true)
    expect(esRutaEmpresa('/empresa/cualquier-subruta')).toBe(true)
    expect(esRutaEmpresa('/profile')).toBe(true)
    expect(esRutaEmpresa('/notifications')).toBe(true)
    expect(esRutaEmpresa('/inicio')).toBe(true)
  })

  it('bloquea la superficie de usuario estándar', () => {
    expect(esRutaEmpresa('/feed')).toBe(false)
    expect(esRutaEmpresa('/jobs')).toBe(false)
    expect(esRutaEmpresa('/rutas')).toBe(false)
    expect(esRutaEmpresa('/social')).toBe(false)
    expect(esRutaEmpresa('/explore')).toBe(false)
    expect(esRutaEmpresa('/verificacion-identidad')).toBe(false)
    expect(esRutaEmpresa('/completar-perfil')).toBe(false)
  })

  it('no hace match por prefijo parcial ambiguo', () => {
    expect(esRutaEmpresa('/empresario')).toBe(false)
    expect(esRutaEmpresa('/perfil')).toBe(false)
  })

  it('expone una lista de rutas no vacía que cubre la home y la edición', () => {
    expect(RUTAS_EMPRESA.length).toBeGreaterThan(0)
    // Las rutas son prefijos: home y edición cuelgan de '/empresa'
    expect(esRutaEmpresa(EMPRESA_HOME)).toBe(true)
    expect(esRutaEmpresa(EMPRESA_EDITAR)).toBe(true)
    expect(RUTAS_EMPRESA.some(r => EMPRESA_HOME.startsWith(r))).toBe(true)
  })
})

describe('tieneRol', () => {
  // ── Regresión: bucle infinito en /empresa/dashboard ────────────────
  // Una persona moral con `role: 'institution'` + `tipo: 'empresa'` debe
  // satisfacer el guard `role="empresa"` de EMPRESA_HOME. Si no, el guard la
  // redirige a EMPRESA_HOME, que es la ruta actual, y la app queda en blanco.
  it('acepta el rol empresa en institution tipada como empresa', () => {
    expect(tieneRol({ role: 'institution', tipo: 'empresa' }, 'empresa')).toBe(true)
    expect(tieneRol({ role: 'institucion', tipo: 'empresa' }, 'empresa')).toBe(true)
  })

  it('acepta el rol `rol: "empresa"` que llega crudo del backend', () => {
    expect(tieneRol({ rol: 'empresa' }, 'empresa')).toBe(true)
    expect(tieneRol({ role: undefined, rol: 'empresa' }, 'empresa')).toBe(true)
  })

  it('acepta el rol empresa normalizado', () => {
    expect(tieneRol({ role: 'empresa' }, 'empresa')).toBe(true)
  })

  // ── Una empresa no entra por la puerta de atrás ─────────────────────
  it('impide que una empresa satisfaga el guard de institución', () => {
    expect(tieneRol({ role: 'institution', tipo: 'empresa' }, 'institution')).toBe(false)
  })

  it('impide que una empresa satisfaga otros roles', () => {
    expect(tieneRol({ role: 'empresa' }, 'pcd')).toBe(false)
    expect(tieneRol({ role: 'empresa' }, 'tutor')).toBe(false)
    expect(tieneRol({ role: 'empresa' }, 'admin')).toBe(false)
    expect(tieneRol({ role: 'institution', tipo: 'empresa' }, 'admin')).toBe(false)
  })

  // ── Roles normales ──────────────────────────────────────────────────
  it('resuelve el resto de roles con normalidad', () => {
    expect(tieneRol({ role: 'pcd' }, 'pcd')).toBe(true)
    expect(tieneRol({ role: 'pcd' }, 'admin')).toBe(false)
    expect(tieneRol({ role: 'tutor' }, 'tutor')).toBe(true)
  })

  it('tolera el valor crudo del backend en roles de institución', () => {
    expect(tieneRol({ role: 'institution' }, 'institution')).toBe(true)
    expect(tieneRol({ rol: 'institucion' }, 'institution')).toBe(true)
    expect(tieneRol({ role: 'institution' }, 'institucion')).toBe(true)
  })

  it('no satisface nada sin usuario, y un guard sin rol deja pasar', () => {
    expect(tieneRol(null, 'empresa')).toBe(false)
    expect(tieneRol(undefined, 'pcd')).toBe(false)
    expect(tieneRol({ role: 'pcd' }, '')).toBe(true)
  })
})

describe('getCamposOnboardingFaltantes', () => {
  const base = { id: 'inst-1', name: 'Mi Empresa' } as Institution

  it('marca todo como faltante cuando no hay institución registrada', () => {
    expect(getCamposOnboardingFaltantes(null)).toEqual(['categoria', 'politicasInclusión'])
    expect(getCamposOnboardingFaltantes(undefined)).toHaveLength(2)
  })

  it('exige la categoría (aceptando el alias en español del backend)', () => {
    const faltan = getCamposOnboardingFaltantes({
      ...base,
      servicios: ['Flexibilidad laboral'],
    } as Institution)
    expect(faltan).toEqual(['categoria'])

    const conAlias = getCamposOnboardingFaltantes({
      ...base,
      categoria: 'laboral',
      servicios: ['Flexibilidad laboral'],
    } as Institution)
    expect(conAlias).toEqual([])
  })

  it('rechaza una categoría fuera del enum del backend', () => {
    const faltan = getCamposOnboardingFaltantes({
      ...base,
      category: 'retail',
      servicios: ['Flexibilidad laboral'],
    } as unknown as Institution)
    expect(faltan).toEqual(['categoria'])
  })

  it('exige al menos una política de inclusión', () => {
    const faltan = getCamposOnboardingFaltantes({
      ...base,
      category: 'laboral',
      servicios: [],
    } as Institution)
    expect(faltan).toEqual(['politicasInclusión'])
  })

  it('normaliza servicios que llegan como objetos', () => {
    const faltan = getCamposOnboardingFaltantes({
      ...base,
      category: 'social',
      servicios: [{ nombre: 'Terapias' }],
    } as unknown as Institution)
    expect(faltan).toEqual([])
  })

  it('considera completo un registro con categoría y políticas', () => {
    expect(
      getCamposOnboardingFaltantes({
        ...base,
        category: 'educativo',
        servicios: ['Infraestructura accesible'],
      } as Institution),
    ).toEqual([])
  })
})
