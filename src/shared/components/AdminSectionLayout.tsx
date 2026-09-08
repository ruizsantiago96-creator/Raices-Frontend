import React, { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from '@shared/components/shared'

const CARD: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)',
}

const INPUT_STYLE: React.CSSProperties = {
  height: 40,
  padding: '0 12px 0 36px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  color: 'var(--fg1)',
  background: 'var(--bg-surface)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-body)',
  width: '100%',
}

const HEADER_CELL: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--fg3)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

export interface SkeletonProps {
  w?: string | number
  h?: string | number
  r?: string | number
  style?: React.CSSProperties
}

function Skeleton({ w = '100%', h = 16, r = 6, style }: SkeletonProps) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: 'var(--border-color)',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

export interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  sub?: string
}

function EmptyState({ icon, title, sub }: EmptyStateProps) {
  return (
    <div style={{ ...CARD, textAlign: 'center', padding: '48px 24px', margin: '0 auto' }}>
      {icon && (
        <div style={{ color: 'var(--fg3)', marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
          {icon}
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: 0 }}>{title ?? 'Sin datos'}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

export interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }: ConfirmDialogProps) {
  return createPortal(
    <div onClick={onCancel} className="modal-overlay" style={{ zIndex: 9999 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...CARD, padding: 28, maxWidth: 420, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: danger
                ? 'color-mix(in oklch, var(--color-error) 14%, transparent)'
                : 'var(--primary-subtle)',
              color: danger ? 'var(--color-error)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {danger ? Icons.shieldAlert({ s: 20 }) : Icons.shield({ s: 20 })}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fg1)', margin: 0 }}>
            {title}
          </h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.5, margin: '0 0 20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            className="btn-secondary"
            style={{ fontSize: 14, padding: '10px 20px' }}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              fontSize: 14,
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: danger ? 'var(--color-error)' : 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export interface PaginationProps {
  safePage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onGo: (p: number) => void
}

function Pagination({
  safePage,
  totalPages,
  onPrev,
  onNext,
  onGo,
}: PaginationProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18 }}>
      <button
        onClick={onPrev}
        disabled={safePage === 1}
        style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          background: safePage === 1 ? 'transparent' : 'var(--bg-surface)',
          color: safePage === 1 ? 'var(--fg3)' : 'var(--fg2)',
          cursor: safePage === 1 ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          transition: 'all 0.15s',
        }}
      >
        Anterior
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onGo(p)}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--font-body)',
            background: p === safePage ? 'var(--primary)' : 'transparent',
            color: p === safePage ? '#fff' : 'var(--fg3)',
            transition: 'all 0.15s',
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={onNext}
        disabled={safePage === totalPages}
        style={{
          padding: '7px 14px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          background: safePage === totalPages ? 'transparent' : 'var(--bg-surface)',
          color: safePage === totalPages ? 'var(--fg3)' : 'var(--fg2)',
          cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          transition: 'all 0.15s',
        }}
      >
        Siguiente
      </button>
    </div>
  )
}

export interface SearchBarProps {
  value?: string
  onChange?: (val: string) => void
  placeholder?: string
  icon?: React.ReactNode
}

function SearchBar({ value, onChange, placeholder, icon }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--fg3)',
        }}
      >
        {icon ?? Icons.search({ s: 16 })}
      </span>
      <input
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={INPUT_STYLE}
      />
    </div>
  )
}

const FILTER_BUTTON: React.CSSProperties = {
  padding: '7px 16px',
  borderRadius: 20,
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  background: 'var(--bg-surface)',
  color: 'var(--fg2)',
}

export interface FilterItem {
  k: string
  l: string
}

export interface FilterPillsProps {
  items: FilterItem[]
  current?: string
  onChange?: (key: string) => void
}

function FilterPills({ items, current, onChange }: FilterPillsProps) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {items.map((f) => (
        <button
          key={f.k}
          onClick={() => onChange?.(f.k)}
          style={{
            ...FILTER_BUTTON,
            background: current === f.k ? 'var(--primary)' : 'var(--bg-surface)',
            color: current === f.k ? '#fff' : 'var(--fg2)',
          }}
        >
          {f.l}
        </button>
      ))}
    </div>
  )
}

export interface RowWrapperProps {
  children: React.ReactNode
  i: number
  length: number
  onRowHover?: (e: React.MouseEvent<HTMLTableRowElement>, entering: boolean) => void
  style?: React.CSSProperties
}

function RowWrapper({ children, i, length, onRowHover, style }: RowWrapperProps) {
  return (
    <tr
      style={{
        borderBottom: i < length - 1 ? '1px solid var(--border-color)' : 'none',
        transition: 'background 0.15s',
        ...style,
      }}
      onMouseEnter={(e) =>
        onRowHover ? onRowHover(e, true) : (e.currentTarget.style.backgroundColor =
          'color-mix(in oklch, var(--primary) 2%, var(--bg-surface))')
      }
      onMouseLeave={(e) =>
        onRowHover ? onRowHover(e, false) : (e.currentTarget.style.backgroundColor = 'transparent')
      }
    >
      {children}
    </tr>
  )
}

export interface TableMenuRenderContext {
  menuRef: React.RefObject<HTMLDivElement | null>
  menuPos: { top: number; right: number } | null
  actionMenuId: string | number | null
  onActionMenuToggle: (id: string | number) => void
  onCloseMenu: () => void
}

