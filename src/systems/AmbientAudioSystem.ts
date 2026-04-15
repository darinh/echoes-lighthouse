import type { ISystem } from '@/interfaces/ISystem.js'
import type { IEventBus, IGameEvent } from '@/interfaces/IEventBus.js'
import type { IGameState } from '@/interfaces/IGameState.js'
import type { LocationId } from '@/interfaces/types.js'

// ─────────────────────────────────────────────────────────────────────────────
// Zone types and location → zone mapping
// ─────────────────────────────────────────────────────────────────────────────

type Zone = 'coastal' | 'interior' | 'inland' | null

const LOCATION_ZONE: Partial<Record<LocationId, Zone>> = {
  harbor:          'coastal',
  cliffside:       'coastal',
  tidal_caves:     'coastal',
  lighthouse_base: 'interior',
  lighthouse_top:  'interior',
  mechanism_room:  'interior',
  archive_basement:'interior',
  keepers_cottage: 'inland',
  village_square:  'inland',
  village_inn:     'inland',
  chapel:          'inland',
  mill:            'inland',
  forest_path:     'inland',
  ruins:           'inland',
}

// Base gains for each zone (applied before night reduction)
const ZONE_GAIN: Record<Exclude<Zone, null>, number> = {
  coastal:  0.04,
  interior: 0.02,
  inland:   0.015,
}

const CROSSFADE_S = 2      // seconds
const NIGHT_GAIN_FACTOR = 0.5
const NIGHT_SINE_FREQ = 60  // Hz
const NIGHT_SINE_GAIN = 0.01
const INTERIOR_LFO_FREQ = 0.1
const COASTAL_FILTER_FREQ = 200
const INLAND_FILTER_FREQ = 800

// Noise buffer length: 2 seconds at 44 100 Hz
const NOISE_BUFFER_SECONDS = 2

// ─────────────────────────────────────────────────────────────────────────────
// AmbientAudioSystem
//
// Plays procedurally generated ambient audio based on the player's location.
// All audio is synthesised via Web Audio API — no external files.
// Wraps all AudioContext calls in try/catch for graceful degradation.
// ─────────────────────────────────────────────────────────────────────────────

export class AmbientAudioSystem implements ISystem {
  readonly name = 'AmbientAudioSystem'

  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null

  // Per-zone gain nodes (always present while ctx is alive, used for crossfade)
  private zoneGains: Map<Exclude<Zone, null>, GainNode> = new Map()
  // Oscillators / sources that belong to each zone
  private zoneNodes: Map<Exclude<Zone, null>, AudioNode[]> = new Map()

  // Night-layer nodes
  private nightGain: GainNode | null = null
  private nightOsc: OscillatorNode | null = null

  private currentZone: Zone = null
  private isNight = false
  private readonly unsubs: Array<() => void> = []

  constructor(private readonly eventBus: IEventBus) {}

  // ─── ISystem ─────────────────────────────────────────────────────────────

  init(state: IGameState): IGameState {
    try {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = state.audioMuted ? 0 : 1
      this.masterGain.connect(this.ctx.destination)

      this.buildZones()
      this.buildNightLayer()

      const zone = this.zoneFor(state.player.currentLocation)
      this.activateZone(zone, /* instant */ true)
    } catch {
      // Web Audio API unavailable — degrade silently
    }

    this.unsubs.push(
      this.eventBus.on('audio.toggle', () => this.handleToggle()),
      this.eventBus.on('loop.dawn',    () => this.setNight(false)),
    )

    return state
  }

