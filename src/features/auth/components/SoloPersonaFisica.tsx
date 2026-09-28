import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { EMPRESA_HOME, useEsEmpresa } from '../lib/empresaRole'

export interface SoloPersonaFisicaProps {
  children: ReactNode
}

/**
 * Envuelve vistas que exigen identidad individual (CURP + identificación oficial).
 * Una empresa es una persona moral: no tiene CURP, así que la vista se sustituye
 * por una redirección a su portal en lugar de renderizarse.
 *
 * No declara hooks más allá de `useEsEmpresa`, de modo que las vistas hijas pueden
 * conservar su orden de hooks intacto.
 */
export default function SoloPersonaFisica({ children }: SoloPersonaFisicaProps) {
  const isEmpresa = useEsEmpresa()
  if (isEmpresa) return <Navigate to={EMPRESA_HOME} replace />
  return <>{children}</>
}
