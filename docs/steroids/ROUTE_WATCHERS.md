# Built-in Route & Navigation System

Sistem routing bawaan ini dirancang untuk memberikan akses reaktif terhadap URL browser tanpa memerlukan library eksternal seperti Vue Router. Fitur ini mengintegrasikan keadaan URL langsung ke dalam inti reaktivitas Vue.

## 1. Akses Objek `$route`

Objek `$route` tersedia secara otomatis di setiap instance komponen Vue via `this.$route`.

```javascript
// Contoh akses di dalam methods atau lifecycle hooks
mounted() {
    console.log("Path saat ini:", this.$route.path);
    console.log("Query 'id':", this.$route.query.id);
}
```

## 2. Properti Reaktif

Properti berikut bersifat reaktif dan akan memicu pembaruan pada UI atau `watchers` saat URL berubah:

| Properti | Deskripsi | Contoh |
| :--- | :--- | :--- |
| `path` | Path utama URL (pathname) | `/admin/settings` |
| `fullPath` | Path lengkap termasuk query & hash | `/admin?tab=1#top` |
| `hash` | Fragment setelah tanda `#` | `#section-1` |
| `query` | Objek parameter query string | `{ id: '123', sort: 'desc' }` |
| `path1` | Segmen pertama dari path | `admin` (dari `/admin/settings`) |
| `path2` | Segmen kedua dari path | `settings` (dari `/admin/settings`) |
| `path3` | Segmen ketiga dari path | `profile` (dari `/admin/settings/profile`) |
| `path4..5` | Segmen keempat dan kelima | (string kosong jika tidak ada) |

## 3. Menggunakan Watchers

Anda dapat memantau perubahan spesifik pada bagian URL menggunakan blok `watch` standar Vue.

### Memantau Segmen Tertentu (Path segments)
Sangat berguna untuk aplikasi modular berbasis Odoo di mana segmen pertama seringkali menentukan modul yang aktif.

```javascript
watch: {
    '$route.path1': function(newVal, oldVal) {
        if (newVal === 'discuss') {
            this.initDiscussModule();
        }
    }
}
```

### Memantau Query atau Hash
```javascript
watch: {
    '$route.query.search': function(keyword) {
        this.performSearch(keyword);
    },
    '$route.hash': function(newHash) {
        this.scrollToElement(newHash);
    }
}
```

## 4. API Navigasi

Navigasi dapat dilakukan secara deklaratif di template atau secara programmatik di script.

### Metode Navigasi
- `this.$route.push(url | object)`: Menambah history baru.
- `this.$route.replace(url | object)`: Mengganti history saat ini.
- `this.$route.back()`: Kembali ke halaman sebelumnya.
- `this.$route.forward()`: Maju ke halaman berikutnya.

### Contoh Penggunaan
```javascript
// Navigasi String
this.$route.push('/dashboard');

// Navigasi Objek dengan Query
this.$route.push({ 
    path: '/search', 
    query: { q: 'vue-steroids' } 
});

// Navigasi Replace (tidak menambah history stack)
this.$route.replace('/login');
```

## 5. Akses Global (Luar Komponen)

Jika Anda perlu melakukan navigasi di luar file `.vue` atau komponen (misalnya di helper JS murni), Anda dapat menggunakan `Vue.router`.

```javascript
// Di file JS murni
Vue.router.push('/logout');
```

---

> **Note:** Sistem ini mendengarkan event `popstate` dan `hashchange` secara otomatis, sehingga navigasi menggunakan tombol Back/Forward browser akan tetap sinkron dengan state `$route`.
