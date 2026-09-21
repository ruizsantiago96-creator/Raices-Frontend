/**
 * Web Audio API utility for accessible synthesized audio feedback.
 * Generates soft tone frequencies for screen reader and interaction cues.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export type SoundEffectType = 'click' | 'success' | 'announce' | 'alert'

export function playSoundEffect(type: SoundEffectType = 'click') {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime

    switch (type) {
      case 'click':
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05)
        osc.start(now)
        osc.stop(now + 0.05)
        break

      case 'success':
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(523.25, now) // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08) // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16) // G5
        gain.gain.setValueAtTime(0.1, now)
        gain.gain.linearRampToValueAtTime(0.01, now + 0.28)
        osc.start(now)
        osc.stop(now + 0.28)
        break

      case 'announce':
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, now)
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.12)
        gain.gain.setValueAtTime(0.07, now)
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15)
        osc.start(now)
        osc.stop(now + 0.15)
        break

      case 'alert':
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(300, now)
        osc.frequency.linearRampToValueAtTime(200, now + 0.15)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15)
        osc.start(now)
        osc.stop(now + 0.15)
        break
    }
  } catch {
    // Ignore audio context errors gracefully
  }
}
