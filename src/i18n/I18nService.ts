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

  private async loadLocale(locale: string): Promise<void> {
    if (this.bundles.has(locale)) return
    const files = ['ui', 'dialogue', 'lore', 'journal']
    const merged: LocaleBundle = {}
    await Promise.all(files.map(async (file) => {
      try {
        const res = await fetch(`${this.base}locales/${locale}/${file}.json`)
        if (res.ok) Object.assign(merged, await res.json())
      } catch {
        // Non-fatal: missing locale file falls back to 'en'
      }
    }))
    this.bundles.set(locale, merged)
  }
}
