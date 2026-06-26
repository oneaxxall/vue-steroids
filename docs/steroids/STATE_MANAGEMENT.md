# Vue 2 Integrated State Management

## 🎯 Overview

Vue 2 sekarang memiliki **State Management built-in** yang terintegrasi langsung ke dalam source code! Tidak perlu install Vuex atau library tambahan. State management ini menyediakan cara terstruktur untuk mengelola state aplikasi secara global dengan API yang sederhana dan intuitif.

---

## ✨ Features

- ✅ **Reactive State** - State otomatis reactive seperti data di component
- ✅ **Getters** - Computed properties untuk state
- ✅ **Mutations** - Synchronous state changes
- ✅ **Actions** - Asynchronous operations
- ✅ **Modules** - Modular store structure
- ✅ **Helpers** - mapState, mapGetters, mapMutations, mapActions
- ✅ **DevTools Ready** - Bisa di-track dan di-debug
- ✅ **Zero Dependencies** - Pure Vue, no external libs

---

## 📦 Setup

### Basic Setup

```javascript
Vue.config.store = {
  state: {
    count: 0,
    user: null,
    items: []
  },
  getters: {
    // Computed getters
    itemCount: (state) => state.items.length,
    isLoggedIn: (state) => !!state.user
  },
  mutations: {
    // Synchronous state changes
    SET_COUNT(state, count) {
      state.count = count
    },
    SET_USER(state, user) {
      state.user = user
    },
    ADD_ITEM(state, item) {
      state.items.push(item)
    }
  },
  actions: {
    // Asynchronous operations
    async fetchUser({ commit }, userId) {
      const response = await fetch(`/api/users/${userId}`)
      const user = await response.json()
      commit('SET_USER', user)
    },
    
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('SET_COUNT', store.state.count + 1)
      }, 1000)
    }
  }
}

// Create Vue instance
new Vue({
  el: '#app'
  // $store otomatis tersedia!
})
```

---

## 📖 Basic Usage

### Access State

```javascript
new Vue({
  el: '#app',
  computed: {
    count() {
      return this.$store.state.count
    },
    user() {
      return this.$store.state.user
    }
  }
})
```

### Use Getters

```javascript
new Vue({
  el: '#app',
  computed: {
    itemCount() {
      return this.$store.getters.itemCount
    },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    }
  }
})
```

### Commit Mutations

```javascript
new Vue({
  el: '#app',
  methods: {
    increment() {
      this.$store.commit('SET_COUNT', this.$store.state.count + 1)
    },
    setUser(user) {
      this.$store.commit('SET_USER', user)
    }
  }
})
```

### Dispatch Actions

```javascript
new Vue({
  el: '#app',
  methods: {
    async loadUser() {
      await this.$store.dispatch('fetchUser', 123)
    },
    
    incrementWithDelay() {
      this.$store.dispatch('incrementAsync')
    }
  }
})
```

---

## 🛠 Helper Functions

### mapState

Map state to computed properties:

```javascript
new Vue({
  el: '#app',
  computed: {
    // Array syntax
    ...Vue.mapState(['count', 'user', 'items']),
    
    // Object syntax (dengan alias)
    ...Vue.mapState({
      currentCount: 'count',
      currentUser: 'user'
    }),
    
    // Custom computed
    doubleCount() {
      return this.$store.state.count * 2
    }
  }
})
```

### mapGetters

Map getters to computed properties:

```javascript
new Vue({
  el: '#app',
  computed: {
    ...Vue.mapGetters(['itemCount', 'isLoggedIn']),
    
    // Dengan alias
    ...Vue.mapGetters({
      totalItems: 'itemCount',
      userLoggedIn: 'isLoggedIn'
    })
  }
})
```

### mapMutations

Map mutations to methods:

```javascript
new Vue({
  el: '#app',
  methods: {
    // Array syntax
    ...Vue.mapMutations(['SET_COUNT', 'SET_USER', 'ADD_ITEM']),
    
    // Usage
    increment() {
      this.SET_COUNT(this.count + 1)
    },
    
    // Object syntax
    ...Vue.mapMutations({
      updateCount: 'SET_COUNT',
      updateUser: 'SET_USER'
    }),
    
    updateCount(newCount) {
      this.updateCount(newCount)
    }
  }
})
```

### mapActions

Map actions to methods:

```javascript
new Vue({
  el: '#app',
  methods: {
    // Array syntax
    ...Vue.mapActions(['fetchUser', 'incrementAsync']),
    
    // Usage
    loadUser(userId) {
      return this.fetchUser(userId)
    },
    
    // Object syntax
    ...Vue.mapActions({
      loadUser: 'fetchUser',
      delayedIncrement: 'incrementAsync'
    })
  }
})
```

---

## 🏗 Advanced Usage

### Store with Modules

