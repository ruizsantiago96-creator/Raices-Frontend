import { useState, FC, CSSProperties } from 'react'
import { motion } from 'motion/react'
import { Sun, Moon, MessageSquare, Bell } from 'lucide-react'

export interface LordIconProps {
  src?: string
  name?: 'theme' | 'sun' | 'moon' | 'message' | 'chat' | 'bell' | 'notification'
  size?: number
  color?: string
  hoverColor?: string
  trigger?: string
  className?: string
  style?: CSSProperties
  ariaLabel?: string
}

const DEFAULT_COLOR = 'currentColor'
const HOVER_COLOR = 'var(--color-verde, #229b58)'

export const LordIcon: FC<LordIconProps> = ({
  src = '',
  name,
  size = 22,
  color,
  hoverColor,
  className,
  style,
  ariaLabel,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const defaultColor = color || DEFAULT_COLOR
  const activeHover = hoverColor || HOVER_COLOR
  const iconColor = isHovered ? activeHover : defaultColor

  const iconType = name || (src.includes('sun') ? 'sun' : src.includes('moon') ? 'moon' : src.includes('chat') ? 'chat' : 'bell')

  if (iconType === 'sun') {
    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.18, rotate: 45 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={className}
        aria-label={ariaLabel || 'Modo claro'}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', ...style }}
      >
        <Sun size={size} color={iconColor} strokeWidth={2.2} style={{ transition: 'color 0.2s ease' }} />
      </motion.div>
    )
  }

  if (iconType === 'moon') {
    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.18, rotate: -20 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={className}
        aria-label={ariaLabel || 'Modo oscuro'}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', ...style }}
      >
        <Moon size={size} color={iconColor} strokeWidth={2.2} style={{ transition: 'color 0.2s ease' }} />
      </motion.div>
    )
  }

  if (iconType === 'chat' || iconType === 'message') {
    return (
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.18, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={className}
        aria-label={ariaLabel || 'Mensajes'}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', ...style }}
      >
        <MessageSquare size={size} color={iconColor} strokeWidth={2.2} style={{ transition: 'color 0.2s ease' }} />
      </motion.div>
    )
  }

  // Bell / Notification default
  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        rotate: [0, -18, 18, -12, 12, -6, 0],
        scale: 1.12,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={className}
      aria-label={ariaLabel || 'Notificaciones'}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', ...style }}
    >
      <Bell size={size} color={iconColor} strokeWidth={2.2} style={{ transition: 'color 0.2s ease' }} />
    </motion.div>
  )
}
