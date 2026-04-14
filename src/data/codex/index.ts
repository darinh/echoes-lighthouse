import type { CodexPage } from './pages.js'
import { CODEX_PAGES } from './pages.js'

export async function loadCodexData(): Promise<Record<string, CodexPage>> {
  return Object.fromEntries(CODEX_PAGES.map(p => [p.id, p]))
}

export type { CodexPage } from './pages.js'
