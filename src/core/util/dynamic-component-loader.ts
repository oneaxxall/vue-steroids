import config from '../config'
import { getComponentHttpClient } from './http'

// Specialized HTTP GET for components (NO baseURL)
async function getComponentHttp(url: string) {
  return getComponentHttpClient().get(url)
}
import { defineDynamicComponent, debugLog, hasDynamicComponent } from './options'
import { warn } from './debug'
import type { Component } from 'types/component'

/**
 * Initialize async components on component instance
 * Called automatically when component is created
 */
export async function initAsyncComponents(vm: Component): Promise<void> {
  const asyncComponents = vm.$options.asyncComponents
  
  if (!asyncComponents || !Array.isArray(asyncComponents)) {
    return
  }

  // If component has loadingTemplate, set $loading to true
  if (vm.$options.loadingTemplate) {
    vm.$loading = true
    debugLog(`[initAsyncComponents] Set $loading=true for: ${vm.$options.name || 'anonymous'}`)
  }

  debugLog(`[initAsyncComponents] Initializing ${asyncComponents.length} async components for: ${vm.$options.name || 'anonymous'}`)

  const promises: Promise<any>[] = []
  const componentsToBatch: Array<{ name: string; path: string; options: any }> = []

  // Process each async component
  for (const item of asyncComponents) {
    let name: string
    let path: string
    let options: AsyncComponentOptions = {}

    // Handle string format: '/path/to/component-name' -> name is last segment
    if (typeof item === 'string') {
      path = item
      const segments = path.split('/').filter(Boolean)
      name = segments[segments.length - 1].replace(/\.(tpl|vue|html)$/, '')
    } else if (typeof item === 'object') {
      if (!item.name || !item.path) {
        warn('[initAsyncComponents] Each async component must have "name" and "path" properties')
        continue
      }
      name = item.name
      path = item.path
      options = item
    } else {
      warn('[initAsyncComponents] Invalid async component format')
      continue
    }

    if (hasDynamicComponent(name)) {
      debugLog(`[initAsyncComponents] ⏭️ Skipped (already loaded): ${name}`)
      continue
    }

    if (config.serverSide && config.serverSideURL) {
      componentsToBatch.push({ name, path, options })
    } else {
      promises.push(loadSingleAsyncComponent(name, path, options))
    }
  }

  // Handle batching if serverSide is enabled
  if (componentsToBatch.length > 0) {
    const batchPaths = componentsToBatch.map(c => c.path)
    debugLog(`[initAsyncComponents] 📦 Batching ${batchPaths.length} components via SSR Bundler`)
    promises.push(fetchBundledComponents(batchPaths))
  }

  // Wait for all async components (individual or batch) to finish
  if (promises.length > 0) {
    try {
      await Promise.all(promises)
      debugLog(`[initAsyncComponents] All async components loaded for: ${vm.$options.name || 'anonymous'}`)
    } catch (error) {
      warn(`[initAsyncComponents] One or more async components failed to load`)
    } finally {
      if (vm.$loading) {
        vm.$loading = false
      }
    }
  } else {
    if (vm.$loading) {
      vm.$loading = false
    }
  }
}

/**
 * Parse component file yang berisi:
 * <script> module.exports = { ... } </script>
 * <template> ... </template>
 * <style> ... </style>
 */