```javascript
Vue.config.store = {
  state: {
    appName: 'My App'
  },
  
  modules: {
    user: {
      state: {
        profile: null,
        token: null
      },
      getters: {
        isAuthenticated: (state) => !!state.token
      },
      mutations: {
        SET_PROFILE(state, profile) {
          state.profile = profile
        },
        SET_TOKEN(state, token) {
          state.token = token
        }
      },
      actions: {
        async login({ commit }, credentials) {
          const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
          })
          const data = await response.json()
          commit('SET_TOKEN', data.token)
          commit('SET_PROFILE', data.user)
        }
      }
    },
    
    cart: {
      state: {
        items: []
      },
      getters: {
        cartTotal: (state) => state.items.length,
        cartValue: (state) => state.items.reduce((sum, item) => sum + item.price, 0)
      },
      mutations: {
        ADD_TO_CART(state, item) {
          state.items.push(item)
        },
        CLEAR_CART(state) {
          state.items = []
        }
      }
    }
  }
}

// Access module state
new Vue({
  el: '#app',
  computed: {
    userProfile() {
      return this.$store.state.user.profile
    },
    cartItems() {
      return this.$store.state.cart.items
    },
    cartTotal() {
      return this.$store.getters.cartTotal
    }
  },
  methods: {
    ...Vue.mapMutations(['cart/ADD_TO_CART', 'cart/CLEAR_CART']),
    ...Vue.mapActions(['user/login'])
  }
})
```

### Subscribe to Mutations

```javascript
// Subscribe to all mutations
this.$store.subscribe((mutation, state) => {
  console.log(`Mutation: ${mutation.type}`)
  console.log(`Payload:`, mutation.payload)
  console.log(`New state:`, state)
})

// Unsubscribe later
const unsubscribe = this.$store.subscribe((mutation, state) => {
  // ...
})

// Later...
unsubscribe()
```

### Reset Store

```javascript
// Reset store to initial state
this.$store.reset()
```

---

## 💡 Complete Example

### Counter App

```html
<!DOCTYPE html>
<html>
<head>
  <script src="../dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <h1>Counter: {{ count }}</h1>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="decrement">-1</button>
    <button @click="incrementAsync">+1 (1s delay)</button>
    <button @click="reset">Reset</button>
  </div>

  <script>
    // Setup store
    Vue.config.store = {
      state: {
        count: 0
      },
      getters: {
        doubleCount: (state) => state.count * 2
      },
      mutations: {
        INCREMENT(state) {
          state.count++
        },
        DECREMENT(state) {
          state.count--
        },
        RESET(state) {
          state.count = 0
        }
      },
      actions: {
        incrementAsync({ commit }) {
          setTimeout(() => {
            commit('INCREMENT')
          }, 1000)
        }
      }
    }

    // Create Vue instance
    new Vue({
      el: '#app',
      computed: {
        count() {
          return this.$store.state.count
        },
        doubleCount() {
          return this.$store.getters.doubleCount
        }
      },
      methods: {
        increment() {
          this.$store.commit('INCREMENT')
        },
        decrement() {
          this.$store.commit('DECREMENT')
        },
        reset() {
          this.$store.commit('RESET')
        },
        incrementAsync() {
          this.$store.dispatch('incrementAsync')
        }
      }
    })
  </script>
</body>
</html>
```

### User Management

```html
<!DOCTYPE html>
<html>
<head>
  <script src="../dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <div v-if="isLoggedIn">
      <h1>Welcome, {{ user.name }}!</h1>
      <p>Email: {{ user.email }}</p>
      <button @click="logout">Logout</button>
    </div>
    <div v-else>
      <h1>Login</h1>
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
    </div>
  </div>

  <script>
    Vue.config.store = {
      state: {
        user: null,
        token: null
      },
      getters: {
        isLoggedIn: (state) => !!state.token
      },
      mutations: {
        SET_USER(state, user) {
          state.user = user
        },
        SET_TOKEN(state, token) {
          state.token = token
        },
        CLEAR_AUTH(state) {
          state.user = null
          state.token = null
        }
      },
      actions: {
        async login({ commit }, { username, password }) {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          })
          
          if (!response.ok) {
            throw new Error('Login failed')
          }
          
          const data = await response.json()
          commit('SET_TOKEN', data.token)
          commit('SET_USER', data.user)
          
          // Save to localStorage
          localStorage.setItem('token', data.token)
        },
        
        logout({ commit }) {
          commit('CLEAR_AUTH')
          localStorage.removeItem('token')
        }
      }
    }

    new Vue({
      el: '#app',
      data: {
        username: '',
        password: ''
      },
      computed: {
        ...Vue.mapState(['user', 'token']),
        ...Vue.mapGetters(['isLoggedIn'])
      },
      methods: {
        ...Vue.mapActions(['login', 'logout'])
      }
    })
  </script>
</body>
</html>
```

---

## 📊 API Reference

### Store Instance

| Property | Type | Description |
|----------|------|-------------|
| `$store.state` | Object | Reactive state object |
| `$store.getters` | Object | Computed getters |
| `$store.commit(type, payload?)` | Function | Commit a mutation |
| `$store.dispatch(type, payload?)` | Function | Dispatch an action |
| `$store.getState(path)` | Function | Get state by dot-notation path |
| `$store.setState(path, value)` | Function | Set state by dot-notation path |
| `$store.subscribe(fn)` | Function | Subscribe to mutations |
| `$store.reset()` | Function | Reset store to initial state |

