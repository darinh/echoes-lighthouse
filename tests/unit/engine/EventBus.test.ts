import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventBus } from '@/engine/EventBus.js'

describe('EventBus', () => {
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
  })

  describe('emit + on', () => {
    it('delivers event to subscriber', () => {
      const handler = vi.fn()
      bus.on('insight.gained', handler)
      bus.emit('insight.gained', { amount: 10 })
      expect(handler).toHaveBeenCalledOnce()
      expect(handler.mock.calls[0][0].payload).toEqual({ amount: 10 })
    })

    it('delivers event to multiple subscribers', () => {
      const h1 = vi.fn()
      const h2 = vi.fn()
      bus.on('insight.gained', h1)
      bus.on('insight.gained', h2)
      bus.emit('insight.gained', { amount: 5 })
      expect(h1).toHaveBeenCalledOnce()
      expect(h2).toHaveBeenCalledOnce()
    })

    it('does not deliver to subscribers of other event types', () => {
      const handler = vi.fn()
      bus.on('quest.started', handler)
      bus.emit('insight.gained', { amount: 5 })
      expect(handler).not.toHaveBeenCalled()
    })

    it('includes timestamp on event', () => {
      const handler = vi.fn()
      bus.on('insight.gained', handler)
      const before = Date.now()
      bus.emit('insight.gained', { amount: 1 })
      const after = Date.now()
      const { timestamp } = handler.mock.calls[0][0]
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('off', () => {
    it('removes a subscriber', () => {
      const handler = vi.fn()
      bus.on('insight.gained', handler)
      bus.off('insight.gained', handler)
      bus.emit('insight.gained', { amount: 5 })
      expect(handler).not.toHaveBeenCalled()
    })

    it('does not throw when removing non-existent subscriber', () => {
      const handler = vi.fn()
      expect(() => bus.off('insight.gained', handler)).not.toThrow()
    })
  })

  describe('on (unsubscribe return value)', () => {
    it('returned function unsubscribes the handler', () => {
      const handler = vi.fn()
      const unsub = bus.on('insight.gained', handler)
      unsub()
      bus.emit('insight.gained', { amount: 5 })
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('once', () => {
    it('fires exactly once then auto-unsubscribes', () => {
      const handler = vi.fn()
      bus.once('insight.gained', handler)
      bus.emit('insight.gained', { amount: 1 })
      bus.emit('insight.gained', { amount: 2 })
      bus.emit('insight.gained', { amount: 3 })
      expect(handler).toHaveBeenCalledOnce()
      expect(handler.mock.calls[0][0].payload).toEqual({ amount: 1 })
    })
  })

  describe('emit with no subscribers', () => {
    it('does not throw', () => {
      expect(() => bus.emit('quest.started', { questId: 'x' })).not.toThrow()
    })
  })
})
