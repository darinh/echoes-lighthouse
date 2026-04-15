import type { IAudioProvider } from '@/interfaces/IAudioProvider.js'
import type { IEventBus, IGameEvent } from '@/interfaces/IEventBus.js'
import type { ISystem } from '@/interfaces/ISystem.js'
import type { IGameState } from '@/interfaces/IGameState.js'

/**
 * AudioFeedbackSystem — Wires game events to audio cues.
 *
 * Events emitted via eventBus are subscribed to directly in init().
 * Events emitted via applyEvent (e.g. location.moved) are handled in onEvent()
 * so that the updated state (including currentLocation) is available.
 */
export class AudioFeedbackSystem implements ISystem {
  readonly name = 'AudioFeedbackSystem'

  private readonly unsubs: Array<() => void> = []

  constructor(
    private readonly audio: IAudioProvider,
    private readonly eventBus: IEventBus,
  ) {}

  init(state: IGameState): IGameState {
    this.unsubs.push(
      this.eventBus.on('examine.completed', () => this.audio.play('examine.completed')),
      this.eventBus.on('insight.gained',    () => this.audio.play('insight.gained')),
      this.eventBus.on('insight.banked',    () => this.audio.play('insight.banked')),
      this.eventBus.on('player.died',       () => this.audio.play('player.died')),
      this.eventBus.on('loop.started',      () => this.audio.play('loop.started')),
      this.eventBus.on('lighthouse.lit',    () => this.audio.play('lighthouse.lit')),
      this.eventBus.on('ending.triggered',  () => this.audio.play('ending.reached')),
      this.eventBus.on('item.taken',           () => this.audio.play('item.taken')),
      this.eventBus.on('location.searched',    () => this.audio.play('location.searched')),
      this.eventBus.on('secret.revealed',      () => this.audio.play('secret.revealed')),
      this.eventBus.on('quest.step.completed', () => this.audio.play('quest.completed')),
      this.eventBus.on('npc.trust.up',         () => this.audio.play('npc.trust.up')),
      this.eventBus.on('loop.dawn',            () => this.audio.play('dawn.break')),
    )
    return state
  }

  update(state: IGameState, _deltaMs: number): IGameState {
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type === 'location.moved' && state.player.currentLocation === 'lighthouse_top') {
      this.audio.play('lighthouse.top')
    }
    return state
  }

  destroy(): void {
    this.unsubs.forEach(unsub => unsub())
    this.unsubs.length = 0
  }
}
