import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,            // Siempre considerar datos obsoletos → refetch al montar
      refetchOnMount: true,     // Refetch cada vez que el componente se monta
      refetchOnWindowFocus: true, // Refetch al volver a la pestaña
      refetchOnReconnect: true,  // Refetch al reconectar a internet
      retry: 1,
    },
  },
})
