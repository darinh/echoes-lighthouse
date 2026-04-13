// ─────────────────────────────────────────────────────────────────────────────
// II18n — Stable contract for the internationalisation service.
//
// All user-visible strings must go through t(). Never hardcode display text.
// Locale files live in public/locales/{locale}/*.json
// ─────────────────────────────────────────────────────────────────────────────

export interface II18n {
  /**
   * Translate a key.
   * @param key   Dot-separated path, e.g. 'npc.maren.greeting.tier1'
   * @param params Optional interpolation values, e.g. { name: 'Keeper' }
   * @returns Translated string, or the key itself if not found (never throws)
   */
  t(key: string, params?: Record<string, string | number>): string

  /**
   * Load and switch to a locale. Lazy-loads locale JSON if not cached.
   * @param locale BCP-47 code, e.g. 'en', 'fr', 'es'
   */
  setLocale(locale: string): Promise<void>

  getCurrentLocale(): string

  /** Returns all locale codes with at least a ui.json present. */
  getAvailableLocales(): string[]

  /** True once the current locale's files have finished loading. */
  isLoaded(): boolean
}
