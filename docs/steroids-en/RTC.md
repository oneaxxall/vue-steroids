# PDS Vue Native RTC (Real-Time Communication)

This RTC feature is a native WebSocket implementation integrated directly into the Vue core. It is designed to replace external dependencies like `pusher-js` and `laravel-echo`, thereby reducing bundle size and improving performance.

## 🚀 Key Features
- **Zero Dependency**: Uses the native browser `WebSocket` (~80KB lighter).
- **Auto-Authentication**: Supports Private and Presence channels with automatic handshake.
- **Echo-Compatible API**: Syntax familiar to Laravel Echo users.
- **Integrated Options**: Supports an `rtc` block directly in the component structure.
- **Echo Compatibility**: Available via `this.$echo` for easy migration.
- **Global Access**: Available via `this.$rtc`, `this.$echo`, and `window.HelperRTC`.

## ⚙️ Configuration
Add the following configuration to your application's `app.config.json` file:

```json
{
  "socket": {
    "enabled": true,
    "broadcaster": "pusher",
    "key": "pds_reverb_key",
    "host": "ws.pusher.local",
    "port": 80,
    "forceTLS": false,
    "authEndpoint": "/broadcasting/auth"
  }
}
```

## 🔌 Initialization (Automatic)
This RTC feature supports **Auto-Initialization**. You **NO LONGER NEED** to call `Vue.rtc.init()` manually.

### How It Works:
As soon as the application sets the configuration to `Vue.config.socket` (usually during bootstrap), the RTC Driver detects the change and automatically connects if `enabled: true`.

```javascript
// In libraries/core/main.js, just do this (Standard Steroids):
setVueConfig : function (appConfig) {
    Object.entries(appConfig).forEach(([key, value]) => {
        Vue.config[key] = value; // RTC auto-connects here!
    });
}
```

## 🔐 Authentication (Bearer Token)
This RTC feature **automatically** uses the authentication system from the core framework. You don't need to manually set the Authorization header for sockets.

### How It Works:
1. When subscribing to a `private-` or `presence-` channel, the driver triggers a handshake to `authEndpoint`.
2. This handshake uses the internal `httpPost` helper.
3. The helper automatically retrieves the token from `Vue.config.axiosToken` or storage.

## 📖 Usage (API)

### 1. RTC Option (Recommended)
The cleanest way to define realtime listeners within a component. This option is automatically executed when the component is initialized.

```javascript
module.exports = {
    rtc: function() {
        this.$echo.channel('chat-room')
            .listen('.NewMessage', this.onNewMessage)
            .listen('.UserJoined', (data) => {
                this.users.push(data.user);
            });
    },
    methods: {
        onNewMessage: function(data) {
            this.messages.push(data);
        }
    }
}
```

### 2. Echo API (Preferred for Migration)
The easiest way to migrate your old Laravel Echo code. The syntax is identical.

```javascript
// Listen to public channel
this.$echo.channel('news').listen('.Update', (e) => { ... });

// Listen to private channel (Auto-prefix 'private-')
this.$echo.private('user.1').listen('.Notify', (e) => { ... });

// Join a Presence channel (Auto-prefix 'presence-')
this.$echo.join('whiteboard')
    .here(users => ...)
    .joining(user => ...)
    .leaving(user => ...);

// Leave a channel
this.$echo.leave('news');
```

### 3. Simple Listen Shortcuts
A quick way to listen for events on a specific channel (Shortcut).

```javascript
this.$channel('chat')
    .listen('MessageSent', (data) => {
        console.log('New message:', data.message);
    });

// Stop listening to a specific event
this.$channel('chat').stopListening('MessageSent');

// Leave the channel entirely
this.$leave('chat');
```

### 🔐 Private Channels
For channels that require backend authentication (automatic handshake):

```javascript
this.$private('user.' + userId)
    .listen('.UpdateEvent', (data) => {
        console.log('Private update:', data);
    });
```

### 💨 Whisper (Client Events)
Send data between clients directly (P2P via socket server) without going through the database/backend. The driver automatically handles the `client-` prefix:

```javascript
// Send whisper
this.$channel('chat').whisper('typing', { user: 'Me' });

// Receive whisper
this.$channel('chat').listenForWhisper('typing', (data) => {
    console.log(data.user + ' is typing...');
});
```

### 👥 Presence Channels (Collaboration)
For features that need a list of online users (like whiteboard or group chat):

```javascript
this.$join('whiteboard')
    .here((users) => {
        console.log('Online users:', users);
    })
    .joining((user) => {
        console.log(user.name + ' just joined');
    })
    .leaving((user) => {
        console.log(user.name + ' left');
    })
    .listen('.WhiteboardUpdated', (data) => {
        this.syncBoard(data);
    });
```

### 3. Manual Channel Management
For use inside methods or other lifecycle hooks.

```javascript
this.$channel('chat-room')
    .listen('.NewMessage', (e) => { ... });
```

## 📦 Migration (Removing Old Dependencies)
After using this native feature, you must remove the old libraries for optimization:
1. Remove `pusher.min.js` and `echo.min.js` from `libraries/app.assets.js`.
2. Remove the library entries from the `scripts/packjs` script.
3. Re-build your application to get a smaller bundle size.

## 📡 Connection Status Monitoring

You no longer need to use manual `addEventListener`. There are two much easier ways:

### 1. Reactive Way (In Template)
Connection status is now reactive. You can use it directly in HTML or Computed Properties.

```html
<!-- Status will change automatically: disconnected -> connecting -> connected -->
<div :class="['status-badge', $rtc.state.status]">
    Status: {{ $rtc.state.status }}
</div>
```

### 2. Event Listener (In RTC Block)
Use the `.on()` method to catch status changes specifically.

```javascript
rtc: function() {
    this.$rtc
        .on('connected', (data) => {
            console.log('Awesome! Connected with ID:', data.socketId);
        })
        .on('disconnected', () => {
            console.warn('Uh oh, connection lost...');
        })
        .on('error', (err) => {
            console.error('Socket error:', err);
        });
}
```

## 🛠️ Troubleshooting
- Type **`window.HelperRTC.state`** or **`this.$echo`** in the console to see the active state.
- Connection status is reactive! You can use it in a template: `<div v-if="$rtc.state.status === 'connected'">...</div>`.
- Use **`this.$echo.leave('channel-name')`** in the `beforeDestroy` hook to save socket resources.
