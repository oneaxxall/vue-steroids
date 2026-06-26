# 🚀 Configuration Guide & Component Options for PDS Vue Dev (Steroids Edition)

This document contains a comprehensive list of all Global Configuration (`Vue.config`) and new Component Options exclusively added to the "Vue 2 Steroids" architecture.

---

## 🌍 1. Global Configuration (`Vue.config`)

You can set this configuration in your application's *entry point* (e.g., in `main.js` or during application *bootstraping*).

### 📡 A. HTTP & Axios Config
Internally, Steroids uses Axios which is already *wrapped* inside Vue. You can configure its default *behaviour* globally:

```javascript
// Base URL for all requests
Vue.config.axiosBaseURL = 'https://api.domain.com/v1';

// Default Bearer Token (Automatically added to Authorization header)
Vue.config.axiosToken = 'eyJhbGciOiJIUzI1Ni...';

// Request timeout in milliseconds (0 = no timeout)
Vue.config.axiosTimeout = 10000;

// Custom default headers
Vue.config.axiosHeaders = {
    'X-Client-App': 'PDS-Superapps'
};

// Global Interceptors (Useful for logging or request/response manipulation)
Vue.config.axiosRequestInterceptor = (config) => {
    console.log('Sending Request to:', config.url);
    return config;
};

Vue.config.axiosResponseInterceptor = (response) => {
    return response.data; // Return data directly, skip axios wrapper
};

Vue.config.axiosResponseErrorInterceptor = (error) => {
    if (error.response && error.response.status === 401) {
        alert('Session expired, please login again.');
    }
    return Promise.reject(error);
};
```

### 🧩 B. Dynamic Component Loader Config
To configure the *lazy-loading* behavior of `.tpl` components via AJAX:

```javascript
// Base folder where component files are located
Vue.config.componentPath = '/app/components';

// Component file extension (default: '.tpl')
Vue.config.componentExtension = '.tpl';

// Fallback component name if the file fails to load
Vue.config.componentFallback = 'component-notfound';

// Auto-fetch: if a component is called via <my-comp> tag but is not registered,
// Vue will automatically look for it on the server (default: false)
Vue.config.autoFetchComponents = true;
```

### ⚡ C. Socket / RTC Config
Settings for the native Real-Time Communication feature (replacement for pusher-js/Echo).

```javascript
Vue.config.socket = {
    enabled: true,                  // Enable socket connection on start
    broadcaster: 'pusher',          // Driver (currently 'pusher')
    key: 'pds_reverb_key',          // App Key (for Reverb/Pusher)
    host: 'ws.pusher.local',        // WebSocket server host
    port: 80,                       // Port
    forceTLS: false,                // Use WSS (Secure)
    authEndpoint: '/broadcasting/auth' // Endpoint for private/presence channel authentication
};
```

### 💾 D. Global Store Config
Initialization of the built-in *State Management* (replacement for Vuex).

```javascript
Vue.config.store = {
    state: { theme: 'dark' },
    mutations: { SET_THEME(state, t) { state.theme = t; } }
};
```

---

## 🏗️ 2. New Component Options

In addition to standard Vue 2 options (such as `data`, `methods`, `computed`, `mounted`), "Steroids" adds several specialized *options blocks* to make code cleaner and more functional.

### 🌐 A. `api` Option (API Namespace)
Separates HTTP call functions from `methods` so UI logic and Server Data are not mixed.

```javascript
module.exports = {
    data() {
        return { users: [] };
    },
    
    // New option: api
    api: {
        fetchUsers() {
            // "this" is automatically bound to the component instance
            // You can use built-in methods: this.get, this.post, this.put, this.delete
            return this.get('/api/users');
        },
        updateUser(id, payload) {
            return this.post(`/api/users/${id}`, payload);
        }
    },
    
    methods: {
        async loadData() {
            // How to call it: this.api.functionName()
            const response = await this.api.fetchUsers();
            this.users = response.data;
        }
    }
}
```

### 🎣 B. `hooks` Option (Event Helpers with Auto-Cleanup)
A *life-hack* for adding advanced *event listeners* without worrying about memory leaks. All events here are **automatically removed** when the component is destroyed. Runs shortly after `created`.

