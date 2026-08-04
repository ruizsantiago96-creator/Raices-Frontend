import { describe, it, expect } from 'vitest'
import {
  LOADING_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  CONFIRM_MESSAGES,
  BUTTON_TEXT,
  INPUT_PLACEHOLDERS,
  PAGE_STATES,
} from '../uiMessages'

describe('shared/constants/uiMessages', () => {
  describe('LOADING_MESSAGES', () => {
    it('is defined and has expected keys', () => {
      expect(LOADING_MESSAGES).toBeDefined()
      expect(LOADING_MESSAGES.GENERIC).toBe('Cargando...')
      expect(LOADING_MESSAGES.SLOW).toBeDefined()
      expect(LOADING_MESSAGES.DATA).toBeDefined()
      expect(LOADING_MESSAGES.SAVE).toBeDefined()
      expect(LOADING_MESSAGES.DELETE).toBeDefined()
      expect(LOADING_MESSAGES.SEND).toBeDefined()
      expect(LOADING_MESSAGES.PROCESS).toBeDefined()
    })

    it('all values are non-empty strings', () => {
      Object.values(LOADING_MESSAGES).forEach((val) => {
        expect(typeof val).toBe('string')
        expect(val.length).toBeGreaterThan(0)
      })
    })
  })

  describe('SUCCESS_MESSAGES', () => {
    it('has all expected success messages', () => {
      expect(SUCCESS_MESSAGES.SAVED).toBeDefined()
      expect(SUCCESS_MESSAGES.UPDATED).toBeDefined()
      expect(SUCCESS_MESSAGES.DELETED).toBeDefined()
      expect(SUCCESS_MESSAGES.CREATED).toBeDefined()
      expect(SUCCESS_MESSAGES.SENT).toBeDefined()
    })

    it('all values are non-empty strings', () => {
      Object.values(SUCCESS_MESSAGES).forEach((val) => {
        expect(typeof val).toBe('string')
        expect(val.length).toBeGreaterThan(0)
      })
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('has all expected error messages', () => {
      expect(ERROR_MESSAGES.GENERIC).toBeDefined()
      expect(ERROR_MESSAGES.NETWORK).toBeDefined()
      expect(ERROR_MESSAGES.UNAUTHORIZED).toBeDefined()
      expect(ERROR_MESSAGES.NOT_FOUND).toBeDefined()
      expect(ERROR_MESSAGES.VALIDATION).toBeDefined()
      expect(ERROR_MESSAGES.SERVER).toBeDefined()
      expect(ERROR_MESSAGES.PERMISSION).toBeDefined()
    })

    it('all values are non-empty strings', () => {
      Object.values(ERROR_MESSAGES).forEach((val) => {
        expect(typeof val).toBe('string')
        expect(val.length).toBeGreaterThan(0)
      })
    })
  })

  describe('CONFIRM_MESSAGES', () => {
    it('has delete, leave, and logout confirmations', () => {
      expect(CONFIRM_MESSAGES.DELETE).toBeDefined()
      expect(CONFIRM_MESSAGES.LEAVE).toBeDefined()
      expect(CONFIRM_MESSAGES.LOGOUT).toBeDefined()
    })
  })

  describe('BUTTON_TEXT', () => {
    it('has common button labels', () => {
      expect(BUTTON_TEXT.SAVE).toBe('Guardar')
      expect(BUTTON_TEXT.CANCEL).toBe('Cancelar')
      expect(BUTTON_TEXT.DELETE).toBe('Eliminar')
      expect(BUTTON_TEXT.EDIT).toBe('Editar')
      expect(BUTTON_TEXT.CLOSE).toBe('Cerrar')
      expect(BUTTON_TEXT.BACK).toBe('Volver')
      expect(BUTTON_TEXT.NEXT).toBe('Siguiente')
      expect(BUTTON_TEXT.PREVIOUS).toBe('Anterior')
      expect(BUTTON_TEXT.SUBMIT).toBe('Enviar')
      expect(BUTTON_TEXT.CONFIRM).toBe('Confirmar')
      expect(BUTTON_TEXT.ACCEPT).toBe('Aceptar')
      expect(BUTTON_TEXT.REJECT).toBe('Rechazar')
      expect(BUTTON_TEXT.RETRY).toBe('Reintentar')
      expect(BUTTON_TEXT.LOAD_MORE).toBe('Ver más')
      expect(BUTTON_TEXT.SHOW_ALL).toBe('Ver todo')
    })

    it('all values are non-empty strings', () => {
      Object.values(BUTTON_TEXT).forEach((val) => {
        expect(typeof val).toBe('string')
        expect(val.length).toBeGreaterThan(0)
      })
    })
  })

  describe('INPUT_PLACEHOLDERS', () => {
    it('has all expected placeholders', () => {
      expect(INPUT_PLACEHOLDERS.SEARCH).toBe('Buscar...')
      expect(INPUT_PLACEHOLDERS.EMAIL).toBeDefined()
      expect(INPUT_PLACEHOLDERS.PASSWORD).toBeDefined()
      expect(INPUT_PLACEHOLDERS.NAME).toBeDefined()
      expect(INPUT_PLACEHOLDERS.PHONE).toBeDefined()
      expect(INPUT_PLACEHOLDERS.MESSAGE).toBeDefined()
      expect(INPUT_PLACEHOLDERS.COMMENT).toBeDefined()
    })
  })

  describe('PAGE_STATES', () => {
    it('has empty, no data, and coming soon states', () => {
      expect(PAGE_STATES.EMPTY).toBeDefined()
      expect(PAGE_STATES.NO_DATA).toBeDefined()
      expect(PAGE_STATES.COMING_SOON).toBeDefined()
    })
  })
})
