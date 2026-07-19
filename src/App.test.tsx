import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('ParcelProof workflow', () => {
  beforeEach(() => localStorage.clear())
  afterEach(cleanup)

  it('creates a real empty review and exposes uncited evidence', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'Test Parcel' } })
    fireEvent.change(screen.getByLabelText('Assessor parcel number'), { target: { value: '123-456-789' } })
    fireEvent.click(screen.getByRole('button', { name: /create evidence file/i }))

    expect(screen.getByRole('heading', { name: 'Test Parcel' })).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /evidence register/i }))
    fireEvent.click(screen.getByRole('button', { name: /assessor parcel record/i }))
    fireEvent.change(screen.getByLabelText('Evidence status'), { target: { value: 'verified' } })
    fireEvent.click(screen.getByRole('button', { name: /findings/i }))

    expect(screen.getByText('Assessor parcel record needs a traceable citation')).toBeInTheDocument()
  })
})
