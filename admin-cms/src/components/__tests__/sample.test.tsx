import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Sample component for testing
function HelloWorld({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>
}

describe('Sample Test', () => {
  it('should render component correctly', () => {
    render(<HelloWorld name="VietShort Admin" />)
    expect(screen.getByText('Hello, VietShort Admin!')).toBeInTheDocument()
  })
})
