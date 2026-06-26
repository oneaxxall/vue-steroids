# Panduan Lengkap PDS Vue Dev (Steroids Edition)

Selamat datang di dokumentasi utama PDS Vue Dev (Steroids Edition). Framework ini merupakan modifikasi mendalam (fork) dari Vue 2.7.16 yang telah dilengkapi dengan berbagai fitur modern bawaan (built-in). Tujuan utama modifikasi ini adalah memberikan pengalaman *Developer Experience* (DX) setara Vue 3 atau library modern lainnya, namun **tanpa memerlukan satu pun dependency eksternal**.

Berikut adalah panduan lengkap fitur-fitur "Steroids" yang siap Anda gunakan.

---

## 1. Manajemen State Terpadu (Pengganti Vuex)
Anda tidak perlu menginstal `vuex` atau `pinia`. Manajemen state sudah terintegrasi langsung di dalam instance Vue.

**Konfigurasi Global:**
```javascript
Vue.config.store = {
    state: { count: 0, user: null },
    getters: { isLoggedIn: state => !!state.user },
    mutations: { SET_COUNT(state, val) { state.count = val; } },
    actions: { 
        async fetchUser({ commit }) {
            // logika fetch
        }
    },
    modules: { /* support modularity */ }
};
```

**Penggunaan di Komponen:**
- Akses: `this.$store.state.count` atau `this.$store.getters.isLoggedIn`
- Eksekusi: `this.$store.commit('SET_COUNT', 1)` atau `this.$store.dispatch('fetchUser')`
- Helper Tersedia: `...Vue.mapState`, `...Vue.mapGetters`, `...Vue.mapMutations`, `...Vue.mapActions`

---

## 2. Panggilan API / HTTP (Namespace `api`)
Alih-alih menumpuk logika request HTTP di dalam `methods`, framework ini menyediakan block `api` khusus agar kode lebih rapi (Separation of Concerns).

```javascript
module.exports = {
    data() { return { users: [] }; },
    // Block API
    api: {
        getUsers() {
            // this.get, this.post tersedia otomatis dan ter-bind ke Vue
            return this.get('/api/users');
        }
    },
    mounted() {
        // Akses mudah
        this.api.getUsers().then(res => this.users = res.data);
    }
}
```

---

## 3. Sistem Modul Native (`require`)
Tanpa menggunakan *bundler* seperti Webpack/Vite, Anda dapat mengisolasi logika ke dalam file JavaScript dan memanggilnya layaknya Node.js.

- **File JS Biasa (`/app/util/math.js`)**:
  ```javascript
  module.exports = { add: (a, b) => a + b };
  ```
- **Di dalam Komponen (`.tpl`)**:
  ```javascript
  // Synchronous
  const math = require('/app/util/math'); 
  // Asynchronous
  const bigModule = await requireAsync('/app/large-lib');
  ```
*Catatan: Module yang dimuat otomatis masuk ke cache memory browser.*

---

## 4. Real-Time Communication / RTC (Pengganti Pusher JS & Echo)
Anda tidak perlu `pusher-js` atau `laravel-echo`. Sistem WebSocket sudah terintegrasi dan jauh lebih ringan.

```javascript
module.exports = {
    // Block RTC (Otomatis start saat komponen load)
    rtc: function() {
        this.$echo.join('meeting-room')
            .here(users => console.log('Online users:', users))
            .joining(user => console.log(user.name, 'joined'))
            .listen('.NewMessage', data => console.log(data));
    }
}
```
*Fitur ini juga menangani authentikasi Token Bearer secara otomatis!*

---

## 5. Built-in Hooks / Helpers (Pengganti VueUse)
Fungsi-fungsi reaktif canggih bisa diakses lewat block `hooks` baru. Fitur unggulannya adalah **Auto-Cleanup** (Event listener otomatis dihapus saat komponen di-destroy).

```javascript
module.exports = {
    hooks() {
        // Klik di luar ref "modal"
        this.onClickOutside('modal', () => this.close());
        
        // Tekan Escape
        this.onEscape(() => this.close());
        
        // Debounce (Sangat berguna untuk input search)
        this.debouncedSearch = this.useDebounce((val) => this.fetch(val), 300);
        
        // Throttle (Scroll, Resize)
        this.onScroll(window, this.useThrottle(() => console.log('scroll'), 100));
    }
}
```

---

## 6. Dynamic Component Loader (AJAX Component)
Bisa memuat komponen dari server secara *on-the-fly* melalui AJAX, bahkan setelah halaman dimuat.

```javascript
// Di dalam methods atau hooks:
async loadMyComponent() {
    // Mengambil /components/ui/card-user.tpl dan merendernya sebagai <card-user>
    await this.fetchDynamicComponent('card-user', '/ui/card-user');
}
```

---

## 7. Storage Management (Pengganti store.js)
Pengelola localStorage dengan kemampuan *expire* (TTL), sinkronisasi antar-tab, dan *reactivity*!

- **Akses:** `this.$storage` atau `Vue.storage`
- **Reactivity (Watch):**
  ```javascript
  this.$storage.watch('theme', (key, newVal) => {
      console.log('Tema diubah ke:', newVal);
  });
  ```
- **Expiration:**
  ```javascript
  // Set data yang otomatis hilang dalam 1 jam (3600000 ms)
  this.$storage.setExpiring('token', 'abc', 3600000);
  ```

---

## 8. Built-in Portal (Pengganti portal-vue)
Pindahkan elemen (seperti modal, tooltip) dari dalam hierarki komponen langsung ke `<body>` atau kontainer lain agar terhindar dari isu `z-index` dan `overflow: hidden`.

```html
<!-- Di App.vue -->
<portal-target name="modals"></portal-target>

<!-- Di komponen anak mana pun -->
<portal to="modals">
    <div class="my-modal">Tampil di root DOM!</div>
</portal>
```

---

## 9. Sistem Routing Native (Pengganti Vue Router Basic)
Dapatkan akses URL secara reaktif tanpa library Vue Router.

- **Akses State:** `this.$route.path`, `this.$route.query`, `this.$route.hash`.
- **Segmentasi Mudah:** `this.$route.path1` (segmen URL pertama), `this.$route.path2` (segmen URL kedua).
- **Watchers:**
  ```javascript
  watch: {
      '$route.path1': function(newModule) {
          console.log('Aplikasi pindah ke modul:', newModule);
      }
  }
  ```
- **Navigasi:** `this.$route.push('/new-path')` atau `this.$route.replace('/path')`.

---

## Ringkasan Ekosistem
Dengan menggunakan **PDS Vue Dev (Steroids Edition)**, Anda telah mengeliminasi kebutuhan akan:
1. `vuex` / `pinia` ➔ Gunakan **Integrated State**
2. `vue-router` (untuk routing sederhana) ➔ Gunakan **Native Route & Watchers**
3. `pusher-js` & `laravel-echo` ➔ Gunakan **Native RTC**
4. `store.js` / library cookies ➔ Gunakan **Storage Management**
5. `@vueuse/core` ➔ Gunakan **Built-in Hooks**
6. `portal-vue` ➔ Gunakan **Built-in Portal**
7. `webpack` / `vite` (untuk code splitting sederhana) ➔ Gunakan **Require / Dynamic Components**
