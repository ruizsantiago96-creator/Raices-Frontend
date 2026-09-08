import type { ReactNode, ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

/**
 * Creates a fresh QueryClient for each test to avoid cache leaks between tests.
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

export interface WrapperOptions {
  queryClient?: QueryClient
}

export interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient
}

/**
 * Wrapper that provides QueryClient + BrowserRouter to any component.
 */
export function createWrapper(options: WrapperOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }): ReactElement {
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
 */
export function renderWithProviders(
  ui: ReactElement,
  options: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {}
): RenderWithProvidersResult {
  const { wrapper, queryClient } = createWrapper(options)
  const { queryClient: _qc, ...renderOptions } = options
  const result = render(ui, { wrapper, ...renderOptions })
  return { ...result, queryClient }
}
