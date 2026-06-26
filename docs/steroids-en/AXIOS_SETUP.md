# Axios Integration Guide

## ⚠️ Important: Axios is Now an External Dependency

Starting from this version, Vue's HTTP client methods (`this.get`, `this.post`, etc.) require **axios** to be loaded separately.

---

## 📦 Setup Instructions

### For Browser Usage (UMD Builds):

When using `vue.js`, `vue.min.js`, `vue.runtime.js`, or `vue.runtime.min.js`, you **MUST** load axios **BEFORE** Vue:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 1. Load axios FIRST -->
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  
  <!-- 2. Then load Vue -->
  <script src="./dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <button @click="loadData">Load Data</button>
  </div>

  <script>
    new Vue({
      el: '#app',
      methods: {
        loadData() {
          // Axios is available!
          this.get('/api/data')
            .then(response => console.log(response.data))
        }
      }
    })
  </script>
</body>
</html>
```

### For Bundlers (Webpack, Vite, etc.):

When using `vue.common.dev.js`, `vue.common.prod.js`, `vue.runtime.common.dev.js`, `vue.runtime.common.prod.js`, `vue.esm.js`, or `vue.runtime.esm.js`:

**1. Install axios:**
```bash
npm install axios
# or
pnpm add axios
# or
yarn add axios
```

**2. Import and use:**
```javascript
// Axios is automatically available as external dependency
import Vue from 'vue'

// Vue will use axios internally
new Vue({
  methods: {
    loadData() {
      this.get('/api/data')
        .then(response => console.log(response.data))
    }
  }
})
```

---

## 🚀 Usage Examples

### Example 1: Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="./dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <h1>{{ title }}</h1>
    <button @click="fetchData">Fetch Data</button>
    <pre>{{ data }}</pre>
  </div>

  <script>
    // Configure axios defaults
    Vue.config.axiosBaseURL = 'https://api.example.com/'
    Vue.config.axiosTimeout = 5000

    new Vue({
      el: '#app',
      data: {
        title: 'Axios Integration Demo',
        data: null
      },
      methods: {
        async fetchData() {
          try {
            const response = await this.get('/users')
            this.data = response.data
          } catch (error) {
            console.error('Error:', error)
          }
        }
      }
    })
  </script>
</body>
</html>
```

### Example 2: With Authentication

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <script src="./dist/vue.min.js"></script>
</head>
<body>
  <div id="app">
    <button @click="login">Login</button>
    <button @click="fetchProfile">Get Profile</button>
  </div>

  <script>
    new Vue({
      el: '#app',
      methods: {
        async login() {
          const response = await this.post('/auth/login', {
            username: 'john',
            password: 'secret'
          })
          // Save token
          localStorage.setItem('token', response.data.token)
          // Update axios config
          Vue.config.axiosToken = response.data.token
        },

        async fetchProfile() {
          const response = await this.get('/users/profile')
          console.log('Profile:', response.data)
        }
      }
    })
  </script>
</body>
</html>
```

---

## 📋 Available HTTP Methods

All these methods are available on `this` inside Vue components:

| Method | Usage | Example |
|--------|-------|---------|
| GET | `this.get(url, config?)` | `this.get('/api/users')` |
| POST | `this.post(url, data?, config?)` | `this.post('/api/users', {name: 'John'})` |
| PUT | `this.put(url, data?, config?)` | `this.put('/api/users/1', {name: 'Jane'})` |
| PATCH | `this.patch(url, data?, config?)` | `this.patch('/api/users/1', {name: 'Jane'})` |
| DELETE | `this.delete(url, config?)` | `this.delete('/api/users/1')` |
| HEAD | `this.head(url, config?)` | `this.head('/api/users')` |
| OPTIONS | `this.options(url, config?)` | `this.options('/api/users')` |
| POST Form | `this.postForm(url, data?, config?)` | `this.postForm('/api/upload', formData)` |
| PUT Form | `this.putForm(url, data?, config?)` | `this.putForm('/api/update', formData)` |
| PATCH Form | `this.patchForm(url, data?, config?)` | `this.patchForm('/api/update', formData)` |
| Custom | `this.request(config)` | `this.request({method: 'GET', url: '/api'})` |

---

## ⚙️ Configuration Options

### Vue.config Properties:

```javascript
// Base URL for all requests
Vue.config.axiosBaseURL = 'https://api.example.com/'