  update(state: IGameState, _deltaMs: number): IGameState {
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'audio.toggle': {
        const audioMuted = !state.audioMuted
        return { ...state, audioMuted }
      }
      case 'location.moved': {
        const locationId = (event.payload as { locationId: LocationId }).locationId
        const zone = this.zoneFor(locationId)
        this.activateZone(zone)
        return state
      }
      case 'phase.changed': {
        const { phase } = event.payload as { phase: string }
        if (phase === 'night_safe' || phase === 'night_dark') {
          this.setNight(true)
        } else if (phase === 'dawn' || phase === 'morning') {
          this.setNight(false)
        }
        return state
      }
      case 'loop.dawn':
        this.setNight(false)
        return state
      case 'loop.night':
        this.setNight(true)
        return state
    }
    return state
  }

  destroy(): void {
    this.unsubs.forEach(u => u())
    this.unsubs.length = 0
    try {
      this.stopZoneNodes()
      this.stopNightLayer()
      this.ctx?.close()
    } catch { /* ignore */ }
    this.ctx = null
    this.masterGain = null
  }

  // ─── Private — zone management ───────────────────────────────────────────

  private zoneFor(locationId: LocationId): Zone {
    return LOCATION_ZONE[locationId] ?? 'inland'
  }

  /** Build all zone signal chains. Zones start at gain=0. */
  private buildZones(): void {
    if (!this.ctx || !this.masterGain) return
    const zones: Array<Exclude<Zone, null>> = ['coastal', 'interior', 'inland']
    for (const zone of zones) {
      const g = this.ctx.createGain()
      g.gain.value = 0
      g.connect(this.masterGain)
      this.zoneGains.set(zone, g)
      this.zoneNodes.set(zone, [])
    }
    this.buildCoastal()
    this.buildInterior()
    this.buildInland()
  }

  /** coastal — pink noise filtered to ~200 Hz (ocean waves) */
  private buildCoastal(): void {
    const ctx = this.ctx!
    const g = this.zoneGains.get('coastal')!
    const nodes = this.zoneNodes.get('coastal')!

    const buf = this.makeNoiseBuffer('pink')
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = COASTAL_FILTER_FREQ
    filter.Q.value = 0.7

    src.connect(filter)
    filter.connect(g)
    src.start()
    nodes.push(src, filter)
  }

  /** interior — 40 Hz sine with 0.1 Hz LFO on gain (structural creak) */
  private buildInterior(): void {
    const ctx = this.ctx!
    const g = this.zoneGains.get('interior')!
    const nodes = this.zoneNodes.get('interior')!

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 40

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = INTERIOR_LFO_FREQ

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.01  // ±0.01 modulation depth

    lfo.connect(lfoGain)
    lfoGain.connect(g.gain)
    osc.connect(g)
    lfo.start()
    osc.start()
    nodes.push(osc, lfo, lfoGain)
  }

  /** inland — high-pass white noise at 800 Hz (wind through trees) */
  private buildInland(): void {
    const ctx = this.ctx!
    const g = this.zoneGains.get('inland')!
    const nodes = this.zoneNodes.get('inland')!

    const buf = this.makeNoiseBuffer('white')
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = INLAND_FILTER_FREQ
    filter.Q.value = 0.5

    src.connect(filter)
    filter.connect(g)
    src.start()
    nodes.push(src, filter)
  }

  /** night overlay — 60 Hz sine at very low gain (deep silence) */
  private buildNightLayer(): void {
    if (!this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = NIGHT_SINE_FREQ

    const gainNode = this.ctx.createGain()
    gainNode.gain.value = 0

    osc.connect(gainNode)
    gainNode.connect(this.masterGain)
    osc.start()

    this.nightOsc = osc
    this.nightGain = gainNode
  }

  private activateZone(zone: Zone, instant = false): void {
    if (!this.ctx) return
    if (zone === this.currentZone) return
    this.currentZone = zone

    const now = this.ctx.currentTime
    const fadeEnd = instant ? now : now + CROSSFADE_S

    for (const [z, g] of this.zoneGains) {
      const target = z === zone ? this.targetGain(z) : 0
      g.gain.cancelScheduledValues(now)
      g.gain.setValueAtTime(g.gain.value, now)
      g.gain.linearRampToValueAtTime(target, fadeEnd)
    }
  }

  private targetGain(zone: Exclude<Zone, null>): number {
    return ZONE_GAIN[zone] * (this.isNight ? NIGHT_GAIN_FACTOR : 1)
  }

  private setNight(night: boolean): void {
    if (!this.ctx) return
    this.isNight = night
    const now = this.ctx.currentTime
    const fadeEnd = now + CROSSFADE_S

    // Scale zone gains
    if (this.currentZone) {
      const g = this.zoneGains.get(this.currentZone)
      if (g) {
        g.gain.cancelScheduledValues(now)
        g.gain.setValueAtTime(g.gain.value, now)
        g.gain.linearRampToValueAtTime(this.targetGain(this.currentZone), fadeEnd)
      }
    }

    // Night overlay
    if (this.nightGain) {
      this.nightGain.gain.cancelScheduledValues(now)
      this.nightGain.gain.setValueAtTime(this.nightGain.gain.value, now)
      this.nightGain.gain.linearRampToValueAtTime(night ? NIGHT_SINE_GAIN : 0, fadeEnd)
    }
  }

  private handleToggle(): void {
    if (!this.ctx || !this.masterGain) return
    // State update is done in onEvent; here we just flip the gain
    const now = this.ctx.currentTime
    const current = this.masterGain.gain.value
    const target = current > 0 ? 0 : 1
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(current, now)
    this.masterGain.gain.linearRampToValueAtTime(target, now + 0.1)
  }

  // ─── Private — noise buffers ──────────────────────────────────────────────

  private makeNoiseBuffer(type: 'white' | 'pink'): AudioBuffer {
    const ctx = this.ctx!
    const sampleRate = ctx.sampleRate
    const length = sampleRate * NOISE_BUFFER_SECONDS
    const buf = ctx.createBuffer(1, length, sampleRate)
    const data = buf.getChannelData(0)

    if (type === 'white') {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1
      }
    } else {
      // Paul Kellett's pink noise approximation
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < length; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + w * 0.0555179
        b1 = 0.99332 * b1 + w * 0.0750759
        b2 = 0.96900 * b2 + w * 0.1538520
        b3 = 0.86650 * b3 + w * 0.3104856
        b4 = 0.55000 * b4 + w * 0.5329522
        b5 = -0.7616 * b5 - w * 0.0168980
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
        b6 = w * 0.115926
      }
    }
    return buf
  }

  private stopZoneNodes(): void {
    for (const nodes of this.zoneNodes.values()) {
      for (const node of nodes) {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          try { node.stop() } catch { /* already stopped */ }
        }
        try { node.disconnect() } catch { /* ignore */ }
      }
    }
    this.zoneNodes.clear()
    for (const g of this.zoneGains.values()) {
      try { g.disconnect() } catch { /* ignore */ }
    }
    this.zoneGains.clear()
  }

  private stopNightLayer(): void {
    try { this.nightOsc?.stop() } catch { /* ignore */ }
    try { this.nightOsc?.disconnect() } catch { /* ignore */ }
    try { this.nightGain?.disconnect() } catch { /* ignore */ }
    this.nightOsc = null
    this.nightGain = null
  }
}
