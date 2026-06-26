/**
 * Build Boilerplate
 * 
 * Orchestrator script untuk build Vue Steroids + generate boilerplate output
 * ke dist/boilerplate/ yang siap digunakan/dideploy.
 * 
 * Alur:
 *   1. Build Vue.js dari source (Rollup) → dist/vue.js, dist/vue.min.js
 *   2. Copy dist/vue.js → dist/boilerplate/public/js/vue/vue.js
 *   3. Copy dist/vue.min.js → dist/boilerplate/public/js/vue/vue.min.js
 *   4. Copy packages/boilerplate/ → dist/boilerplate/ (kecuali node_modules, public/js/vue)
 *   5. Generate index.html dengan script tag yang benar
 * 
 * Usage:
 *   node scripts/build-boilerplate.js            # Build full + dev + prod
 *   node scripts/build-boilerplate.js --full     # Hanya full build (with compiler)
 *   node scripts/build-boilerplate.js --runtime  # Hanya runtime build
 *   node scripts/build-boilerplate.js --prod     # Hanya production build
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const BOILERPLATE_SRC = path.join(ROOT, 'packages', 'boilerplate')
const BOILERPLATE_DIST = path.join(DIST, 'boilerplate')

// =====================================================
// 1. Build Vue.js dari source
// =====================================================

function buildVue(mode) {
  console.log('\n🔨 Building Vue Steroids...')

  const targets = {
    full: 'full-dev,full-prod',
    runtime: 'runtime-cjs-dev,runtime-cjs-prod',
    all: 'full-dev,full-prod,runtime-cjs-dev,runtime-cjs-prod'
  }

  const target = targets[mode] || targets.all
  const cmd = `node scripts/build.js ${target}`

  console.log(`  Target: ${target}`)
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' })
}

// =====================================================
// 2. Copy hasil build Vue ke boilerplate
// =====================================================

function copyVueFiles() {
  console.log('\n📋 Copying Vue compiled files...')

  const vueDist = path.join(BOILERPLATE_DIST, 'public', 'js', 'vue')
  fs.mkdirSync(vueDist, { recursive: true })

  const files = [
    { src: 'dist/vue.js', dest: 'vue.js' },
    { src: 'dist/vue.min.js', dest: 'vue.min.js' },
    { src: 'dist/vue.runtime.common.dev.js', dest: 'vue.runtime.common.dev.js' },
    { src: 'dist/vue.runtime.common.prod.js', dest: 'vue.runtime.common.prod.js' }
  ]

  files.forEach(({ src, dest }) => {
    const srcPath = path.join(ROOT, src)
    const destPath = path.join(vueDist, dest)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
      const size = (fs.statSync(destPath).size / 1024).toFixed(1)
      console.log(`  ✅ ${dest} (${size} KB)`)
    } else {
      console.warn(`  ⚠️  ${src} not found, skipping`)
    }
  })
}

// =====================================================
// 3. Copy boilerplate template
// =====================================================

function copyBoilerplate() {
  console.log('\n📋 Copying boilerplate template...')

  if (!fs.existsSync(BOILERPLATE_SRC)) {
    console.error('  ❌ packages/boilerplate/ not found!')
    return
  }

  // Excluded files/dirs (tidak perlu di-copy)
  const exclude = [
    'node_modules',
    path.join('public', 'js', 'vue'), // sudah di-copy terpisah dengan versi compiled
  ]

  function shouldExclude(relativePath) {
    return exclude.some(ex => relativePath.startsWith(ex) || relativePath === ex)
  }

  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true })
    const entries = fs.readdirSync(src, { withFileTypes: true })

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)
      const relativePath = path.relative(BOILERPLATE_SRC, srcPath)

      if (entry.name === '.' || entry.name === '..') continue
      if (shouldExclude(relativePath)) {
        console.log(`  ⏭️  Skipped: ${relativePath}`)
        continue
      }

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath)
      } else {
        fs.copyFileSync(srcPath, destPath)
        const size = (fs.statSync(destPath).size / 1024).toFixed(1)
        console.log(`  ✅ ${relativePath} (${size} KB)`)
      }
    }
  }

  copyDir(BOILERPLATE_SRC, BOILERPLATE_DIST)
}

// =====================================================
// 4. Generate index.html
// =====================================================

function generateIndexHtml(mode) {
  console.log('\n📝 Generating index.html...')

  const isProd = mode === 'prod'
  const vueSrc = isProd
    ? 'public/js/vue/vue.min.js'
    : 'public/js/vue/vue.js'

  const tailwindCss = isProd
    ? 'public/css/tailwind.css'
    : 'public/css/tailwind.css'

  const appBundle = isProd ? 'public/js/app.bundle.js' : null

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vue Steroids Boilerplate</title>
  <meta name="description" content="Vue 2.7.16 - Reborn with built-in HTTP client, state management, dynamic components, and more." />
  <link rel="stylesheet" href="${tailwindCss}" />
</head>
<body>
  <div id="app">
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">Vue Steroids 🚀</h1>
        <p class="text-lg text-gray-600 mb-2">Vue 2.7.16 - Reborn</p>
        <p class="text-sm text-gray-500">Built-in HTTP Client · State Management · Dynamic Components</p>
        <div class="mt-8">
          <p class="text-gray-400">Count: <span id="count-display" class="font-mono text-green-600">0</span></p>
          <button id="increment-btn" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">+1</button>
          <button id="fetch-btn" class="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2">Fetch API</button>
        </div>
      </div>
    </div>
  </div>

  <script src="${vueSrc}"></script>
  ${appBundle ? `<script src="${appBundle}"></script>` : ''}
  <script>
    // Setup store (optional)
    Vue.config.store = {
      state: { count: 0 },
      mutations: {
        INCREMENT: function(state) { state.count++ }
      }
    }

    // Create Vue instance
    new Vue({
      el: '#app',
      computed: {
        count: function() { return this.$store.state.count }
      },
      methods: {
        increment: function() {
          this.$store.commit('INCREMENT')
        },
        loadData: async function() {
          try {
            var res = await this.get('/api/hello')
            console.log('API Response:', res.data)
          } catch(e) {
            console.log('API not available (expected if no backend)')
          }
        }
      },
      mounted: function() {
        console.log('Vue Steroids Boilerplate is running! 🚀')
        console.log('Built-in HTTP: this.get(), this.post(), ...')
        console.log('Built-in Store: this.$store.state, this.$store.commit()')

        // Wire up buttons (for non-Vue template mode)
        document.getElementById('increment-btn').addEventListener('click', this.increment.bind(this))
        document.getElementById('fetch-btn').addEventListener('click', this.loadData.bind(this))
      },
      watch: {
        count: function(val) {
          document.getElementById('count-display').textContent = val
        }
      }
    })
  </script>
</body>
</html>`

  const destPath = path.join(BOILERPLATE_DIST, 'index.html')
  fs.writeFileSync(destPath, html, 'utf-8')
  const size = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1)
  console.log(`  ✅ index.html (${size} KB)`)
}

// =====================================================
// 5. Summary
// =====================================================

function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('📦 Build Summary')
  console.log('='.repeat(50))
  console.log(`  Output: ${BOILERPLATE_DIST}`)
  
  function getDirSize(dir) {
    let size = 0
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) size += getDirSize(fullPath)
        else size += fs.statSync(fullPath).size
      }
    } catch (e) {}
    return size
  }

  const totalSize = (getDirSize(BOILERPLATE_DIST) / 1024).toFixed(1)
  console.log(`  Total size: ${totalSize} KB`)
  console.log('='.repeat(50) + '\n')
}

// =====================================================
// Main
// =====================================================

function main() {
  const args = process.argv.slice(2)
  const mode = args.includes('--full') ? 'full'
    : args.includes('--runtime') ? 'runtime'
    : args.includes('--prod') ? 'prod'
    : 'full'

  console.log('🏗️  Building Vue Steroids Boilerplate...')
  console.log(`  Mode: ${mode}`)
  console.log(`  Source: ${BOILERPLATE_SRC}`)
  console.log(`  Output: ${BOILERPLATE_DIST}`)

  // Clean dist/boilerplate
  if (fs.existsSync(BOILERPLATE_DIST)) {
    fs.rmSync(BOILERPLATE_DIST, { recursive: true })
    console.log('  🧹 Cleaned existing dist/boilerplate/')
  }

  // Step 1: Build Vue
  if (mode !== 'prod') {
    buildVue(mode)
  }

  // Step 2: Copy boilerplate template
  copyBoilerplate()

  // Step 3: Copy Vue compiled files
  copyVueFiles()

  // Step 4: Generate index.html
  generateIndexHtml(mode)

  // Summary
  printSummary()
}

main()
