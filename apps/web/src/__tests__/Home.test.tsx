import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/Home'

describe('Home', () => {
  it('renders greeting', () => {
    render(<Home />)
    expect(screen.getByText(/easy-lingo/i)).toBeInTheDocument()
  })
})
