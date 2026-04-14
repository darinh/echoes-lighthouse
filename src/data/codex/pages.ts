import type { ArchiveDomain, LocationId } from '@/interfaces/types.js'

export interface CodexPage {
  id: string
  domain: ArchiveDomain
  titleKey: string
  bodyKey: string
  location: LocationId
  prerequisite?: { domain: ArchiveDomain; minLevel: number }
}

export const CODEX_PAGES: ReadonlyArray<CodexPage> = [
  // history (10)
  { id: 'history_01', domain: 'history', titleKey: 'codex.history_01.title', bodyKey: 'codex.history_01.body', location: 'archive_basement' },
  { id: 'history_02', domain: 'history', titleKey: 'codex.history_02.title', bodyKey: 'codex.history_02.body', location: 'archive_basement' },
  { id: 'history_03', domain: 'history', titleKey: 'codex.history_03.title', bodyKey: 'codex.history_03.body', location: 'archive_basement' },
  { id: 'history_04', domain: 'history', titleKey: 'codex.history_04.title', bodyKey: 'codex.history_04.body', location: 'archive_basement' },
  { id: 'history_05', domain: 'history', titleKey: 'codex.history_05.title', bodyKey: 'codex.history_05.body', location: 'keepers_cottage' },
  { id: 'history_06', domain: 'history', titleKey: 'codex.history_06.title', bodyKey: 'codex.history_06.body', location: 'keepers_cottage' },
  { id: 'history_07', domain: 'history', titleKey: 'codex.history_07.title', bodyKey: 'codex.history_07.body', location: 'keepers_cottage' },
  { id: 'history_08', domain: 'history', titleKey: 'codex.history_08.title', bodyKey: 'codex.history_08.body', location: 'chapel' },
  { id: 'history_09', domain: 'history', titleKey: 'codex.history_09.title', bodyKey: 'codex.history_09.body', location: 'chapel' },
  { id: 'history_10', domain: 'history', titleKey: 'codex.history_10.title', bodyKey: 'codex.history_10.body', location: 'chapel' },
  // occult (10)
  { id: 'occult_01', domain: 'occult', titleKey: 'codex.occult_01.title', bodyKey: 'codex.occult_01.body', location: 'ruins' },
  { id: 'occult_02', domain: 'occult', titleKey: 'codex.occult_02.title', bodyKey: 'codex.occult_02.body', location: 'ruins' },
  { id: 'occult_03', domain: 'occult', titleKey: 'codex.occult_03.title', bodyKey: 'codex.occult_03.body', location: 'ruins' },
  { id: 'occult_04', domain: 'occult', titleKey: 'codex.occult_04.title', bodyKey: 'codex.occult_04.body', location: 'ruins' },
  { id: 'occult_05', domain: 'occult', titleKey: 'codex.occult_05.title', bodyKey: 'codex.occult_05.body', location: 'cliffside' },
  { id: 'occult_06', domain: 'occult', titleKey: 'codex.occult_06.title', bodyKey: 'codex.occult_06.body', location: 'cliffside' },
  { id: 'occult_07', domain: 'occult', titleKey: 'codex.occult_07.title', bodyKey: 'codex.occult_07.body', location: 'cliffside' },
  { id: 'occult_08', domain: 'occult', titleKey: 'codex.occult_08.title', bodyKey: 'codex.occult_08.body', location: 'tidal_caves' },
  { id: 'occult_09', domain: 'occult', titleKey: 'codex.occult_09.title', bodyKey: 'codex.occult_09.body', location: 'tidal_caves' },
  { id: 'occult_10', domain: 'occult', titleKey: 'codex.occult_10.title', bodyKey: 'codex.occult_10.body', location: 'tidal_caves' },
  // maritime (10)
  { id: 'maritime_01', domain: 'maritime', titleKey: 'codex.maritime_01.title', bodyKey: 'codex.maritime_01.body', location: 'harbor' },
  { id: 'maritime_02', domain: 'maritime', titleKey: 'codex.maritime_02.title', bodyKey: 'codex.maritime_02.body', location: 'harbor' },
  { id: 'maritime_03', domain: 'maritime', titleKey: 'codex.maritime_03.title', bodyKey: 'codex.maritime_03.body', location: 'harbor' },
  { id: 'maritime_04', domain: 'maritime', titleKey: 'codex.maritime_04.title', bodyKey: 'codex.maritime_04.body', location: 'harbor' },
  { id: 'maritime_05', domain: 'maritime', titleKey: 'codex.maritime_05.title', bodyKey: 'codex.maritime_05.body', location: 'harbor' },
  { id: 'maritime_06', domain: 'maritime', titleKey: 'codex.maritime_06.title', bodyKey: 'codex.maritime_06.body', location: 'tidal_caves' },
  { id: 'maritime_07', domain: 'maritime', titleKey: 'codex.maritime_07.title', bodyKey: 'codex.maritime_07.body', location: 'tidal_caves' },
  { id: 'maritime_08', domain: 'maritime', titleKey: 'codex.maritime_08.title', bodyKey: 'codex.maritime_08.body', location: 'tidal_caves' },
  { id: 'maritime_09', domain: 'maritime', titleKey: 'codex.maritime_09.title', bodyKey: 'codex.maritime_09.body', location: 'tidal_caves' },
  { id: 'maritime_10', domain: 'maritime', titleKey: 'codex.maritime_10.title', bodyKey: 'codex.maritime_10.body', location: 'tidal_caves' },
  // ecology (10)
  { id: 'ecology_01', domain: 'ecology', titleKey: 'codex.ecology_01.title', bodyKey: 'codex.ecology_01.body', location: 'forest_path' },
  { id: 'ecology_02', domain: 'ecology', titleKey: 'codex.ecology_02.title', bodyKey: 'codex.ecology_02.body', location: 'forest_path' },
  { id: 'ecology_03', domain: 'ecology', titleKey: 'codex.ecology_03.title', bodyKey: 'codex.ecology_03.body', location: 'forest_path' },
  { id: 'ecology_04', domain: 'ecology', titleKey: 'codex.ecology_04.title', bodyKey: 'codex.ecology_04.body', location: 'forest_path' },
  { id: 'ecology_05', domain: 'ecology', titleKey: 'codex.ecology_05.title', bodyKey: 'codex.ecology_05.body', location: 'forest_path' },
  { id: 'ecology_06', domain: 'ecology', titleKey: 'codex.ecology_06.title', bodyKey: 'codex.ecology_06.body', location: 'cliffside' },
  { id: 'ecology_07', domain: 'ecology', titleKey: 'codex.ecology_07.title', bodyKey: 'codex.ecology_07.body', location: 'cliffside' },
  { id: 'ecology_08', domain: 'ecology', titleKey: 'codex.ecology_08.title', bodyKey: 'codex.ecology_08.body', location: 'cliffside' },
  { id: 'ecology_09', domain: 'ecology', titleKey: 'codex.ecology_09.title', bodyKey: 'codex.ecology_09.body', location: 'mill' },
  { id: 'ecology_10', domain: 'ecology', titleKey: 'codex.ecology_10.title', bodyKey: 'codex.ecology_10.body', location: 'mill' },
  // alchemy (10)
  { id: 'alchemy_01', domain: 'alchemy', titleKey: 'codex.alchemy_01.title', bodyKey: 'codex.alchemy_01.body', location: 'ruins' },
  { id: 'alchemy_02', domain: 'alchemy', titleKey: 'codex.alchemy_02.title', bodyKey: 'codex.alchemy_02.body', location: 'ruins' },
  { id: 'alchemy_03', domain: 'alchemy', titleKey: 'codex.alchemy_03.title', bodyKey: 'codex.alchemy_03.body', location: 'ruins' },
  { id: 'alchemy_04', domain: 'alchemy', titleKey: 'codex.alchemy_04.title', bodyKey: 'codex.alchemy_04.body', location: 'ruins' },
  { id: 'alchemy_05', domain: 'alchemy', titleKey: 'codex.alchemy_05.title', bodyKey: 'codex.alchemy_05.body', location: 'chapel' },
  { id: 'alchemy_06', domain: 'alchemy', titleKey: 'codex.alchemy_06.title', bodyKey: 'codex.alchemy_06.body', location: 'chapel' },
  { id: 'alchemy_07', domain: 'alchemy', titleKey: 'codex.alchemy_07.title', bodyKey: 'codex.alchemy_07.body', location: 'chapel' },
  { id: 'alchemy_08', domain: 'alchemy', titleKey: 'codex.alchemy_08.title', bodyKey: 'codex.alchemy_08.body', location: 'ruins' },
  { id: 'alchemy_09', domain: 'alchemy', titleKey: 'codex.alchemy_09.title', bodyKey: 'codex.alchemy_09.body', location: 'ruins' },
  { id: 'alchemy_10', domain: 'alchemy', titleKey: 'codex.alchemy_10.title', bodyKey: 'codex.alchemy_10.body', location: 'ruins' },
  // cartography (10)
  { id: 'cartography_01', domain: 'cartography', titleKey: 'codex.cartography_01.title', bodyKey: 'codex.cartography_01.body', location: 'lighthouse_top' },
  { id: 'cartography_02', domain: 'cartography', titleKey: 'codex.cartography_02.title', bodyKey: 'codex.cartography_02.body', location: 'lighthouse_top' },
  { id: 'cartography_03', domain: 'cartography', titleKey: 'codex.cartography_03.title', bodyKey: 'codex.cartography_03.body', location: 'lighthouse_top' },
  { id: 'cartography_04', domain: 'cartography', titleKey: 'codex.cartography_04.title', bodyKey: 'codex.cartography_04.body', location: 'lighthouse_top' },
  { id: 'cartography_05', domain: 'cartography', titleKey: 'codex.cartography_05.title', bodyKey: 'codex.cartography_05.body', location: 'cliffside' },
  { id: 'cartography_06', domain: 'cartography', titleKey: 'codex.cartography_06.title', bodyKey: 'codex.cartography_06.body', location: 'cliffside' },
  { id: 'cartography_07', domain: 'cartography', titleKey: 'codex.cartography_07.title', bodyKey: 'codex.cartography_07.body', location: 'cliffside' },
  { id: 'cartography_08', domain: 'cartography', titleKey: 'codex.cartography_08.title', bodyKey: 'codex.cartography_08.body', location: 'village_square' },
  { id: 'cartography_09', domain: 'cartography', titleKey: 'codex.cartography_09.title', bodyKey: 'codex.cartography_09.body', location: 'village_square' },
  { id: 'cartography_10', domain: 'cartography', titleKey: 'codex.cartography_10.title', bodyKey: 'codex.cartography_10.body', location: 'village_square' },
  // linguistics (10)
  { id: 'linguistics_01', domain: 'linguistics', titleKey: 'codex.linguistics_01.title', bodyKey: 'codex.linguistics_01.body', location: 'archive_basement' },
  { id: 'linguistics_02', domain: 'linguistics', titleKey: 'codex.linguistics_02.title', bodyKey: 'codex.linguistics_02.body', location: 'archive_basement' },
  { id: 'linguistics_03', domain: 'linguistics', titleKey: 'codex.linguistics_03.title', bodyKey: 'codex.linguistics_03.body', location: 'archive_basement' },
  { id: 'linguistics_04', domain: 'linguistics', titleKey: 'codex.linguistics_04.title', bodyKey: 'codex.linguistics_04.body', location: 'archive_basement' },
  { id: 'linguistics_05', domain: 'linguistics', titleKey: 'codex.linguistics_05.title', bodyKey: 'codex.linguistics_05.body', location: 'archive_basement' },
  { id: 'linguistics_06', domain: 'linguistics', titleKey: 'codex.linguistics_06.title', bodyKey: 'codex.linguistics_06.body', location: 'ruins' },
  { id: 'linguistics_07', domain: 'linguistics', titleKey: 'codex.linguistics_07.title', bodyKey: 'codex.linguistics_07.body', location: 'ruins' },
  { id: 'linguistics_08', domain: 'linguistics', titleKey: 'codex.linguistics_08.title', bodyKey: 'codex.linguistics_08.body', location: 'ruins' },
  { id: 'linguistics_09', domain: 'linguistics', titleKey: 'codex.linguistics_09.title', bodyKey: 'codex.linguistics_09.body', location: 'chapel' },
  { id: 'linguistics_10', domain: 'linguistics', titleKey: 'codex.linguistics_10.title', bodyKey: 'codex.linguistics_10.body', location: 'chapel' },
]
