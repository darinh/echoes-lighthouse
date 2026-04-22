/**
 * Journal Thread utilities — pure functions for grouping, sorting,
 * and computing completion state for insight chains.
 * These have no side effects and are fully unit-testable.
 */

import type { InsightThread } from './cards.js'

/** Minimal shape needed for thread grouping — satisfied by InsightCard. */
export interface ThreadableCard {
  id: string
  titleKey: string
  descKey: string
  cost: number
  threadId?: string
  threadOrder?: number
}

export interface ThreadSlot {
  card: ThreadableCard
  sealed: boolean
}

export interface ThreadGroup {
  thread: InsightThread
  slots: ThreadSlot[]
  revealedCount: number
  totalCount: number
  isComplete: boolean
}

/**
 * Group all cards that belong to threads, sort each chain by threadOrder,
 * and compute per-slot sealed status.
 *
 * Cards not assigned to any thread are omitted (they remain in the flat
 * sealed-insights list in the journal).
 */
export function buildThreadGroups(
  cards: ThreadableCard[],
  threads: InsightThread[],
  sealedInsights: ReadonlySet<string>,
): ThreadGroup[] {
  return threads.map(thread => {
    const slots: ThreadSlot[] = cards
      .filter(c => c.threadId === thread.id)
      .sort((a, b) => (a.threadOrder ?? 0) - (b.threadOrder ?? 0))
      .map(card => ({ card, sealed: sealedInsights.has(card.id) }))

    const revealedCount = slots.filter(s => s.sealed).length
    return {
      thread,
      slots,
      revealedCount,
      totalCount: slots.length,
      isComplete: slots.length > 0 && revealedCount === slots.length,
    }
  })
}

/**
 * Return the completion percentage (0–100) for a thread group.
 * Returns 0 for empty threads.
 */
export function threadCompletionPct(group: ThreadGroup): number {
  if (group.totalCount === 0) return 0
  return Math.round((group.revealedCount / group.totalCount) * 100)
}
