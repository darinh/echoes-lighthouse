import type { NPCId, LocationId } from '@/interfaces/types.js'

export type ItemId =
  | 'keeper_logbook'
  | 'old_compass'
  | 'signal_flare'
  | 'rusted_key'
  | 'tide_chart'

export interface ItemDefinition {
  readonly id: ItemId
  readonly locationId: LocationId
  readonly nameKey: string
  readonly descKey: string
  readonly pickupKey: string
  readonly dialogueUnlocks: Readonly<Partial<Record<NPCId, string>>>
}

export const ITEMS: readonly ItemDefinition[] = [
  {
    id: 'keeper_logbook',
    locationId: 'lighthouse_base',
    nameKey: 'item.keeper_logbook.name',
    descKey: 'item.keeper_logbook.desc',
    pickupKey: 'item.keeper_logbook.pickup',
    dialogueUnlocks: { vael: 'vael.item.logbook' },
  },
  {
    id: 'old_compass',
    locationId: 'harbor',
    nameKey: 'item.old_compass.name',
    descKey: 'item.old_compass.desc',
    pickupKey: 'item.old_compass.pickup',
    dialogueUnlocks: { silas: 'silas.item.compass' },
  },
  {
    id: 'signal_flare',
    locationId: 'cliffside',
    nameKey: 'item.signal_flare.name',
    descKey: 'item.signal_flare.desc',
    pickupKey: 'item.signal_flare.pickup',
    dialogueUnlocks: { elara: 'elara.item.flare' },
  },
  {
    id: 'rusted_key',
    locationId: 'keepers_cottage',
    nameKey: 'item.rusted_key.name',
    descKey: 'item.rusted_key.desc',
    pickupKey: 'item.rusted_key.pickup',
    dialogueUnlocks: { maren: 'maren.item.key' },
  },
  {
    id: 'tide_chart',
    locationId: 'tidal_caves',
    nameKey: 'item.tide_chart.name',
    descKey: 'item.tide_chart.desc',
    pickupKey: 'item.tide_chart.pickup',
    dialogueUnlocks: { petra: 'petra.item.chart' },
  },
]

export function getItemAtLocation(locationId: LocationId): ItemDefinition | undefined {
  return ITEMS.find(item => item.locationId === locationId)
}

export function itemTakenFlag(itemId: ItemId): string {
  return `item.taken.${itemId}`
}
