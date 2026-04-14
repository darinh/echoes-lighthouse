/// <reference types="vite/client" />
import type { II18n } from '@/interfaces/index.js'

type LocaleBundle = Record<string, unknown>

/**
 * I18nService — Loads locale JSON files lazily from public/locales/{locale}/.
 * Files: ui.json, dialogue.json, lore.json, journal.json
 * Falls back to 'en' for any missing key.
 */
export class I18nService implements II18n {
  private locale = 'en'
  private bundles = new Map<string, LocaleBundle>()
  private loaded = false
  private readonly availableLocales = ['en']
  private readonly base: string

  constructor(base: string = import.meta.env.BASE_URL) {
    this.base = base.endsWith('/') ? base : base + '/'
  }

  async setLocale(locale: string): Promise<void> {
    this.locale = locale
    this.loaded = false
    await this.loadLocale(locale)
    this.loaded = true
  }

  t(key: string, params?: Record<string, string | number>): string {
    const value = this.resolve(this.locale, key) ?? this.resolve('en', key) ?? key
    if (!params) return value
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
  }

  getCurrentLocale(): string { return this.locale }
  getAvailableLocales(): string[] { return [...this.availableLocales] }
  isLoaded(): boolean { return this.loaded }

  private resolve(locale: string, key: string): string | undefined {
    const bundle = this.bundles.get(locale)
    if (!bundle) return undefined
    const parts = key.split('.')
    let node: unknown = bundle
    for (const part of parts) {
      if (typeof node !== 'object' || node === null) return undefined
      node = (node as Record<string, unknown>)[part]
    }
    return typeof node === 'string' ? node : undefined
  }

  private deepMerge(target: LocaleBundle, source: LocaleBundle): LocaleBundle {
    for (const key of Object.keys(source)) {
      const sv = source[key], tv = target[key]
      if (sv && typeof sv === 'object' && !Array.isArray(sv) &&
          tv && typeof tv === 'object' && !Array.isArray(tv)) {
        this.deepMerge(tv as LocaleBundle, sv as LocaleBundle)
      } else {
        target[key] = sv
      }
    }
    return target
  }

  private async loadLocale(locale: string): Promise<void> {
    if (this.bundles.has(locale)) return
    const files = ['ui', 'dialogue', 'lore', 'journal']
    const results = await Promise.all(files.map(async (file) => {
      try {
        const res = await fetch(`${this.base}locales/${locale}/${file}.json`)
        return res.ok ? (await res.json() as LocaleBundle) : null
      } catch {
        return null
      }
    }))
    const merged: LocaleBundle = {}
    for (const bundle of results) {
      if (bundle) this.deepMerge(merged, bundle)
    }
    this.bundles.set(locale, merged)
  }
}
