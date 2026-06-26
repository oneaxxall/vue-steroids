# POC: Server-Side Component Bundling (SSR)

Dokumen ini mendeskripsikan Proof of Concept (POC) untuk optimasi pemuatan komponen dengan menggabungkan beberapa file `.tpl` menjadi satu paket JavaScript yang sudah ter-minifikasi melalui sisi server.

---

## 🏗️ Arsitektur POC

### 1. Client-Side (Vue 2 Steroids Core)
Modifikasi pada `dynamic-component-loader.ts` untuk mendukung mode `serverSide`.

*   **Existing Cache Check**: Menggunakan logic `hasDynamicComponent(name)` yang sudah ada untuk mem-filter komponen yang sudah terdaftar.
*   **Batching Transition**: Mengubah fungsi `loadMultipleAsyncComponents` yang tadinya melakukan looping fetch individu, menjadi satu pengiriman batch.
*   **Simplified Payload**: Client hanya mengirimkan array berisi path komponen (string).
*   **Bundle Request**: Mengirimkan POST request ke `serverSideURL` berisi daftar path komponen yang *hanya* belum ada di registry.
*   **Dynamic Script Execution**: Mengeksekusi bundle JS hasil respon server menggunakan metode **Fetch + Script Injection**.

### 2. Server-Side (Bundler Service)
Layanan yang bertugas melakukan:
*   **Extraction**: Membaca file `.tpl` dan memecahnya menjadi bagian script, template, dan style.
*   **Component Naming**: Mengambil segmen terakhir dari path sebagai nama komponen.
*   **JS Wrapper**: Membungkus setiap definisi komponen ke dalam template `Vue.defineDynamicComponent('name', { ... })`.

---

## 🚀 Mekanisme Eksekusi Bundle

Untuk memastikan bundle JavaScript dieksekusi dengan aman dan tetap bisa di-debug, POC ini akan menggunakan metode berikut:

1.  **Fetch**: Mengambil konten bundle melalui `fetch` dengan metode POST.
2.  **Injection**: Membuat elemen `<script>` dinamis dan memasukkan konten bundle ke dalam `textContent`.
3.  **Source Mapping**: Menambahkan `//# sourceURL` di akhir bundle agar kode tetap terlihat di tab **Sources** browser.

```javascript
// Contoh implementasi di core
const response = await fetch(config.serverSideURL, {
    method: 'POST',
    body: JSON.stringify({ components: listToLoad })
});
const bundleCode = await response.text();

const script = document.createElement('script');
script.textContent = bundleCode + "\n//# sourceURL=ssr-bundle.js";
document.head.appendChild(script);
document.head.removeChild(script); // Bersihkan DOM setelah eksekusi
```

---

## 🛠️ Strategi Caching & Efisiensi

Logic caching saat ini sudah berjalan dengan baik di sisi client (Skip if Loaded). Optimasi selanjutnya adalah:

1.  **Request Filtering**: Client hanya mengirimkan array path yang benar-benar dibutuhkan.
2.  **Server-Side Caching**: Server bisa menyimpan bundle yang sering diminta di memory (Redis/Local Cache).
3.  **No Redundancy**: Komponen global yang sudah dimuat saat startup tidak akan pernah masuk ke dalam request bundle selanjutnya.

---

## 📝 Contoh Alur Request (Batch)

Jika komponen utama membutuhkan `[A, B, C]` dan `B` sudah teregistrasi:

**Request (POST to Bundler):**
```json
{
    "components": [
        "/path/to/component-a",
        "/path/to/component-c"
    ]
}
```

**Response (JavaScript):**
```javascript
Vue.defineDynamicComponent('component-a', { /* def a */ });
Vue.defineDynamicComponent('component-c', { /* def c */ });
```

---

## 🧪 Langkah Eksekusi POC

1.  **Update `loadMultipleAsyncComponents`**: Tambahkan kondisi `if (config.serverSide)`.
2.  **Fetch Bundler Implementation**: Buat fungsi internal untuk melakukan `fetch` POST ke bundler server.
3.  **Style Handling**: Memastikan bundle JS tetap bisa melakukan injeksi `<style>` ke dalam `<head>` untuk setiap komponen yang dibundel.
4.  **Uji Coba**: Membandingkan jumlah HTTP request di Network Tab sebelum dan sesudah mode `serverSide` diaktifkan.