```javascript
module.exports = {
    // New option: hooks
    hooks() {
        // 1. Detect click outside element with $refs="modalBody"
        this.onClickOutside('modalBody', () => {
            this.closeModal();
        });

        // 2. Detect Escape key
        this.onEscape(() => {
            this.closeModal();
        });

        // 3. Detect Scroll on window or specific element
        this.onScroll(window, () => {
            this.isScrolled = window.scrollY > 100;
        });

        // 4. Detect Resize
        this.onWindowResize(() => {
            this.isMobile = window.innerWidth < 768;
        }, { immediate: true });

        // 5. Create a Debounce function (e.g., for text input)
        this.debouncedSearch = this.useDebounce((query) => {
            this.api.search(query);
        }, 500); // Wait 500ms after the user stops typing
        
        // 6. Create a Throttle function
        this.throttledScroll = this.useThrottle(() => {
            console.log('Scroll tick');
        }, 200); // Called at most 1 time per 200ms
    }
}
```

### 📡 C. `rtc` Option (Real-Time Communication)
A dedicated place for listening to *realtime events* via WebSocket. Automatically executed when the component is mounted and has full access to the component instance.

```javascript
module.exports = {
    // New option: rtc
    rtc() {
        // Join a presence channel
        this.$echo.join('meeting-room')
            .here((users) => {
                this.onlineUsers = users;
            })
            .joining((user) => {
                this.onlineUsers.push(user);
            })
            .leaving((user) => {
                this.onlineUsers = this.onlineUsers.filter(u => u.id !== user.id);
            });

        // Listen to a private channel
        this.$echo.private(`user.${this.currentUser.id}`)
            .listen('.NotificationReceived', (data) => {
                alert(data.message);
            });
    }
}
```

---

## 🛠️ 3. New Instance Methods & Properties (Global Helpers)

All your Vue components automatically have these helper methods (*available under* `this`).

### 🌍 A. HTTP Helper (Built-in Axios)
- `this.get(url, config)`
- `this.post(url, data, config)`
- `this.put(url, data, config)`
- `this.patch(url, data, config)`
- `this.delete(url, config)`
- `this.postForm(url, formData)` ➔ Automatically sets `Content-Type: multipart/form-data`

### ⚡ B. Realtime Helper (RTC)
- `this.$echo` ➔ Direct access to the RTC driver (fully compatible with Laravel Echo syntax).
- `this.$channel('news')` ➔ Shortcut to subscribe to a public channel.
- `this.$private('user.1')` ➔ Shortcut to subscribe to a private channel (automatically prefixed with `private-`).
- `this.$join('chat')` ➔ Shortcut to a presence channel (automatically prefixed with `presence-`).
- `this.$leave('chat')` ➔ Leave a channel.

### 💾 C. Storage Helper
- `this.$storage.set('key', 'value')`
- `this.$storage.get('key', 'defaultValue')`
- `this.$storage.setExpiring('token', 'abc', 3600000)` ➔ Set TTL in ms (automatically deleted on expiry).
- `this.$storage.watch('theme', (key, newVal) => {...})` ➔ Reactive watcher for a specific key.

### 🧭 D. Route Helper (Route Watcher)
Access navigation info without the Vue Router library.
- `this.$route.path` ➔ Current path (e.g., `/admin/users/123`).
- `this.$route.query` ➔ Query parameter object `?sort=desc`.
- `this.$route.hash` ➔ String after `#`.
- `this.$route.path1` to `this.$route.path5` ➔ Reactive extraction of path segments (e.g., path1 = `admin`, path2 = `users`).
- `this.$route.push('/new-url')` ➔ Navigate to page (adds to history).
- `this.$route.replace('/new-url')` ➔ Navigate to page (replaces history).

### 🧩 E. Dynamic Components Helper
Used to load additional UI components *on-the-fly* via AJAX.
- `this.fetchDynamicComponent('card-user', '/ui/card-user')`
- `this.fetchDynamicComponents([{ name: 'btn-play', path: '/ui/btn-play' }])`
- `this.loadAsyncComponent(...)`

### 📦 F. Require Helper (Native Module System)
Standard *CommonJS* call pattern directly in the browser.
- `const utils = require('/app/helpers/utils')` ➔ Loads `.js` module synchronously (Sync XHR fallback).
- `const bigLib = await requireAsync('/app/vendors/chart')` ➔ Loads asynchronously.

---

> By leveraging the full combination of `Vue.config`, *component options (`api`, `hooks`, `rtc`)*, and helper instruments (`this.*`), writing Front-End code in the PDS Superapps application can become very clean, readable, and modular (scalable).
