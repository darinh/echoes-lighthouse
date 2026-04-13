# Architecture Guide

## Module Map

```
src/
├── interfaces/      ← Stable contracts — governed, see below
├── engine/          ← Game loop, event bus, turn system, initial state
├── systems/         ← Pure game logic (state in → state out)
├── world/           ← Location data, movement
├── entities/        ← NPC and interactable definitions
├── ui/              ← Canvas UI panels (journal, dialogue, HUD, map)
├── providers/
│   ├── audio/       ← Swappable audio implementations
│   └── renderer/    ← Swappable renderer implementations
├── i18n/            ← Translation service
├── data/            ← Lazy-loaded game content (npcs, quests, codex, locations)
└── main.ts          ← Wires everything together
```

---

## The Interface Contract

`src/interfaces/` defines the boundaries that let agents and developers work independently. No module imports implementation details from a sibling module — only interfaces.

| Interface | Implemented by | Purpose |
|---|---|---|
| `IAudioProvider` | `SynthAudioProvider`, `FileAudioProvider` | All audio |
| `IRenderer` | `CanvasTextRenderer`, `SpriteRenderer` | All drawing |
| `II18n` | `I18nService` | All translated strings |
| `ISystem` | `KnowledgeSystem`, `QuestSystem`, etc. | Game logic |
| `IEventBus` | `EventBus` | Cross-module communication |
| `IGameState` | (data shape, not a class) | Central read-only state |
| `IEntity` | NPCs, interactables | World objects |

**Rule:** To change any interface, open a PR with `refactor(interfaces):` prefix and explain the downstream impact. All implementing classes must update in the same PR.

---

## Swapping Providers

To replace synthesised audio with file-based audio:

```typescript
// src/main.ts — one line change
import { FileAudioProvider } from '@/providers/audio/FileAudioProvider.js'
const audio = new FileAudioProvider()
```

To add sprite rendering:

```typescript
import { SpriteRenderer } from '@/providers/renderer/SpriteRenderer.js'
const renderer = new SpriteRenderer()
```

The engine, systems, and all other modules are unaffected.

---

## Adding a Language

1. Create `public/locales/{code}/` with `ui.json`, `dialogue.json`, `lore.json`, `journal.json`
2. Add the locale code to `I18nService.availableLocales`
3. Missing keys fall back to `en` automatically

---

## Adding a System

1. Implement `ISystem` in `src/systems/YourSystem.ts`
2. Register in `src/main.ts`: `engine.registerSystem(new YourSystem(eventBus))`
3. Systems run in registration order — declare dependencies via event subscriptions, not ordering

---

## The Event Bus

All cross-module communication uses `IEventBus`. Systems never import each other.

```typescript
// Emitting
eventBus.emit('insight.gained', { amount: 15, source: 'dialogue' })

// Subscribing (returns unsubscribe fn — call it on teardown)
const unsub = eventBus.on('insight.gained', ({ payload }) => {
  console.log(`Gained ${payload.amount} insight`)
})
```

All event types are declared in `src/interfaces/IEventBus.ts`. Adding a new event type requires updating that file.

---

## State Management

`IGameState` is the central read-only snapshot. No module mutates it directly.

- **Systems** receive state, return new state (pure functions)
- **`GameEngine`** owns the state reference and applies system updates
- **Renderer** reads state each frame — never writes
- **UI panels** read state; emit events to request changes

**Persistent vs ephemeral (per GDD §1.1):**

| Resets on death | Persists across loops |
|---|---|
| `stamina`, `lightReserves`, `hearts` | `insight` (banked only), `resonance`, `archiveMastery` |
| `currentLocation` → cottage | `loopCount`, `moralWeight`, `sealedInsights` |
| Unbanked insight | `discoveredLocations`, `activeJournalThreads` |

---

## Data Loading

Content in `src/data/` is lazy-loaded by Vite code-splitting. Don't import data eagerly from `main.ts` — use dynamic imports at the point of need:

```typescript
const { loadNPCData } = await import('@/data/npcs/index.js')
const npcs = await loadNPCData()
```

This keeps the initial bundle small and fast.
