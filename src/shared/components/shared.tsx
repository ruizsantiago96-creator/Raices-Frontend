import React from 'react'
import { motion } from 'motion/react'
import { VERSION } from '../../../version'
import {
  Home,
  Search,
  Heart,
  MessageSquare,
  User,
  Sparkles,
  Shield,
  Users,
  Activity,
  MapPin,
  Star,
  ArrowRight,
  ArrowLeft,
  Building2,
  Brain,
  Send,
  X,
  Check,
  Filter,
  Bookmark,
  Calendar,
  Info,
  RefreshCw,
  Phone,
  Mail,
  Globe,
  Upload,
  Target,
  LogOut,
  Plus,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  Compass,
  Milestone,
  HeartPulse,
  Bell,
  Briefcase,
  GraduationCap,
  LayoutGrid,
  List,
  Loader2,
  Camera,
  Sliders,
  ChevronDown,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Trash2,
  BadgeCheck,
  Sprout,
} from 'lucide-react'

export interface LeafIconProps {
  size?: number
  color?: string
  style?: React.CSSProperties
}

export const LeafIcon: React.FC<LeafIconProps> = ({ size = 16, color = 'currentColor', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity="0.8" style={style}>
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75" />
  </svg>
)

export interface IconProps {
  s?: number
  filled?: boolean
  color?: string
  style?: React.CSSProperties
}

export const IconWrapper: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <motion.span
    whileHover={{ scale: 1.16, rotate: 2 }}
    whileTap={{ scale: 0.92 }}
    transition={{ type: 'spring', stiffness: 350, damping: 15 }}
    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
  >
    {children}
  </motion.span>
)

// eslint-disable-next-line react-refresh/only-export-components
export const Icons: Record<string, (p?: IconProps) => React.JSX.Element> = {
  home: (p) => <IconWrapper style={p?.style}><Home size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  search: (p) => <IconWrapper style={p?.style}><Search size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  heart: (p) => <IconWrapper style={p?.style}><Heart size={p?.s || 20} fill={p?.filled ? 'currentColor' : 'none'} color={p?.color || 'currentColor'} /></IconWrapper>,
  message: (p) => <IconWrapper style={p?.style}><MessageSquare size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  user: (p) => <IconWrapper style={p?.style}><User size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  sparkles: (p) => <IconWrapper style={p?.style}><Sparkles size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  shield: (p) => <IconWrapper style={p?.style}><Shield size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  users: (p) => <IconWrapper style={p?.style}><Users size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  activity: (p) => <IconWrapper style={p?.style}><Activity size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  mapPin: (p) => <IconWrapper style={p?.style}><MapPin size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  star: (p) => <IconWrapper style={p?.style}><Star size={p?.s || 20} fill={p?.filled ? 'currentColor' : 'none'} color={p?.color || 'currentColor'} /></IconWrapper>,
  arrowRight: (p) => <IconWrapper style={p?.style}><ArrowRight size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  arrowLeft: (p) => <IconWrapper style={p?.style}><ArrowLeft size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  building: (p) => <IconWrapper style={p?.style}><Building2 size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  brain: (p) => <IconWrapper style={p?.style}><Brain size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  send: (p) => <IconWrapper style={p?.style}><Send size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  x: (p) => <IconWrapper style={p?.style}><X size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  check: (p) => <IconWrapper style={p?.style}><Check size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  filter: (p) => <IconWrapper style={p?.style}><Filter size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  bookmark: (p) => <IconWrapper style={p?.style}><Bookmark size={p?.s || 20} fill={p?.filled ? 'currentColor' : 'none'} color={p?.color || 'currentColor'} /></IconWrapper>,
  calendar: (p) => <IconWrapper style={p?.style}><Calendar size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  close: (p) => <IconWrapper style={p?.style}><X size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  info: (p) => <IconWrapper style={p?.style}><Info size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  refresh: (p) => <IconWrapper style={p?.style}><RefreshCw size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  phone: (p) => <IconWrapper style={p?.style}><Phone size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  mail: (p) => <IconWrapper style={p?.style}><Mail size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  globe: (p) => <IconWrapper style={p?.style}><Globe size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  upload: (p) => <IconWrapper style={p?.style}><Upload size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  target: (p) => <IconWrapper style={p?.style}><Target size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  logout: (p) => <IconWrapper style={p?.style}><LogOut size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  plus: (p) => <IconWrapper style={p?.style}><Plus size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  edit: (p) => <IconWrapper style={p?.style}><Pencil size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  shieldAlert: (p) => <IconWrapper style={p?.style}><ShieldAlert size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  shieldCheck: (p) => <IconWrapper style={p?.style}><ShieldCheck size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  barChart: (p) => <IconWrapper style={p?.style}><BarChart3 size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  compass: (p) => <IconWrapper style={p?.style}><Compass size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  milestone: (p) => <IconWrapper style={p?.style}><Milestone size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  heartPulse: (p) => <IconWrapper style={p?.style}><HeartPulse size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  bell: (p) => <IconWrapper style={p?.style}><Bell size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  briefcase: (p) => <IconWrapper style={p?.style}><Briefcase size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  graduationCap: (p) => <IconWrapper style={p?.style}><GraduationCap size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  grid: (p) => <IconWrapper style={p?.style}><LayoutGrid size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  list: (p) => <IconWrapper style={p?.style}><List size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  loader: (p) => <IconWrapper style={p?.style}><Loader2 size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  camera: (p) => <IconWrapper style={p?.style}><Camera size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  sliders: (p) => <IconWrapper style={p?.style}><Sliders size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  chevronDown: (p) => <IconWrapper style={p?.style}><ChevronDown size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  eye: (p) => <IconWrapper style={p?.style}><Eye size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  accessibility: (p) => <IconWrapper style={p?.style}><Eye size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  eyeOff: (p) => <IconWrapper style={p?.style}><EyeOff size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  link: (p) => <IconWrapper style={p?.style}><LinkIcon size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  trash: (p) => <IconWrapper style={p?.style}><Trash2 size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  plant: (p) => <IconWrapper style={p?.style}><Sprout size={p?.s || 20} color={p?.color || 'currentColor'} /></IconWrapper>,
  verifiedBadge: (p) => <IconWrapper style={p?.style}><BadgeCheck size={p?.s || 16} color={p?.color || 'currentColor'} /></IconWrapper>,
}

