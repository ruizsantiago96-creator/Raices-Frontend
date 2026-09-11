/**
 * Iconos de catálogo (Fluent Emoji Modern) renderizados a su tamaño de tarjeta.
 * ============================================================================
 * Los catálogos (`institutionCatalogos`, `enterpriseCatalogos`,
 * `registrationCatalogos`) guardan la referencia del componente; aquí se
 * renderizan con el MISMO tamaño en px que tenía el `font-size` del emoji del
 * sistema, según la variante de tarjeta:
 *
 *   - horizontal / comunidad  → 28px (círculo de 44px)
 *   - vertical / grid         → 24px
 *   - thanks (éxito)          → 48px
 *
 * El diseño, estructura y clases de las tarjetas quedan intactos.
 */

import type { CSSProperties, ReactNode } from 'react'
import type { FluentEmojiComponent } from '../constants/fluentEmojis'

interface CatalogIconProps {
  icon: FluentEmojiComponent | string
  size: number
  style?: CSSProperties
}

/**
 * Renderiza un icono de catálogo que puede ser un componente Fluent Emoji
 * (SVG) o un emoji de texto legado (p. ej. 👨‍👩‍👧‍👦 que se conserva).
 *
 * Los componentes de `react-fluentui-emoji` solo aceptan `size`; cualquier
 * estilo adicional se aplica en un span contenedor.
 */
export function CatalogIcon({ icon: Icon, size, style }: CatalogIconProps): React.JSX.Element {
  if (typeof Icon === 'string') {
    return (
      <span style={{ fontSize: size, lineHeight: 1, ...style }} aria-hidden="true">
        {Icon}
      </span>
    )
  }
  return (
    <span style={{ display: 'inline-flex', lineHeight: 1, ...style }} aria-hidden="true">
      <Icon size={size} />
    </span>
  )
}

/** Helper para props de ReactNode con tamaño fijo por variante. */
export function renderCatalogIcon(icon: FluentEmojiComponent | string, size: number): ReactNode {
  return <CatalogIcon icon={icon} size={size} />
}
