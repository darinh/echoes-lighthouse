import type { EndingId } from '@/interfaces/types.js'

export interface EchoesCodexEntry {
  endingId: EndingId
  shortNameKey: string
  titleKey: string
  bodyKey: string
}

export const ECHOES_CODEX: ReadonlyArray<EchoesCodexEntry> = [
  {
    endingId: 'liberation',
    shortNameKey: 'ending_tracker.liberation.short',
    titleKey: 'ending_tracker.liberation.codex_title',
    bodyKey: 'ending_tracker.liberation.codex_body',
  },
  {
    endingId: 'keepers_peace',
    shortNameKey: 'ending_tracker.keepers_peace.short',
    titleKey: 'ending_tracker.keepers_peace.codex_title',
    bodyKey: 'ending_tracker.keepers_peace.codex_body',
  },
  {
    endingId: 'sacrifice',
    shortNameKey: 'ending_tracker.sacrifice.short',
    titleKey: 'ending_tracker.sacrifice.codex_title',
    bodyKey: 'ending_tracker.sacrifice.codex_body',
  },
  {
    endingId: 'corruption',
    shortNameKey: 'ending_tracker.corruption.short',
    titleKey: 'ending_tracker.corruption.codex_title',
    bodyKey: 'ending_tracker.corruption.codex_body',
  },
  {
    endingId: 'transcendence',
    shortNameKey: 'ending_tracker.transcendence.short',
    titleKey: 'ending_tracker.transcendence.codex_title',
    bodyKey: 'ending_tracker.transcendence.codex_body',
  },
]
