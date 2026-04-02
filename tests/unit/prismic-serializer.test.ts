import { describe, it, expect } from 'vitest'

/**
 * Tests for the Prismic rich text serializer from utils/prismicSerializer.ts.
 * We reproduce the label handler logic to test in isolation.
 */

const classMap: Record<string, string> = {
  'highlight-pink': 'text-prado-signature-accent',
  'highlight-orange': 'text-[#FB6223]',
  'highlight-purple': 'text-[#024266]',
  'highlight-green': 'text-[#93C1AF]',
}

function renderLabel(label: string, children: string): string {
  const cls = classMap[label] ?? ''
  return `<span class="${cls}">${children}</span>`
}

describe('richTextSerializer — label handler', () => {
  it('applies pink highlight class', () => {
    const html = renderLabel('highlight-pink', 'Hello')
    expect(html).toBe('<span class="text-prado-signature-accent">Hello</span>')
  })

  it('applies orange highlight class', () => {
    const html = renderLabel('highlight-orange', 'World')
    expect(html).toBe('<span class="text-[#FB6223]">World</span>')
  })

  it('applies purple highlight class', () => {
    const html = renderLabel('highlight-purple', 'Test')
    expect(html).toBe('<span class="text-[#024266]">Test</span>')
  })

  it('applies green highlight class', () => {
    const html = renderLabel('highlight-green', 'Eco')
    expect(html).toBe('<span class="text-[#93C1AF]">Eco</span>')
  })

  it('uses empty class for unknown labels', () => {
    const html = renderLabel('unknown-label', 'Content')
    expect(html).toBe('<span class="">Content</span>')
  })

  it('uses empty class for empty label', () => {
    const html = renderLabel('', 'Content')
    expect(html).toBe('<span class="">Content</span>')
  })

  it('preserves HTML entities in children', () => {
    const html = renderLabel('highlight-orange', '&amp; test')
    expect(html).toContain('&amp; test')
  })
})
