import type { IAudioProvider, PlayOptions, AudioCategory } from '@/interfaces/index.js'
import type { GamePhase } from '@/interfaces/index.js'

/**
 * SynthAudioProvider — All audio synthesised via Web Audio API.
 * Zero audio files. All sounds are mathematical constructions.
 * See docs/gdd/08-audio-design.md for full parameter specifications.
 */
export class SynthAudioProvider implements IAudioProvider {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private categoryGains: Partial<Record<AudioCategory, GainNode>> = {}
  private unlocked = false

  async unlock(): Promise<void> {
    if (this.unlocked) return
    this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0.8
    this.masterGain.connect(this.ctx.destination)

    for (const cat of ['ambient', 'ui', 'narrative'] as AudioCategory[]) {
      const g = this.ctx.createGain()
      g.gain.value = 1.0
      g.connect(this.masterGain)
      this.categoryGains[cat] = g
    }

    this.unlocked = true
  }

  isUnlocked(): boolean { return this.unlocked }

  play(soundId: string, _options?: PlayOptions): void {
    if (!this.ctx || !this.unlocked) return
    // TODO: route soundId to synthesised sound constructors (see audio-design.md)
    console.debug(`[SynthAudio] play: ${soundId}`)
  }

  stop(soundId: string, _fadeOutMs?: number): void {
    console.debug(`[SynthAudio] stop: ${soundId}`)
  }

  stopAll(_fadeOutMs?: number): void {
    console.debug('[SynthAudio] stopAll')
  }

  setPhase(phase: GamePhase): void {
    console.debug(`[SynthAudio] setPhase: ${phase}`)
    // TODO: crossfade ambient layers per phase spec in audio-design.md
  }

  setThreatLevel(level: number): void {
    console.debug(`[SynthAudio] threatLevel: ${level}`)
    // TODO: modulate filter cutoff / LFO rate on ambient layer
  }

  setVolume(category: AudioCategory, volume: number): void {
    if (category === 'master' && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.1)
    } else {
      this.categoryGains[category]?.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.1)
    }
  }
}