### Vue.config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Vue.config.store` | Object | null | Global store configuration |

### Helper Functions

| Helper | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `Vue.mapState(paths)` | Array/Object | Object | Map state to computed |
| `Vue.mapGetters(names)` | Array | Object | Map getters to computed |
| `Vue.mapMutations(names)` | Array/Object | Object | Map mutations to methods |
| `Vue.mapActions(names)` | Array/Object | Object | Map actions to methods |
| `Vue.createStore(options)` | Object | Store | Create store instance |

---

## ⚠️ Best Practices

### 1. Use Constants for Mutation/Action Names

```javascript
// store/constants.js
export const SET_USER = 'SET_USER'
export const SET_TOKEN = 'SET_TOKEN'
export const CLEAR_AUTH = 'CLEAR_AUTH'

// store/index.js
Vue.config.store = {
  mutations: {
    [SET_USER](state, user) {
      state.user = user
    }
  }
}

// component.js
this.$store.commit(SET_USER, user)
```

### 2. Keep Mutations Synchronous

```javascript
// ✅ GOOD
mutations: {
  SET_COUNT(state, count) {
    state.count = count
  }
}

// ❌ BAD
mutations: {
  async SET_COUNT(state, count) {
    await someAsyncOperation()
    state.count = count
  }
}
```

### 3. Use Actions for Async Operations

```javascript
// ✅ GOOD
actions: {
  async fetchData({ commit }) {
    const data = await fetch('/api/data').then(r => r.json())
    commit('SET_DATA', data)
  }
}

// ❌ BAD
mutations: {
  async SET_DATA(state, payload) {
    state.data = await fetch(payload.url).then(r => r.json())
  }
}
```

### 4. Use Getters for Computed State

```javascript
// ✅ GOOD
getters: {
  filteredItems: (state) => state.items.filter(item => item.active),
  itemCount: (state) => state.items.length
}

// ❌ BAD - Don't compute in component
computed: {
  filteredItems() {
    return this.$store.state.items.filter(item => item.active)
  }
}
```

### 5. Organize with Modules

```javascript
// ✅ GOOD
Vue.config.store = {
  modules: {
    user: {
      state: { ... },
      mutations: { ... },
      actions: { ... }
    },
    cart: {
      state: { ... },
      mutations: { ... },
      actions: { ... }
    }
  }
}

// ❌ BAD - One giant store
Vue.config.store = {
  state: {
    userProfile: { ... },
    userPreferences: { ... },
    cartItems: { ... },
    // ... hundreds of properties
  }
}
```

---

## 🐛 Troubleshooting

### Problem: "$store is undefined"

**Solution:**
- Pastikan `Vue.config.store` diset **sebelum** membuat Vue instance
- Check apakah store object memiliki `state` property

```javascript
// ✅ GOOD
Vue.config.store = { state: { count: 0 } }
new Vue({ el: '#app' })

// ❌ BAD
new Vue({ el: '#app' })
Vue.config.store = { state: { count: 0 } } // Too late!
```

### Problem: State tidak reactive

**Solution:**
- Pastikan state di-init dengan nilai awal
- Jangan assign property baru langsung ke state

```javascript
// ✅ GOOD
state: {
  user: { name: '', email: '' }
}

// ❌ BAD - Property 'user' tidak ada di awal
state: {}

// Later...
this.$store.state.user = { name: 'John' } // Not reactive!
```

### Problem: Mutations tidak ter-trigger

**Solution:**
- Pastikan mutation name benar (case-sensitive)
- Gunakan commit bukan dispatch

```javascript
// ✅ GOOD
this.$store.commit('SET_COUNT', 5)

// ❌ BAD
this.$store.mutations.SET_COUNT(5) // Wrong!
this.$store.dispatch('SET_COUNT', 5) // Wrong! Use commit
```

---

## 📚 Comparison with Vuex

| Feature | Vuex | Vue Integrated Store |
|---------|------|---------------------|
| Install Required | ✅ Yes | ❌ No |
| Size | +12kb | Built-in |
| API | Complex | Simple |
| Reactivity | ✅ Yes | ✅ Yes |
| DevTools | ✅ Yes | ✅ Yes |
| Modules | ✅ Yes | ✅ Yes |
| Plugins | ✅ Yes | ❌ No |
| SSR Support | ✅ Yes | ⚠️ Limited |
| Learning Curve | Medium | Easy |

---

## ✅ Summary

State management Vue 2 yang terintegrasi menyediakan:

- ✅ **Simple API** - Mudah dipelajari dan digunakan
- ✅ **Reactive State** - Otomatis update saat state berubah
- ✅ **Helper Functions** - mapState, mapGetters, mapMutations, mapActions
- ✅ **Modules Support** - Organize store dengan modules
- ✅ **Zero Dependencies** - Tidak perlu install library tambahan
- ✅ **Production Ready** - Siap digunakan untuk aplikasi besar

---

**Version**: Vue 2.7.16 + Integrated State Management  
**Last Updated**: 2024
