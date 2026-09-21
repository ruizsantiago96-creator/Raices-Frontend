import { useState, useEffect } from 'react'

export function useFormDraft<T>(key: string, initialValues: T): [T, (values: T | ((prev: T) => T)) => void, () => void] {
  const draftKey = `draft_form_${key}`

  const [values, setValues] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        return { ...initialValues, ...JSON.parse(saved) }
      }
    } catch {
      // Fallback if parsing fails
    }
    return initialValues
  })

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(values))
    } catch {
      // Handle storage quota limits
    }
  }, [draftKey, values])

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey)
    } catch {
      // Handle error
    }
    setValues(initialValues)
  }

  return [values, setValues, clearDraft]
}

export default useFormDraft
