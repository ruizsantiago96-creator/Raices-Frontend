import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@test/renderWithProviders'
import { useJobs, useApplyJob } from '../hooks/useJobs'
import userEvent from '@testing-library/user-event'
import api from '@shared/lib/api'
import { useAuthStore } from '@features/auth'

vi.mock('@shared/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  useAuthStore.setState({
    token: 'test-token',
    user: { id: '1', role: 'pcd', full_name: 'Test User' },
  })
})

function JobsTestComponent({ filters = {} }) {
  const { data, isLoading, isError } = useJobs(filters)
  if (isLoading) return <div data-testid="loading">Loading...</div>
  if (isError) return <div data-testid="error">Error</div>
  const items = Array.isArray(data) ? data : []
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      {items.map(job => (
        <div key={job.id} data-testid={`job-${job.id}`}>
          <span>{job.title ?? job.titulo}</span>
          <span>{job.empresa}</span>
        </div>
      ))}
    </div>
  )
}

describe('features/jobs/hooks/useJobs', () => {
  it('fetches jobs list', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        datos: [
          { id: 'j1', titulo: 'Desarrollador', empresa: 'TechCorp', categoria: 'laboral' },
        ],
        total: 1,
        paginas: 1,
      },
    })

    renderWithProviders(<JobsTestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })

    expect(screen.getByText('Desarrollador')).toBeInTheDocument()
    expect(screen.getByText('TechCorp')).toBeInTheDocument()
  })

  it('handles empty results', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { datos: [], total: 0, paginas: 0 },
    })

    renderWithProviders(<JobsTestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('0')
    })
  })

})

describe('features/jobs/hooks/useApplyJob', () => {
  it('applies to a job via POST', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { id: 'app1', jobId: 'j1', cartaPresentacion: 'Estimados...' },
    })

    function ApplyButton() {
      const { mutate } = useApplyJob()
      return (
        <button onClick={() => mutate({ jobId: 'j1', cover_letter: 'Estimados...' })}>
          Apply
        </button>
      )
    }

    const user = userEvent.setup()
    renderWithProviders(<ApplyButton />)
    await user.click(screen.getByText('Apply'))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/empleo/j1/postularse', {
        cartaPresentacion: 'Estimados...',
      })
    })
  })
})
