import type { IAudioProvider, PlayOptions, AudioCategory } from '@/interfaces/index.js'
import type { GamePhase } from '@/interfaces/index.js'

/**
 * FileAudioProvider — Stub for future file-based audio implementation.
 * Drop-in replacement for SynthAudioProvider.
 * Audio files live in public/audio/{category}/{soundId}.ogg
 */
export class FileAudioProvider implements IAudioProvider {
  private unlocked = false

  async unlock(): Promise<void> { this.unlocked = true }
  isUnlocked(): boolean { return this.unlocked }

  play(_soundId: string, _options?: PlayOptions): void {
    throw new Error('FileAudioProvider: not yet implemented')
  }
  stop(_soundId: string, _fadeOutMs?: number): void {
    throw new Error('FileAudioProvider: not yet implemented')
  }
  stopAll(_fadeOutMs?: number): void {
    throw new Error('FileAudioProvider: not yet implemented')
  }
  setPhase(_phase: GamePhase): void {
    throw new Error('FileAudioProvider: not yet implemented')
  }
  setThreatLevel(_level: number): void {
    throw new Error('FileAudioProvider: not yet implemented')
  }
  setVolume(_category: AudioCategory, _volume: number): void {
    throw new Error('FileAudioProvider: not yet implemented')
  }
}
