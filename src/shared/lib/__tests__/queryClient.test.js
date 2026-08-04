import { describe, it, expect } from 'vitest'
import { queryClient } from '../queryClient'

describe('shared/lib/queryClient', () => {
  it('exports a QueryClient instance', () => {
    expect(queryClient).toBeDefined()
    expect(typeof queryClient.getDefaultOptions).toBe('function')
  })

  it('has correct default query options', () => {
    const opts = queryClient.getDefaultOptions()
    expect(opts.queries.staleTime).toBe(0)
    expect(opts.queries.refetchOnMount).toBe(true)
    expect(opts.queries.refetchOnWindowFocus).toBe(true)
    expect(opts.queries.refetchOnReconnect).toBe(true)
    expect(opts.queries.retry).toBe(1)
  })

  it('is a singleton (same reference on re-import)', async () => {
    const mod1 = await import('../queryClient')
    const mod2 = await import('../queryClient')
    expect(mod1.queryClient).toBe(mod2.queryClient)
  })

  it('has query cache methods available', () => {
    expect(typeof queryClient.getQueryCache).toBe('function')
    expect(typeof queryClient.getMutationCache).toBe('function')
    expect(typeof queryClient.clear).toBe('function')
  })
})
