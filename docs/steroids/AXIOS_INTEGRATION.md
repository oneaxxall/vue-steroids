# Vue 2 Integrated HTTP Client (Axios)

## 🎯 Fitur Baru: Axios Terintegrasi Langsung di Vue

Axios sekarang sudah menjadi bagian dari Vue.js 2 Anda! Tidak perlu install atau import axios lagi. Semua HTTP methods tersedia langsung di setiap Vue instance.

---

## 📦 Instalasi

### Untuk Bundler (Webpack, Vite, dll):

```bash
npm install axios
# atau
pnpm add axios
# atau  
yarn add axios
```

### Untuk Browser (CDN):

```html
<!-- Load axios first -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<!-- Then load Vue -->
<script src="./dist/vue.js"></script>
```

---

## 🚀 Quick Start

### Setup Config (Opsional):

```javascript
// Set default config di Vue.config
Vue.config.axiosBaseURL = 'http://localhost:8181/';
Vue.config.axiosToken = 'your-jwt-token-here';
Vue.config.axiosTimeout = 5000; // 5 seconds

const app = new Vue({
  el: '#app',
  data: { users: [] },
  mounted() {
    // Langsung pakai! Tidak perlu import axios
    this.get('/api/users')
      .then(response => {
        this.users = response.data
      })
      .catch(error => {
        console.error('Failed to load users:', error)
      })
  }
})
```

---

## 📋 API Reference

### HTTP Methods di Vue Instance

Semua methods ini tersedia di `this` dalam component:

#### 1. **GET Request**

```javascript
// Simple GET
this.get('/api/users')

// GET dengan params
this.get('/api/users', {
  params: { page: 1, limit: 10 },
  headers: { 'X-Custom-Header': 'value' }
})

// GET dengan timeout
this.get('/api/users', {
  timeout: 3000
})
```

#### 2. **POST Request**

```javascript
// Simple POST
this.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// POST dengan config tambahan
this.post('/api/users', userData, {
  headers: { 'X-Token': 'secret' }
})
```

#### 3. **PUT Request**

```javascript
this.put('/api/users/1', {
  name: 'Jane Doe'
})
```

#### 4. **PATCH Request**

```javascript
this.patch('/api/users/1', {
  name: 'Jane Smith'
})
```

#### 5. **DELETE Request**

```javascript
this.delete('/api/users/1')

// DELETE dengan config
this.delete('/api/users/1', {
  headers: { 'Authorization': 'Bearer token' }
})
```

#### 6. **HEAD Request**

```javascript
this.head('/api/users')
```

#### 7. **OPTIONS Request**

```javascript
this.options('/api/users')
```

---

### Form Data Methods

#### 8. **POST Form (Multipart)**

```javascript
// Upload file
const fileInput = document.querySelector('input[type="file"]')
this.postForm('/api/upload', {
  avatar: fileInput.files[0],
  description: 'User avatar'
})
```

#### 9. **PUT Form (Multipart)**

```javascript
this.putForm('/api/users/1/avatar', {
  avatar: fileInput.files[0]
})
```

#### 10. **PATCH Form (Multipart)**

```javascript
this.patchForm('/api/users/1/avatar', {
  avatar: fileInput.files[0]
})
```

---

### Advanced Methods

#### 11. **Custom Request**

```javascript
// Full control dengan axios config
this.request({
  method: 'GET',
  url: '/api/users',
  params: { page: 1 },
  timeout: 5000,
  headers: { 'X-Custom': 'value' }
})
```

#### 12. **Access Axios Instance**

```javascript
// Get underlying axios instance
const axiosInstance = this.$http

// Use axios directly
this.$http.get('/api/users')
this.$http.post('/api/users', data)

// Add interceptors
this.$http.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer ' + getToken()
  return config
})
```

---

### Interceptor Methods

#### 13. **Add Request Interceptor**

```javascript
const interceptorId = this.$addRequestInterceptor(
  // Success handler
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add loading state
    config.metadata = { startTime: Date.now() }
    
    return config
  },
  // Error handler
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)
```

#### 14. **Add Response Interceptor**

```javascript
this.$addResponseInterceptor(
  // Success handler
  (response) => {
    // Calculate request time
    const duration = Date.now() - response.config.metadata.startTime
    console.log(`Request took ${duration}ms`)
    
    // Return only data
    return response.data
  },
  // Error handler
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Redirect to login
      router.push('/login')
    }
    
    // Handle 500 Server Error
    if (error.response && error.response.status === 500) {
      alert('Server error, please try again later')
    }
    
    return Promise.reject(error)
  }
)
```

