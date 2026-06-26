import { getRtcClient } from '../util/rtc'

/**
 * Initialize RTC methods on Vue prototype
 * This provides convenient Real-time methods directly on Vue instances
 */
export function initRtc(Vue: any) {
  const rtc = getRtcClient()
  
  // Make the state reactive
  const reactiveState = Vue.observable(rtc.state)
  rtc.state = reactiveState // Replace with reactive version

  /**
   * Get the global RTC client
   */
  Vue.prototype.$rtc = rtc

  /**
   * Subscribe to a channel and listen for an event
   * Shortcut for this.$rtc.channel(name).listen(event, callback)
   * @param channel - Channel name
   * @param event - Event name
   * @param callback - Event handler
   */
  Vue.prototype.$listen = function (channel: string, event: string, callback: Function) {
    return getRtcClient().channel(channel).listen(event, callback)
  }

  /**
   * Access a channel
   * @param name - Channel name
   */
  Vue.prototype.$channel = function (name: string) {
    return getRtcClient().channel(name)
  }

  /**
   * Access a private channel
   * @param name - Channel name
   */
  Vue.prototype.$private = function (name: string) {
    const privateName = name.startsWith('private-') ? name : `private-${name}`
    return getRtcClient().channel(privateName)
  }

  /**
   * Join a presence channel
   * @param name - Channel name
   */
  Vue.prototype.$join = function (name: string) {
    return getRtcClient().join(name)
  }

  /**
   * Leave a channel
   * @param name - Channel name
   */
  Vue.prototype.$leave = function (name: string) {
    return getRtcClient().leave(name)
  }

  /**
   * Laravel Echo Compatibility Alias
   */
  Vue.prototype.$echo = {
    channel: (name: string) => getRtcClient().channel(name),
    private: (name: string) => {
      const privateName = name.startsWith('private-') ? name : `private-${name}`
      return getRtcClient().channel(privateName)
    },
    join: (name: string) => getRtcClient().join(name),
    leave: (name: string) => getRtcClient().leave(name)
  }
}

/**
 * Initialize rtc option in components
 * This allows defining rtc listeners in a dedicated 'rtc' block
 */
export function initRtcOptions(vm: any) {
  const rtc = vm.$options.rtc
  
  if (typeof rtc === 'function') {
    rtc.call(vm)
  } else if (Array.isArray(rtc)) {
    rtc.forEach((fn: Function) => {
      fn.call(vm)
    })
  }
}
