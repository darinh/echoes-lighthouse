import { EventBus, GameEngine } from '@/engine/index.js'
import { InputHandler } from '@/engine/InputHandler.js'
import { I18nService } from '@/i18n/index.js'
import { FileAudioProvider } from '@/providers/audio/FileAudioProvider.js'
import { CanvasRenderer } from '@/providers/renderer/CanvasRenderer.js'
import { UIManager } from '@/providers/ui/UIManager.js'
import { HybridRenderer } from '@/providers/renderer/HybridRenderer.js'
import { KnowledgeSystem, QuestSystem, MoralWeightSystem, LoopSystem, DialogueSystem, RelationshipSystem, SaveSystem, AudioFeedbackSystem, NPCScheduleSystem, MilestoneSystem, WeatherSystem, StaminaSystem, InsightBankingSystem, NightSystem, ResonanceSystem, VisionSystem, EndingSystem, ArchiveMasterySystem } from '@/systems/index.js'
import { AchievementSystem } from '@/systems/AchievementSystem.js'
import { AmbientAudioSystem } from '@/systems/AmbientAudioSystem.js'
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
  const i18n = new I18nService()
  await i18n.setLocale('en')

  setProgress(30, 'Initialising systems...')
  const audio      = new FileAudioProvider()
  const canvasRend = new CanvasRenderer()
  canvasRend.setI18n(i18n)
  const uiManager  = new UIManager()
  uiManager.setI18n(i18n)
  const renderer   = new HybridRenderer(canvasRend, uiManager)
  const eventBus   = new EventBus()
  const engine     = new GameEngine(eventBus, renderer, audio)
  const movement   = new MovementSystem(eventBus)

  engine.setMovementSystem(movement)
  engine.registerSystem(new LoopSystem(eventBus))
  engine.registerSystem(new MilestoneSystem(eventBus))
  engine.registerSystem(new KnowledgeSystem(eventBus))
  engine.registerSystem(new ArchiveMasterySystem(eventBus))
  engine.registerSystem(new QuestSystem(eventBus))
  engine.registerSystem(new MoralWeightSystem(eventBus))
  engine.registerSystem(new DialogueSystem(eventBus))
  engine.registerSystem(new RelationshipSystem(eventBus))
  engine.registerSystem(new SaveSystem(eventBus))
  engine.registerSystem(new AudioFeedbackSystem(audio, eventBus))
  engine.registerSystem(new NPCScheduleSystem())
  engine.registerSystem(new WeatherSystem(eventBus))
  engine.registerSystem(new AchievementSystem(eventBus))
  engine.registerSystem(new AmbientAudioSystem(eventBus))
  engine.registerSystem(new StaminaSystem(eventBus))
  engine.registerSystem(new InsightBankingSystem(eventBus))
  engine.registerSystem(new NightSystem(eventBus))
  engine.registerSystem(new ResonanceSystem(eventBus))
  engine.registerSystem(new VisionSystem(eventBus))
  engine.registerSystem(new EndingSystem(eventBus))

  setProgress(80, 'Preparing world...')
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement

  uiManager.setActionHandler(action => engine.handleAction(action))

  const input = new InputHandler(canvas, eventBus)
  input.init(action => engine.handleAction(action))

  setProgress(100, 'Ready.')
  await engine.start(canvas)

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