#### 15. **Remove Interceptor**

```javascript
// Remove a specific interceptor
this.$removeInterceptor('request', interceptorId)
this.$removeInterceptor('response', responseInterceptorId)
```

---

## ⚙️ Configuration

### Vue.config Options

```javascript
// Base URL untuk semua requests
Vue.config.axiosBaseURL = 'https://api.example.com/'

// Default authentication token
Vue.config.axiosToken = 'your-jwt-token'

// Default timeout (milliseconds)
Vue.config.axiosTimeout = 10000 // 10 seconds

// Custom headers
Vue.config.axiosHeaders = {
  'X-API-Key': 'your-api-key',
  'X-App-Version': '1.0.0'
}

// Request interceptor function
Vue.config.axiosRequestInterceptor = (config) => {
  // Modify config before request
  config.headers['X-Custom'] = 'value'
  return config
}

// Response interceptor function
Vue.config.axiosResponseInterceptor = (response) => {
  // Modify response before it reaches your code
  return response.data // Return only data instead of full response
}

// Request error interceptor
Vue.config.axiosRequestErrorInterceptor = (error) => {
  console.error('Request error:', error)
  return Promise.reject(error)
}

// Response error interceptor
Vue.config.axiosResponseErrorInterceptor = (error) => {
  if (error.response) {
    // Handle HTTP errors
    switch (error.response.status) {
      case 401:
        // Unauthorized - redirect to login
        window.location.href = '/login'
        break
      case 403:
        // Forbidden
        alert('You do not have permission')
        break
      case 500:
        // Server error
        alert('Server error')
        break
    }
  }
  return Promise.reject(error)
}
```

---

## 💡 Examples

### Example 1: Basic CRUD

```javascript
new Vue({
  el: '#app',
  data: {
    posts: [],
    currentPost: null
  },
  methods: {
    // Read - Get all posts
    async loadPosts() {
      try {
        const response = await this.get('/api/posts')
        this.posts = response.data
      } catch (error) {
        console.error('Failed to load posts:', error)
      }
    },

    // Read - Get single post
    async loadPost(id) {
      try {
        const response = await this.get(`/api/posts/${id}`)
        this.currentPost = response.data
      } catch (error) {
        console.error('Failed to load post:', error)
      }
    },

    // Create - Add new post
    async createPost(postData) {
      try {
        const response = await this.post('/api/posts', postData)
        this.posts.push(response.data)
      } catch (error) {
        console.error('Failed to create post:', error)
      }
    },

    // Update - Edit post
    async updatePost(id, postData) {
      try {
        const response = await this.put(`/api/posts/${id}`, postData)
        const index = this.posts.findIndex(p => p.id === id)
        this.posts[index] = response.data
      } catch (error) {
        console.error('Failed to update post:', error)
      }
    },

    // Delete - Remove post
    async deletePost(id) {
      try {
        await this.delete(`/api/posts/${id}`)
        this.posts = this.posts.filter(p => p.id !== id)
      } catch (error) {
        console.error('Failed to delete post:', error)
      }
    }
  },
  mounted() {
    this.loadPosts()
  }
})
```

### Example 2: File Upload

```javascript
new Vue({
  el: '#app',
  data: {
    files: [],
    uploading: false
  },
  methods: {
    async uploadFiles() {
      this.uploading = true
      try {
        const formData = {
          title: this.$refs.titleInput.value,
          files: this.$refs.fileInput.files
        }

        const response = await this.postForm('/api/upload', formData)
        console.log('Upload successful:', response.data)
        
        this.files = response.data.files
      } catch (error) {
        console.error('Upload failed:', error)
        alert('Upload failed!')
      } finally {
        this.uploading = false
      }
    }
  }
})
```

### Example 3: Global Interceptors

```javascript
// Setup di main.js
Vue.config.axiosRequestInterceptor = (config) => {
  // Show loading spinner
  LoadingBar.start()
  
  // Add auth token
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}

Vue.config.axiosResponseInterceptor = (response) => {
  // Hide loading spinner
  LoadingBar.finish()
  return response
}

Vue.config.axiosResponseErrorInterceptor = (error) => {
  // Hide loading spinner
  LoadingBar.error()
  
  // Handle errors
  if (error.response) {
    switch (error.response.status) {
      case 401:
        localStorage.removeItem('auth_token')
        router.push('/login')
        break
      case 403:
        alert('Access denied')
        break
      case 500:
        alert('Server error occurred')
        break
    }
  }
  
  return Promise.reject(error)
}
```

### Example 4: API Service Layer

