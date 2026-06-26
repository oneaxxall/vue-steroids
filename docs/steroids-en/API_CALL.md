# Vue 2 Built-in API Namespace

## 🎯 Overview

Vue 2 now has a built-in **`api`** option that allows you to separate **API Call** logic from regular **Methods**. This helps keep components well-structured following the **Separation of Concerns** principle.

Instead of mixing UI logic and HTTP calls inside the `methods` option, you can now place them in the `api` namespace and access them via **`this.api.methodName()`** anywhere (mounted, created, methods, hooks, etc.).

---

## ✨ Key Features

- ✅ **Separation of Concerns** - Separates UI logic (methods) from API logic (api).
- ✅ **Accessible Everywhere** - Accessible in `created`, `mounted`, `methods`, `hooks`, etc.
- ✅ **Auto Binding** - All functions inside `api` are automatically bound to the Vue instance (`this`).
- ✅ **Built-in HTTP** - Can directly use `this.get`, `this.post`, etc.
- ✅ **Clean Code** - Makes components easier to read and maintain.

---

## 📖 Basic Usage

Add the `api` option to your component definition. All functions inside it can be called via `this.api[functionName]()`.

### Example 1: Login Form

```javascript
new Vue({
  el: '#app',
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  
  template: `
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  `,
  
  // Methods: UI Logic & Event Handler
  methods: {
    handleLogin() {
      this.loading = true
      
      // Call API from the api namespace
      this.api.login(this.username, this.password)
        .then(() => {
          this.$router.push('/dashboard')
        })
        .catch((error) => {
          alert('Login failed: ' + error.message)
        })
        .finally(() => {
          this.loading = false
        })
    }
  },
  
  // api: Specifically for API/HTTP calls
  api: {
    login(user, pass) {
      // this here refers to the Vue Instance
      return this.post('/api/auth/login', {
        username: user,
        password: pass
      })
    }
  },
  
  // Can be accessed in lifecycle hooks
  mounted() {
    console.log('API object:', this.api)
  }
})
```

---

## 🔧 API Reference

### Structure

The `api` option accepts an Object where each property is a function.

```typescript
interface ComponentOptions {
  // ... other options
  api?: {
    [key: string]: (this: Component, ...args: any[]) => Promise<any> | any
  }
}
```

### Accessing API Calls

Inside the component (methods, hooks, lifecycle), you can access them via:

```javascript
this.api[functionName](...args)
```

---

## 💡 Advanced Examples

### Example 1: CRUD User Management

Separating all database/API operations into one place.

```javascript
Vue.component('user-table', {
  data() {
    return { users: [], loading: false }
  },
  
  template: `
    <div>
      <button @click="loadUsers">Refresh Data</button>
      <table>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.name }}</td>
          <td><button @click="api.removeUser(user.id)">Delete</button></td>
        </tr>
      </table>
    </div>
  `,
  
  methods: {
    loadUsers() {
      this.loading = true
      this.api.fetchUsers()
        .then(res => this.users = res.data)
        .finally(() => this.loading = false)
    }
  },
  
  mounted() {
    // Load users when component is created
    this.api.fetchUsers().then(res => this.users = res.data)
  },
  
  // All API Calls go here
  api: {
    fetchUsers() {
      return this.get('/api/users')
    },
    
    removeUser(id) {
      return this.delete(`/api/users/${id}`)
    }
  }
})
```

### Example 2: Using with Hooks

Combining with the **Hooks** feature for reactive logic.

```javascript
Vue.component('live-search', {
  data() {
    return { query: '', results: [] }
  },
  
  template: `<input v-model="query" @input="onInput" />`,
  
  hooks() {
    // Use useDebounce from hooks
    const search = this.useDebounce((val) => {
      // Call the API call defined below
      this.api.search(val).then(res => {
        this.results = res.data
      })
    }, 300)
    
    // Assign to instance so it can be called in the onInput method
    this.debouncedSearch = search
  },
  
  methods: {
    onInput() {
      this.debouncedSearch(this.query)
    }
  },
  
  // Define the API call here
  api: {
    search(query) {
      return this.get(`/api/search?q=${encodeURIComponent(query)}`)
    }
  }
})
```

---

## 🆚 Comparison: Methods vs API

| Feature | `methods` | `api` |
|---------|-----------|-------|
| **Purpose** | UI Logic & Event Handler | HTTP/API Calls |
| **Context (`this`)** | Vue Instance | Vue Instance |
| **Return** | Anything | Usually Promise (HTTP) |
| **Access Location** | `this.methodName()` | `this.api.methodName()` |
| **Initialization** | After `data` | Before `methods` & `data` |

---

## 🐛 Troubleshooting

### Problem: "Cannot read property 'login' of undefined"

**Cause:** The function name inside `api` does not match the one being called, or you are accessing it before the instance is ready.

**Solution:** Make sure `this.api` is called after the Vue instance is initialized (e.g., in `created` or `mounted`, not outside the instance).

### Problem: "this is undefined inside api function"

**Cause:** Using a regular `function()` instead of an arrow function `() => {}` inside a method called from `api` (very rare because Vue auto-binds).

**Solution:** Make sure you call via `this.api`, because Vue automatically does `.bind(this)` on all functions inside the `api` block.

```javascript
// Definition
api: {
  login() { return this.post(...) }
}

// Call (Correct)
this.api.login()
```

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Auto Binding | ✅ | `this` always available |
| HTTP Methods | ✅ | Access `this.get`, `this.post`, etc. |
| Integration | ✅ | Works with Hooks, Storage, etc. |
| Type Safety | ✅ | TypeScript support |
| Lifecycle Access | ✅ | Created, Mounted, etc. |

---

**Version**: Vue 2.7.16 + API Namespace  
**Last Updated**: 2024
