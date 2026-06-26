# 🚀 Panduan Konfigurasi & Opsi Komponen PDS Vue Dev (Steroids Edition)

Dokumen ini berisi daftar lengkap dan komprehensif mengenai semua Konfigurasi Global (`Vue.config`) dan Opsi Komponen (Component Options) baru yang eksklusif ditambahkan ke dalam arsitektur "Vue 2 Steroids". 

---

## 🌍 1. Konfigurasi Global (`Vue.config`)

Anda dapat mengatur konfigurasi ini di *entry point* aplikasi Anda (misalnya di `main.js` atau saat *bootstraping* aplikasi).

### 📡 A. HTTP & Axios Config
Secara internal, Steroids menggunakan Axios yang sudah di-*wrap* di dalam Vue. Anda bisa mengatur *default behaviour*-nya secara global:

```javascript
// URL dasar untuk semua request
Vue.config.axiosBaseURL = 'https://api.domain.com/v1';

// Token Bearer default (Otomatis ditambahkan ke header Authorization)
Vue.config.axiosToken = 'eyJhbGciOiJIUzI1Ni...';

// Timeout request dalam milidetik (0 = no timeout)
Vue.config.axiosTimeout = 10000;

// Header kustom default
Vue.config.axiosHeaders = {
    'X-Client-App': 'PDS-Superapps'
};

// Global Interceptors (Berguna untuk logging atau manipulasi request/response)
Vue.config.axiosRequestInterceptor = (config) => {
    console.log('Mengirim Request ke:', config.url);
    return config;
};

Vue.config.axiosResponseInterceptor = (response) => {
    return response.data; // Langsung kembalikan data, skip wrapper axios
};

Vue.config.axiosResponseErrorInterceptor = (error) => {
    if (error.response && error.response.status === 401) {
        alert('Sesi habis, silakan login ulang.');
    }
    return Promise.reject(error);
};
```

### 🧩 B. Dynamic Component Loader Config
Untuk mengatur perilaku *lazy-loading* komponen `.tpl` via AJAX:

```javascript
// Folder dasar tempat file komponen berada
Vue.config.componentPath = '/app/components';

// Ekstensi file komponen (default: '.tpl')
Vue.config.componentExtension = '.tpl';

// Nama komponen fallback jika file gagal di-load
Vue.config.componentFallback = 'component-notfound';

// Auto-fetch: jika komponen dipanggil via tag <my-comp> tapi belum di-register,
// Vue akan otomatis mencarinya ke server (default: false)
Vue.config.autoFetchComponents = true;
```

### ⚡ C. Socket / RTC Config
Pengaturan untuk fitur Real-Time Communication native (pengganti pusher-js/Echo).

```javascript
Vue.config.socket = {
    enabled: true,                  // Aktifkan koneksi socket saat start
    broadcaster: 'pusher',          // Driver (saat ini 'pusher')
    key: 'pds_reverb_key',          // App Key (untuk Reverb/Pusher)
    host: 'ws.pusher.local',        // Host server WebSocket
    port: 80,                       // Port
    forceTLS: false,                // Gunakan WSS (Secure)
    authEndpoint: '/broadcasting/auth' // Endpoint untuk autentikasi private/presence channel
};
```

### 💾 D. Global Store Config
Inisialisasi *State Management* bawaan (pengganti Vuex).

```javascript
Vue.config.store = {
    state: { theme: 'dark' },
    mutations: { SET_THEME(state, t) { state.theme = t; } }
};
```

---

## 🏗️ 2. Opsi Komponen Baru (Component Options)

Selain opsi standar Vue 2 (seperti `data`, `methods`, `computed`, `mounted`), "Steroids" menambahkan beberapa *options block* khusus agar kode lebih rapi dan fungsional.

### 🌐 A. Opsi `api` (API Namespace)
Memisahkan fungsi-fungsi pemanggilan HTTP dari `methods` agar logika UI dan Server Data tidak bercampur.

```javascript
module.exports = {
    data() {
        return { users: [] };
    },
    
    // Opsi baru: api
    api: {
        fetchUsers() {
            // "this" otomatis ter-bind ke instance komponen
            // Anda bisa menggunakan built-in methods: this.get, this.post, this.put, this.delete
            return this.get('/api/users');
        },
        updateUser(id, payload) {
            return this.post(`/api/users/${id}`, payload);
        }
    },
    
    methods: {
        async loadData() {
            // Cara memanggilnya: this.api.namaFungsi()
            const response = await this.api.fetchUsers();
            this.users = response.data;
        }
    }
}
```

### 🎣 B. Opsi `hooks` (Event Helpers dengan Auto-Cleanup)
*Life-hack* untuk menambahkan *event listener* canggih tanpa khawatir memori bocor (*memory leak*). Semua event di sini **otomatis dihapus** saat komponen di-destroy. Dijalankan sesaat setelah `created`.