export const CATEGORY_LABELS: Record<string, string> = {
  'funcional': 'Salud y Terapia',
  'educativo': 'Educación',
  'laboral': 'Empleo',
  'social': 'Comunidad y Recreación',
}

export interface CategoryTagProps {
  label: string
  color: string
}

export const CategoryTag: React.FC<CategoryTagProps> = ({ label, color }) => (
  <span style={{
    padding: '4px 12px',
    borderRadius: '16px 16px 16px 5px',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: `color-mix(in oklch, ${color} 15%, transparent)`,
    color,
  }}>
    <LeafIcon size={10} color={color} />
    {CATEGORY_LABELS[label] ?? label}
  </span>
)

// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_COLORS: Record<string, string> = {
  'funcional': 'color-mix(in oklch, var(--primary) 70%, white)',
  'educativo': 'color-mix(in oklch, var(--primary) 55%, white)',
  'laboral': 'color-mix(in oklch, var(--primary) 85%, white)',
  'social': 'color-mix(in oklch, var(--primary) 40%, white)',
  'Salud': 'color-mix(in oklch, var(--primary) 70%, white)',
  'Terapia': 'color-mix(in oklch, var(--primary) 70%, white)',
  'Recreación': 'color-mix(in oklch, var(--primary) 40%, white)',
  'Educación': 'color-mix(in oklch, var(--primary) 55%, white)',
  'Empleo': 'color-mix(in oklch, var(--primary) 85%, white)',
  'Comunidad': 'color-mix(in oklch, var(--primary) 40%, white)',
}

export interface BrandMarkProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  size?: number
  light?: boolean
}

export const BrandMark: React.FC<BrandMarkProps> = ({ onClick, size = 22, light = false }) => (
  <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap', padding: 0 }}>
    <span style={{
      fontFamily: 'var(--font-body)', fontSize: size, fontWeight: 700,
      color: light ? 'white' : 'var(--fg1)',
    }}>
      Raíces
    </span>
    <span style={{
      fontFamily: 'var(--font-body)', fontSize: size, fontWeight: 900,
      color: 'var(--color-coral)',
      marginLeft: 1,
    }}>
      .
    </span>
  </button>
)

