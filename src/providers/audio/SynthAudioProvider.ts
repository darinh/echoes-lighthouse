import type { IAudioProvider, PlayOptions, AudioCategory } from '@/interfaces/index.js'
import type { GamePhase } from '@/interfaces/index.js'

interface AmbientLayerConfig {
  type: OscillatorType | 'noise'
  frequency?: number
  gain: number
  filterType?: BiquadFilterType
  filterFreq?: number
  filterQ?: number
  lfoFreq?: number
  lfoDepth?: number
  lfoTarget?: 'frequency' | 'gain'
  reverb?: boolean
  delayFeedback?: number
}

interface PhaseAmbientConfig {
  layers: AmbientLayerConfig[]
}

/**
 * SynthAudioProvider - All audio synthesised via Web Audio API.
 * Zero audio files. All sounds are mathematical constructions.
 * See docs/gdd/08-audio-design.md for full parameter specifications.
 */
export class SynthAudioProvider implements IAudioProvider {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private categoryGains: Partial<Record<AudioCategory, GainNode>> = {}
  private activeNodes: Map<string, AudioNode[]> = new Map()
  private ambientLayers: Map<string, AudioNode[]> = new Map()
  private currentPhase: GamePhase = 'title'
  private unlocked = false
  private threatLevel = 0
  private threatNoiseInterval: ReturnType<typeof setInterval> | null = null
  private nightDarkBassGain: GainNode | null = null
  private nightDarkLfo: OscillatorNode | null = null

  private readonly PHASE_CONFIGS: Partial<Record<GamePhase, PhaseAmbientConfig>> = {
    dawn: {
      layers: [
        { type: 'sine', frequency: 180, gain: 0.08, lfoFreq: 0.3, lfoDepth: 5, lfoTarget: 'frequency' },
        { type: 'sine', frequency: 360, gain: 0.04, lfoFreq: 0.5, lfoDepth: 0.02, lfoTarget: 'gain' },
        { type: 'noise', filterType: 'bandpass', filterFreq: 800, filterQ: 15, gain: 0.02 },
      ],
    },
    day: {
      layers: [
        { type: 'triangle', frequency: 120, gain: 0.06, lfoFreq: 0.1, lfoDepth: 3, lfoTarget: 'frequency' },
        { type: 'sine', frequency: 240, gain: 0.03 },
        { type: 'noise', filterType: 'lowpass', filterFreq: 400, gain: 0.03 },
        { type: 'sine', frequency: 480, gain: 0.015, lfoFreq: 0.25, lfoDepth: 0.01, lfoTarget: 'gain' },
      ],
    },
    dusk: {
      layers: [
        { type: 'sawtooth', frequency: 80, gain: 0.07, filterType: 'lowpass', filterFreq: 300 },
        { type: 'sine', frequency: 160, gain: 0.05, lfoFreq: 0.8, lfoDepth: 4, lfoTarget: 'frequency' },
        { type: 'square', frequency: 320, gain: 0.02, filterType: 'lowpass', filterFreq: 600 },
        { type: 'noise', filterType: 'highpass', filterFreq: 1200, gain: 0.025 },
      ],
    },
    night_safe: {
      layers: [
        { type: 'sine', frequency: 220, gain: 0.05, reverb: true, delayFeedback: 0.3 },
        { type: 'sine', frequency: 330, gain: 0.04, lfoFreq: 0.2, lfoDepth: 0.02, lfoTarget: 'gain' },
        { type: 'sine', frequency: 440, gain: 0.025 },
        { type: 'noise', filterType: 'bandpass', filterFreq: 200, filterQ: 20, gain: 0.015 },
      ],
    },
    night_dark: {
      layers: [
        { type: 'sine', frequency: 55, gain: 0.12 },
        { type: 'sawtooth', frequency: 110, gain: 0.08, filterType: 'lowpass', filterFreq: 200 },
        { type: 'noise', filterType: 'allpass', filterFreq: 500, gain: 0.06 },
        { type: 'sine', frequency: 165, gain: 0.04, lfoFreq: 3, lfoDepth: 0.04, lfoTarget: 'gain' },
      ],
    },
    vision: {
      layers: [
        { type: 'sine', frequency: 174, gain: 0.06, reverb: true, delayFeedback: 0.4 },
        { type: 'sine', frequency: 261, gain: 0.04 },
        { type: 'sine', frequency: 348, gain: 0.025, lfoFreq: 0.15, lfoDepth: 0.015, lfoTarget: 'gain' },
      ],
    },
  }

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

