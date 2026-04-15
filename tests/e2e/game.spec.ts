import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect console errors (not warnings) emitted during a test. */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))
  return errors
}

/** Wait for the canvas to be painted (non-transparent pixel present). */
async function waitForCanvasPaint(page: Page, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
      if (!canvas) return false
      const ctx = canvas.getContext('2d')
      if (!ctx) return false
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true
      }
      return false
    },
    { timeout },
  )
}

/** Press Enter to start the game from the title screen. */
async function startGame(page: Page): Promise<void> {
  await page.keyboard.press('Enter')
  // Give the engine a tick to transition from 'title' → 'day'
  await page.waitForTimeout(300)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Echoes of the Lighthouse — UI', () => {

  // -------------------------------------------------------------------------
  // 1. Page load & canvas
  // -------------------------------------------------------------------------
  test.describe('Page load', () => {
    test('loads without JavaScript errors', async ({ page }) => {
      const errors = trackConsoleErrors(page)
      await page.goto('/')
      await waitForCanvasPaint(page)
      expect(errors).toHaveLength(0)
    })

    test('renders a canvas element that fills the viewport', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)

      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      const box = await canvas.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThan(200)
      expect(box!.height).toBeGreaterThan(200)
    })

    test('canvas buffer dimensions are non-zero', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)

      const dims = await page.evaluate(() => {
        const c = document.querySelector('canvas') as HTMLCanvasElement
        return { w: c.width, h: c.height }
      })
      expect(dims.w).toBeGreaterThan(0)
      expect(dims.h).toBeGreaterThan(0)
    })
  })

  // -------------------------------------------------------------------------
  // 2. Title screen
  // -------------------------------------------------------------------------
  test.describe('Title screen', () => {
    test('title screen renders with visible content', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await page.waitForTimeout(300) // allow animation to settle enough to paint >1000 px

      // Canvas must have painted non-transparent pixels
      const hasPaint = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let painted = 0
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0) painted++
        }
        return painted > 1000
      })
      expect(hasPaint).toBe(true)
    })

    test('title screenshot looks correct', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await page.waitForTimeout(200) // allow lighthouse animation to settle
      await expect(page).toHaveScreenshot('title-screen.png', { maxDiffPixelRatio: 0.05 })
    })
  })

  // -------------------------------------------------------------------------
  // 3. Starting the game
  // -------------------------------------------------------------------------
  test.describe('Game start', () => {
    test('Enter key transitions from title to day phase', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)

      // After starting, the canvas should repaint (HUD + location panel)
      const repainted = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let painted = 0
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0) painted++
        }
        return painted > 5000
      })
      expect(repainted).toBe(true)
    })

    test('clicking the canvas starts the game', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      // In hybrid layout, the start button is in the HTML overlay — click it
      const startBtn = page.locator('.start-btn').first()
      await expect(startBtn).toBeVisible({ timeout: 3000 })
      await startBtn.click()
      await page.waitForTimeout(300)

      const pixelCount = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let count = 0
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0) count++
        }
        return count
      })
      expect(pixelCount).toBeGreaterThan(5000)
    })

    test('game screenshot after start looks correct', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)
      await page.waitForTimeout(200)
      await expect(page).toHaveScreenshot('game-day.png', { maxDiffPixelRatio: 0.05 })
    })
  })

  // -------------------------------------------------------------------------
  // 4. HUD integrity
  // -------------------------------------------------------------------------
  test.describe('HUD', () => {
    test('top strip of canvas is painted after game start (HUD present)', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)

      // Sample the top 10% of the canvas — the HUD lives there
      const hudPainted = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        const strip = ctx.getImageData(0, 0, canvas.width, Math.floor(canvas.height * 0.1))
        let painted = 0
        for (let i = 3; i < strip.data.length; i += 4) {
          if (strip.data[i] > 0) painted++
        }
        return painted
      })
      expect(hudPainted).toBeGreaterThan(100)
    })

    test('action panel area has paint (buttons rendered)', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)

      // In landscape, the right ~35% is the action panel
      const actionPanelPainted = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        const startX = Math.floor(canvas.width * 0.65)
        const strip = ctx.getImageData(startX, 0, canvas.width - startX, canvas.height)
        let painted = 0
        for (let i = 3; i < strip.data.length; i += 4) {
          if (strip.data[i] > 0) painted++
        }
        return painted
      })
      expect(actionPanelPainted).toBeGreaterThan(200)
    })
  })

  // -------------------------------------------------------------------------
  // 5. Accessibility — aria-label on canvas
  // -------------------------------------------------------------------------
  test.describe('Accessibility', () => {
    test('canvas has an aria-label attribute', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)

      const label = await page.locator('canvas').getAttribute('aria-label')
      expect(label).toBeTruthy()
      expect(label!.length).toBeGreaterThan(10)
    })
  })

  // -------------------------------------------------------------------------
  // 6. Keyboard — Escape closes dialogue / handles gracefully
  // -------------------------------------------------------------------------
  test.describe('Keyboard interaction', () => {
    test('Escape does not crash the game', async ({ page }) => {
      const errors = trackConsoleErrors(page)
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
      expect(errors).toHaveLength(0)
    })

    test('Space also starts the game from title', async ({ page }) => {
      await page.goto('/')
      await waitForCanvasPaint(page)
      await page.keyboard.press('Space')
      await page.waitForTimeout(300)

      const painted = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let count = 0
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count++
        return count
      })
      expect(painted).toBeGreaterThan(5000)
    })
  })

  // -------------------------------------------------------------------------
  // 7. Responsive layout
  // -------------------------------------------------------------------------
  test.describe('Responsive layout', () => {
    test('renders correctly at 1280×720 (HD landscape)', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)
      await expect(page).toHaveScreenshot('hd-landscape.png', { maxDiffPixelRatio: 0.05 })
    })

    test('renders correctly at 390×844 (mobile portrait)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto('/')
      await waitForCanvasPaint(page)
      await startGame(page)
      await expect(page).toHaveScreenshot('mobile-portrait.png', { maxDiffPixelRatio: 0.05 })
    })

    test('canvas resizes to fill viewport width', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 })
      await page.goto('/')
      await waitForCanvasPaint(page)

      const box = await page.locator('canvas').boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(790) // within 10px of viewport
    })
  })

  // -------------------------------------------------------------------------
  // 8. No memory leaks / teardown — page navigates away cleanly
  // -------------------------------------------------------------------------
  test('navigating away does not throw unhandled errors', async ({ page }) => {
    const errors = trackConsoleErrors(page)
    await page.goto('/')
    await waitForCanvasPaint(page)
    await startGame(page)
    await page.goto('about:blank')
    expect(errors).toHaveLength(0)
  })
})
