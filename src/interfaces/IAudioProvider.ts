import type { GamePhase, AudioCategory } from './types.js'

export interface PlayOptions {
  volume?: number    // 0–1, overrides category volume
  loop?: boolean
  fadeInMs?: number
  fadeOutMs?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// IAudioProvider — Stable contract for all audio implementations.
//
// Current implementation: SynthAudioProvider (Web Audio API, zero files)
// Future implementation:  FileAudioProvider  (.ogg/.mp3 assets)
//
// The engine calls this interface only. Swap providers in config.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface IAudioProvider {
  /** Play a named sound. Sound IDs are defined in src/data/audio-manifest.ts */
  play(soundId: string, options?: PlayOptions): void

  /** Stop a playing sound, optionally fading out. */
  stop(soundId: string, fadeOutMs?: number): void

  /** Stop all sounds. */
  stopAll(fadeOutMs?: number): void

  /** Transition the ambient soundscape to match the current game phase. */
  setPhase(phase: GamePhase): void

  /**
   * Set threat level for dynamic ambient escalation.
   * @param level 0 = calm, 1 = maximum danger
   */
  setThreatLevel(level: number): void

  /** Set volume for a category (0–1). */
  setVolume(category: AudioCategory, volume: number): void

  /**
   * Unlock audio context after first user interaction.
   * Must be called before any sound plays (browser autoplay policy).
   */
  unlock(): Promise<void>

  isUnlocked(): boolean
}
