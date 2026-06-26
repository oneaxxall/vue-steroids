# Documentation: Template Loading (`scope="loading"`)

Fitur `template scope="loading"` adalah salah satu inovasi utama dalam framework **Vue 2 Steroids** yang memungkinkan pengembang untuk mendefinisikan UI loading secara deklaratif di dalam file `.tpl` tanpa mengotori template utama dengan logic `v-if`.

---

## 🚀 Cara Penggunaan

Cukup tambahkan blok `<template scope="loading">` di samping template utama Anda.

```html
<script>
module.exports = {
    name: 'MyComponent',
    asyncComponents: [
        '/components/heavy-chart',
        '/components/data-table'
    ],
    // ... logic lainnya
}
</script>

<!-- Template ini akan muncul otomatis selama asyncComponents dimuat -->
<template scope="loading">
    <div class="flex items-center justify-center p-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span class="ml-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Memuat Dependensi...
        </span>
    </div>
</template>

<!-- Template utama (otomatis dirender setelah semua siap) -->
<template>
    <div class="p-6">
        <heavy-chart />
        <data-table />
    </div>
</template>
```

---

## ⚙️ Bagaimana Cara Kerjanya?

Berbeda dengan pendekatan standard yang menggunakan `v-if` di level user-land, fitur ini diimplementasikan langsung pada **Core Lifecycle** Vue 2 Steroids.

### 1. Parsing & Extraction
Saat file `.tpl` dimuat via `loadAsyncComponent`, loader akan memisahkan konten berdasarkan tag:
- `<template scope="loading">` diekstrak ke properti `loadingTemplate`.
- `<template>` standar diekstrak ke properti `template`.

### 2. Reactive State Management
Fungsi `initAsyncComponents` di core engine secara otomatis mendeteksi keberadaan `loadingTemplate`. Jika ada, sistem akan menyetel properti internal reaktif `this.$loading = true`.

### 3. Render Swapping (Core Level)
Keajaiban terjadi di dalam internal method `_render` (pada `src/core/instance/render.ts`). Framework melakukan intersepsi sebelum rendering terjadi:

```typescript
// Pseudocode Logic di Core
if (vm.$loading && vm.$options.loadingTemplate) {
    // Gunakan render function hasil kompilasi loadingTemplate
    return renderLoading(vm); 
} else {
    // Gunakan render function utama
    return renderMain(vm);
}
```

Sistem akan menukar fungsi render secara *on-the-fly*. Begitu semua komponen di dalam `asyncComponents` selesai di-fetch, `$loading` berubah menjadi `false`, memicu re-render otomatis ke template utama.

---

## 🌟 Keuntungan Utama

1.  **Isolasi Kode**: Template utama Anda tidak perlu tahu tentang state loading. Tidak ada lagi `v-if="!isLoading"` yang membungkus seluruh halaman.
2.  **Zero Boilerplate**: Anda tidak perlu membuat variabel `isLoading: true` di dalam `data()` secara manual.
3.  **Static Optimization**: Framework memisahkan cache optimasi (`staticRenderFns`) antara template loading dan template utama, memastikan performa tetap maksimal.
4.  **UX Konsisten**: Memastikan pengguna tidak melihat elemen yang belum siap (misal: tag komponen kustom yang belum terdaftar) selama proses fetch berlangsung.

---

## 🔄 Lifecycle Flow

1.  **Fetch `.tpl`**: File diunduh dan diparsing.
2.  **Instance Init**: Properti `$loading` disetel ke `true`.
3.  **First Render**: Framework mendeteksi `$loading: true`, merender `loadingTemplate`.
4.  **Async Load**: Semua file di `asyncComponents` diunduh secara paralel.
5.  **Completion**: Setelah semua selesai, `$loading` disetel ke `false`.
6.  **Auto Re-render**: Vue mendeteksi perubahan reaktif, memanggil `_render` kembali, dan kini merender template utama.

---

> [!TIP]
> Anda bisa menggunakan template loading yang sama secara global dengan menyetelnya di level layout jika aplikasi Anda memiliki pola loading yang seragam.

---

## 🧩 Dukungan Komponen Dinamis

Fitur `loadingTemplate` tidak terbatas pada file `.tpl` statis, tetapi juga didukung penuh oleh sistem pendaftaran komponen dinamis framework.

### 1. Pendaftaran Manual via `defineDynamicComponent`
Anda bisa mendaftarkan komponen secara programatik dengan menyertakan properti `loadingTemplate`.

```javascript
Vue.defineDynamicComponent('custom-widget', {
    asyncComponents: ['/api/heavy-data'],
    loadingTemplate: `<div class="shimmer">Memuat data widget...</div>`,
    template: `<div class="widget-content"><heavy-data /></div>`
});
```

### 2. Integrasi Auto-Fetch
Sistem **Auto-Fetch** (yang memuat komponen berdasarkan nama tag secara otomatis) telah dikonfigurasi untuk mengekstrak blok loading. Jika Anda menggunakan tag yang belum terdaftar:

1.  Framework mendeteksi tag `<user-profile />`.
2.  Framework mencari file `/components/user/user-profile.tpl`.
3.  Jika file tersebut memiliki `<template scope="loading">`, maka properti tersebut akan otomatis didaftarkan ke dalam registry global.

### 3. Memahami Perbedaan Fase Loading
Penting untuk membedakan dua fase loading yang terjadi:

| Fase | Deskripsi | Status UI |
|------|-----------|-----------|
| **Fetching Component** | Saat file `.tpl` sedang diunduh pertama kali. | Placeholder kosong (transisi sangat singkat). |
| **Initializing Dependencies** | File `.tpl` sudah ada, tapi sedang menunggu `asyncComponents` miliknya. | **`loadingTemplate` dirender.** |

Fitur ini dirancang untuk memberikan feedback instan kepada pengguna saat sebuah modul besar sedang menyiapkan sub-komponennya, memastikan aplikasi tetap terasa responsif meskipun sedang melakukan banyak operasi I/O secara paralel.
