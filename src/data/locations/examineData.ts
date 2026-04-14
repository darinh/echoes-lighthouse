import type { LocationId, ArchiveDomain } from '@/interfaces/index.js'

export interface ExamineItem {
  readonly id: string
  readonly labelKey: string   // i18n key for button label
  readonly textKey: string    // i18n key for reveal text
  readonly insight: number
  readonly worldFlag: string  // flag set when examined
  readonly domain: ArchiveDomain
}

export const EXAMINE_DATA: Partial<Record<LocationId, ExamineItem[]>> = {
  keepers_cottage: [
    { id: 'old_journal',       labelKey: 'examine.keepers_cottage.old_journal.label',       textKey: 'examine.keepers_cottage.old_journal.text',       insight: 5,  worldFlag: 'examined.keepers_cottage.old_journal',       domain: 'history' },
    { id: 'mechanism_diagram', labelKey: 'examine.keepers_cottage.mechanism_diagram.label', textKey: 'examine.keepers_cottage.mechanism_diagram.text', insight: 8,  worldFlag: 'examined.keepers_cottage.mechanism_diagram', domain: 'occult' },
  ],
  lighthouse_top: [
    { id: 'lens_inscription',  labelKey: 'examine.lighthouse_top.lens_inscription.label',  textKey: 'examine.lighthouse_top.lens_inscription.text',  insight: 10, worldFlag: 'examined.lighthouse_top.lens_inscription',  domain: 'occult' },
    { id: 'keepers_last_log',  labelKey: 'examine.lighthouse_top.keepers_last_log.label',  textKey: 'examine.lighthouse_top.keepers_last_log.text',  insight: 8,  worldFlag: 'examined.lighthouse_top.keepers_last_log',  domain: 'history' },
  ],
  archive_basement: [
    { id: 'sealed_ledger',     labelKey: 'examine.archive_basement.sealed_ledger.label',   textKey: 'examine.archive_basement.sealed_ledger.text',   insight: 8,  worldFlag: 'examined.archive_basement.sealed_ledger',   domain: 'history' },
    { id: 'water_line_mark',   labelKey: 'examine.archive_basement.water_line_mark.label', textKey: 'examine.archive_basement.water_line_mark.text', insight: 5,  worldFlag: 'examined.archive_basement.water_line_mark', domain: 'ecology' },
  ],
  harbor: [
    { id: 'manifest_discrepancy', labelKey: 'examine.harbor.manifest_discrepancy.label', textKey: 'examine.harbor.manifest_discrepancy.text', insight: 6, worldFlag: 'examined.harbor.manifest_discrepancy', domain: 'maritime' },
    { id: 'silas_logbook',        labelKey: 'examine.harbor.silas_logbook.label',        textKey: 'examine.harbor.silas_logbook.text',        insight: 6, worldFlag: 'examined.harbor.silas_logbook',        domain: 'maritime' },
  ],
  mechanism_room: [
    { id: 'mechanism_symbols', labelKey: 'examine.mechanism_room.mechanism_symbols.label', textKey: 'examine.mechanism_room.mechanism_symbols.text', insight: 15, worldFlag: 'examined.mechanism_room.mechanism_symbols', domain: 'occult' },
    { id: 'binding_rune',      labelKey: 'examine.mechanism_room.binding_rune.label',      textKey: 'examine.mechanism_room.binding_rune.text',      insight: 12, worldFlag: 'examined.mechanism_room.binding_rune',      domain: 'occult' },
  ],
  ruins: [
    { id: 'burned_portrait', labelKey: 'examine.ruins.burned_portrait.label', textKey: 'examine.ruins.burned_portrait.text', insight: 5, worldFlag: 'examined.ruins.burned_portrait', domain: 'history' },
    { id: 'east_wing_door',  labelKey: 'examine.ruins.east_wing_door.label',  textKey: 'examine.ruins.east_wing_door.text',  insight: 3, worldFlag: 'examined.ruins.east_wing_door',  domain: 'cartography' },
  ],
  chapel: [
    { id: 'hidden_names',  labelKey: 'examine.chapel.hidden_names.label',  textKey: 'examine.chapel.hidden_names.text',  insight: 8, worldFlag: 'examined.chapel.hidden_names',  domain: 'history' },
    { id: 'cracked_saint', labelKey: 'examine.chapel.cracked_saint.label', textKey: 'examine.chapel.cracked_saint.text', insight: 6, worldFlag: 'examined.chapel.cracked_saint', domain: 'linguistics' },
  ],
  cliffside: [
    { id: 'shape_in_water',     labelKey: 'examine.cliffside.shape_in_water.label',     textKey: 'examine.cliffside.shape_in_water.text',     insight: 10, worldFlag: 'examined.cliffside.shape_in_water',     domain: 'ecology' },
    { id: 'rope_marks_on_rock', labelKey: 'examine.cliffside.rope_marks_on_rock.label', textKey: 'examine.cliffside.rope_marks_on_rock.text', insight: 5,  worldFlag: 'examined.cliffside.rope_marks_on_rock', domain: 'cartography' },
  ],
  tidal_caves: [
    { id: 'bioluminescent_symbols', labelKey: 'examine.tidal_caves.bioluminescent_symbols.label', textKey: 'examine.tidal_caves.bioluminescent_symbols.text', insight: 12, worldFlag: 'examined.tidal_caves.bioluminescent_symbols', domain: 'occult' },
    { id: 'waterlogged_chest',      labelKey: 'examine.tidal_caves.waterlogged_chest.label',      textKey: 'examine.tidal_caves.waterlogged_chest.text',      insight: 8,  worldFlag: 'examined.tidal_caves.waterlogged_chest',      domain: 'maritime' },
  ],
  forest_path: [
    { id: 'disturbed_earth', labelKey: 'examine.forest_path.disturbed_earth.label', textKey: 'examine.forest_path.disturbed_earth.text', insight: 6, worldFlag: 'examined.forest_path.disturbed_earth', domain: 'ecology' },
    { id: 'carved_tree',     labelKey: 'examine.forest_path.carved_tree.label',     textKey: 'examine.forest_path.carved_tree.text',     insight: 4, worldFlag: 'examined.forest_path.carved_tree',     domain: 'linguistics' },
  ],
  village_square: [
    { id: 'dry_well',     labelKey: 'examine.village_square.dry_well.label',     textKey: 'examine.village_square.dry_well.text',     insight: 4, worldFlag: 'examined.village_square.dry_well',     domain: 'ecology' },
    { id: 'notice_board', labelKey: 'examine.village_square.notice_board.label', textKey: 'examine.village_square.notice_board.text', insight: 3, worldFlag: 'examined.village_square.notice_board', domain: 'history' },
  ],
  mill: [
    { id: 'millers_last_log', labelKey: 'examine.mill.millers_last_log.label', textKey: 'examine.mill.millers_last_log.text', insight: 6, worldFlag: 'examined.mill.millers_last_log', domain: 'history' },
    { id: 'hidden_trapdoor',  labelKey: 'examine.mill.hidden_trapdoor.label',  textKey: 'examine.mill.hidden_trapdoor.text',  insight: 8, worldFlag: 'examined.mill.hidden_trapdoor',  domain: 'cartography' },
  ],
}
