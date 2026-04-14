// scripts/bundle-single-file.mjs
// Post-build script: inlines all JS/CSS into a single distributable HTML file.
// GDD §4.2 constraint: single .html file, <2MB total.
import fs from 'fs'
import path from 'path'

const distDir = 'dist'
const htmlFile = path.join(distDir, 'index.html')

if (!fs.existsSync(htmlFile)) {
  console.error('✗ dist/index.html not found — run vite build first')
  process.exit(1)
}

let html = fs.readFileSync(htmlFile, 'utf8')

// Inline JS files
html = html.replace(
  /<script[^>]*src="([^"]+)"[^>]*><\/script>/g,
  (match, src) => {
    const filePath = path.join(distDir, src.replace(/^\//, ''))
    if (fs.existsSync(filePath)) {
      const code = fs.readFileSync(filePath, 'utf8')
      return `<script type="module">\n${code}\n</script>`
    }
    return match
  }
)

// Inline CSS files
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g,
  (match, href) => {
    const filePath = path.join(distDir, href.replace(/^\//, ''))
    if (fs.existsSync(filePath)) {
      const css = fs.readFileSync(filePath, 'utf8')
      return `<style>\n${css}\n</style>`
    }
    return match
  }
)

// Write single-file output
const outputFile = path.join(distDir, 'echoes-of-the-lighthouse.html')
fs.writeFileSync(outputFile, html)

const sizeBytes = Buffer.byteLength(html, 'utf8')
const sizeKB = (sizeBytes / 1024).toFixed(1)
console.log(`✓ Single file: ${outputFile} (${sizeKB} KB)`)

if (sizeBytes > 2 * 1024 * 1024) {
  console.warn('⚠ WARNING: Single file exceeds 2MB GDD constraint!')
  process.exit(1)
}
