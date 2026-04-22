import { describe, it, expect } from 'vitest'
import type { InsightThread } from '@/data/insights/cards.js'
import type { ThreadableCard } from '@/data/insights/threadUtils.js'
import { buildThreadGroups, threadCompletionPct } from '@/data/insights/threadUtils.js'
import { INSIGHT_CARDS, INSIGHT_THREADS } from '@/data/insights/cards.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const THREAD_A: InsightThread = { id: 'thread_a', titleKey: 'thread.a.title' }
const THREAD_B: InsightThread = { id: 'thread_b', titleKey: 'thread.b.title' }

const CARDS: ThreadableCard[] = [
  { id: 'a1', titleKey: 'a1.title', descKey: 'a1.desc', cost: 10, threadId: 'thread_a', threadOrder: 1 },
  { id: 'a2', titleKey: 'a2.title', descKey: 'a2.desc', cost: 20, threadId: 'thread_a', threadOrder: 2 },
  { id: 'a3', titleKey: 'a3.title', descKey: 'a3.desc', cost: 30, threadId: 'thread_a', threadOrder: 3 },
  { id: 'b1', titleKey: 'b1.title', descKey: 'b1.desc', cost: 15, threadId: 'thread_b', threadOrder: 1 },
  { id: 'b2', titleKey: 'b2.title', descKey: 'b2.desc', cost: 25, threadId: 'thread_b', threadOrder: 2 },
  { id: 'b3', titleKey: 'b3.title', descKey: 'b3.desc', cost: 35, threadId: 'thread_b', threadOrder: 3 },
  { id: 'solo', titleKey: 'solo.title', descKey: 'solo.desc', cost: 40 }, // no thread
]

const THREADS = [THREAD_A, THREAD_B]

// ─── buildThreadGroups ────────────────────────────────────────────────────────

describe('[GDD §8.3] buildThreadGroups', () => {
  it('returns one group per thread', () => {
    const groups = buildThreadGroups(CARDS, THREADS, new Set())
    expect(groups).toHaveLength(2)
  })

  it('assigns the correct thread to each group', () => {
    const groups = buildThreadGroups(CARDS, THREADS, new Set())
    expect(groups[0].thread.id).toBe('thread_a')
    expect(groups[1].thread.id).toBe('thread_b')
  })

  it('excludes cards that belong to no thread', () => {
    const groups = buildThreadGroups(CARDS, THREADS, new Set())
    const allCardIds = groups.flatMap(g => g.slots.map(s => s.card.id))
    expect(allCardIds).not.toContain('solo')
  })

  it('sorts cards by threadOrder ascending within each group', () => {
    // Provide cards out of order to verify sorting
    const shuffled: ThreadableCard[] = [
      { id: 'a3', titleKey: '', descKey: '', cost: 0, threadId: 'thread_a', threadOrder: 3 },
      { id: 'a1', titleKey: '', descKey: '', cost: 0, threadId: 'thread_a', threadOrder: 1 },
      { id: 'a2', titleKey: '', descKey: '', cost: 0, threadId: 'thread_a', threadOrder: 2 },
    ]
    const groups = buildThreadGroups(shuffled, [THREAD_A], new Set())
    const ids = groups[0].slots.map(s => s.card.id)
    expect(ids).toEqual(['a1', 'a2', 'a3'])
  })

  it('marks sealed slots as sealed=true', () => {
    const sealed = new Set(['a1', 'a3'])
    const groups = buildThreadGroups(CARDS, THREADS, sealed)
    const aSlots = groups[0].slots
    expect(aSlots[0].sealed).toBe(true)   // a1
    expect(aSlots[1].sealed).toBe(false)  // a2
    expect(aSlots[2].sealed).toBe(true)   // a3
  })

  it('marks unsealed slots as sealed=false', () => {
    const groups = buildThreadGroups(CARDS, THREADS, new Set())
    expect(groups[0].slots.every(s => !s.sealed)).toBe(true)
  })

  it('computes revealedCount correctly', () => {
    const sealed = new Set(['a1', 'a2'])
    const groups = buildThreadGroups(CARDS, THREADS, sealed)
    expect(groups[0].revealedCount).toBe(2)
    expect(groups[1].revealedCount).toBe(0)
  })

  it('computes totalCount correctly', () => {
    const groups = buildThreadGroups(CARDS, THREADS, new Set())
    expect(groups[0].totalCount).toBe(3)
    expect(groups[1].totalCount).toBe(3)
  })

  it('sets isComplete=false when not all slots are sealed', () => {
    const sealed = new Set(['a1', 'a2'])
    const groups = buildThreadGroups(CARDS, THREADS, sealed)
    expect(groups[0].isComplete).toBe(false)
  })

  it('sets isComplete=true when all slots are sealed', () => {
    const sealed = new Set(['a1', 'a2', 'a3'])
    const groups = buildThreadGroups(CARDS, THREADS, sealed)
    expect(groups[0].isComplete).toBe(true)
  })

  it('sets isComplete=false for a thread with 0 slots', () => {
    const emptyGroups = buildThreadGroups([], [THREAD_A], new Set())
    expect(emptyGroups[0].isComplete).toBe(false)
  })

  it('handles an empty sealedInsights set without error', () => {
    expect(() => buildThreadGroups(CARDS, THREADS, new Set())).not.toThrow()
  })

  it('handles an empty threads array', () => {
    const groups = buildThreadGroups(CARDS, [], new Set())
    expect(groups).toHaveLength(0)
  })

  it('handles an empty cards array', () => {
    const groups = buildThreadGroups([], THREADS, new Set())
    expect(groups[0].slots).toHaveLength(0)
    expect(groups[0].totalCount).toBe(0)
  })
})

