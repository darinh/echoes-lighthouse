import type { EndingId } from '@/interfaces/types.js'

export interface EchoesCodexEntry {
  endingId: EndingId
  shortNameKey: string
  titleKey: string
  bodyKey: string
}

export const ECHOES_CODEX: ReadonlyArray<EchoesCodexEntry> = [
  {
    endingId: 'keepers_bargain',
    shortNameKey: 'ending_tracker.keepers_bargain.short',
    titleKey: 'ending_tracker.keepers_bargain.codex_title',
    bodyKey: 'ending_tracker.keepers_bargain.codex_body',
  },
  {
    endingId: 'drowned_truth',
    shortNameKey: 'ending_tracker.drowned_truth.short',
    titleKey: 'ending_tracker.drowned_truth.codex_title',
    bodyKey: 'ending_tracker.drowned_truth.codex_body',
  },
  {
    endingId: 'light_restored',
    shortNameKey: 'ending_tracker.light_restored.short',
    titleKey: 'ending_tracker.light_restored.codex_title',
    bodyKey: 'ending_tracker.light_restored.codex_body',
  },
  {
    endingId: 'sunken_accord',
    shortNameKey: 'ending_tracker.sunken_accord.short',
    titleKey: 'ending_tracker.sunken_accord.codex_title',
    bodyKey: 'ending_tracker.sunken_accord.codex_body',
  },
  {
    endingId: 'endless_loop',
    shortNameKey: 'ending_tracker.endless_loop.short',
    titleKey: 'ending_tracker.endless_loop.codex_title',
    bodyKey: 'ending_tracker.endless_loop.codex_body',
  },
  {
    endingId: 'transcendence',
    shortNameKey: 'ending_tracker.transcendence.short',
    titleKey: 'ending_tracker.transcendence.codex_title',
    bodyKey: 'ending_tracker.transcendence.codex_body',
  },
]
