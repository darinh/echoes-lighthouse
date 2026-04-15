import type { IAudioProvider, PlayOptions, AudioCategory } from '@/interfaces/index.js'
import type { GamePhase } from '@/interfaces/index.js'

interface SoundDef {
  path: string
  category: AudioCategory
  loop?: boolean
}

const BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'

const SOUNDS: Record<string, SoundDef> = {
  // UI
  'examine.completed':  { path: 'audio/ui/examine.completed.ogg',  category: 'ui' },
  'insight.gained':     { path: 'audio/ui/insight.gained.ogg',     category: 'ui' },
  'insight.banked':     { path: 'audio/ui/insight.banked.ogg',     category: 'ui' },
  'item.taken':         { path: 'audio/ui/item.taken.ogg',         category: 'ui' },
  'location.searched':  { path: 'audio/ui/location.searched.ogg',  category: 'ui' },
  'location.moved':     { path: 'audio/ui/location.moved.ogg',     category: 'ui' },
  'quest.completed':    { path: 'audio/ui/quest.completed.ogg',    category: 'ui' },
  'npc.trust.up':       { path: 'audio/ui/npc.trust.up.ogg',       category: 'ui' },
  'loop.started':       { path: 'audio/ui/loop.started.ogg',       category: 'ui' },
  'lighthouse.lit':     { path: 'audio/ui/lighthouse.lit.ogg',     category: 'ui' },
  'lighthouse.top':     { path: 'audio/ui/lighthouse.top.ogg',     category: 'ui' },
  'button.hover':       { path: 'audio/ui/button.hover.ogg',       category: 'ui' },
  'button.click':       { path: 'audio/ui/button.click.ogg',       category: 'ui' },
  'dialogue.advance':   { path: 'audio/ui/dialogue.advance.ogg',   category: 'ui' },
  // Narrative
  'player.died':        { path: 'audio/narrative/player.died.ogg',       category: 'narrative' },
  'secret.revealed':    { path: 'audio/narrative/secret.revealed.ogg',   category: 'narrative' },
  'dawn.break':         { path: 'audio/narrative/dawn.break.ogg',        category: 'narrative' },
  'ending.reached':     { path: 'audio/narrative/ending.reached.ogg',    category: 'narrative' },
}

export class FileAudioProvider implements IAudioProvider {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private categoryGains: Partial<Record<AudioCategory, GainNode>> = {}
  private buffers: Map<string, AudioBuffer> = new Map()
  private activeSources: Map<string, { source: AudioBufferSourceNode; gain: GainNode }[]> = new Map()
  private unlocked = false

  async unlock(): Promise<void> {
    if (this.unlocked) return
    this.ctx = new AudioContext()
    this.masterGain = this.ctx.createGain()
    this.masterGain.connect(this.ctx.destination)

    const categories: AudioCategory[] = ['master', 'ui', 'narrative', 'ambient']
    for (const cat of categories) {
      const g = this.ctx.createGain()
      g.gain.value = cat === 'master' ? 1 : 0.8
      g.connect(this.masterGain)
      this.categoryGains[cat] = g
    }

    await this.preloadAll()
    this.unlocked = true
  }

  isUnlocked(): boolean { return this.unlocked }

  play(soundId: string, options?: PlayOptions): void {
    if (!this.ctx || !this.unlocked) return
    const buf = this.buffers.get(soundId)
    if (!buf) {
      console.warn(`[FileAudioProvider] Sound not loaded: ${soundId}`)
      return
    }
    const def = SOUNDS[soundId]
    if (!def) return

    const catGain = this.categoryGains[def.category] ?? this.masterGain!
    const envGain = this.ctx.createGain()
    envGain.connect(catGain)

    const source = this.ctx.createBufferSource()
    source.buffer = buf
    source.loop = options?.loop ?? def.loop ?? false
    source.connect(envGain)

    const now = this.ctx.currentTime
    const vol = options?.volume ?? 1
    if (options?.fadeInMs && options.fadeInMs > 0) {
      envGain.gain.setValueAtTime(0, now)
      envGain.gain.linearRampToValueAtTime(vol, now + options.fadeInMs / 1000)
    } else {
      envGain.gain.setValueAtTime(vol, now)
    }

    source.start(now)

    const entry = { source, gain: envGain }
    const existing = this.activeSources.get(soundId) ?? []
    existing.push(entry)
    this.activeSources.set(soundId, existing)

    source.onended = () => {
      const list = this.activeSources.get(soundId)
      if (list) {
        const idx = list.indexOf(entry)
        if (idx !== -1) list.splice(idx, 1)
      }
      try { envGain.disconnect() } catch { /* */ }
    }
  }

  stop(soundId: string, fadeOutMs = 200): void {
    if (!this.ctx) return
    const entries = this.activeSources.get(soundId)
    if (!entries?.length) return
    const now = this.ctx.currentTime
    const fadeS = fadeOutMs / 1000
    for (const { source, gain } of [...entries]) {
      gain.gain.setTargetAtTime(0, now, fadeS / 3)
      setTimeout(() => {
        try { source.stop() } catch { /* */ }
        try { gain.disconnect() } catch { /* */ }
      }, fadeOutMs + 100)
    }
    this.activeSources.delete(soundId)
  }

  stopAll(fadeOutMs = 200): void {
    for (const id of [...this.activeSources.keys()]) {
      this.stop(id, fadeOutMs)
    }
  }

  setPhase(_phase: GamePhase): void { /* ambient handled by AmbientAudioSystem */ }
  setThreatLevel(_level: number): void { /* no-op */ }

  setVolume(category: AudioCategory, volume: number): void {
    if (!this.ctx) return
    if (category === 'master' && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
    } else {
      this.categoryGains[category]?.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
    }
  }

  private async preloadAll(): Promise<void> {
    const entries = Object.entries(SOUNDS)
    await Promise.allSettled(entries.map(([id, def]) => this.loadSound(id, def.path)))
  }

  private async loadSound(id: string, path: string): Promise<void> {
    if (!this.ctx) return
    try {
      const url = `${BASE}${path}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer)
      this.buffers.set(id, audioBuffer)
    } catch (err) {
      console.warn(`[FileAudioProvider] Failed to load ${id} from ${path}:`, err)
    }
  }
}
