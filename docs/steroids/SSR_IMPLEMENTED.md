# Implementation Report: Server-Side Component Bundling (SSR)

Fitur SSR Bundling telah berhasil diimplementasikan ke dalam core engine **Vue 2 Steroids**. Fitur ini dirancang untuk mengoptimalkan pemuatan komponen dengan menggabungkan banyak request file `.tpl` menjadi satu request bundle JavaScript melalui layanan bundler di sisi server.

---

## ✅ Fitur yang Diimplementasikan

### 1. Batch Request Management
Sistem kini secara otomatis mengumpulkan semua path komponen yang dibutuhkan dalam satu siklus inisialisasi dan mengirimkannya sebagai satu payload kolektif ke server.

### 2. Smart Client-Side Caching
Sebelum request dikirim, framework melakukan pengecekan terhadap registry komponen global. Hanya komponen yang **belum pernah dimuat** yang akan dimasukkan ke dalam daftar request bundle.

### 3. Dynamic Execution (Fetch & Inject)
Menggunakan metode **Fetch POST** untuk mengambil bundle (mendukung daftar komponen yang panjang) dan mengeksekusinya via **Dynamic Script Injection**. Penambahan `//# sourceURL` memastikan bundle tetap dapat di-debug melalui Developer Tools.

### 4. Global API Alias
Menambahkan `Vue.dynamicComponent` sebagai alias resmi untuk `Vue.defineDynamicComponent` agar kompatibel dengan format output dari server-side bundler.

---

## 🛠️ Perubahan Kode (Core)

1.  **`src/core/config.ts`**:
    *   Menambahkan `serverSide` (Boolean) - Default: `false`.
    *   Menambahkan `serverSideURL` (String) - Endpoint untuk layanan bundler.

2.  **`src/core/util/dynamic-component-loader.ts`**:
    *   Refaktor `initAsyncComponents` untuk mendukung pengumpulan batch.
    *   Refaktor `loadMultipleAsyncComponents` dengan logic filter cache.
    *   Implementasi `fetchBundledComponents` (The core bundler client).

3.  **`src/core/global-api/index.ts`**:
    *   Registrasi `Vue.dynamicComponent` secara global.

---

## 🚀 Cara Aktivasi

Tambahkan konfigurasi berikut pada `app.config.json` di project superapps Anda:

```json
{
  "serverSide": true,
  "serverSideURL": "http://your-bundler-service.com/bundle"
}
```

---

## 🖥️ Server-Side Bundler (`ssr.js`)

Tersedia sebuah script server standalone yang sangat ringan untuk menangani proses bundling di sisi server.

### Fitur Server:
- **Zero Dependency**: Hanya membutuhkan Node.js (modul internal `http`, `fs`, `path`).
- **Core Logic Parity**: Menggunakan algoritma parsing yang sama dengan core framework (mendukung nested templates).
- **Auto Style Injection**: Mengotomatisasi penyuntikan CSS ke dalam head browser untuk setiap komponen di dalam bundle.

### Cara Menjalankan:
Pindahkan file `ssr.js` ke server Anda dan jalankan perintah:
```bash
# Penggunaan: node ssr.js [base_path_komponen] [port]
node ssr.js ./components 8485
```

---

## 📈 Manfaat Performa
- **Zero HTTP Waterfall**: Mengurangi puluhan request `.tpl` menjadi satu request `.js`.
- **Minified Payload**: Server melakukan penggabungan whitespace pada template untuk memperkecil ukuran bundle.
- **Cache-Aware**: Client secara cerdas hanya meminta komponen yang belum terdaftar di registry global.

---
*Status: Ready for Production Integration*