```javascript
// services/api.js
export const UserService = {
  getAll() {
    return Vue.prototype.get('/api/users')
  },

  getById(id) {
    return Vue.prototype.get(`/api/users/${id}`)
  },

  create(userData) {
    return Vue.prototype.post('/api/users', userData)
  },

  update(id, userData) {
    return Vue.prototype.put(`/api/users/${id}`, userData)
  },

  delete(id) {
    return Vue.prototype.delete(`/api/users/${id}`)
  }
}

// Component usage
import { UserService } from './services/api'

new Vue({
  methods: {
    async loadUsers() {
      const response = await UserService.getAll()
      this.users = response.data
    }
  }
})
```

---

## 🆚 Perbandingan dengan Axios Biasa

### Cara Lama (Install Axios Manual):

```javascript
import axios from 'axios'

// Setup
const api = axios.create({
  baseURL: 'http://localhost:8181/',
  timeout: 5000
})

// Component
new Vue({
  methods: {
    async getUsers() {
      const response = await api.get('/api/users')
      return response.data
    }
  }
})
```

### Cara Baru (Axios Terintegrasi):

```javascript
// Setup
Vue.config.axiosBaseURL = 'http://localhost:8181/'
Vue.config.axiosTimeout = 5000

// Component - langsung pakai!
new Vue({
  methods: {
    async getUsers() {
      const response = await this.get('/api/users')
      return response.data
    }
  }
})
```

**Lebih simple, tidak perlu import!** ✅

---

## 📊 Response Format

Semua methods return axios response object:

```javascript
{
  data: { ... },           // Response body
  status: 200,             // HTTP status code
  statusText: 'OK',        // HTTP status message
  headers: { ... },        // Response headers
  config: { ... },         // Request config
  request: { ... }         // The request object
}
```

Untuk langsung access data:

```javascript
// Option 1: Access data property
const response = await this.get('/api/users')
const users = response.data

// Option 2: Use interceptor to auto-extract data
Vue.config.axiosResponseInterceptor = (response) => response.data
const users = await this.get('/api/users') // users is already data
```

---

## ⚠️ Important Notes

### 1. **Axios adalah External Dependency**

Untuk CommonJS dan ES module builds, axios adalah **external dependency**. Anda harus install axios:

```bash
npm install axios
```

### 2. **Browser Build**

Untuk browser build (`vue.js`, `vue.min.js`), **load axios sebelum Vue**:

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script src="./dist/vue.js"></script>
```

### 3. **No SSR Support Yet**

Server-side rendering perlu setup khusus untuk axios.

---

## 🐛 Troubleshooting

### Problem: "axios is not defined"

**Solution**: Install dan load axios:

```bash
npm install axios
```

```html
<!-- Untuk browser -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

### Problem: "this.get is not a function"

**Solution**: Pastikan menggunakan Vue instance (`this`), bukan Vue global:

```javascript
// ❌ SALAH
Vue.get('/api/users')

// ✅ BENAR
this.get('/api/users')
```

### Problem: CORS Error

**Solution**: Setup CORS di server atau gunakan proxy:

```javascript
// Vue dev server proxy
module.exports = {
  devServer: {
    proxy: 'http://localhost:8181'
  }
}

// Then use relative paths
this.get('/api/users') // Will proxy to http://localhost:8181/api/users
```

---

## ✅ Summary

| Feature | Available | Notes |
|---------|-----------|-------|
| GET request | ✅ | `this.get(url, config)` |
| POST request | ✅ | `this.post(url, data, config)` |
| PUT request | ✅ | `this.put(url, data, config)` |
| PATCH request | ✅ | `this.patch(url, data, config)` |
| DELETE request | ✅ | `this.delete(url, config)` |
| HEAD request | ✅ | `this.head(url, config)` |
| OPTIONS request | ✅ | `this.options(url, config)` |
| POST Form | ✅ | `this.postForm(url, data, config)` |
| PUT Form | ✅ | `this.putForm(url, data, config)` |
| PATCH Form | ✅ | `this.patchForm(url, data, config)` |
| Custom Request | ✅ | `this.request(config)` |
| Axios Instance | ✅ | `this.$http` |
| Interceptors | ✅ | `$addRequestInterceptor()`, etc |
| Config via Vue.config | ✅ | `axiosBaseURL`, `axiosToken`, etc |

---

## 📚 More Resources

- Axios Documentation: https://axios-http.com/
- Vue.js Documentation: https://vuejs.org/
- Demo: See example files in `examples/axios-demo.html`

---

**Version**: Vue 2.7.16 + Integrated Axios  
**Last Updated**: 2024
