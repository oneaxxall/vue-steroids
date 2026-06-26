#!/usr/bin/env node

/**
 * pack.js — JavaScript Packer
 * 
 * Menggabungkan (concat) dan meminifikasi file .js menjadi satu bundle
 * untuk production. Hanya untuk file .js — urusan .tpl ditangani oleh ssr.js
 * 
 * ❌ BUKAN untuk .tpl files (itu tugas SSR bundler)
 * ✅ Hanya untuk .js files (concat + minify)
 * 
 * Usage:
 *   node scripts/pack.js                   # Production: minify + concat
 *   node scripts/pack.js --dev             # Development: concat only
 *   node scripts/pack.js --watch           # Watch mode (future)
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(ROOT, 'public', 'js')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'app.bundle.js')

// Daftar JS files yang akan digabung
// Urutan penting: dependency harus lebih dulu
const SOURCE_FILES = [
  // Vue framework (compiled production version)
  path.join(ROOT, 'public', 'js', 'vue', 'vue.min.js'),
  
  // Aplikasi scripts (akan ditambahkan jika ada)
  // path.join(ROOT, 'public', 'js', 'app.js'),
  // path.join(ROOT, 'public', 'js', 'router.js'),
]

function log(msg) {
  console.log(`[pack] ${msg}`)
}

function warn(msg) {
  console.warn(`[pack] ⚠️  ${msg}`)
}

function concatFiles(files) {
  let bundle = ''
  let totalSize = 0
  let loadedCount = 0

  files.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      warn(`File not found: ${path.basename(filePath)}`)
      return
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const fileName = path.basename(filePath)
    const fileSize = Buffer.byteLength(content, 'utf-8')

    bundle += `\n/* --- ${fileName} (${(fileSize / 1024).toFixed(1)} KB) --- */\n${content}\n`
    totalSize += fileSize
    loadedCount++
    log(`  + ${fileName} (${(fileSize / 1024).toFixed(1)} KB)`)
  })

  return { bundle, totalSize, loadedCount }
}

function minifyJS(code) {
  // Simple minification without terser dependency:
  // Hanya untuk basic minification, untuk production-grade
  // sebaiknya gunakan terser (npm install terser)
  try {
    const terser = require('terser')
    const result = terser.minify(code, {
      toplevel: true,
      compress: { drop_console: false },
      output: { beautify: false }
    })
    return result.code || code
  } catch (e) {
    warn('Terser not available, using basic minification')
    // Basic minification fallback
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')     // Hapus block comments
      .replace(/\/\/[^\n]*/g, '')            // Hapus line comments
      .replace(/\n\s*\n/g, '\n')             // Hapus empty lines
      .replace(/^\s+/gm, '')                 // Hapus leading whitespace
      .replace(/\s+$/gm, '')                 // Hapus trailing whitespace
  }
}

function writeBundle(content) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8')
  const finalSize = fs.statSync(OUTPUT_FILE).size
  log(`📦 Written: ${OUTPUT_FILE}`)
  log(`   Size: ${(finalSize / 1024).toFixed(1)} KB`)
  return finalSize
}

function main() {
  const args = process.argv.slice(2)
  const isDev = args.includes('--dev')
  const isWatch = args.includes('--watch')

  log(`Mode: ${isDev ? 'development (concat only)' : 'production (minified)'}`)
  log(`Output: ${OUTPUT_FILE}`)

  // Filter hanya file yang ada
  const availableFiles = SOURCE_FILES.filter(f => fs.existsSync(f))
  
  if (availableFiles.length === 0) {
    warn('No source files found!')
    log('Make sure vue.min.js exists in public/js/vue/')
    process.exit(0)
  }

  // Concat files
  const { bundle, totalSize, loadedCount } = concatFiles(availableFiles)
  log(`📥 Loaded ${loadedCount} files (${(totalSize / 1024).toFixed(1)} KB total)`)

  // Minify (jika production)
  let finalContent = bundle
  if (!isDev) {
    log('🔧 Minifying...')
    finalContent = minifyJS(bundle)
  }

  // Write output
  const finalSize = writeBundle(finalContent)
  const savings = ((1 - finalSize / totalSize) * 100).toFixed(1)
  
  if (!isDev && totalSize > 0) {
    log(`💾 Saved ${(totalSize - finalSize) / 1024}.${String(savings).padStart(2, '0')} KB (${savings}%)`)
  }

  log('✅ Pack complete!')

  // Watch mode (future)
  if (isWatch) {
    log('👀 Watch mode not yet implemented')
  }
}

main()