export interface AdminTableConfig<T = unknown> {
  headers?: Array<string | { key?: string; label?: string }>
  rows: T[]
  renderRow?: (row: T, ctx: TableMenuRenderContext) => React.ReactNode
  rowKey?: (row: T) => string | number
}

export interface AdminFilters {
  items?: FilterItem[]
  current?: string
  onChange?: (key: string) => void
}

export interface AdminSearch {
  value?: string
  onChange?: (val: string) => void
  placeholder?: string
}

export interface AdminPagination {
  page?: number
  safePage: number
  totalPages: number
  onPageChange?: (page: number) => void
  pageSizes?: number[]
  pendingMode?: boolean
}

export interface AdminEmptyMessage {
  icon?: React.ReactNode
  title?: string
  sub?: string
}

export interface AdminSectionLayoutProps<T = unknown> {
  title?: string
  subtitle?: string
  toolbar?: React.ReactNode
  filters?: AdminFilters
  search?: AdminSearch
  isLoading?: boolean
  emptyMessage?: AdminEmptyMessage
  table?: AdminTableConfig<T>
  pagination?: AdminPagination
  skeletonCount?: number
  tableWrapStyle?: React.CSSProperties
}

/* ════════════════════════════════════════════════════════════════
   Layout reutilizable para tablas de administración
   ════════════════════════════════════════════════════════════════ */

export default function AdminSectionLayout<T = unknown>({
  toolbar,
  filters = {},
  search = {},
  isLoading,
  emptyMessage,
  table,
  pagination,
  skeletonCount = 3,
  tableWrapStyle,
}: AdminSectionLayoutProps<T>) {
  const actionMenuRef = useRef<HTMLDivElement | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const [actionMenuId, setActionMenuId] = useState<string | number | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setActionMenuId(null)
        setMenuPos(null)
      }
    }
    if (actionMenuId) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [actionMenuId])

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {toolbar}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.items?.map((f) => (
            <button
              key={f.k}
              onClick={() => filters.onChange?.(f.k)}
              style={{
                ...FILTER_BUTTON,
                background: filters.current === f.k ? 'var(--primary)' : 'var(--bg-surface)',
                color: filters.current === f.k ? '#fff' : 'var(--fg2)',
              }}
            >
              {f.l}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 220, marginLeft: 'auto' }}>
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--fg3)',
            }}
          >
            {Icons.search({ s: 16 })}
          </span>
          <input
            value={search.value ?? ''}
            onChange={(e) => search.onChange?.(e.target.value)}
            placeholder={search.placeholder}
            style={INPUT_STYLE}
          />
        </div>
      </div>

      {/* ── Body ── */}
      {isLoading ? (
        <div style={{ ...CARD, padding: 0 }}>
          {Array.from({ length: skeletonCount }, (_, i) => (
            <Skeleton
              key={i}
              h={40}
              style={{ marginBottom: i < skeletonCount - 1 ? 12 : 0 }}
            />
          ))}
        </div>
      ) : table?.rows?.length === 0 ? (
        <div style={{ textAlign: 'center', margin: '0 auto' }}>
          {emptyMessage?.icon && (
            <div
              style={{
                color: 'var(--fg3)',
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {emptyMessage.icon}
            </div>
          )}
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg2)', margin: 0 }}>
            {emptyMessage?.title ?? 'Sin datos'}
          </p>
          {emptyMessage?.sub && (
            <p style={{ fontSize: 13, color: 'var(--fg3)', marginTop: 4 }}>
              {emptyMessage.sub}
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            className="responsive-table-wrap"
            style={{
              ...CARD,
              overflowX: 'auto',
              ...tableWrapStyle,
            }}
          >
            <table
              className="responsive-table"
              style={{ width: '100%', minWidth: 750, borderCollapse: 'collapse' }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    background: 'color-mix(in oklch, var(--bg-warm) 60%, var(--bg-surface))',
                  }}
                >
                  {table?.headers?.map((h) => {
                    const key = typeof h === 'string' ? h : (h.key ?? h.label ?? '')
                    const label = typeof h === 'string' ? h : (h.label ?? key)
                    return (
                      <th key={key} style={HEADER_CELL}>
                        {label}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {table?.rows.map((row, i) => (
                  <RowWrapper key={table.rowKey?.(row) ?? i} i={i} length={table.rows.length}>
                    {table.renderRow?.(row, {
                      menuRef: actionMenuRef,
                      menuPos,
                      actionMenuId,
                      onActionMenuToggle: (id) =>
                        setActionMenuId(actionMenuId === id ? null : id),
                      onCloseMenu: () => {
                        setActionMenuId(null)
                        setMenuPos(null)
                      },
                    })}
                  </RowWrapper>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              safePage={pagination.safePage}
              totalPages={pagination.totalPages}
              onPrev={() => pagination.onPageChange?.(pagination.safePage - 1)}
              onNext={() => pagination.onPageChange?.(pagination.safePage + 1)}
              onGo={(p) => pagination.onPageChange?.(p)}
            />
          )}
        </>
      )}
    </div>
  )
}

AdminSectionLayout.Skeleton = Skeleton
AdminSectionLayout.EmptyState = EmptyState
AdminSectionLayout.ConfirmDialog = ConfirmDialog
AdminSectionLayout.SearchBar = SearchBar
AdminSectionLayout.FilterPills = FilterPills