// Default authentication token
Vue.config.axiosToken = 'your-jwt-token'

// Default timeout (milliseconds)
Vue.config.axiosTimeout = 10000

// Custom headers
Vue.config.axiosHeaders = {
  'X-API-Key': 'your-api-key'
}

// Request interceptor
Vue.config.axiosRequestInterceptor = (config) => {
  config.headers.Authorization = 'Bearer ' + getToken()
  return config
}

// Response interceptor
Vue.config.axiosResponseInterceptor = (response) => {
  return response.data // Auto-extract data
}

// Error handlers
Vue.config.axiosRequestErrorInterceptor = (error) => {
  console.error('Request error:', error)
  return Promise.reject(error)
}

Vue.config.axiosResponseErrorInterceptor = (error) => {
  if (error.response?.status === 401) {
    window.location.href = '/login'
  }
  return Promise.reject(error)
}
```

---

## 🔧 Advanced Usage

### Access Axios Instance Directly

```javascript
new Vue({
  mounted() {
    // Get the underlying axios instance
    const axiosInstance = this.$http
    
    // Use axios features like interceptors
    this.$addRequestInterceptor((config) => {
      config.headers['X-Custom-Header'] = 'value'
      return config
    })
    
    // Remove interceptor when done
    const id = this.$addRequestInterceptor(...)
    this.$removeInterceptor('request', id)
  }
})
```

### Cancel Requests

```javascript
new Vue({
  data: {
    cancelToken: null
  },
  methods: {
    fetchData() {
      const CancelToken = axios.CancelToken
      const source = CancelToken.source()
      this.cancelToken = source

      this.get('/api/data', {
        cancelToken: source.token
      })
    },

    cancelRequest() {
      if (this.cancelToken) {
        this.cancelToken.cancel('Request cancelled by user')
      }
    }
  }
})
```

---

## ⚠️ Common Errors

### Error: "axios is not defined"

**Cause**: Axios is not loaded before Vue

**Solution**: Load axios first:
```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script src="./dist/vue.js"></script>
```

### Error: "this.get is not a function"

**Cause**: Trying to use HTTP methods outside Vue instance

**Solution**: Use inside component methods:
```javascript
// ❌ WRONG
Vue.get('/api/data')

// ✅ CORRECT
new Vue({
  methods: {
    loadData() {
      this.get('/api/data')
    }
  }
})
```

---

## 📊 Build Variants

| Build File | Format | Axios Setup |
|------------|--------|-------------|
| `vue.js` | UMD | Load axios first |
| `vue.min.js` | UMD | Load axios first |
| `vue.runtime.js` | UMD | Load axios first |
| `vue.runtime.min.js` | UMD | Load axios first |
| `vue.common.dev.js` | CommonJS | `npm install axios` |
| `vue.common.prod.js` | CommonJS | `npm install axios` |
| `vue.esm.js` | ES Module | `npm install axios` |
| `vue.runtime.esm.js` | ES Module | `npm install axios` |

---

## ✅ Summary

**Before (Old Way)**:
```javascript
import axios from 'axios'

new Vue({
  methods: {
    loadData() {
      return axios.get('/api/data')
    }
  }
})
```

**After (Integrated Way)**:
```html
<!-- Load axios first -->
<script src="axios.min.js"></script>
<script src="vue.js"></script>

<script>
new Vue({
  methods: {
    loadData() {
      return this.get('/api/data') // Built-in!
    }
  }
})
</script>
```

**Benefits**:
- ✅ No need to import axios in every component
- ✅ Centralized configuration via `Vue.config`
- ✅ Consistent API across all components
- ✅ Automatic interceptors setup
- ✅ Less boilerplate code

---

**Version**: Vue 2.7.16 + Integrated Axios  
**Last Updated**: 2024