  private createNoiseSource(): AudioBufferSourceNode {
    const ctx = this.ctx!
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    return source
  }

  private createSimpleReverb(delayTime = 0.1, feedback = 0.3): [DelayNode, GainNode] {
    const ctx = this.ctx!
    const delay = ctx.createDelay(1.0)
    const feedbackGain = ctx.createGain()
    delay.delayTime.value = delayTime
    feedbackGain.gain.value = feedback
    delay.connect(feedbackGain)
    feedbackGain.connect(delay)
    return [delay, feedbackGain]
  }

  private startAmbientLayer(id: string, config: AmbientLayerConfig): void {
    const ctx = this.ctx!
    const ambientOut = this.categoryGains['ambient']!
    const nodes: AudioNode[] = []

    const gainNode = ctx.createGain()
    gainNode.gain.value = 0

    let sourceNode: OscillatorNode | AudioBufferSourceNode

    if (config.type === 'noise') {
      sourceNode = this.createNoiseSource()
    } else {
      const osc = ctx.createOscillator()
      osc.type = config.type as OscillatorType
      osc.frequency.value = config.frequency ?? 440
      sourceNode = osc
    }

    let lastNode: AudioNode = sourceNode

    if (config.filterType) {
      const filter = ctx.createBiquadFilter()
      filter.type = config.filterType
      filter.frequency.value = config.filterFreq ?? 1000
      if (config.filterQ !== undefined) filter.Q.value = config.filterQ
      sourceNode.connect(filter)
      lastNode = filter
      nodes.push(filter)
    }

    if (config.lfoFreq) {
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = config.lfoFreq
      lfoGain.gain.value = config.lfoDepth ?? 0
      lfo.connect(lfoGain)
      lfo.start()
      nodes.push(lfo, lfoGain)

      if (config.lfoTarget === 'frequency' && 'frequency' in sourceNode) {
        lfoGain.connect((sourceNode as OscillatorNode).frequency)
      } else if (config.lfoTarget === 'gain') {
        lfoGain.connect(gainNode.gain)
      }

      if (id === 'night_dark_3') {
        this.nightDarkLfo = lfo
      }
    }

    if (config.reverb) {
      const [delay, feedbackGain] = this.createSimpleReverb(0.1, config.delayFeedback ?? 0.3)
      lastNode.connect(delay)
      delay.connect(gainNode)
      nodes.push(delay, feedbackGain)
    } else {
      lastNode.connect(gainNode)
    }

    gainNode.connect(ambientOut)
    nodes.push(sourceNode, gainNode)

    sourceNode.start()

    if (id === 'night_dark_0') {
      this.nightDarkBassGain = gainNode
    }

    gainNode.gain.setTargetAtTime(config.gain, ctx.currentTime, 2 / 3)
    this.ambientLayers.set(id, nodes)
  }

