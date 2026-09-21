import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionEvent {
  resultIndex: number
  results: {
    length: number
    [key: number]: {
      [key: number]: {
        transcript: string
      }
      isFinal: boolean
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface ISpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  onend: () => void
}

interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function useSpeechRecognition(lang = 'es-MX') {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognitionClass) {
      setIsSupported(true)
      const instance = new SpeechRecognitionClass()
      instance.continuous = true
      instance.interimResults = true
      instance.lang = lang

      instance.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setTranscript(currentTranscript)
      }

      instance.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error)
        setIsListening(false)
      }

      instance.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = instance
    } else {
      setIsSupported(false)
    }
  }, [lang])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    setTranscript('')
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (err) {
      console.warn('SpeechRecognition start error:', err)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.stop()
      setIsListening(false)
    } catch (err) {
      console.warn('SpeechRecognition stop error:', err)
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}

export default useSpeechRecognition
