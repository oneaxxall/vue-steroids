/**
 * Minimalist require() implementation for browser
 * Supports module.exports pattern with Sync/Async support
 */

const moduleCache: Record<string, any> = {};

/**
 * Normalizes the path and ensures it has a .js extension
 */
function normalizePath(path: string): string {
  let url = path;
  if (!url.endsWith('.js')) {
    url = `${url}.js`;
  }
  // Ensure absolute path if it starts with /
  return url;
}

/**
 * Main require implementation (Synchronous)
 */
export function requireSync(path: string): any {
  const url = normalizePath(path);
  
  if (moduleCache[url]) {
    return moduleCache[url];
  }

  try {
    // Use Sync XHR to support synchronous require in browser
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // false = synchronous
    xhr.send();

    if (xhr.status !== 200) {
      throw new Error(`Failed to load module ${url}: Status ${xhr.status}`);
    }

    const code = xhr.responseText;
    return executeModule(url, code);
  } catch (err) {
    console.error(`[Require] Error loading ${url}:`, err);
    return null;
  }
}

/**
 * Async version of require
 */
export async function requireAsync(path: string): Promise<any> {
  const url = normalizePath(path);
  
  if (moduleCache[url]) {
    return moduleCache[url];
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load module: ${url}`);
    
    const code = await response.text();
    return executeModule(url, code);
  } catch (err) {
    console.error(`[Require] Error loading ${url}:`, err);
    throw err;
  }
}

/**
 * Executes module code in an isolated context
 */
function executeModule(url: string, code: string): any {
  const module = { exports: {} };
  const exports = module.exports;
  
  try {
    // Append sourceURL for better debugging in DevTools
    const sourceMap = `\n//# sourceURL=${window.location.origin}${url}`;
    const wrapper = new Function('module', 'exports', 'require', code + sourceMap);
    
    wrapper(module, exports, window.require);
    
    moduleCache[url] = module.exports;
    return module.exports;
  } catch (err) {
    console.error(`[Require] Execution error in ${url}:`, err);
    throw err;
  }
}

/**
 * Initialize global require functions
 */
export function initRequire() {
  if (typeof window !== 'undefined' && !(window as any).require) {
    (window as any).require = requireSync;
    (window as any).requireAsync = requireAsync;
    
    // Also expose to Vue prototype if needed
    const globalVue = (window as any).Vue;
    if (globalVue) {
      globalVue.prototype.$require = requireSync;
      globalVue.prototype.$requireAsync = requireAsync;
    }
  }
}

// Auto-init immediately when module is loaded
initRequire();