  private stopAmbientLayer(id: string, fadeDuration = 2): void {
    const ctx = this.ctx!
    const nodes = this.ambientLayers.get(id)
    if (!nodes) return

    const gainNode = nodes.find(n => 'gain' in n && 'connect' in n) as GainNode | undefined
    if (gainNode) {
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, fadeDuration / 3)
      setTimeout(() => {
        nodes.forEach(n => {
          try { n.disconnect() } catch { /* already disconnected */ }
          if ('stop' in n) {
            try { (n as { stop: () => void }).stop() } catch { /* already stopped */ }
          }
        })
        this.ambientLayers.delete(id)
      }, fadeDuration * 1000 + 200)
    } else {
      nodes.forEach(n => { try { n.disconnect() } catch { /* */ } })
      this.ambientLayers.delete(id)
    }
  }

  private stopAllAmbientLayers(fadeDuration = 2): void {
    for (const id of [...this.ambientLayers.keys()]) {
      this.stopAmbientLayer(id, fadeDuration)
    }
    this.nightDarkBassGain = null
    this.nightDarkLfo = null
  }

  private crossfadeToPhase(newPhase: GamePhase): void {
    if (!this.ctx || !this.unlocked) return

    if (this.currentPhase === 'night_dark' && newPhase !== 'night_dark') {
      if (this.threatNoiseInterval !== null) {
        clearInterval(this.threatNoiseInterval)
        this.threatNoiseInterval = null
      }
    }

    this.stopAllAmbientLayers(2)
    this.currentPhase = newPhase

    const config = this.PHASE_CONFIGS[newPhase]
    if (config) {
      config.layers.forEach((layerConfig, i) => {
        this.startAmbientLayer(`${newPhase}_${i}`, layerConfig)
      })
    }

    if (newPhase === 'night_dark') {
      setTimeout(() => this.applyThreatModulation(this.threatLevel), 300)
    }
  }

  private applyThreatModulation(level: number): void {
    if (!this.ctx || this.currentPhase !== 'night_dark') return
    const t = this.ctx.currentTime

    if (this.nightDarkBassGain) {
      this.nightDarkBassGain.gain.setTargetAtTime(0.06 + level * 0.12, t, 0.5)
    }
    if (this.nightDarkLfo) {
      this.nightDarkLfo.frequency.setTargetAtTime(2 + level * 4, t, 0.5)
    }

    if (level > 0.8 && this.threatNoiseInterval === null) {
      this.threatNoiseInterval = setInterval(() => {
        if (this.ctx && this.unlocked) this.playNoiseBurst(0.08, 80)
      }, 2000 + Math.random() * 2000)
    } else if (level <= 0.8 && this.threatNoiseInterval !== null) {
      clearInterval(this.threatNoiseInterval)
      this.threatNoiseInterval = null
    }
  }

  private playNoiseBurst(gain: number, durationMs: number): void {
    const ctx = this.ctx!
    const noise = this.createNoiseSource()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1000
    const gainNode = ctx.createGain()
    gainNode.gain.value = gain
    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.categoryGains['ambient']!)
    noise.start()
    noise.stop(ctx.currentTime + durationMs / 1000)
    setTimeout(() => { try { gainNode.disconnect() } catch { /* */ } }, durationMs + 100)
  }

  private applyEnvelope(
    gainNode: GainNode, startTime: number,
    attackMs: number, decayMs: number, sustainLevel: number,
    releaseMs: number, durationMs: number, peakGain: number,
  ): void {
    const t   = startTime
    const a   = attackMs  / 1000
    const d   = decayMs   / 1000
    const r   = releaseMs / 1000
    const dur = durationMs / 1000

    gainNode.gain.cancelScheduledValues(t - 0.001)
    gainNode.gain.setValueAtTime(0, t)
    gainNode.gain.linearRampToValueAtTime(peakGain, t + a)
    gainNode.gain.linearRampToValueAtTime(peakGain * sustainLevel, t + a + d)
    gainNode.gain.setValueAtTime(peakGain * sustainLevel, t + dur - r)
    gainNode.gain.linearRampToValueAtTime(0, t + dur)
  }

  private buildOscSound(
    freq: number, endFreq: number | null, sweepMs: number,
    type: OscillatorType, peakGain: number,
    attackMs: number, decayMs: number, sustainLevel: number, releaseMs: number,
    durationMs: number, category: AudioCategory, delayMs = 0,
  ): AudioNode[] {
    const ctx = this.ctx!
    const startTime = ctx.currentTime + delayMs / 1000
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    if (endFreq !== null) {
      osc.frequency.linearRampToValueAtTime(endFreq, startTime + sweepMs / 1000)
    }
    gainNode.gain.value = 0
    osc.connect(gainNode)
    gainNode.connect(this.categoryGains[category]!)

    this.applyEnvelope(gainNode, startTime, attackMs, decayMs, sustainLevel, releaseMs, durationMs, peakGain)

    osc.start(startTime)
    osc.stop(startTime + durationMs / 1000 + 0.05)
    return [osc, gainNode]
  }

  private buildSound(soundId: string): AudioNode[] | null {
    if (!this.ctx) return null

    switch (soundId) {

      case 'examine.completed': {
        // Short rising two-tone chime — insight discovery
        const e1 = this.buildOscSound(523, 784, 120, 'sine', 0.18, 5, 60, 0.1, 150, 280, 'ui')
        const e2 = this.buildOscSound(1047, null, 0, 'sine', 0.1, 5, 60, 0.1, 150, 200, 'ui', 80)
        return [...e1, ...e2]
      }

      case 'lighthouse.top': {
        // High sustained tone — arrival at the peak
        const lt1 = this.buildOscSound(1320, null, 0, 'sine', 0.15, 200, 400, 0.6, 800, 2000, 'ui')
        const lt2 = this.buildOscSound(1980, null, 0, 'sine', 0.06, 200, 400, 0.5, 800, 1800, 'ui', 100)
        return [...lt1, ...lt2]
      }

      case 'button.hover':
        return this.buildOscSound(800, 600, 10, 'sine', 0.1, 2, 30, 0, 20, 50, 'ui')

      case 'button.click':
        return this.buildOscSound(600, 400, 20, 'sine', 0.15, 1, 50, 0, 30, 80, 'ui')

      case 'insight.gained': {
        const n1 = this.buildOscSound(440, null, 0, 'sine', 0.2,  5, 100, 0.3, 200, 300, 'ui')
        const n2 = this.buildOscSound(880, null, 0, 'sine', 0.1,  5, 100, 0.3, 200, 200, 'ui', 50)
        return [...n1, ...n2]
      }

      case 'insight.banked': {
        const n1 = this.buildOscSound(523, 784, 100, 'sine', 0.25, 10, 150, 0.2, 200, 400, 'ui')
        const n2 = this.buildOscSound(1047, null, 0, 'sine', 0.1,  10, 150, 0.2, 200, 300, 'ui', 100)
        return [...n1, ...n2]
      }

      case 'insight.sealed': {
        const n1 = this.buildOscSound(392, null, 0, 'sine', 0.3, 5, 50, 0.4, 100, 100, 'ui',   0)
        const n2 = this.buildOscSound(523, null, 0, 'sine', 0.3, 5, 50, 0.4, 100, 100, 'ui', 110)
        const n3 = this.buildOscSound(659, null, 0, 'sine', 0.3, 5, 50, 0.4, 100, 200, 'ui', 220)
        return [...n1, ...n2, ...n3]
      }

      case 'dialogue.advance':
        return this.buildOscSound(350, null, 0, 'sine', 0.08, 2, 20, 0, 10, 30, 'ui')

      case 'location.moved': {
        const ctx = this.ctx!
        const nodes: AudioNode[] = []
        for (let i = 0; i < 2; i++) {
          const t = ctx.currentTime + i * 0.08
          const noise = this.createNoiseSource()
          const filter = ctx.createBiquadFilter()
          filter.type = 'bandpass'
          filter.frequency.value = 400
          filter.Q.value = 1
          const gainNode = ctx.createGain()
          gainNode.gain.value = 0
          noise.connect(filter)
          filter.connect(gainNode)
          gainNode.connect(this.categoryGains['ui']!)
          gainNode.gain.setValueAtTime(0, t)
          gainNode.gain.linearRampToValueAtTime(0.15, t + 0.005)
          gainNode.gain.linearRampToValueAtTime(0, t + 0.08)
          noise.start(t)
          noise.stop(t + 0.085)
          nodes.push(noise, filter, gainNode)
        }
        return nodes
      }

      case 'player.died': {
        const ctx = this.ctx!
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        osc.type = 'sine'
        osc.frequency.value = 110
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(400, ctx.currentTime)
        filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 2)
        osc.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(this.categoryGains['narrative']!)
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1)
        gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2.1)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.0)
        osc.start()
        osc.stop(ctx.currentTime + 3.1)
        return [osc, filter, gainNode]
      }

      case 'loop.started': {
        const n1 = this.buildOscSound(174, 220, 500, 'sine', 0.2,  200, 300, 0.3, 500, 1000, 'ui')
        const n2 = this.buildOscSound(261, null,  0, 'sine', 0.1,  200, 300, 0.3, 500,  800, 'ui', 200)
        return [...n1, ...n2]
      }

      case 'lighthouse.lit': {
        const chords = [
          { freqs: [220, 277, 330], delayMs:   0, dur: 800 },
          { freqs: [261, 330, 392], delayMs: 200, dur: 800 },
          { freqs: [294, 370, 440], delayMs: 400, dur: 1200 },
        ]
        const nodes: AudioNode[] = []
        for (const chord of chords) {
          for (const freq of chord.freqs) {
            nodes.push(...this.buildOscSound(freq, null, 0, 'sine', 0.3, 30, 100, 0.4, 600, chord.dur, 'ui', chord.delayMs))
          }
        }
        return nodes
      }

      case 'ending.reached': {
        const notes = [220, 277, 330, 415, 523, 659]
        const nodes: AudioNode[] = []
        notes.forEach((freq, i) => {
          nodes.push(...this.buildOscSound(freq, null, 0, 'sine', 0.25, 20, 80, 0.4, 200, 400, 'narrative', i * 400))
        })
        ;[330, 415, 523].forEach(freq => {
          nodes.push(...this.buildOscSound(freq, null, 0, 'sine', 0.2, 50, 200, 0.5, 1500, 3000, 'narrative', notes.length * 400))
        })
        return nodes
      }

      default:
        return null
    }
  }

  play(soundId: string, _options?: PlayOptions): void {
    if (!this.ctx || !this.unlocked) return
    const nodes = this.buildSound(soundId)
    if (nodes) {
      this.activeNodes.set(soundId, nodes)
    }
  }

  stop(soundId: string, fadeOutMs = 200): void {
    const nodes = this.activeNodes.get(soundId)
    if (!nodes || !this.ctx) return
    const t = this.ctx.currentTime
    const timeConst = fadeOutMs / 1000 / 3
    nodes.forEach(node => {
      if ('gain' in node && 'connect' in node) {
        const gn = node as GainNode
        gn.gain.setTargetAtTime(0, t, timeConst)
        setTimeout(() => { try { gn.disconnect() } catch { /* */ } }, fadeOutMs + 100)
      }
    })
    this.activeNodes.delete(soundId)
  }

  stopAll(fadeOutMs = 200): void {
    for (const id of [...this.activeNodes.keys()]) {
      this.stop(id, fadeOutMs)
    }
    this.stopAllAmbientLayers(fadeOutMs / 1000)
  }

  setPhase(phase: GamePhase): void {
    if (phase === this.currentPhase) return
    this.crossfadeToPhase(phase)
  }

  setThreatLevel(level: number): void {
    this.threatLevel = Math.max(0, Math.min(1, level))
    this.applyThreatModulation(this.threatLevel)
  }

  setVolume(category: AudioCategory, volume: number): void {
    if (!this.ctx) return
    if (category === 'master' && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
    } else {
      this.categoryGains[category]?.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1)
    }
  }
}
