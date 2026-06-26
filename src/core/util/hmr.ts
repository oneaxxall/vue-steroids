import config from '../config'
import { warn } from './debug'
import { debugLog } from './options'
import { defineDynamicComponent } from './options'
import { parseComponentFile, fetchDynamicComponent } from './dynamic-component-loader'

/**
 * Vue 2 Steroids - HMR Client
 * 
 * Hot Module Replacement client for Vue Steroids.
 * Menghubungkan ke HMR WebSocket server untuk hot-reload
 * komponen, style, dan script saat development.
 * 
 * Alur:
 *   1. Connect ke WebSocket server (Vue.config.hmrHost:hmrPort)
 *   2. Kirim sinyal watch dengan extensions dari config
 *   3. Server kirim event saat file berubah
 *   4. Client handle: .tpl/.vue → re-register, .css → inject, .js → reload
 */

class HMRClient {
  private socket: WebSocket | null = null
  private connected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 20
  private reconnectDelay: number = 1000
  private vueInstance: any
  private destroyed: boolean = false

  constructor(vueInstance: any) {
    this.vueInstance = vueInstance
  }

  /**
   * Connect ke HMR WebSocket server
   */
  connect(): void {
    if (this.destroyed) return
    if (!config.hmr) return

    const protocol = config.hmrSecure ? 'wss' : 'ws'
    const url = `${protocol}://${config.hmrHost}:${config.hmrPort}`

    debugLog(`[HMR] Connecting to ${url}...`)

    try {
      this.socket = new WebSocket(url)

      this.socket.onopen = () => {
        this.connected = true
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000
        debugLog('[HMR] ✅ Connected to HMR server')
        this.sendWatchSignal()
      }

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (e) {
          warn('[HMR] Invalid message from server:', e)
        }
      }

      this.socket.onclose = () => {
        this.connected = false
        if (!this.destroyed) {
          debugLog('[HMR] ❌ Disconnected from HMR server')
          this.reconnect()
        }
      }

      this.socket.onerror = (error: Event) => {
        warn('[HMR] Connection error:', error)
      }
    } catch (e) {
      warn('[HMR] Failed to create WebSocket connection:', e)
      this.reconnect()
    }
  }

  /**
   * Kirim sinyal watch ke server
   * Client memberi tahu server file extensions apa yang perlu di-watch
   */
  private sendWatchSignal(): void {
    const extensions = config.hmrFiles || ['css', 'vue', 'tpl', 'js']
    this.send({
      type: 'watch',
      extensions: extensions
    })
    debugLog(`[HMR] Sent watch signal for: ${extensions.join(', ')}`)
  }

  /**
   * Handle pesan dari server
   */
  private handleMessage(data: HMRMessage): void {
    switch (data.type) {
      case 'change':
        this.handleFileChange(data.file, data.ext, data.content)
        break
      case 'connected':
        debugLog(`[HMR] Server acknowledged (clientId: ${data.clientId})`)
        break
      case 'error':
        warn(`[HMR] Server error: ${data.message}`)
        break
      default:
        debugLog(`[HMR] Unknown message type: ${data.type}`)
    }
  }

  /**
   * Handle perubahan file berdasarkan extension
   */
  private handleFileChange(file: string, ext: string, content?: string): void {
    debugLog(`[HMR] File changed: ${file} (${ext})`)

    switch (ext) {
      case 'tpl':
        this.handleComponentChange(file, content)
        break
      case 'vue':
        this.handleComponentChange(file, content)
        break
      case 'css':
        this.handleStyleChange(file, content)
        break
      case 'js':
        this.handleScriptChange(file, content)
        break
      default:
        debugLog(`[HMR] Unhandled extension: ${ext}`)
    }
  }

  /**
   * Handle perubahan .tpl atau .vue file
   * Re-register komponen + force update
   */
  private handleComponentChange(file: string, content?: string): void {
    // Extract component name dari filename
    const name = this.getComponentName(file)
    if (!name) {
      warn(`[HMR] Could not extract component name from: ${file}`)
      return
    }

    if (content) {
      // Parse konten file dan register ulang
      const parsed = parseComponentFile(content)
      if (parsed.script) {
        try {
          // Evaluate script
          const module: any = { exports: {} }
          const exports = module.exports

          // Support export default
          let scriptContent = parsed.script
          if (/\bexport\s+default\b/.test(scriptContent)) {
            scriptContent = scriptContent.replace(/\bexport\s+default\b/g, 'module.exports =')
          }

          const wrappedScript = `(function(module, exports) {
            ${scriptContent}
          })`

          const fn = eval(wrappedScript)
          fn(module, exports)
          const componentDef = module.exports || {}

          // Set template jika ada
          if (parsed.template) {
            componentDef.template = parsed.template
          }
          if (parsed.loadingTemplate) {
            componentDef.loadingTemplate = parsed.loadingTemplate
          }

          // Tandai sebagai hot-reloaded
          componentDef.__hmr = true

          // Re-register component
          defineDynamicComponent(name, componentDef)
          debugLog(`[HMR] 🔄 Hot-reloaded component: ${name}`)
        } catch (e) {
          warn(`[HMR] Failed to evaluate component script: ${name}`, e)
        }
      } else {
        warn(`[HMR] No script found in: ${file}`)
      }
    } else {
      // Tanpa konten, fetch ulang dari server
      debugLog(`[HMR] Fetching component from server: ${name}`)
      fetchDynamicComponent(name, `/${name}${config.componentExtension || '.tpl'}`)
    }
  }

  /**
   * Handle perubahan .css file
   * Inject/replace <style> tag
   */
  private handleStyleChange(file: string, content?: string): void {
    if (!content) {
      debugLog(`[HMR] No content for style: ${file}`)
      return
    }

    // Gunakan path file sebagai ID unik
    const styleId = `hmr-style-${file.replace(/[^a-zA-Z0-9]/g, '-')}`

    // Cari existing style tag atau buat baru
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = styleId
      document.head.appendChild(styleTag)
    }

    // Update content
    styleTag.textContent = content
    debugLog(`[HMR] 🎨 Hot-reloaded style: ${file}`)
  }

  /**
   * Handle perubahan .js file
   * Full page reload karena JS bisa mengubah state global
   */
  private handleScriptChange(file: string, content?: string): void {
    debugLog(`[HMR] 🔄 Script changed, full reload: ${file}`)
    // Full page reload untuk keamanan state
    window.location.reload()
  }

  /**
   * Extract component name dari file path
   * Contoh:
   *   /components/input/input-text.tpl → input-text
   *   components/Button.vue → Button
   *   header.tpl → header
   */
  private getComponentName(filePath: string): string {
    // Hapus extension
    let name = filePath.replace(/\.(tpl|vue|html)$/i, '')

    // Ambil segmen terakhir
    const segments = name.split('/').filter(Boolean)
    name = segments[segments.length - 1] || ''

    // Kebab-case to PascalCase untuk component naming
    return name
  }

  /**
   * Kirim pesan ke server
   */
  private send(data: any): void {
    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify(data))
    }
  }

  /**
   * Reconnect dengan exponential backoff
   * 1s → 2s → 4s → 8s → 16s → 32s → 60s (max)
   */
  private reconnect(): void {
    if (this.destroyed) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      warn('[HMR] Max reconnection attempts reached. Stopping HMR.')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectDelay, 60000)
    debugLog(`[HMR] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      if (!this.destroyed) {
        this.connect()
      }
    }, delay)

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s, 60s...
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60000)
  }

  /**
   * Disconnect dari server
   */
  disconnect(): void {
    this.destroyed = true
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.connected = false
    debugLog('[HMR] Disconnected')
  }
}

// =====================================================
// Message Types
// =====================================================

interface HMRMessage {
  type: 'change' | 'connected' | 'error'
  file?: string
  ext?: string
  content?: string | null
  clientId?: number
  message?: string
  timestamp?: number
}

// =====================================================
// HMR Client Manager
// =====================================================

let hmrInstance: HMRClient | null = null

/**
 * Inisialisasi HMR client
 * Dipanggil dari global-api/index.ts saat Vue.initGlobalAPI()
 */
export function initHMR(Vue: any): void {
  if (!config.hmr) {
    debugLog('[HMR] HMR is disabled (Vue.config.hmr = false)')
    return
  }

  if (typeof window === 'undefined') {
    debugLog('[HMR] HMR not available in non-browser environment')
    return
  }

  // Cek WebSocket availability
  if (typeof WebSocket === 'undefined') {
    warn('[HMR] WebSocket is not available in this browser')
    return
  }

  // Buat instance HMR client
  hmrInstance = new HMRClient(Vue)

  // Simpan di Vue prototype untuk akses dari komponen
  Vue.prototype.$hmr = hmrInstance

  // Auto-connect saat Vue siap
  Vue.nextTick(() => {
    hmrInstance!.connect()
  })

  debugLog(`[HMR] Client initialized (ws://${config.hmrHost}:${config.hmrPort})`)
}

/**
 * Dapatkan HMR client instance
 */
export function getHMRClient(): HMRClient | null {
  return hmrInstance
}

export { HMRClient }
