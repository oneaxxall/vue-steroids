import config from '../config'
import axios from 'axios'

// Handle both default and named exports
const axiosInstance = (axios as any).default || axios

/**
 * Vue's integrated HTTP client based on Axios
 * This provides convenient HTTP methods directly on Vue instances
 */

// Create default axios instance (for user requests - uses baseURL)
let httpInstance = axiosInstance.create()

// Create separate axios instance for component loading (NO baseURL)
let componentInstance = axiosInstance.create()

/**
 * Initialize HTTP client with default config
 * Called automatically when Vue is initialized
 */
export function initHttpClient(): void {
  // Set initial defaults
  if (config.axiosBaseURL) {
    httpInstance.defaults.baseURL = config.axiosBaseURL
  }
  if (config.axiosTimeout) {
    httpInstance.defaults.timeout = config.axiosTimeout
  }
  if (config.axiosHeaders) {
    Object.assign(httpInstance.defaults.headers.common, config.axiosHeaders)
  }
  if (config.axiosToken) {
    httpInstance.defaults.headers.common['Authorization'] = `Bearer ${config.axiosToken}`
  }

  // Add request interceptor for DYNAMIC config updates
  httpInstance.interceptors.request.use(
    (requestConfig) => {
      // Dynamically apply baseURL from config (allows changing it after Vue init)
      if (config.axiosBaseURL && !requestConfig.baseURL) {
        requestConfig.baseURL = config.axiosBaseURL
      }

      // Dynamically apply token
      if (config.axiosToken && !requestConfig.headers['Authorization']) {
        requestConfig.headers['Authorization'] = `Bearer ${config.axiosToken}`
      }

      // Apply custom headers if provided in config
      if (config.axiosHeaders) {
        Object.assign(requestConfig.headers, config.axiosHeaders)
      }

      // Call custom request interceptor if defined
      if (config.axiosRequestInterceptor) {
        return config.axiosRequestInterceptor(requestConfig)
      }

      return requestConfig
    },
    (error) => {
      if (config.axiosRequestErrorInterceptor) {
        return config.axiosRequestErrorInterceptor(error)
      }
      return Promise.reject(error)
    }
  )

  // Add response interceptor
  httpInstance.interceptors.response.use(
    (response) => {
      if (config.axiosResponseInterceptor) {
        return config.axiosResponseInterceptor(response)
      }
      return response
    },
    (error) => {
      if (config.axiosResponseErrorInterceptor) {
        return config.axiosResponseErrorInterceptor(error)
      }
      return Promise.reject(error)
    }
  )
}

/**
 * Get the axios instance for user requests (uses baseURL)
 */
export function getHttpClient(): any {
  return httpInstance
}

/**
 * Get the axios instance for component loading (NO baseURL)
 */
export function getComponentHttpClient(): any {
  return componentInstance
}

/**
 * Reset axios instance with new config
 */
export function resetHttpClient(): void {
  httpInstance = axios.create()
  initHttpClient()
}

/**
 * HTTP Methods for Vue instance
 * These methods will be added to Vue.prototype
 */

/**
 * Make a GET request
 * @param url - Request URL
 * @param config - Axios request config
 */
export function httpGet(url: string, config?: any): Promise<any> {
  return httpInstance.get(url, config)
}

/**
 * Make a POST request
 * @param url - Request URL
 * @param data - Request body data
 * @param config - Axios request config
 */
export function httpPost(url: string, data?: any, config?: any): Promise<any> {
  return httpInstance.post(url, data, config)
}

/**
 * Make a PUT request
 * @param url - Request URL
 * @param data - Request body data
 * @param config - Axios request config
 */
export function httpPut(url: string, data?: any, config?: any): Promise<any> {
  return httpInstance.put(url, data, config)
}

/**
 * Make a PATCH request
 * @param url - Request URL
 * @param data - Request body data
 * @param config - Axios request config
 */
export function httpPatch(url: string, data?: any, config?: any): Promise<any> {
  return httpInstance.patch(url, data, config)
}

/**
 * Make a DELETE request
 * @param url - Request URL
 * @param config - Axios request config
 */
export function httpDelete(url: string, config?: any): Promise<any> {
  return httpInstance.delete(url, config)
}

/**
 * Make a HEAD request
 * @param url - Request URL
 * @param config - Axios request config
 */
export function httpHead(url: string, config?: any): Promise<any> {
  return httpInstance.head(url, config)
}

/**
 * Make an OPTIONS request
 * @param url - Request URL
 * @param config - Axios request config
 */
export function httpOptions(url: string, config?: any): Promise<any> {
  return httpInstance.options(url, config)
}

/**
 * Make a POST request with form data
 * @param url - Request URL
 * @param data - Form data
 * @param config - Axios request config
 */
export function httpPostForm(url: string, data?: any, config?: any): Promise<any> {
  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
  }
  return httpInstance.post(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(config?.headers || {})
    }
  })
}

/**
 * Make a PUT request with form data
 * @param url - Request URL
 * @param data - Form data
 * @param config - Axios request config
 */
export function httpPutForm(url: string, data?: any, config?: any): Promise<any> {
  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
  }
  return httpInstance.put(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(config?.headers || {})
    }
  })
}

/**
 * Make a PATCH request with form data
 * @param url - Request URL
 * @param data - Form data
 * @param config - Axios request config
 */
export function httpPatchForm(url: string, data?: any, config?: any): Promise<any> {
  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
  }
  return httpInstance.patch(url, formData, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(config?.headers || {})
    }
  })
}

/**
 * Make a custom request
 * @param requestConfig - Full axios request config
 */
export function httpRequest(requestConfig: any): Promise<any> {
  return httpInstance(requestConfig)
}

/**
 * Add a request interceptor
 * @param onFulfilled - Success callback
 * @param onRejected - Error callback
 */
export function addRequestInterceptor(
  onFulfilled?: (config: any) => any,
  onRejected?: (error: any) => any
): number {
  return httpInstance.interceptors.request.use(onFulfilled, onRejected)
}

/**
 * Add a response interceptor
 * @param onFulfilled - Success callback
 * @param onRejected - Error callback
 */
export function addResponseInterceptor(
  onFulfilled?: (response: any) => any,
  onRejected?: (error: any) => any
): number {
  return httpInstance.interceptors.response.use(onFulfilled, onRejected)
}

/**
 * Remove an interceptor
 * @param type - Interceptor type (request or response)
 * @param id - Interceptor ID
 */
export function removeInterceptor(type: 'request' | 'response', id: number): void {
  if (type === 'request') {
    httpInstance.interceptors.request.eject(id)
  } else {
    httpInstance.interceptors.response.eject(id)
  }
}
