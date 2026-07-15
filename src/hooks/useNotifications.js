import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import api from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useNotificationStream(onNotification) {
  const { token } = useAuthStore()
  const esRef = useRef(null)

  useEffect(() => {
    if (!token) return
    // Use full backend URL for EventSource (relative URLs go to FileZilla, not the API)
    const baseUrl = import.meta.env.VITE_API_URL ?? '/api'
    const es = new EventSource(`${baseUrl}/notifications/stream?token=${token}`)
    esRef.current = es
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        onNotification?.(data)
      } catch {}
    }
    return () => es.close()
  }, [token])
}