// eslint-disable-next-line react-refresh/only-export-components
export function hashColor(str: string = ''): string {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff
  const colors = ['var(--primary)', 'color-mix(in oklch, var(--primary) 85%, white)', 'color-mix(in oklch, var(--primary) 70%, white)', 'color-mix(in oklch, var(--primary) 55%, white)', 'color-mix(in oklch, var(--primary) 40%, white)', 'color-mix(in oklch, var(--primary) 25%, white)', 'var(--fg3)']
  return colors[Math.abs(h) % colors.length]
}

// eslint-disable-next-line react-refresh/only-export-components
export const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: 14,
  fontWeight: 700, color: 'var(--fg2)', marginBottom: 6, letterSpacing: '0.02em',
}

// eslint-disable-next-line react-refresh/only-export-components
export const inputStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 16px',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
  fontSize: 16, color: 'var(--fg1)', background: 'var(--bg-surface)',
  outline: 'none', boxSizing: 'border-box',
}

/* ── Footer columns data ──────────────────────────── */
interface FooterColumn {
  title: string
  items: string[]
}

const FOOTER_COLUMNS: FooterColumn[] = [
  { title: 'Caminos', items: ['Salud y bienestar', 'Educación', 'Empleo', 'Comunidad'] },
  { title: 'Florece', items: ['Acerca de nosotros', 'Nuestro propósito', 'Privacidad', 'Contacto'] },
]

export const AppFooter: React.FC = () => (
  <footer className="app-footer-main" style={{ background: 'var(--landing-footer-bg)', borderTop: '1px solid var(--landing-footer-border)', padding: '44px 48px 24px', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden' }}>
    <style>{`
      .footer-nav-item {
        color: var(--landing-footer-text-muted);
        transition: color 0.2s ease, transform 0.2s ease;
      }
      .footer-nav-item:hover {
        color: #FF4D68 !important;
        transform: translateX(3px);
      }
      .footer-bottom-link {
        color: var(--landing-footer-text-muted);
        transition: color 0.2s ease;
      }
      .footer-bottom-link:hover {
        color: #FF4D68 !important;
      }
    `}</style>
    <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }} className="responsive-footer-grid">
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--landing-footer-text)', margin: 0, lineHeight: 1.2 }}>
          <span style={{ textDecoration: 'underline', textDecorationColor: '#FF4D68', textUnderlineOffset: 3 }}>Raíces</span>
          <br />
          para florecer.
        </h3>
        <p style={{ fontSize: 14, color: 'var(--landing-footer-text-muted)', marginTop: 10, lineHeight: 1.5, maxWidth: 240 }}>
          Conectamos caminos claros, dignos y confiables para el desarrollo, la autonomía y el florecimiento.
        </p>
      </div>
      {FOOTER_COLUMNS.map((col, i) => (
        <div key={i}>
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--landing-footer-text)', margin: '0 0 14px' }}>{col.title}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {col.items.map((item, j) => (
              <li 
                key={j} 
                className="footer-nav-item" 
                style={{ fontSize: 14, cursor: 'pointer' }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div style={{ maxWidth: 1100, margin: '28px auto 0', borderTop: '1px solid var(--landing-footer-border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--landing-footer-text-muted)', position: 'relative', zIndex: 1 }} className="app-footer-bottom footer-bottom">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LeafIcon size={14} color="#FF4D68" />
          2026. Raíces para florecer. Construida con dignidad y cuidado
        </span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span className="footer-bottom-link" style={{ cursor: 'pointer' }}>Privacidad · Accesibilidad</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: '#FFFFFF' }}>
        POWERED BY
        <img src="/images/Techmaleon_Logo.png" alt="Techmaleon" style={{ height: 22, width: 'auto', display: 'block' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--landing-footer-text-muted)', opacity: 0.7, fontWeight: 500 }}>
        v{VERSION}
      </div>
    </div>
  </footer>
)

export * from './RestrictedUI'
export * from './EmptyState'
export * from './TextToSpeechButton'
export * from './Breadcrumbs'
export * from './SupportCardModal'
export * from './CustomSelect'
