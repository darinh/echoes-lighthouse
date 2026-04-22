export interface EndingNarrative {
  id: string
  titleKey: string
  subtitleKey: string
  openingKey: string
  epilogueKeys: string[]
  closingKey: string
}

export const ENDING_NARRATIVES: Record<string, EndingNarrative> = {
  keepers_bargain: {
    id: 'keepers_bargain',
    titleKey: 'ending.keepers_bargain.title',
    subtitleKey: 'ending.keepers_bargain.subtitle',
    openingKey: 'ending.keepers_bargain.opening',
    epilogueKeys: [
      'ending.keepers_bargain.epilogue.maren',
      'ending.keepers_bargain.epilogue.silas',
      'ending.keepers_bargain.epilogue.petra',
      'ending.keepers_bargain.epilogue.tobias',
      'ending.keepers_bargain.epilogue.elara',
    ],
    closingKey: 'ending.keepers_bargain.closing',
  },
  drowned_truth: {
    id: 'drowned_truth',
    titleKey: 'ending.drowned_truth.title',
    subtitleKey: 'ending.drowned_truth.subtitle',
    openingKey: 'ending.drowned_truth.opening',
    epilogueKeys: [
      'ending.drowned_truth.epilogue.maren',
      'ending.drowned_truth.epilogue.silas',
      'ending.drowned_truth.epilogue.petra',
      'ending.drowned_truth.epilogue.tobias',
      'ending.drowned_truth.epilogue.elara',
    ],
    closingKey: 'ending.drowned_truth.closing',
  },
  light_restored: {
    id: 'light_restored',
    titleKey: 'ending.light_restored.title',
    subtitleKey: 'ending.light_restored.subtitle',
    openingKey: 'ending.light_restored.opening',
    epilogueKeys: [
      'ending.light_restored.epilogue.maren',
      'ending.light_restored.epilogue.silas',
      'ending.light_restored.epilogue.petra',
      'ending.light_restored.epilogue.tobias',
      'ending.light_restored.epilogue.elara',
    ],
    closingKey: 'ending.light_restored.closing',
  },
  sunken_accord: {
    id: 'sunken_accord',
    titleKey: 'ending.sunken_accord.title',
    subtitleKey: 'ending.sunken_accord.subtitle',
    openingKey: 'ending.sunken_accord.opening',
    epilogueKeys: [
      'ending.sunken_accord.epilogue.maren',
      'ending.sunken_accord.epilogue.silas',
      'ending.sunken_accord.epilogue.petra',
      'ending.sunken_accord.epilogue.tobias',
      'ending.sunken_accord.epilogue.elara',
    ],
    closingKey: 'ending.sunken_accord.closing',
  },
  endless_loop: {
    id: 'endless_loop',
    titleKey: 'ending.endless_loop.title',
    subtitleKey: 'ending.endless_loop.subtitle',
    openingKey: 'ending.endless_loop.opening',
    epilogueKeys: [
      'ending.endless_loop.epilogue.maren',
      'ending.endless_loop.epilogue.silas',
    ],
    closingKey: 'ending.endless_loop.closing',
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
