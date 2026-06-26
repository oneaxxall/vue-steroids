import config from '../config'
import { debugLog } from './options'
import { httpPost } from './http'

/**
 * Native RTC Driver for PDS Vue Core
 * Implements Pusher/Reverb protocol over native WebSockets
 */
export class RTCDriver {
  private socket: WebSocket | null = null
  public state: any = null

  constructor() {
    const globalVue = (typeof window !== 'undefined') ? (window as any).Vue : null
    if (globalVue && globalVue.observable) {
      this.state = globalVue.observable({
        status: 'disconnected',
        socketId: null
      })
    } else {
      this.state = {
        status: 'disconnected',
        socketId: null
      }
    }
  }
  private channels: Record<string, boolean> = {}
  private eventListeners: Record<string, Record<string, Array<Function>>> = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private pingInterval: any = null


  private internalListeners: Record<string, Array<Function>> = {}

  private initAttempts = 0
  private initialized = false

  public init(): void {
    if (this.initialized) return

    // Ambil Vue secara global untuk memastikan referensi config sinkron
    const globalVue = (typeof window !== 'undefined') ? (window as any).Vue : null
    const socketConfig = globalVue?.config?.socket || (config as any).socket
    
    if (socketConfig && socketConfig.enabled) {
      this.initialized = true
      debugLog('[RTC] Socket enabled detected! Connecting to:', socketConfig.host)
      this.connect()
    } else if (this.initAttempts < 40) { // Coba selama 20 detik
      this.initAttempts++
      setTimeout(() => this.init(), 500)
    }
  }

  /**
   * Listen to internal RTC events (connected, disconnected, error, status)
   */
  public on(event: string, callback: Function): this {
    if (!this.internalListeners[event]) this.internalListeners[event] = []
    this.internalListeners[event].push(callback)
    return this
  }

