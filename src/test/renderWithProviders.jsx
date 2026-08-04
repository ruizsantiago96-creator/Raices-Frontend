import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

/**
 * Creates a fresh QueryClient for each test to avoid cache leaks between tests.
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

/**
 * Wrapper that provides QueryClient + BrowserRouter to any component.
 * Use this to render components that depend on React Query or React Router.
 *
 * @example
 * render(<MyComponent />, { wrapper: createWrapper() })
 *
 * Or use the convenience renderWithProviders:
 * @example
 * renderWithProviders(<MyComponent />)
 */
export function createWrapper(options = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient()

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return { wrapper: Wrapper, queryClient }
}

/**
 * Convenience function: renders a component wrapped in providers.
 * Returns the queryClient for assertions on cache state.
 *
 * @param {React.ReactNode} ui - Component to render
 * @param {Object} options - Additional options
 * @returns {{ queryClient: QueryClient, ...renderResult }}
 */
export function renderWithProviders(ui, options = {}) {
  const { wrapper, queryClient } = createWrapper(options)
  const { queryClient: _qc, ...renderOptions } = options
  const result = render(ui, { wrapper, ...renderOptions })
  return { ...result, queryClient }
}