```javascript
module.exports = {
    // Opsi baru: hooks
    hooks() {
        // 1. Deteksi klik di luar elemen dengan $refs="modalBody"
        this.onClickOutside('modalBody', () => {
            this.closeModal();
        });

        // 2. Deteksi tombol Escape
        this.onEscape(() => {
            this.closeModal();
        });

        // 3. Deteksi Scroll window atau elemen tertentu
        this.onScroll(window, () => {
            this.isScrolled = window.scrollY > 100;
        });

        // 4. Deteksi Resize
        this.onWindowResize(() => {
            this.isMobile = window.innerWidth < 768;
        }, { immediate: true });

        // 5. Buat fungsi Debounce (misal untuk input text)
        this.debouncedSearch = this.useDebounce((query) => {
            this.api.search(query);
        }, 500); // Tunggu 500ms setelah user berhenti mengetik
        
        // 6. Buat fungsi Throttle
        this.throttledScroll = this.useThrottle(() => {
            console.log('Scroll tick');
        }, 200); // Maksimal dipanggil 1 kali per 200ms
    }
}
```

### 📡 C. Opsi `rtc` (Real-Time Communication)
Tempat khusus untuk mendengarkan *event realtime* WebSocket. Otomatis tereksekusi saat komponen di-*mount* dan memiliki akses penuh ke instance komponen.

```javascript
module.exports = {
    // Opsi baru: rtc
    rtc() {
        // Bergabung dengan channel presence
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

        // Mendengarkan private channel
        this.$echo.private(`user.${this.currentUser.id}`)
            .listen('.NotificationReceived', (data) => {
                alert(data.message);
            });
    }
}
```

---

## 🛠️ 3. Instance Methods & Properties Baru (Global Helpers)

Semua komponen Vue Anda otomatis memiliki method pembantu ini (*available under* `this`).

### 🌍 A. Helper HTTP (Built-in Axios)
- `this.get(url, config)`
- `this.post(url, data, config)`
- `this.put(url, data, config)`
- `this.patch(url, data, config)`
- `this.delete(url, config)`
- `this.postForm(url, formData)` ➔ Otomatis set `Content-Type: multipart/form-data`

### ⚡ B. Helper Realtime (RTC)
- `this.$echo` ➔ Mengakses driver RTC langsung (kompatibel penuh dengan sintaks Laravel Echo).
- `this.$channel('news')` ➔ Shortcut subscribe channel publik.
- `this.$private('user.1')` ➔ Shortcut subscribe private channel (otomatis prefix `private-`).
- `this.$join('chat')` ➔ Shortcut presence channel (otomatis prefix `presence-`).
- `this.$leave('chat')` ➔ Keluar dari channel.

### 💾 C. Helper Storage
- `this.$storage.set('key', 'value')`
- `this.$storage.get('key', 'defaultValue')`
- `this.$storage.setExpiring('token', 'abc', 3600000)` ➔ Set TTL dalam ms (otomatis hapus jika kadaluarsa).
- `this.$storage.watch('theme', (key, newVal) => {...})` ➔ Reactive watcher untuk key tertentu.

### 🧭 D. Helper Route (Route Watcher)
Akses info navigasi tanpa Vue Router library.
- `this.$route.path` ➔ Path saat ini (contoh: `/admin/users/123`).
- `this.$route.query` ➔ Object parameter `?sort=desc`.
- `this.$route.hash` ➔ String setelah `#`.
- `this.$route.path1` s/d `this.$route.path5` ➔ Ekstraksi per segmen path secara reaktif (contoh path1 = `admin`, path2 = `users`).
- `this.$route.push('/new-url')` ➔ Pindah halaman (nambah history).
- `this.$route.replace('/new-url')` ➔ Pindah halaman (replace history).

### 🧩 E. Helper Dynamic Components
Digunakan untuk load komponen UI tambahan secara *on-the-fly* via AJAX.
- `this.fetchDynamicComponent('card-user', '/ui/card-user')`
- `this.fetchDynamicComponents([{ name: 'btn-play', path: '/ui/btn-play' }])`
- `this.loadAsyncComponent(...)`

### 📦 F. Helper Require (Native Module System)
Pola pemanggilan *CommonJS* standar langsung di browser.
- `const utils = require('/app/helpers/utils')` ➔ Memuat module `.js` secara sinkron (XHR Sync fallback).
- `const bigLib = await requireAsync('/app/vendors/chart')` ➔ Memuat secara asinkron.

---

> Dengan memanfaatkan seluruh kombinasi `Vue.config`, *opsi komponen (`api`, `hooks`, `rtc`)*, serta instrumen helper (`this.*`), penulisan kode Front-End di aplikasi PDS Superapps bisa menjadi sangat bersih (clean), mudah terbaca (readable), dan modular (scalable).
