import { EventBus, GameEngine } from '@/engine/index.js'
import { I18nService } from '@/i18n/index.js'
import { SynthAudioProvider } from '@/providers/audio/SynthAudioProvider.js'
import { CanvasTextRenderer } from '@/providers/renderer/CanvasTextRenderer.js'
import { KnowledgeSystem, QuestSystem, MoralWeightSystem, LoopSystem } from '@/systems/index.js'

async function boot(): Promise<void> {
  const loadingEl = document.getElementById('loading')!
  const statusEl  = document.getElementById('loading-status')!
  const barFill   = document.getElementById('loading-bar-fill')!

  const setProgress = (pct: number, label: string) => {
    barFill.style.width = `${pct}%`
    statusEl.textContent = label
  }

  setProgress(10, 'Loading language...')
  const i18n = new I18nService()
  await i18n.setLocale('en')

  setProgress(30, 'Initialising audio...')
  const audio    = new SynthAudioProvider()
  const renderer = new CanvasTextRenderer()
  const eventBus = new EventBus()
  const engine   = new GameEngine(eventBus, renderer, audio)

  setProgress(50, 'Registering systems...')
  engine.registerSystem(new LoopSystem(eventBus))
  engine.registerSystem(new KnowledgeSystem(eventBus))
  engine.registerSystem(new QuestSystem(eventBus))
  engine.registerSystem(new MoralWeightSystem(eventBus))

  setProgress(80, 'Preparing world...')
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement

  // Unlock audio on first user interaction
  const unlockAudio = async () => {
    await audio.unlock()
    canvas.removeEventListener('click', unlockAudio)
    document.removeEventListener('keydown', unlockAudio)
    eventBus.emit('audio.unlock', {})
  }
  canvas.addEventListener('click', unlockAudio)
  document.addEventListener('keydown', unlockAudio)

  setProgress(100, 'Ready.')
  await engine.start(canvas)

  // Fade out loading screen
  loadingEl.classList.add('hidden')
  setTimeout(() => { loadingEl.style.display = 'none' }, 600)
}

boot().catch(err => {
  console.error('Boot failed:', err)
  const statusEl = document.getElementById('loading-status')
  if (statusEl) statusEl.textContent = 'Failed to load. Please refresh.'
})
