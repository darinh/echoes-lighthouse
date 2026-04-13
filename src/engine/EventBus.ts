import type { IEventBus, IGameEvent, GameEventType, EventHandler } from '@/interfaces/index.js'

/** Concrete event bus implementation. A single instance is shared app-wide. */
export class EventBus implements IEventBus {
  private readonly listeners = new Map<GameEventType, Set<EventHandler>>()

  emit<T extends Record<string, unknown>>(type: GameEventType, payload: T): void {
    const event: IGameEvent<T> = { type, payload, timestamp: Date.now() }
    this.listeners.get(type)?.forEach(handler => handler(event as IGameEvent))
  }

  on<T extends Record<string, unknown>>(type: GameEventType, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(handler as EventHandler)
    return () => this.off(type, handler)
  }

  off<T extends Record<string, unknown>>(type: GameEventType, handler: EventHandler<T>): void {
    this.listeners.get(type)?.delete(handler as EventHandler)
  }

  once<T extends Record<string, unknown>>(type: GameEventType, handler: EventHandler<T>): void {
    const wrapper: EventHandler<T> = (event) => {
      handler(event)
      this.off(type, wrapper)
    }
    this.on(type, wrapper)
  }
}
