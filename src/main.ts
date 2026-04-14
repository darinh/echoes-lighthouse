import { EventBus, GameEngine } from '@/engine/index.js'
import { InputHandler } from '@/engine/InputHandler.js'
import { I18nService } from '@/i18n/index.js'
import { SynthAudioProvider } from '@/providers/audio/SynthAudioProvider.js'
import { CanvasTextRenderer } from '@/providers/renderer/CanvasTextRenderer.js'
import { KnowledgeSystem, QuestSystem, MoralWeightSystem, LoopSystem, DialogueSystem, SaveSystem } from '@/systems/index.js'
import { MovementSystem } from '@/world/MovementSystem.js'

async function boot(): Promise<void> {
  const loadingEl = document.getElementById('loading')
  const statusEl  = document.getElementById('loading-status')
  const barFill   = document.getElementById('loading-bar-fill')

  const setProgress = (pct: number, label: string) => {
    if (barFill) barFill.style.width = `${pct}%`
    if (statusEl) statusEl.textContent = label
  }

  setProgress(10, 'Loading language...')
  // i18n loaded globally; will be injected into systems in Phase 2
  await new I18nService().setLocale('en')

  setProgress(30, 'Initialising systems...')
  const audio    = new SynthAudioProvider()
  const renderer = new CanvasTextRenderer()
  const eventBus = new EventBus()
  const engine   = new GameEngine(eventBus, renderer, audio)
  const movement = new MovementSystem(eventBus)

  engine.setMovementSystem(movement)
  engine.registerSystem(new LoopSystem(eventBus))
  engine.registerSystem(new KnowledgeSystem(eventBus))
  engine.registerSystem(new QuestSystem(eventBus))
  engine.registerSystem(new MoralWeightSystem(eventBus))
  engine.registerSystem(new DialogueSystem(eventBus))

  setProgress(80, 'Preparing world...')
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement

  // Load persisted save state if available.
  const savedState = SaveSystem.loadState()
  if (savedState) {
    engine.loadState(savedState)
  }

  // Wire renderer action handler (canvas click regions)
  renderer.setActionHandler(action => engine.handleAction(action))

  // Wire InputHandler (keyboard + first-click audio unlock)
  const input = new InputHandler(canvas, eventBus)
  input.init(action => engine.handleAction(action))

  // Wire event bus -> audio
  eventBus.on('insight.gained',   () => audio.play('insight.gained'))
  eventBus.on('insight.banked',   () => audio.play('insight.banked'))
  eventBus.on('lighthouse.lit',   () => audio.play('lighthouse.lit'))
  eventBus.on('player.died',      () => audio.play('player.died'))
  eventBus.on('loop.started',     () => audio.play('loop.started'))
  eventBus.on('ending.triggered', () => audio.play('ending.reached'))

  setProgress(100, 'Ready.')
  await engine.start(canvas)

  // Fade out loading screen
  if (loadingEl) {
    loadingEl.classList.add('hidden')
    setTimeout(() => { loadingEl.style.display = 'none' }, 600)
  }
}

boot().catch(err => {
  console.error('Boot failed:', err)
  const statusEl = document.getElementById('loading-status')
  if (statusEl) statusEl.textContent = 'Failed to load. Please refresh.'
})
