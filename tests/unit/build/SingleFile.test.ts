import { existsSync } from 'fs'
import { describe, it, expect } from 'vitest'

describe('build artifacts', () => {
  it('single-file bundle script exists', () => {
    expect(existsSync('scripts/bundle-single-file.mjs')).toBe(true)
  })
  it('package version is 1.0.0', async () => {
    const pkg = await import('../../../package.json')
    expect(pkg.version).toBe('1.0.0')
  })
})
