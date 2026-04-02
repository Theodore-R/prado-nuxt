import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------- Shared mocks ----------

const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()
const mockIs = vi.fn()
const mockLt = vi.fn()
const mockSingle = vi.fn()

function mockChain() {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }
  return chain
}

// ---------- Tests for PATCH endpoint logic ----------

describe('PATCH /api/admin/actions — logic', () => {
  function parsePatchBody(body: Record<string, any>) {
    const { id, places_max, archived_at } = body ?? {}

    if (!id) throw new Error('id requis')

    const updates: Record<string, unknown> = {}

    if (places_max !== undefined) {
      if (places_max !== null && (typeof places_max !== 'number' || places_max < 0)) {
        throw new Error('places_max doit être un nombre positif ou null')
      }
      updates.places_max = places_max ?? null
    }

    if (archived_at !== undefined) {
      updates.archived_at = archived_at
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('Aucune modification')
    }

    return { id, updates }
  }

  it('rejects missing id', () => {
    expect(() => parsePatchBody({})).toThrow('id requis')
  })

  it('accepts places_max update', () => {
    const { id, updates } = parsePatchBody({ id: 1, places_max: 20 })
    expect(id).toBe(1)
    expect(updates).toEqual({ places_max: 20 })
  })

  it('accepts places_max null (unlimited)', () => {
    const { updates } = parsePatchBody({ id: 1, places_max: null })
    expect(updates).toEqual({ places_max: null })
  })

  it('rejects negative places_max', () => {
    expect(() => parsePatchBody({ id: 1, places_max: -5 })).toThrow('nombre positif')
  })

  it('rejects string places_max', () => {
    expect(() => parsePatchBody({ id: 1, places_max: 'abc' })).toThrow('nombre positif')
  })

  it('accepts archived_at update', () => {
    const ts = '2026-03-25T02:00:00.000Z'
    const { updates } = parsePatchBody({ id: 1, archived_at: ts })
    expect(updates).toEqual({ archived_at: ts })
  })

  it('accepts archived_at null (unarchive)', () => {
    const { updates } = parsePatchBody({ id: 1, archived_at: null })
    expect(updates).toEqual({ archived_at: null })
  })

  it('accepts both places_max and archived_at', () => {
    const { updates } = parsePatchBody({ id: 1, places_max: 15, archived_at: '2026-01-01T00:00:00Z' })
    expect(updates).toEqual({ places_max: 15, archived_at: '2026-01-01T00:00:00Z' })
  })

  it('rejects empty update (no fields)', () => {
    expect(() => parsePatchBody({ id: 1 })).toThrow('Aucune modification')
  })
})

// ---------- Tests for POST duplicate logic ----------

describe('POST /api/admin/actions — duplication logic', () => {
  function buildClone(source: Record<string, any>): Record<string, any> {
    const { id: _id, created_at: _created, ...rest } = source
    return {
      ...rest,
      title: `${source.title} (copie)`,
      is_published: false,
    }
  }

  it('appends (copie) to title', () => {
    const clone = buildClone({ id: 1, title: 'Foodtruck', category: 'Cuisine', created_at: '2026-01-01' })
    expect(clone.title).toBe('Foodtruck (copie)')
  })

  it('sets is_published to false', () => {
    const clone = buildClone({ id: 1, title: 'Test', is_published: true, created_at: '2026-01-01' })
    expect(clone.is_published).toBe(false)
  })

  it('removes id and created_at from clone', () => {
    const clone = buildClone({ id: 1, title: 'Test', created_at: '2026-01-01', category: 'A' })
    expect(clone).not.toHaveProperty('id')
    expect(clone).not.toHaveProperty('created_at')
  })

  it('preserves all other fields', () => {
    const source = {
      id: 5,
      title: 'Fresque',
      category: 'Atelier',
      date: '2026-05-01',
      time: '14:00',
      summary: 'Summary',
      description: 'Desc',
      url_detail: 'https://prado.fr/fresque',
      url_image: 'https://prado.fr/img.jpg',
      is_activite: true,
      is_published: true,
      places_max: 20,
      archived_at: null,
      created_at: '2026-01-01',
    }
    const clone = buildClone(source)
    expect(clone.category).toBe('Atelier')
    expect(clone.date).toBe('2026-05-01')
    expect(clone.places_max).toBe(20)
    expect(clone.description).toBe('Desc')
    expect(clone.archived_at).toBeNull()
  })
})

// ---------- Tests for archive cron logic ----------

describe('Cron archive-actions — date filtering logic', () => {
  function shouldArchive(action: { is_activite: boolean; archived_at: string | null; date: string }, today: string): boolean {
    return action.is_activite && action.archived_at === null && action.date < today
  }

  it('archives activite with past date', () => {
    expect(shouldArchive({ is_activite: true, archived_at: null, date: '2026-03-20' }, '2026-03-25')).toBe(true)
  })

  it('does not archive action with future date', () => {
    expect(shouldArchive({ is_activite: true, archived_at: null, date: '2026-04-01' }, '2026-03-25')).toBe(false)
  })

  it('does not archive already-archived action', () => {
    expect(shouldArchive({ is_activite: true, archived_at: '2026-03-20T00:00:00Z', date: '2026-03-10' }, '2026-03-25')).toBe(false)
  })

  it('does not archive non-activite (sur mesure) actions', () => {
    expect(shouldArchive({ is_activite: false, archived_at: null, date: '2026-03-01' }, '2026-03-25')).toBe(false)
  })

  it('does not archive action with today date (only strict past)', () => {
    expect(shouldArchive({ is_activite: true, archived_at: null, date: '2026-03-25' }, '2026-03-25')).toBe(false)
  })
})

// ---------- Tests for GET admin/actions filtering ----------

describe('GET /api/admin/actions — archive filter logic', () => {
  const allActions = [
    { id: 1, title: 'Active', archived_at: null },
    { id: 2, title: 'Archived', archived_at: '2026-03-20T00:00:00Z' },
    { id: 3, title: 'Active 2', archived_at: null },
  ]

  function filterActions(actions: typeof allActions, showArchived: boolean) {
    if (!showArchived) {
      return actions.filter(a => a.archived_at === null)
    }
    return actions
  }

  it('returns only active actions by default', () => {
    const result = filterActions(allActions, false)
    expect(result).toHaveLength(2)
    expect(result.every(a => a.archived_at === null)).toBe(true)
  })

  it('returns all actions when showArchived is true', () => {
    const result = filterActions(allActions, true)
    expect(result).toHaveLength(3)
  })
})
