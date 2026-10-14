import { describe, it, expect } from 'vitest'
import {
  normalizeAIResumen,
  normalizeAIRecommendations,
  generateContextualRecommendations,
} from '../utils/aiHelpers'
import type { AIResumenResponse, Dependiente } from '@/types/tutor'

describe('aiHelpers', () => {
  describe('normalizeAIResumen', () => {
    it('returns null if data is null or undefined', () => {
      expect(normalizeAIResumen(null)).toBeNull()
      expect(normalizeAIResumen(undefined)).toBeNull()
    })

    it('does not alter content if isTutor is false', () => {
      const original: AIResumenResponse = {
        resumenUnParrafo: 'Texto sin cambios para PCD',
        resumenTresParrafos: {
          quienEres: 'Persona independiente',
        },
      }
      const res = normalizeAIResumen(original, { isTutor: false })
      expect(res).toEqual(original)
    })

    it('corrects tutor Lou Qtar and tutored son Mateo in single-paragraph and 3-section narrative', () => {
      const rawResumen: AIResumenResponse = {
        resumenUnParrafo:
          'Lou Qtar, radicado en Mérida, Yucatán, es un valiente niño con discapacidad motriz de nacimiento que cuenta con un diagnóstico formal. Acompañado por su padre tutor, Lou muestra un desarrollo equilibrado, destacando especialmente en su comunicación. Con una situación económica favorable, su familia se enfoca en brindarle una atención integral que abarca desde la rehabilitación física hasta el deporte adaptado. Lou se encuentra en una etapa vital de crecimiento y exploración, con metas claras que incluyen acceder a educación básica, participar en eventos culturales y fortalecer su autonomía diaria. Es admirable ver su entusiasmo por integrarse plenamente en la comunidad y su interés por el desarrollo de su propia marca personal, elementos que, junto a su socialización guiada, le permitirán construir un camino lleno de grandes oportunidades y bienestar constante.',
        resumenTresParrafos: {
          quienEres:
            'Lou Qtar es un niño valiente que reside en Mérida, Yucatán, junto a su padre tutor. Cuenta con un diagnóstico formal de discapacidad motriz presente desde su nacimiento. En esta etapa fundamental de su infancia, Lou demuestra un gran potencial y una capacidad de comunicación destacable, mostrando una actitud positiva ante los retos y oportunidades de su entorno diario.',
          contexto:
            'Actualmente, Lou se encuentra en una situación donde cuenta con el respaldo necesario para su desarrollo, incluyendo acceso a atención médica especializada y terapias de rehabilitación física. Su nivel de apoyo es independiente, reflejando su capacidad de adaptación. Aunque su historial educativo no ha sido especificado, su entorno familiar se dedica plenamente a garantizarle una vida plena y estable.',
          intereses:
            'Sus metas son ambiciosas y diversas, abarcando desde la educación básica hasta la incursión en el deporte adaptado y el empleo adaptado a futuro. Lou tiene un fuerte interés por participar en eventos culturales, mejorar su organización diaria y fortalecer su comunidad mediante la socialización guiada y el desarrollo de su propia marca personal, preparándose para un futuro brillante.',
        },
      }

      const normalized = normalizeAIResumen(rawResumen, {
        tutorName: 'Lou Qtar',
        dependentName: 'Mateo',
        parentesco: 'hijo',
        isTutor: true,
      })

      expect(normalized).not.toBeNull()
      const unParrafo = normalized?.resumenUnParrafo || ''
      const tres = normalized?.resumenTresParrafos || {}

      // Lou Qtar debe ser identificado como tutor y no como niño
      expect(unParrafo).toContain('Lou Qtar, radicado en Mérida, Yucatán, es tutor de su hijo Mateo')
      expect(unParrafo).toContain('Con el respaldo y acompañamiento de Lou, Mateo muestra')
      expect(unParrafo).toContain('Mateo se encuentra en una etapa vital')

      // En Quién eres: Lou es tutor de Mateo y Mateo cuenta con diagnóstico y demuestra potencial
      expect(tres.quienEres).toContain('Lou Qtar es tutor de su hijo Mateo, un niño valiente que reside en Mérida, Yucatán.')
      expect(tres.quienEres).toContain('Mateo cuenta con un diagnóstico formal')
      expect(tres.quienEres).toContain('Mateo demuestra un gran potencial')

      // En Contexto: Mateo cuenta con el respaldo y cuidado activo de Lou
      expect(tres.contexto).toContain('Actualmente, Mateo cuenta con el respaldo y cuidado activo de Lou')

      // En Intereses: Mateo tiene un fuerte interés
      expect(tres.intereses).toContain('Mateo tiene un fuerte interés')
    })
  })

  describe('generateContextualRecommendations', () => {
    it('generates tailored suggestions for motor disability in childhood', () => {
      const dep: Dependiente = {
        id: '1',
        nombreCompleto: 'Mateo',
        parentesco: 'Hijo',
        tiposDiscapacidad: ['motriz'],
        etapaVida: 'ninez',
      }
      const recs = generateContextualRecommendations(dep)
      expect(recs.length).toBeGreaterThanOrEqual(3)
      expect(recs.some(r => r.includes('rehabilitación física') || r.includes('ergonómicas') || r.includes('asistiva'))).toBe(true)
    })
  })

  describe('normalizeAIRecommendations', () => {
    it('extracts steps and generates fallback when empty', () => {
      const dep: Dependiente = {
        id: '1',
        nombreCompleto: 'Mateo',
        parentesco: 'Hijo',
        tiposDiscapacidad: ['motriz'],
      }
      const res = normalizeAIRecommendations({}, dep)
      expect(res.steps.length).toBeGreaterThanOrEqual(3)
      expect(res.isFallback).toBe(true)
    })
  })
})
