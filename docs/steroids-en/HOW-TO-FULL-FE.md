# Complete Guide to PDS Vue Dev (Steroids Edition)

Welcome to the main documentation for PDS Vue Dev (Steroids Edition). This framework is a deep modification (fork) of Vue 2.7.16 that has been equipped with various modern built-in features. The main goal of this modification is to provide a Developer Experience (DX) equivalent to Vue 3 or other modern libraries, but **without requiring a single external dependency**.

Here is the complete guide to the "Steroids" features ready for you to use.

---

## 1. Integrated State Management (Vuex Replacement)
You don't need to install `vuex` or `pinia`. State management is already integrated directly into the Vue instance.

**Global Configuration:**
```javascript
Vue.config.store = {
    state: { count: 0, user: null },
    getters: { isLoggedIn: state => !!state.user },
    mutations: { SET_COUNT(state, val) { state.count = val; } },
    actions: { 
        async fetchUser({ commit }) {
            // fetch logic
        }
    },
    modules: { /* support modularity */ }
};
```

**Usage in Components:**
- Access: `this.$store.state.count` or `this.$store.getters.isLoggedIn`
- Execute: `this.$store.commit('SET_COUNT', 1)` or `this.$store.dispatch('fetchUser')`
- Helpers Available: `...Vue.mapState`, `...Vue.mapGetters`, `...Vue.mapMutations`, `...Vue.mapActions`

---

## 2. API / HTTP Calls (`api` Namespace)
Instead of piling up HTTP request logic inside `methods`, this framework provides a dedicated `api` block to keep code cleaner (Separation of Concerns).

```javascript
module.exports = {
    data() { return { users: [] }; },
    // API Block
    api: {
        getUsers() {
            // this.get, this.post are automatically available and bound to Vue
            return this.get('/api/users');
        }
    },
    mounted() {
        // Easy access
        this.api.getUsers().then(res => this.users = res.data);
    }
}
```

---

## 3. Native Module System (`require`)
Without using a *bundler* like Webpack/Vite, you can isolate logic into JavaScript files and call them like Node.js.

- **Regular JS File (`/app/util/math.js`)**:
  ```javascript
  module.exports = { add: (a, b) => a + b };
  ```
- **Inside a Component (`.tpl`)**:
  ```javascript
  // Synchronous
  const math = require('/app/util/math'); 
  // Asynchronous
  const bigModule = await requireAsync('/app/large-lib');
  ```
*Note: Loaded modules are automatically cached in browser memory.*

---

## 4. Real-Time Communication / RTC (Pusher JS & Echo Replacement)
You don't need `pusher-js` or `laravel-echo`. The WebSocket system is already integrated and is much lighter.

```javascript
module.exports = {
    // RTC Block (Automatically starts when component loads)
    rtc: function() {
        this.$echo.join('meeting-room')
            .here(users => console.log('Online users:', users))
            .joining(user => console.log(user.name, 'joined'))
            .listen('.NewMessage', data => console.log(data));
    }
}
```
*This feature also handles Bearer Token authentication automatically!*

---

## 5. Built-in Hooks / Helpers (VueUse Replacement)
Advanced reactive functions can be accessed via the new `hooks` block. Its standout feature is **Auto-Cleanup** (Event listeners are automatically removed when the component is destroyed).

```javascript
module.exports = {
    hooks() {
        // Click outside ref "modal"
        this.onClickOutside('modal', () => this.close());
        
        // Press Escape
        this.onEscape(() => this.close());
        
        // Debounce (Very useful for search input)
        this.debouncedSearch = this.useDebounce((val) => this.fetch(val), 300);
        
        // Throttle (Scroll, Resize)
        this.onScroll(window, this.useThrottle(() => console.log('scroll'), 100));
    }
}
```

---

## 6. Dynamic Component Loader (AJAX Component)
Can load components from the server *on-the-fly* via AJAX, even after the page has loaded.

```javascript
// Inside methods or hooks:
async loadMyComponent() {
    // Fetches /components/ui/card-user.tpl and renders it as <card-user>
    await this.fetchDynamicComponent('card-user', '/ui/card-user');
}
```

---

## 7. Storage Management (store.js Replacement)
localStorage management with *expire* (TTL) capability, cross-tab synchronization, and *reactivity*!

- **Access:** `this.$storage` or `Vue.storage`
- **Reactivity (Watch):**
  ```javascript
  this.$storage.watch('theme', (key, newVal) => {
      console.log('Theme changed to:', newVal);
  });
  ```
- **Expiration:**
  ```javascript
  // Set data that expires automatically in 1 hour (3600000 ms)
  this.$storage.setExpiring('token', 'abc', 3600000);
  ```

---

## 8. Built-in Portal (portal-vue Replacement)
Move elements (such as modals, tooltips) from inside the component hierarchy directly to `<body>` or another container to avoid `z-index` and `overflow: hidden` issues.

```html
<!-- In App.vue -->
<portal-target name="modals"></portal-target>

<!-- In any child component -->
<portal to="modals">
    <div class="my-modal">Rendered at root DOM!</div>
</portal>
```

---

## 9. Native Routing System (Basic Vue Router Replacement)
Get reactive URL access without the Vue Router library.

- **State Access:** `this.$route.path`, `this.$route.query`, `this.$route.hash`.
- **Easy Segmentation:** `this.$route.path1` (first URL segment), `this.$route.path2` (second URL segment).
- **Watchers:**
  ```javascript
  watch: {
      '$route.path1': function(newModule) {
          console.log('Application switched to module:', newModule);
      }
  }
  ```
- **Navigation:** `this.$route.push('/new-path')` or `this.$route.replace('/path')`.

---

## Ecosystem Summary
By using **PDS Vue Dev (Steroids Edition)**, you have eliminated the need for:
1. `vuex` / `pinia` ➔ Use **Integrated State**
2. `vue-router` (for simple routing) ➔ Use **Native Route & Watchers**
3. `pusher-js` & `laravel-echo` ➔ Use **Native RTC**
4. `store.js` / cookie libraries ➔ Use **Storage Management**
5. `@vueuse/core` ➔ Use **Built-in Hooks**
6. `portal-vue` ➔ Use **Built-in Portal**
7. `webpack` / `vite` (for simple code splitting) ➔ Use **Require / Dynamic Components**