// ─── threadCompletionPct ──────────────────────────────────────────────────────

describe('[GDD §8.3] threadCompletionPct', () => {
  it('returns 0 when nothing is sealed', () => {
    const [group] = buildThreadGroups(CARDS, [THREAD_A], new Set())
    expect(threadCompletionPct(group)).toBe(0)
  })

  it('returns 33 when 1 of 3 slots sealed', () => {
    const [group] = buildThreadGroups(CARDS, [THREAD_A], new Set(['a1']))
    expect(threadCompletionPct(group)).toBe(33)
  })

  it('returns 67 when 2 of 3 slots sealed', () => {
    const [group] = buildThreadGroups(CARDS, [THREAD_A], new Set(['a1', 'a2']))
    expect(threadCompletionPct(group)).toBe(67)
  })

  it('returns 100 when all slots are sealed', () => {
    const [group] = buildThreadGroups(CARDS, [THREAD_A], new Set(['a1', 'a2', 'a3']))
    expect(threadCompletionPct(group)).toBe(100)
  })

  it('returns 0 for an empty thread (totalCount = 0)', () => {
    const [group] = buildThreadGroups([], [THREAD_A], new Set())
    expect(threadCompletionPct(group)).toBe(0)
  })

  it('returns 25 when 1 of 4 slots sealed', () => {
    const fourCards: ThreadableCard[] = [
      { id: 'c1', titleKey: '', descKey: '', cost: 0, threadId: 'thread_a', threadOrder: 1 },
      { id: 'c2', titleKey: '', descKey: '', cost: 0, threadId: 'thread_a', threadOrder: 2 },
      { id: 'c3', titleKey: '', descKey: '', cost: 0, threadId: 'thread_a', threadOrder: 3 },
      { id: 'c4', titleKey: '', descKey: '', cost: 0, threadId: 'thread_a', threadOrder: 4 },
    ]
    const [group] = buildThreadGroups(fourCards, [THREAD_A], new Set(['c1']))
    expect(threadCompletionPct(group)).toBe(25)
  })
})

// ─── Integration: INSIGHT_CARDS + INSIGHT_THREADS ────────────────────────────

describe('[GDD §8.3] INSIGHT_CARDS thread data integrity', () => {
  it('every threadId in INSIGHT_CARDS references a defined INSIGHT_THREAD', () => {
    const threadIds = new Set(INSIGHT_THREADS.map(t => t.id))
    const orphaned = INSIGHT_CARDS.filter(
      c => c.threadId !== undefined && !threadIds.has(c.threadId),
    )
    expect(orphaned).toHaveLength(0)
  })

  it('each thread has at least 3 cards assigned', () => {
    for (const thread of INSIGHT_THREADS) {
      const count = INSIGHT_CARDS.filter(c => c.threadId === thread.id).length
      expect(count).toBeGreaterThanOrEqual(3)
    }
  })

  it('all threadOrder values within a thread are unique and positive', () => {
    for (const thread of INSIGHT_THREADS) {
      const orders = INSIGHT_CARDS
        .filter(c => c.threadId === thread.id)
        .map(c => c.threadOrder ?? 0)
      const unique = new Set(orders)
      expect(unique.size).toBe(orders.length)
      expect(orders.every(o => o > 0)).toBe(true)
    }
  })

  it('there are at least 3 threads defined', () => {
    expect(INSIGHT_THREADS.length).toBeGreaterThanOrEqual(3)
  })

  it('buildThreadGroups produces correct groups for real data', () => {
    const sealed = new Set<string>()
    const groups = buildThreadGroups(INSIGHT_CARDS, INSIGHT_THREADS, sealed)
    expect(groups).toHaveLength(INSIGHT_THREADS.length)
    for (const group of groups) {
      expect(group.totalCount).toBeGreaterThanOrEqual(3)
    }
  })
})