  private emit(event: string, ...args: any[]): void {
    if (this.internalListeners[event]) {
      this.internalListeners[event].forEach(cb => cb(...args))
    }
    // Also emit to window for legacy support
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`rtc:${event}`, { detail: args[0] }))
    }
  }

  private getSocketConfig() {
    const globalVue = (typeof window !== 'undefined') ? (window as any).Vue : null
    return globalVue?.config?.socket || (config as any).socket
  }

  public connect(): void {
    if (this.state.status === 'connected' || this.state.status === 'connecting') return
    
    // 1. Cek apakah sudah ada socket aktif di instance ini atau di window
    const existingSocket = this.socket || (window as any).__PDS_RTC_WS_INSTANCE__
    
    if (existingSocket) {
      if (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING) {
        debugLog('[RTC] Connection already active or connecting. Skipping.')
        return
      }
      // Jika ada tapi tertutup, bersihkan
      this.socket = null
      ;(window as any).__PDS_RTC_WS_INSTANCE__ = null
    }

    const socketConfig = this.getSocketConfig()
    if (!socketConfig || !socketConfig.host) return

    const protocol = socketConfig.encrypted ? 'wss' : 'ws'
    const port = socketConfig.port ? `:${socketConfig.port}` : ''
    const key = socketConfig.key
    const version = '8.4.0-rc2'
    
    const url = `${protocol}://${socketConfig.host}${port}/app/${key}?protocol=7&client=js&version=${version}&flash=false`

    debugLog(`[RTC] Connecting to ${url}...`)
    this.updateStatus('connecting')

    try {
      this.socket = new WebSocket(url)
      ;(window as any).__PDS_RTC_WS_INSTANCE__ = this.socket
      this.setupSocketListeners()
    } catch (e) {
      console.error('[RTC] Connection failed', e)
      this.handleReconnect()
    }
  }

  private updateStatus(newStatus: 'disconnected' | 'connecting' | 'connected'): void {
    this.state.status = newStatus
    this.emit('status', newStatus)
    if (newStatus === 'connected') this.emit('connected', { socketId: this.state.socketId })
    if (newStatus === 'disconnected') this.emit('disconnected')
  }

  private setupSocketListeners(): void {
    if (!this.socket) return

    this.socket.onopen = () => {
      debugLog('[RTC] WebSocket Opened, waiting for connection_established...')
      this.reconnectAttempts = 0
      this.startPing()
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleMessage(data)
    }

    this.socket.onclose = () => {
      this.updateStatus('disconnected')
      this.stopPing()
      this.handleReconnect()
    }

    this.socket.onerror = (error) => {
      console.error('[RTC] WebSocket Error', error)
      this.emit('error', error)
    }
  }

  private handleMessage(data: any): void {
    if (data.event === 'pusher:connection_established') {
      const content = JSON.parse(data.data)
      this.state.socketId = content.socket_id
      debugLog(`[RTC] Connection Established. Socket ID: ${this.state.socketId}`)
      this.updateStatus('connected')

      // Re-subscribe HANYA setelah socketId siap
      Object.keys(this.channels).forEach(channelName => {
        this.authenticateChannel(channelName)
      })
    } else if (data.event === 'pusher:ping') {
      this.send('pusher:pong')
    }

    // Handle Presence Events
    if (data.event === 'pusher_internal:subscription_succeeded' && data.channel?.startsWith('presence-')) {
      try {
        const presenceData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data
        if (presenceData.presence) {
          const users = Object.values(presenceData.presence.hash).map((u: any) => {
            if (u && u.id !== undefined) u.id = String(u.id)
            return u
          })
          debugLog(`[RTC] Presence: ${data.channel} - ${users.length} users online`)
          this.emit(`presence:${data.channel}:here`, users)
        }
      } catch (e) {
        console.error('[RTC] Gagal parse presence here data', e)
      }
    } else if (data.event === 'pusher_internal:member_added' || data.event === 'member_added') {
      try {
        const member = typeof data.data === 'string' ? JSON.parse(data.data) : data.data
        const userInfo = { ...(member.user_info || member.info || member) }
        const userId = member.user_id || userInfo.id
        if (userId !== undefined) userInfo.id = String(userId)
        
        debugLog(`[RTC] Presence: User joining ${data.channel}`, userInfo)
        this.emit(`presence:${data.channel}:joining`, userInfo)
      } catch (e) {
        console.error('[RTC] Gagal parse presence joining data', e)
      }
    } else if (data.event === 'pusher_internal:member_removed' || data.event === 'member_removed') {
      try {
        const member = typeof data.data === 'string' ? JSON.parse(data.data) : data.data
        const userInfo = { ...(member.user_info || member.info || member) }
        const userId = member.user_id || userInfo.id
        if (userId !== undefined) userInfo.id = String(userId)

        debugLog(`[RTC] Presence: User leaving ${data.channel}`, userInfo)
        this.emit(`presence:${data.channel}:leaving`, userInfo)
      } catch (e) {
        console.error('[RTC] Gagal parse presence leaving data', e)
      }
    }

    if (data.channel && this.eventListeners[data.channel]) {
      const eventName = data.event
      if (this.eventListeners[data.channel][eventName]) {
        try {
          const payload = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data || {})
          this.eventListeners[data.channel][eventName].forEach(cb => cb(payload))
        } catch (e) {
          console.error(`[RTC] Gagal parse event payload untuk ${eventName}`, e)
        }
      }
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      debugLog(`[RTC] Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts})`)
      setTimeout(() => this.connect(), delay)
    }
  }

  private startPing(): void {
    this.stopPing()
    this.pingInterval = setInterval(() => {
      this.send('pusher:ping', {})
    }, 15000)
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private send(event: string, data: any = {}, channel?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const payload: any = { event, data }
      if (channel) payload.channel = channel
      this.socket.send(JSON.stringify(payload))
    }
  }

  public channel(name: string) {
    let channelName = name
    
    // Jangan double prefix jika sudah ada
    if (name.startsWith('private-') || name.startsWith('presence-')) {
      channelName = name
    }

    if (!this.channels[channelName]) {
      this.channels[channelName] = true
      if (this.state.status === 'connected' && this.state.socketId) {
        this.sendSubscribe(channelName)
      }
    }

    const channelObj: any = {
      listen: (event: string, callback: Function) => {
        // Normalisasi event name (hapus titik di depan)
        const normalizedEvent = event.startsWith('.') ? event.substring(1) : event
        if (!this.eventListeners[channelName]) this.eventListeners[channelName] = {}
        if (!this.eventListeners[channelName][normalizedEvent]) this.eventListeners[channelName][normalizedEvent] = []
        this.eventListeners[channelName][normalizedEvent].push(callback)
        return channelObj
      },
      stopListening: (event: string, callback?: Function) => {
        if (this.eventListeners[name] && this.eventListeners[name][event]) {
          if (callback) {
            this.eventListeners[name][event] = this.eventListeners[name][event].filter(cb => cb !== callback)
          } else {
            delete this.eventListeners[name][event]
          }
        }
        return channelObj
      },
      whisper: (event: string, data: any) => {
        this.send(`client-${event}`, data, name)
        return channelObj
      },
      listenForWhisper: (event: string, callback: Function) => {
        return channelObj.listen(`client-${event}`, callback)
      },
      error: (callback: Function) => {
        this.on('error', callback)
        return channelObj
      }
    }

    return channelObj
  }

  public join(name: string) {
    let presenceName = name
    if (!name.startsWith('presence-')) {
      presenceName = `presence-${name}`
    }
    
    const channel = this.channel(presenceName)
    const presenceObj: any = {
      ...channel,
      here: (callback: Function) => {
        this.on(`presence:${presenceName}:here`, callback)
        return presenceObj
      },
      joining: (callback: Function) => {
        this.on(`presence:${presenceName}:joining`, callback)
        return presenceObj
      },
      leaving: (callback: Function) => {
        this.on(`presence:${presenceName}:leaving`, callback)
        return presenceObj
      },
      error: (callback: Function) => {
        this.on('error', callback)
        return presenceObj
      }
    }
    return presenceObj
  }

  public leave(name: string): void {
    let targetName = name
    
    // Cari nama channel yang cocok (dengan atau tanpa prefix)
    if (!this.channels[targetName]) {
      if (this.channels[`private-${name}`]) targetName = `private-${name}`
      else if (this.channels[`presence-${name}`]) targetName = `presence-${name}`
    }

    if (this.channels[targetName]) {
      delete this.channels[targetName]
      delete this.eventListeners[targetName]
      this.sendUnsubscribe(targetName)
    } else {
      debugLog(`[RTC] Warning: Attempted to leave channel ${name} but it was not subscribed.`)
    }
  }

  private sendUnsubscribe(channelName: string): void {
    debugLog(`[RTC] Unsubscribing from channel: ${channelName}`)
    this.send('pusher:unsubscribe', { channel: channelName })
  }

  private sendSubscribe(channelName: string): void {
    if (channelName.startsWith('private-') || channelName.startsWith('presence-')) {
      this.authenticateChannel(channelName)
    } else {
      debugLog(`[RTC] Subscribing to public channel: ${channelName}`)
      this.send('pusher:subscribe', { channel: channelName })
    }
  }

  private async authenticateChannel(channelName: string): Promise<void> {
    if (!this.state.socketId) {
      debugLog(`[RTC] Delaying auth for ${channelName}, socketId not ready`)
      return
    }

    try {
      const globalVue = (typeof window !== 'undefined') ? (window as any).Vue : null
      const socketConfig = globalVue?.config?.socket || (config as any).socket
      const authEndpoint = socketConfig.authEndpoint || '/broadcasting/auth'
      
      debugLog(`[RTC] Authenticating ${channelName}...`)
      
      const response = await httpPost(authEndpoint, {
        socket_id: this.state.socketId,
        channel_name: channelName
      })

      // Axios returns data in .data
      const authData = response.data || response

      debugLog(`[RTC] Authenticated ${channelName}`)
      this.send('pusher:subscribe', {
        channel: channelName,
        auth: authData.auth,
        channel_data: authData.channel_data
      })
    } catch (e) {
      console.error(`[RTC] Authentication failed for ${channelName}`, e)
    }
  }

  public getStatus(): string {
    return this.state.status
  }

  public getSocketId(): string | null {
    return this.state.socketId
  }
}

export function getRtcClient(): RTCDriver {
  const global = (typeof window !== 'undefined') ? (window as any) : {}
  if (!global.__PDS_RTC_INSTANCE__) {
    global.__PDS_RTC_INSTANCE__ = new RTCDriver()
  }
  return global.__PDS_RTC_INSTANCE__
}

export function initRtcClient(): void {
  const global = (typeof window !== 'undefined') ? (window as any) : {}
  if (global.__PDS_RTC_INIT_STARTED__) return
  global.__PDS_RTC_INIT_STARTED__ = true

  const rtc = getRtcClient()
  debugLog('[RTC] Native Driver Initialized')
  rtc.init()
  
  if (typeof window !== 'undefined') {
    global.HelperRTC = rtc
  }
}