function parseComponentFile(content: string): { script: string; template: string; loadingTemplate: string; style: string } {
  const result = {
    script: '',
    template: '',
    loadingTemplate: '',
    style: ''
  }

  // Extract <script> content
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  if (scriptMatch && scriptMatch[1]) {
    result.script = scriptMatch[1].trim()
  }

  // Extract <template scope="loading"> content
  const loadingTemplateMatch = content.match(/<template\s+[^>]*scope=["']loading["'][^>]*>([\s\S]*?)<\/template>/i)
  if (loadingTemplateMatch) {
    result.loadingTemplate = loadingTemplateMatch[1].trim()
    // Remove the loading template from content to avoid it being picked up as the main template
    content = content.replace(loadingTemplateMatch[0], '')
  }

  // Extract <template> content (Robust nested matching)
  const templateStartMatch = content.match(/<template[^>]*>/i)
  if (templateStartMatch && typeof templateStartMatch.index === 'number') {
    const startIdx = templateStartMatch.index
    const contentAfterStart = content.slice(startIdx + templateStartMatch[0].length)
    
    // Find the matching </template> by counting depth
    let depth = 1
    const tagRegex = /<\/?template[^>]*>/gi
    let match: RegExpExecArray | null
    
    while ((match = tagRegex.exec(contentAfterStart)) !== null) {
      if (match[0].toLowerCase().startsWith('</template')) {
        depth--
      } else {
        depth++
      }
      
      if (depth === 0) {
        result.template = contentAfterStart.slice(0, match.index).trim()
        break
      }
    }
    
    // Fallback if balancing fails
    if (depth !== 0) {
      const fallbackMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
      if (fallbackMatch) result.template = fallbackMatch[1].trim()
    }
  }

  // Extract <style> content
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  if (styleMatch && styleMatch[1]) {
    result.style = styleMatch[1].trim()
  }

  return result
}

/**
 * Evaluate script content and extract component definition
 * Supports both:
 *   module.exports = { ... }  (CommonJS)
 *   export default { ... }     (ES Module)
 */
function evaluateScript(scriptContent: string): Record<string, any> {
  try {
    // Create a safe evaluation context
    const module: any = { exports: {} }
    const exports = module.exports
    let result: any

    // Check if script uses ES module export default pattern
    const hasExportDefault = /\bexport\s+default\b/.test(scriptContent)

    if (hasExportDefault) {
      // ES Module: rewrite export default → module.exports
      // Handles: export default { ... }, export default function ..., export default class ...
      const transformedScript = scriptContent
        .replace(/\bexport\s+default\b/g, 'module.exports =')
        .replace(/\bexport\s+const\b/g, 'const')
        .replace(/\bexport\s+let\b/g, 'let')
        .replace(/\bexport\s+var\b/g, 'var')
        .replace(/\bexport\s+function\b/g, 'function')
        .replace(/\bexport\s+class\b/g, 'class')

      const wrappedScript = `(function(module, exports) {
        ${transformedScript}
      })`

      const fn = eval(wrappedScript)
      fn(module, exports)
      
      return module.exports || {}
    }

    // CommonJS: module.exports = { ... }
    const wrappedScript = `(function(module, exports) {
      ${scriptContent}
    })`

    const fn = eval(wrappedScript)
    fn(module, exports)

    return module.exports || (typeof result === 'object' ? result : {})
  } catch (error) {
    warn(`Failed to evaluate component script: ${error}`)
    return {}
  }
}

/**
 * Fetch and register a dynamic component from server
 * 
 * @param name - Component name
 * @param pathOrOptions - Path to component file or options object
 * @param optionsOrFallback - Options object or fallback component name
 */
export async function fetchDynamicComponent(
  name: string | FetchComponentOptions,
  pathOrOptions?: string | FetchComponentOptions,
  optionsOrFallback?: FetchComponentOptions | string
): Promise<boolean> {
  let componentName: string
  let path: string
  let options: FetchComponentOptions = {}

  // Handle jika parameter pertama adalah object
  if (typeof name === 'object' && name !== null) {
    // Parameter pertama adalah object config
    const configObj = name as FetchComponentOptions
    componentName = configObj.name || ''
    path = configObj.path || `/${componentName}${config.componentExtension || '.tpl'}`
    options = configObj
  } else if (typeof name === 'string') {
    // Parameter pertama adalah string name
    componentName = name

    // Handle parameter kedua
    if (typeof pathOrOptions === 'string') {
      path = pathOrOptions
      options = typeof optionsOrFallback === 'string'
        ? { fallbackComponent: optionsOrFallback }
        : (optionsOrFallback || {})
    } else if (typeof pathOrOptions === 'object') {
      path = pathOrOptions.path || `/${name}${config.componentExtension || '.tpl'}`
      options = pathOrOptions
    } else {
      path = `/${name}${config.componentExtension || '.tpl'}`
      options = {}
    }
  } else {
    warn('[fetchDynamicComponent] Invalid parameters')
    return false
  }

  // Validate component name
  if (!componentName) {
    warn('[fetchDynamicComponent] Component name is required')
    return false
  }

  // Dapatkan extension dari config
  const extension = config.componentExtension || '.tpl'

  // Tambahkan extension ke path jika belum ada
  // Cek apakah path sudah berakhiran dengan extension
  if (!path.endsWith(extension)) {
    path = path + extension
  }

  const basePath = config.componentPath || '/components'
  const fullPath = path.startsWith('/') ? `${basePath}${path}` : `${basePath}/${path}`

  debugLog(`[fetchDynamicComponent] Component: ${componentName}`)
  debugLog(`[fetchDynamicComponent] Fetching: ${fullPath}`)
  debugLog(`[fetchDynamicComponent] Config - basePath: ${basePath}, extension: ${extension}`)
  debugLog(`[fetchDynamicComponent] Final path with extension: ${path}`)

  try {
    // Fetch component file (using component-specific axios instance without baseURL)
    const response = await getComponentHttp(fullPath)
    const content = response.data

    // Parse file content
    const result = parseComponentFile(content)
    const { script, template, style, loadingTemplate } = result

    // Evaluate script to get component definition
    const componentDef = evaluateScript(script)

    // Inject styles directly into head if exists
    if (style) {
      const styleId = `style-${componentName}`
      let styleEl = document.getElementById(styleId) as HTMLStyleElement
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = style
      debugLog(`[fetchDynamicComponent] Style injected for: ${componentName}`)
    }

    // Set template if exists
    if (template) {
      componentDef.template = template
    }

    // Set loading template if exists
    if (loadingTemplate) {
      componentDef.loadingTemplate = loadingTemplate
    }

    // Register component globally
    defineDynamicComponent(componentName, componentDef)
    debugLog(`[fetchDynamicComponent] ✅ Registered: ${componentName}`)

    // Call onSuccess callback if provided
    if (options.onSuccess) {
      options.onSuccess(componentName, componentDef)
    }

    return true
  } catch (error: any) {
    warn(`[fetchDynamicComponent] Failed to load component "${componentName}" from ${fullPath}: ${error.message}`)

    // Handle fallback component
    const fallbackName = options.fallbackComponent || config.componentFallback || 'component-notfound'

    debugLog(`[fetchDynamicComponent] Using fallback: ${fallbackName}`)

    // Check if fallback exists
    if (hasDynamicComponent(fallbackName)) {
      // Fallback already registered, just use it
      debugLog(`[fetchDynamicComponent] ✅ Fallback available: ${fallbackName}`)
    } else {
      // Create default fallback component
      defineDynamicComponent(fallbackName, {
        template: `<div class="vue-component-notfound">
          <p style="color: #999; padding: 20px; border: 1px dashed #ccc; border-radius: 4px;">
            Component "<strong>${componentName}</strong>" not found
          </p>
        </div>`
      })
      debugLog(`[fetchDynamicComponent] ✅ Created default fallback: ${fallbackName}`)
    }

    // Call onError callback if provided
    if (options.onError) {
      options.onError(componentName, error)
    }

    return false
  }
}

/**
 * Fetch and register multiple dynamic components
 */
export async function fetchDynamicComponents(
  components: Array<{ name: string; path: string }>
): Promise<number> {
  let successCount = 0

  for (const comp of components) {
    const success = await fetchDynamicComponent(comp.name, comp.path)
    if (success) {
      successCount++
    }
  }

  debugLog(`[fetchDynamicComponents] Loaded ${successCount}/${components.length} components`)
  return successCount
}

/**
 * Clear cached dynamic component
 */
export function clearDynamicComponentCache(name: string): void {
  // Implementation for cache clearing if needed
  debugLog(`[clearDynamicComponentCache] Cleared: ${name}`)
}

export interface FetchComponentOptions {
  /**
   * Component path (relative to componentPath)
   */
  path?: string

  /**
   * Component name
   */
  name?: string

  /**
   * Fallback component name if file not found
   */
  fallbackComponent?: string

  /**
   * Success callback
   */
  onSuccess?: (name: string, componentDef: Record<string, any>) => void

  /**
   * Error callback
   */
  onError?: (name: string, error: any) => void
}

export interface AsyncComponentOptions {
  /**
   * Component path (required when using object parameter)
   */
  path?: string

  /**
   * Component name (required when using object parameter)
   */
  name?: string

  /**
   * Custom file extension (default: .tpl)
   */
  extension?: string

  /**
   * Auto append extension to path (default: true)
   */
  autoAppendExtension?: boolean

  /**
   * Fallback component name if file not found
   */
  fallbackComponent?: string

  /**
   * Success callback
   */
  onSuccess?: (name: string, componentDef: Record<string, any>) => void

  /**
   * Error callback
   */
  onError?: (name: string, error: any) => void
}

/**
 * Load async component from custom path
 * Similar to fetchDynamicComponent but with full path control
 * Does NOT use config.componentPath - you have full control
 * BUT still uses config.componentExtension for auto-append
 * 
 * Same parameter format as fetchDynamicComponent
 * 
 * @param nameOrComponents - Component name (string) OR component object OR array of objects
 * @param pathOrOptions - Path (if nameOrComponents is string) OR options object
 * @param optionsOrFallback - Additional options or fallback component name
 * 
 * @example
 * // Single component - String path
 * await this.loadAsyncComponent('my-comp', '/custom/path/component')
 * 
 * // Single component - With options
 * await this.loadAsyncComponent('my-comp', '/custom/path/component', {
 *   extension: '.vue',
 *   fallbackComponent: 'notfound',
 *   onSuccess: (name, def) => console.log('Loaded:', name),
 *   onError: (name, error) => console.error('Failed:', name, error)
 * })
 * 
 * // Single component - Object format
 * await this.loadAsyncComponent({
 *   name: 'my-comp',
 *   path: '/custom/path/component',
 *   extension: '.vue',
 *   fallbackComponent: 'notfound',
 *   onSuccess: (name, def) => console.log('Loaded:', name),
 *   onError: (name, error) => console.error('Failed:', name, error)
 * })
 * 
 * // Multiple components - Array of objects
 * await this.loadAsyncComponent([
 *   { name: 'header', path: '/layout/header' },
 *   { name: 'footer', path: '/layout/footer', extension: '.vue' }
 * ])
 */
export async function loadAsyncComponent(
  nameOrComponents: string | AsyncComponentOptions | Array<AsyncComponentOptions>,
  pathOrOptions?: string | AsyncComponentOptions,
  optionsOrFallback?: AsyncComponentOptions
): Promise<boolean | number> {
  
  // Handle array - multiple components
  if (Array.isArray(nameOrComponents)) {
    return loadMultipleAsyncComponents(nameOrComponents)
  }

  // Handle single component
  let name: string
  let path: string
  let options: AsyncComponentOptions = {}

  if (typeof nameOrComponents === 'object' && nameOrComponents !== null) {
    // Object format
    const obj = nameOrComponents as AsyncComponentOptions
    
    if (!obj.name || !obj.path) {
      warn('[loadAsyncComponent] "name" and "path" are required in options object')
      return false
    }
    
    name = obj.name
    path = obj.path
    options = obj
  } else if (typeof nameOrComponents === 'string') {
    // String format
    name = nameOrComponents
    
    if (typeof pathOrOptions === 'string') {
      path = pathOrOptions
      options = typeof optionsOrFallback === 'string'
        ? { fallbackComponent: optionsOrFallback }
        : (optionsOrFallback || {})
    } else if (typeof pathOrOptions === 'object') {
      path = pathOrOptions.path || `/${name}${options.extension || config.componentExtension || '.tpl'}`
      options = pathOrOptions
    } else {
      path = `/${name}${config.componentExtension || '.tpl'}`
    }
  } else {
    warn('[loadAsyncComponent] Invalid parameters')
    return false
  }

  // Check if component is already registered
  if (hasDynamicComponent(name)) {
    debugLog(`[loadAsyncComponent] ⏭️ Skipped (already loaded): ${name}`)
    return true
  }

  // If serverSide is enabled, use bundling even for single component
  if (config.serverSide && config.serverSideURL) {
    debugLog(`[loadAsyncComponent] 📦 Routing single component "${name}" via SSR Bundler`)
    return loadMultipleAsyncComponents([{ name, path, ...options }])
  }

  return loadSingleAsyncComponent(name, path, options)
}

/**
 * Load single async component
 */
async function loadSingleAsyncComponent(
  name: string,
  path: string,
  options: AsyncComponentOptions = {}
): Promise<boolean> {
  // Validate inputs
  if (!name) {
    warn('[loadAsyncComponent] Component name is required')
    return false
  }

  if (!path || typeof path !== 'string') {
    warn('[loadAsyncComponent] Path must be a string')
    return false
  }

  // Use path as-is
  let fullPath: string = path
  
  // Auto-append extension from config (unless disabled)
  const shouldAppendExtension = options.autoAppendExtension !== false
  
  if (shouldAppendExtension) {
    // Use custom extension from options, or fallback to config, or default to .tpl
    const ext = (options.extension || config.componentExtension || '.tpl') as string
    
    // Safe check: only append if path doesn't already end with this extension
    const pathLen = fullPath.length
    const extLen = ext.length
    let hasExtension = false
    
    if (pathLen >= extLen) {
      const pathEnd = fullPath.slice(pathLen - extLen)
      hasExtension = (pathEnd === ext)
    }
    
    if (!hasExtension) {
      fullPath = fullPath + ext
      debugLog('[loadAsyncComponent] Auto-appended extension: ' + ext)
    }
  }

  debugLog('[loadAsyncComponent] Component: ' + name)
  debugLog('[loadAsyncComponent] Original path: ' + path)
  debugLog('[loadAsyncComponent] Full path: ' + fullPath)

  try {
    // Fetch component file (using component-specific axios instance without baseURL)
    const response = await getComponentHttp(fullPath)
    const content = response.data

    // Parse file content
    const result = parseComponentFile(content)
    const { script, template, style, loadingTemplate } = result

    // Evaluate script to get component definition
    const componentDef = evaluateScript(script)

    // Inject styles directly into head if exists
    if (style) {
      const styleId = `style-${name}`
      let styleEl = document.getElementById(styleId) as HTMLStyleElement
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = style
      debugLog(`[loadAsyncComponent] Style injected for: ${name}`)
    }

    // Set template if exists
    if (template) {
      componentDef.template = template
    }

    // Set loading template if exists
    if (loadingTemplate) {
      componentDef.loadingTemplate = loadingTemplate
    }

    // Register component globally
    defineDynamicComponent(name, componentDef)
    debugLog('[loadAsyncComponent] ✅ Registered: ' + name)

    // Call onSuccess callback if provided
    if (options.onSuccess) {
      options.onSuccess(name, componentDef)
    }

    return true
  } catch (error: any) {
    warn('[loadAsyncComponent] Failed to load "' + name + '" from ' + fullPath + ': ' + error.message)

    // Handle fallback component
    const fallbackName = options.fallbackComponent || config.componentFallback || 'component-notfound'
    
    debugLog('[loadAsyncComponent] Using fallback: ' + fallbackName)

    // Check if fallback exists
    if (hasDynamicComponent(fallbackName)) {
      debugLog('[loadAsyncComponent] ✅ Fallback available: ' + fallbackName)
    } else {
      // Create default fallback component
      defineDynamicComponent(fallbackName, {
        template: '<div class="vue-component-notfound">' +
          '<p style="color: #999; padding: 20px; border: 1px dashed #ccc; border-radius: 4px;">' +
          'Component "<strong>' + name + '</strong>" not found' +
          '</p></div>'
      })
      debugLog('[loadAsyncComponent] ✅ Created default fallback: ' + fallbackName)
    }

    // Call onError callback if provided
    if (options.onError) {
      options.onError(name, error)
    }

    return false
  }
}

/**
 * Load multiple async components
 */
async function loadMultipleAsyncComponents(
  components: Array<AsyncComponentOptions>
): Promise<number> {
  const componentsToLoad: Array<AsyncComponentOptions> = []
  
  // Filter out already loaded components
  for (const comp of components) {
    if (!comp.name || !comp.path) {
      warn('[loadAsyncComponent] Each component must have "name" and "path" properties')
      continue
    }
    if (!hasDynamicComponent(comp.name)) {
      componentsToLoad.push(comp)
    }
  }

  if (componentsToLoad.length === 0) {
    return 0
  }

  if (config.serverSide && config.serverSideURL) {
    const paths = componentsToLoad.map(c => c.path!)
    debugLog(`[loadAsyncComponent] 📦 Batching ${paths.length} components via SSR Bundler`)
    const success = await fetchBundledComponents(paths)
    return success ? componentsToLoad.length : 0
  }

  let successCount = 0
  for (const comp of componentsToLoad) {
    const success = await loadSingleAsyncComponent(comp.name!, comp.path!, comp)
    if (success) {
      successCount++
    }
  }

  debugLog('[loadAsyncComponent] Loaded ' + successCount + '/' + components.length + ' components')
  return successCount
}

/**
 * Fetch multiple components as a single JS bundle from SSR Bundler
 */
async function fetchBundledComponents(paths: string[]): Promise<boolean> {
  if (!paths || paths.length === 0) return true
  if (!config.serverSideURL) return false

  try {
    debugLog(`[fetchBundledComponents] Requesting bundle for:`, paths)
    
    const response = await fetch(config.serverSideURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ components: paths })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const bundleJS = await response.text()
    
    // Inject and execute the bundle script
    const script = document.createElement('script')
    const bundleId = `ssr-bundle-${Date.now()}`
    script.id = bundleId
    
    // Add sourceURL for better debugging in DevTools
    script.textContent = bundleJS + `\n//# sourceURL=ssr-bundle.js`
    
    document.head.appendChild(script)
    
    // Clean up script tag after execution
    setTimeout(() => {
      const el = document.getElementById(bundleId)
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    }, 100)

    debugLog(`[fetchBundledComponents] ✅ Bundle executed successfully`)
    return true
  } catch (error: any) {
    warn(`[fetchBundledComponents] ❌ Failed to load bundle: ${error.message}`)
    return false
  }
}
