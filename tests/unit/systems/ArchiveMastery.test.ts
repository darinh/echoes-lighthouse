import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ArchiveMasterySystem, MASTERY_TIERS, ALL_DOMAINS } from '@/systems/ArchiveMasterySystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/index.js'
import type { ArchiveDomain } from '@/interfaces/types.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEvent(type: string, payload: Record<string, unknown> = {}) {
  return { type, payload, timestamp: Date.now() } as Parameters<ArchiveMasterySystem['onEvent']>[0]
}

/** Return a state with archiveMastery counts set as specified. */
function stateWithMastery(counts: Partial<Record<ArchiveDomain, number>>): IGameState {
  const base = createInitialState()
  return {
    ...base,
    player: {
      ...base.player,
      archiveMastery: {
        history:     0, occult:   0, maritime: 0, ecology: 0,
        alchemy:     0, cartography: 0, linguistics: 0,
        ...counts,
      },
    },
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('[GDD §8.4] ArchiveMasterySystem', () => {
  let bus: EventBus
  let system: ArchiveMasterySystem
  let state: IGameState

  beforeEach(() => {
    bus = new EventBus()
    system = new ArchiveMasterySystem(bus)
    state = system.init(createInitialState())
  })

  // ── init / update are pass-through ──────────────────────────────────────
  it('init returns state unchanged', () => {
    expect(system.init(state)).toBe(state)
  })

  it('update returns state unchanged', () => {
    expect(system.update(state, 16)).toBe(state)
  })

  it('ignores unrelated events', () => {
    const next = system.onEvent(makeEvent('insight.gained', { amount: 10 }), state)
    expect(next).toBe(state)
  })

  // ── mastery.unlocked re-emission ─────────────────────────────────────────
  describe('mastery.unlocked forwarding', () => {
    it('emits mastery.unlocked when a domain reaches novice tier', () => {
      const captured: unknown[] = []
      bus.on('mastery.unlocked', e => captured.push(e.payload))

      system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'history', level: 'novice' }),
        state,
      )

      expect(captured).toHaveLength(1)
      expect(captured[0]).toMatchObject({ category: 'history', tier: 'novice' })
    })

    it('emits mastery.unlocked when a domain reaches adept tier', () => {
      const captured: unknown[] = []
      bus.on('mastery.unlocked', e => captured.push(e.payload))

      system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'occult', level: 'adept' }),
        state,
      )

      expect(captured[0]).toMatchObject({ category: 'occult', tier: 'adept' })
    })

    it('emits mastery.unlocked when a domain reaches master tier', () => {
      const captured: unknown[] = []
      bus.on('mastery.unlocked', e => captured.push(e.payload))

      system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'maritime', level: 'master' }),
        state,
      )

      // At least the domain unlock fires (full-mastery check also fires for all-master
      // only if all OTHER domains are also at master — they aren't here).
      expect(captured.some(p => (p as Record<string, unknown>)['tier'] === 'master')).toBe(true)
    })

    it('does NOT emit mastery.unlocked for unrecognised level strings', () => {
      const captured: unknown[] = []
      bus.on('mastery.unlocked', e => captured.push(e.payload))

      system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'history', level: 'none' }),
        state,
      )

      expect(captured).toHaveLength(0)
    })
  })

  // ── archive_mastery_complete flag ─────────────────────────────────────────
  describe('archive_mastery_complete world flag', () => {
    it('sets archive_mastery_complete when ALL domains are at master level', () => {
      // All domains already at master count in archiveMastery.
      const allMasteredCounts = Object.fromEntries(
        ALL_DOMAINS.map(d => [d, MASTERY_TIERS.master])
      ) as Record<ArchiveDomain, number>
      const masteredState = stateWithMastery(allMasteredCounts)

      const next = system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'linguistics', level: 'master' }),
        masteredState,
      )

      expect(next.worldFlags.has('archive_mastery_complete')).toBe(true)
    })

    it('does NOT set archive_mastery_complete when some domains are below master', () => {
      // Only one domain is at master.
      const partialState = stateWithMastery({ history: MASTERY_TIERS.master })

      const next = system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'history', level: 'master' }),
        partialState,
      )

      expect(next.worldFlags.has('archive_mastery_complete')).toBe(false)
    })

    it('does not add duplicate archive_mastery_complete flags', () => {
      const allMasteredCounts = Object.fromEntries(
        ALL_DOMAINS.map(d => [d, MASTERY_TIERS.master])
      ) as Record<ArchiveDomain, number>
      const baseState = stateWithMastery(allMasteredCounts)
      const alreadyFlagged: IGameState = {
        ...baseState,
        worldFlags: new Set([...baseState.worldFlags, 'archive_mastery_complete']),
      }

      const next = system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'linguistics', level: 'master' }),
        alreadyFlagged,
      )

      // worldFlags size unchanged — no extra entries.
      expect(next.worldFlags.size).toBe(alreadyFlagged.worldFlags.size)
    })

    it('also emits mastery.unlocked { category: all, tier: master } on full completion', () => {
      const allMasteredCounts = Object.fromEntries(
        ALL_DOMAINS.map(d => [d, MASTERY_TIERS.master])
      ) as Record<ArchiveDomain, number>
      const masteredState = stateWithMastery(allMasteredCounts)

      const captured: unknown[] = []
      bus.on('mastery.unlocked', e => captured.push(e.payload))

      system.onEvent(
        makeEvent('archive.domain.unlocked', { domain: 'ecology', level: 'master' }),
        masteredState,
      )

      expect(captured.some(p => (p as Record<string, unknown>)['category'] === 'all')).toBe(true)
    })
  })

  // ── Static helper: tierFromCount ──────────────────────────────────────────
  describe('ArchiveMasterySystem.tierFromCount', () => {
    it('returns null for 0 pages', () => {
      expect(ArchiveMasterySystem.tierFromCount(0)).toBeNull()
    })

    it('returns null for counts below novice threshold (3)', () => {
      expect(ArchiveMasterySystem.tierFromCount(2)).toBeNull()
    })

    it('returns novice at threshold 3', () => {
      expect(ArchiveMasterySystem.tierFromCount(MASTERY_TIERS.novice)).toBe('novice')
    })

    it('returns adept at threshold 6', () => {
      expect(ArchiveMasterySystem.tierFromCount(MASTERY_TIERS.adept)).toBe('adept')
    })

    it('returns master at threshold 10', () => {
      expect(ArchiveMasterySystem.tierFromCount(MASTERY_TIERS.master)).toBe('master')
    })

    it('returns master for counts above master threshold', () => {
      expect(ArchiveMasterySystem.tierFromCount(12)).toBe('master')
    })
  })

  // ── Static helper: nextThreshold ─────────────────────────────────────────
  describe('ArchiveMasterySystem.nextThreshold', () => {
    it('returns novice threshold for 0 pages', () => {
      expect(ArchiveMasterySystem.nextThreshold(0)).toBe(MASTERY_TIERS.novice)
    })

    it('returns adept threshold when between novice and adept', () => {
      expect(ArchiveMasterySystem.nextThreshold(4)).toBe(MASTERY_TIERS.adept)
    })

    it('returns master threshold when between adept and master', () => {
      expect(ArchiveMasterySystem.nextThreshold(7)).toBe(MASTERY_TIERS.master)
    })

    it('returns null when already at master level', () => {
      expect(ArchiveMasterySystem.nextThreshold(MASTERY_TIERS.master)).toBeNull()
      expect(ArchiveMasterySystem.nextThreshold(15)).toBeNull()
    })
  })

  // ── Spy: no unexpected eventBus.emit calls for non-master tiers ──────────
  it('does not call emit for unrecognised archive.domain.unlocked levels', () => {
    const spy = vi.spyOn(bus, 'emit')

    system.onEvent(
      makeEvent('archive.domain.unlocked', { domain: 'alchemy', level: 'none' }),
      state,
    )

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
