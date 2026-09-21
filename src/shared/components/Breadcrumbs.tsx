import React from 'react'
import { Link } from 'react-router-dom'
import { Icons } from './shared'

export interface BreadcrumbItem {
  label: string
  path?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  style?: React.CSSProperties
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, style }) => {
  if (!items || items.length === 0) return null

  return (
    <nav
      aria-label="Migas de pan"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--fg3)',
        marginBottom: 16,
        flexWrap: 'wrap',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span style={{ color: 'var(--border-color)', display: 'flex', alignItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            )}

            {item.path && !isLast ? (
              <Link
                to={item.path}
                style={{
                  color: 'var(--fg3)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg3)')}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                style={{
                  color: isLast ? 'var(--fg1)' : 'var(--fg3)',
                  fontWeight: isLast ? 700 : 500,
                }}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
