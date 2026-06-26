# Vue 2 Built-in API Namespace

## 🎯 Overview

Vue 2 sekarang memiliki opsi **`api`** bawaan yang memungkinkan Anda memisahkan logika **API Calls** dari **Methods** biasa. Ini membantu menjaga component tetap terstruktur dengan prinsip **Separation of Concerns**.

Alih-alih mencampuradukkan logika UI dan pemanggilan HTTP di dalam opsi `methods`, Anda sekarang bisa meletakkannya di dalam namespace `api` dan mengaksesnya melalui **`this.api.namaMethod()`** di manapun (mounted, created, methods, hooks, dll).

---

## ✨ Key Features

- ✅ **Separation of Concerns** - Memisahkan logika UI (methods) dan logika API (api).
- ✅ **Accessible Everywhere** - Bisa diakses di `created`, `mounted`, `methods`, `hooks`, dll.
- ✅ **Auto Binding** - Semua fungsi di dalam `api` otomatis terikat dengan instance Vue (`this`).
- ✅ **Built-in HTTP** - Bisa langsung pakai `this.get`, `this.post`, dll.
- ✅ **Clean Code** - Membuat component lebih mudah dibaca dan di-maintain.

---

## 📖 Basic Usage

Tambahkan opsi `api` pada definisi component Anda. Semua fungsi di dalamnya bisa dipanggil melalui `this.api[namaFungsi]()`.

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
  
  // Methods: Logika UI & Event Handler
  methods: {
    handleLogin() {
      this.loading = true
      
      // Panggil API dari namespace api
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
  
  // api: Khusus untuk pemanggilan API/HTTP
  api: {
    login(user, pass) {
      // this di sini mengarah ke Vue Instance
      return this.post('/api/auth/login', {
        username: user,
        password: pass
      })
    }
  },
  
  // Bisa diakses di lifecycle hooks
  mounted() {
    console.log('API object:', this.api)
  }
})
```

---

## 🔧 API Reference

### Structure

Opsi `api` menerima Object di mana setiap propertinya adalah sebuah fungsi.

```typescript
interface ComponentOptions {
  // ... opsi lainnya
  api?: {
    [key: string]: (this: Component, ...args: any[]) => Promise<any> | any
  }
}
```

### Accessing API Calls

Di dalam component (methods, hooks, lifecycle), Anda bisa mengaksesnya melalui:

```javascript
this.api[namaFungsi](...args)
```

---

## 💡 Advanced Examples

### Example 1: CRUD User Management

Memisahkan semua operasi database/API ke dalam satu tempat.

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
    // Load users saat component dibuat
    this.api.fetchUsers().then(res => this.users = res.data)
  },
  
  // Semua API Call ada di sini
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

### Example 2: Menggunakan dengan Hooks

Kombinasi dengan fitur **Hooks** untuk logic yang reaktif.

```javascript
Vue.component('live-search', {
  data() {
    return { query: '', results: [] }
  },
  
  template: `<input v-model="query" @input="onInput" />`,
  
  hooks() {
    // Gunakan useDebounce dari hooks
    const search = this.useDebounce((val) => {
      // Panggil API call yang sudah didefinisikan di bawah
      this.api.search(val).then(res => {
        this.results = res.data
      })
    }, 300)
    
    // Assign ke instance agar bisa dipanggil di method onInput
    this.debouncedSearch = search
  },
  
  methods: {
    onInput() {
      this.debouncedSearch(this.query)
    }
  },
  
  // Definisikan API call-nya di sini
  api: {
    search(query) {
      return this.get(`/api/search?q=${encodeURIComponent(query)}`)
    }
  }
})
```

---

## 🆚 Comparison: Methods vs API

| Fitur | `methods` | `api` |
|-------|-----------|-------|
| **Tujuan** | Logika UI & Event Handler | Pemanggilan HTTP/API |
| **Context (`this`)** | Vue Instance | Vue Instance |
| **Return** | Apa saja | Biasanya Promise (HTTP) |
| **Lokasi Akses** | `this.namaMethod()` | `this.api.namaMethod()` |
| **Inisialisasi** | Setelah `data` | Sebelum `methods` & `data` |

---

## 🐛 Troubleshooting

### Problem: "Cannot read property 'login' of undefined"

**Penyebab:** Nama fungsi di dalam `api` tidak sama dengan yang dipanggil, atau Anda mengaksesnya sebelum instance siap.

**Solusi:** Pastikan `this.api` dipanggil setelah Vue instance terinisialisasi (misalnya di `created` atau `mounted`, bukan di luar instance).

### Problem: "this is undefined inside api function"

**Penyebab:** Menggunakan fungsi biasa `function()` alih-alih arrow function `() => {}` di dalam method yang dipanggil `api` (sangat jarang terjadi karena Vue otomatis binding).

**Solusi:** Pastikan Anda memanggil lewat `this.api`, karena Vue otomatis melakukan `.bind(this)` pada semua fungsi di dalam blok `api`.

```javascript
// Definsi
api: {
  login() { return this.post(...) }
}

// Panggil (Benar)
this.api.login()
```

---

## ✅ Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Auto Binding | ✅ | `this` selalu tersedia |
| HTTP Methods | ✅ | Akses `this.get`, `this.post`, dll |
| Integration | ✅ | Bekerja dengan Hooks, Storage, dll |
| Type Safety | ✅ | TypeScript support |
| Lifecycle Access | ✅ | Created, Mounted, dll |

---

**Version**: Vue 2.7.16 + API Namespace  
**Last Updated**: 2024
