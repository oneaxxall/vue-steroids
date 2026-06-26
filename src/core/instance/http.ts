import {
  httpGet,
  httpPost,
  httpPut,
  httpPatch,
  httpDelete,
  httpHead,
  httpOptions,
  httpPostForm,
  httpPutForm,
  httpPatchForm,
  httpRequest,
  getHttpClient,
  addRequestInterceptor,
  addResponseInterceptor,
  removeInterceptor
} from '../util/http'
import { fetchDynamicComponent, fetchDynamicComponents, loadAsyncComponent } from '../util/dynamic-component-loader'

/**
 * Initialize HTTP methods on Vue prototype
 * This provides convenient HTTP methods directly on Vue instances
 */
export function initHttp(Vue: any) {
  /**
   * Make a GET request
   * @param url - Request URL
   * @param config - Axios request config
   * @example
   * this.get('/api/users')
   * this.get('/api/users', { params: { page: 1 } })
   */
  Vue.prototype.get = function (url: string, config?: any) {
    return httpGet(url, config)
  }

  /**
   * Make a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request config
   * @example
   * this.post('/api/users', { name: 'John' })
   */
  Vue.prototype.post = function (url: string, data?: any, config?: any) {
    return httpPost(url, data, config)
  }

  /**
   * Make a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request config
   * @example
   * this.put('/api/users/1', { name: 'Jane' })
   */
  Vue.prototype.put = function (url: string, data?: any, config?: any) {
    return httpPut(url, data, config)
  }

  /**
   * Make a PATCH request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request config
   * @example
   * this.patch('/api/users/1', { name: 'Jane' })
   */
  Vue.prototype.patch = function (url: string, data?: any, config?: any) {
    return httpPatch(url, data, config)
  }

  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param config - Axios request config
   * @example
   * this.delete('/api/users/1')
   */
  Vue.prototype.delete = function (url: string, config?: any) {
    return httpDelete(url, config)
  }

  /**
   * Make a HEAD request
   * @param url - Request URL
   * @param config - Axios request config
   * @example
   * this.head('/api/users')
   */
  Vue.prototype.head = function (url: string, config?: any) {
    return httpHead(url, config)
  }

  /**
   * Make an OPTIONS request
   * @param url - Request URL
   * @param config - Axios request config
   * @example
   * this.options('/api/users')
   */
  Vue.prototype.options = function (url: string, config?: any) {
    return httpOptions(url, config)
  }

  /**
   * Make a POST request with form data
   * @param url - Request URL
   * @param data - Form data
   * @param config - Axios request config
   * @example
   * this.postForm('/api/upload', { file: fileInput.files[0] })
   */
  Vue.prototype.postForm = function (url: string, data?: any, config?: any) {
    return httpPostForm(url, data, config)
  }

  /**
   * Make a PUT request with form data
   * @param url - Request URL
   * @param data - Form data
   * @param config - Axios request config
   * @example
   * this.putForm('/api/users/1/avatar', { avatar: fileInput.files[0] })
   */
  Vue.prototype.putForm = function (url: string, data?: any, config?: any) {
    return httpPutForm(url, data, config)
  }

  /**
   * Make a PATCH request with form data
   * @param url - Request URL
   * @param data - Form data
   * @param config - Axios request config
   * @example
   * this.patchForm('/api/users/1/avatar', { avatar: fileInput.files[0] })
   */
  Vue.prototype.patchForm = function (url: string, data?: any, config?: any) {
    return httpPatchForm(url, data, config)
  }

  /**
   * Make a custom HTTP request
   * @param config - Full axios request config
   * @example
   * this.request({ method: 'GET', url: '/api/users' })
   */
  Vue.prototype.request = function (config: any) {
    return httpRequest(config)
  }

  /**
   * Get the underlying axios instance
   * @example
   * this.$http.interceptors.request.use(...)
   */
  Vue.prototype.$http = getHttpClient()

  /**
   * Add a request interceptor
   * @param onFulfilled - Success callback
   * @param onRejected - Error callback
   * @example
   * this.$addRequestInterceptor((config) => {
   *   config.headers.Authorization = 'Bearer ' + getToken()
   *   return config
   * })
   */
  Vue.prototype.$addRequestInterceptor = function (
    onFulfilled?: (config: any) => any,
    onRejected?: (error: any) => any
  ) {
    return addRequestInterceptor(onFulfilled, onRejected)
  }

  /**
   * Add a response interceptor
   * @param onFulfilled - Success callback
   * @param onRejected - Error callback
   * @example
   * this.$addResponseInterceptor((response) => {
   *   return response.data
   * })
   */
  Vue.prototype.$addResponseInterceptor = function (
    onFulfilled?: (response: any) => any,
    onRejected?: (error: any) => any
  ) {
    return addResponseInterceptor(onFulfilled, onRejected)
  }

  /**
   * Remove an interceptor
   * @param type - Interceptor type (request or response)
   * @param id - Interceptor ID
   * @example
   * this.$removeInterceptor('request', interceptorId)
   */
  Vue.prototype.$removeInterceptor = function (
    type: 'request' | 'response',
    id: number
  ) {
    removeInterceptor(type, id)
  }

  /**
   * Fetch and register a dynamic component from server
   * @param name - Component name
   * @param pathOrOptions - Path to component file or options object
   * @param optionsOrFallback - Options object or fallback component name
   * @example
   * this.fetchDynamicComponent('input-text', '/input/input-text')
   * this.fetchDynamicComponent('input-text', '/input/input-text', 'component-notfound')
   * this.fetchDynamicComponent({ name: 'input-text', path: '/input/input-text', fallbackComponent: 'component-notfound' })
   */
  Vue.prototype.fetchDynamicComponent = async function (
    name: string,
    pathOrOptions?: string | any,
    optionsOrFallback?: any
  ) {
    return fetchDynamicComponent(name, pathOrOptions, optionsOrFallback)
  }

  /**
   * Fetch and register multiple dynamic components
   * @param components - Array of component objects with name and path
   * @example
   * this.fetchDynamicComponents([
   *   { name: 'input-text', path: '/input/input-text' },
   *   { name: 'button-primary', path: '/button/button-primary' }
   * ])
   */
  Vue.prototype.fetchDynamicComponents = async function (
    components: Array<{ name: string; path: string }>
  ) {
    return fetchDynamicComponents(components)
  }

  /**
   * Load async component from custom path
   * Same parameter format as fetchDynamicComponent
   * @param nameOrComponents - Component name (string) OR component object OR array of objects
   * @param pathOrOptions - Path (if nameOrComponents is string) OR options object
   * @param optionsOrFallback - Additional options or fallback component name
   * @example
   * // String path + options
   * await this.loadAsyncComponent('my-comp', '/custom/path/component', { extension: '.vue' })
   * 
   * // Options object with path
   * await this.loadAsyncComponent({
   *   name: 'my-comp',
   *   path: '/custom/path/component',
   *   extension: '.vue'
   * })
   * 
   * // Multiple components - Array
   * await this.loadAsyncComponent([
   *   { name: 'header', path: '/layout/header' },
   *   { name: 'footer', path: '/layout/footer' }
   * ])
   */
  Vue.prototype.loadAsyncComponent = async function (
    nameOrComponents: string | any | any[],
    pathOrOptions?: string | any,
    optionsOrFallback?: any
  ) {
    return loadAsyncComponent(nameOrComponents, pathOrOptions, optionsOrFallback)
  }
}
