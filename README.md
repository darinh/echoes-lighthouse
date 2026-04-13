# Echoes of the Lighthouse

> *Every loop reveals more. Every choice persists.*

A narrative mystery roguelite. You are the new Keeper of a lighthouse on an island where time loops, the dead linger, and the truth is buried in layers.

**[Play on GitHub Pages](https://darinh.github.io/echoes-lighthouse/)**

---

## Design Documents

Full game design documentation lives in [`docs/gdd/`](./docs/gdd/).

| # | Document |
|---|---|
| 01 | [Game Design Document](docs/gdd/01-game-design-document.md) |
| 02 | [Narrative Bible](docs/gdd/02-narrative-bible.md) |
| 03 | [Technical Specification](docs/gdd/03-technical-specification.md) |
| 04 | [Systems Design](docs/gdd/04-systems-design.md) |
| 05 | [Level Design](docs/gdd/05-level-design.md) |
| 06 | [Quest & Dialogue Design](docs/gdd/06-quest-dialogue.md) |
| 07 | [UI/UX Specification](docs/gdd/07-ui-ux-specification.md) |
| 08 | [Audio Design](docs/gdd/08-audio-design.md) |
| 09 | [Art Direction](docs/gdd/09-art-direction.md) |
| 10 | [Data Specification](docs/gdd/10-data-specification.md) |

---

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run typecheck  # type-check without building
```

## Architecture

```
src/
├── interfaces/    ← Stable contracts (agents: never break without council)
├── engine/        ← Game loop, event bus, turn system
├── systems/       ← Knowledge economy, quests, moral weight, loop
├── world/         ← Locations, map, movement
├── entities/      ← NPCs, player
├── ui/            ← Journal, dialogue panels, HUD
├── providers/
│   ├── audio/     ← SynthAudioProvider (Web Audio API, zero files)
│   └── renderer/  ← CanvasTextRenderer (typography-first, no sprites)
├── i18n/          ← t() function, lazy locale loader
└── data/          ← Lazy-loaded game content chunks
```

**Swapping providers:** To add file-based audio or sprite rendering, implement `IAudioProvider` or `IRenderer` and swap the class in `src/main.ts`. Zero engine changes required.

**Adding a language:** Add `public/locales/{code}/` with `ui.json`, `dialogue.json`, `lore.json`, `journal.json`. The i18n service lazy-loads and falls back to `en` for missing keys.

**Adding a system:** Implement `ISystem`, register with `engine.registerSystem()` in `main.ts`.

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`.
