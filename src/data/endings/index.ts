export interface EndingNarrative {
  id: string
  titleKey: string
  subtitleKey: string
  openingKey: string
  epilogueKeys: string[]
  closingKey: string
}

export const ENDING_NARRATIVES: Record<string, EndingNarrative> = {
  liberation: {
    id: 'liberation',
    titleKey: 'ending.liberation.title',
    subtitleKey: 'ending.liberation.subtitle',
    openingKey: 'ending.liberation.opening',
    epilogueKeys: [
      'ending.liberation.epilogue.maren',
      'ending.liberation.epilogue.silas',
      'ending.liberation.epilogue.petra',
      'ending.liberation.epilogue.tobias',
      'ending.liberation.epilogue.elara',
    ],
    closingKey: 'ending.liberation.closing',
  },
  keepers_peace: {
    id: 'keepers_peace',
    titleKey: 'ending.keepers_peace.title',
    subtitleKey: 'ending.keepers_peace.subtitle',
    openingKey: 'ending.keepers_peace.opening',
    epilogueKeys: [
      'ending.keepers_peace.epilogue.maren',
      'ending.keepers_peace.epilogue.silas',
      'ending.keepers_peace.epilogue.petra',
      'ending.keepers_peace.epilogue.tobias',
      'ending.keepers_peace.epilogue.elara',
    ],
    closingKey: 'ending.keepers_peace.closing',
  },
  sacrifice: {
    id: 'sacrifice',
    titleKey: 'ending.sacrifice.title',
    subtitleKey: 'ending.sacrifice.subtitle',
    openingKey: 'ending.sacrifice.opening',
    epilogueKeys: [
      'ending.sacrifice.epilogue.maren',
      'ending.sacrifice.epilogue.silas',
      'ending.sacrifice.epilogue.petra',
      'ending.sacrifice.epilogue.tobias',
    ],
    closingKey: 'ending.sacrifice.closing',
  },
  corruption: {
    id: 'corruption',
    titleKey: 'ending.corruption.title',
    subtitleKey: 'ending.corruption.subtitle',
    openingKey: 'ending.corruption.opening',
    epilogueKeys: [
      'ending.corruption.epilogue.maren',
      'ending.corruption.epilogue.silas',
      'ending.corruption.epilogue.petra',
      'ending.corruption.epilogue.tobias',
      'ending.corruption.epilogue.elara',
    ],
    closingKey: 'ending.corruption.closing',
  },
  transcendence: {
    id: 'transcendence',
    titleKey: 'ending.transcendence.title',
    subtitleKey: 'ending.transcendence.subtitle',
    openingKey: 'ending.transcendence.opening',
    epilogueKeys: [
      'ending.transcendence.epilogue.maren',
      'ending.transcendence.epilogue.silas',
      'ending.transcendence.epilogue.petra',
      'ending.transcendence.epilogue.tobias',
      'ending.transcendence.epilogue.elara',
    ],
    closingKey: 'ending.transcendence.closing',
  },
}
