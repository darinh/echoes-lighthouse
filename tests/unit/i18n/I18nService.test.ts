import { describe, it, expect, vi, beforeEach } from 'vitest'
import { I18nService } from '@/i18n/I18nService.js'

// Mock fetch so we don't need the actual locale files
const mockLocales: Record<string, Record<string, unknown>> = {
  en: {
    game: { title: 'Echoes of the Lighthouse' },
    hud: { loop: 'Loop {count}' },
    location: { harbor: 'The Harbour' },
  },
  fr: {
    game: { title: 'Échos du Phare' },
    location: { harbor: 'Le Port' },
  },
}

function createMockFetch() {
  return vi.fn(async (url: string) => {
    const match = url.match(/locales\/(\w+)\/(\w+)\.json/)
    if (!match) return new Response('{}', { status: 404 })
    const [, locale] = match
    const data = mockLocales[locale] ?? {}
    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
  })
}

describe('I18nService', () => {
  let i18n: I18nService

  beforeEach(async () => {
    vi.stubGlobal('fetch', createMockFetch())
    i18n = new I18nService('/')
    await i18n.setLocale('en')
  })

  describe('t() — key resolution', () => {
    it('resolves a top-level key', () => {
      expect(i18n.t('location.harbor')).toBe('The Harbour')
    })

    it('resolves a nested key', () => {
      expect(i18n.t('game.title')).toBe('Echoes of the Lighthouse')
    })

    it('returns the key itself when not found (never throws)', () => {
      expect(i18n.t('this.key.does.not.exist')).toBe('this.key.does.not.exist')
    })

    it('interpolates {params} in the translated string', () => {
      expect(i18n.t('hud.loop', { count: 3 })).toBe('Loop 3')
    })

    it('leaves unreplaced {params} intact when param is missing', () => {
      expect(i18n.t('hud.loop')).toBe('Loop {count}')
    })
  })

  describe('locale switching', () => {
    it('returns correct locale after setLocale', async () => {
      await i18n.setLocale('fr')
      expect(i18n.getCurrentLocale()).toBe('fr')
    })

    it('resolves translated value in new locale', async () => {
      await i18n.setLocale('fr')
      expect(i18n.t('game.title')).toBe('Échos du Phare')
    })

    it('falls back to en for keys missing in target locale', async () => {
      await i18n.setLocale('fr')
      // hud.loop only exists in en mock
      expect(i18n.t('hud.loop', { count: 2 })).toBe('Loop 2')
    })
  })

  describe('isLoaded', () => {
    it('returns true after setLocale resolves', () => {
      expect(i18n.isLoaded()).toBe(true)
    })
  })
})
