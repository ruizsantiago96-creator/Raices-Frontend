import React, { useState, useEffect } from 'react'

export interface TextToSpeechButtonProps {
  text: string
  label?: string
  size?: 'sm' | 'md'
  style?: React.CSSProperties
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({
  text,
  label = 'Escuchar',
  size = 'md',
  style,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  if (!supported) return null

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    const synth = window.speechSynthesis

    if (isPlaying) {
      synth.cancel()
      setIsPlaying(false)
      return
    }

    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-MX'
    utterance.rate = 0.95

    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    synth.speak(utterance)
    setIsPlaying(true)
  }

  const isSmall = size === 'sm'

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      aria-label={isPlaying ? 'Detener lectura' : 'Escuchar texto en voz alta'}
      title={isPlaying ? 'Detener lectura' : 'Escuchar texto'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 4 : 6,
        padding: isSmall ? '3px 8px' : '5px 12px',
        borderRadius: 20,
        border: '1.5px solid',
        borderColor: isPlaying ? 'var(--primary)' : 'var(--border-color)',
        background: isPlaying ? 'color-mix(in oklch, var(--primary) 12%, transparent)' : 'var(--bg-warm)',
        color: isPlaying ? 'var(--primary)' : 'var(--fg2)',
        fontSize: isSmall ? 11.5 : 12.5,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span style={{ fontSize: isSmall ? 13 : 15 }}>{isPlaying ? '⏹️' : '🔊'}</span>
      <span>{isPlaying ? 'Detener' : label}</span>
    </button>
  )
}

export default TextToSpeechButton
