# Steroids Native Module System (Require)

Fitur ini memungkinkan Anda untuk mengimpor file JavaScript lokal menggunakan pola `module.exports` (seperti di Node.js) secara langsung di browser tanpa perlu menggunakan bundler eksternal seperti Webpack atau Vite.

## Fitur Utama
1.  **Synchronous Require**: Mendukung pemanggilan `require()` secara sinkron di dalam methods Vue.
2.  **Asynchronous Require**: Mendukung `requireAsync()` untuk pemuatan non-blocking.
3.  **Module Caching**: File yang sudah dimuat akan disimpan di memori agar tidak terjadi request berulang.
4.  **Debugging Support**: Mendukung `sourceURL` sehingga file yang di-require muncul di Chrome DevTools Sources untuk debugging.

---

## 1. Menyiapkan File Module (.js)
Tulis file JavaScript Anda menggunakan standar `module.exports`.

```javascript
// file: /app/util/email-exporter.js

const Header = "--- Email Export ---";

module.exports = {
    exportToHtml: function(blocks) {
        console.log("Exporting...");
        return `<html><body>${Header}</body></html>`;
    },
    version: "1.0.0"
};
```

---

## 2. Penggunaan di Komponen Vue (.tpl)

### A. Penggunaan Sinkron (Standard)
Gunakan di dalam methods atau lifecycle hooks. Ekstensi `.js` bersifat opsional.

```javascript
<script>
module.exports = {
    methods: {
        handleExport: function() {
            // Memanggil module secara sinkron
            const exporter = require('/app/util/email-exporter');
            
            this.html = exporter.exportToHtml(this.blocks);
            alert('Export Berhasil versi: ' + exporter.version);
        }
    }
}
</script>
```

### B. Penggunaan Asinkron (Recommended for large files)
Gunakan jika file sangat besar untuk menghindari pemblokiran UI thread.

```javascript
async mounted() {
    const bigModule = await requireAsync('/app/large-lib');
    bigModule.init();
}
```

---

## 3. Detail Teknis
- **Pathing**: Path harus bersifat absolut dari root project (dimulai dengan `/`).
- **Sync XHR**: Fungsi `require()` menggunakan Synchronous XMLHttpRequest sebagai fallback jika module belum ada di cache. Ini memastikan kompatibilitas dengan alur kode sinkron di Vue 2.
- **Isolation**: Setiap module dieksekusi dalam scope-nya sendiri. Variabel global yang didefinisikan tanpa `var/let/const` tetap akan masuk ke `window`.

## 4. Tips Debugging
Jika Anda ingin melakukan debug pada file yang di-require:
1. Buka Chrome DevTools.
2. Pergi ke tab **Sources**.
3. Cari di bagian `(no domain)` atau gunakan `Ctrl + P` lalu ketik nama file JS Anda. 
4. Anda bisa memasang breakpoint secara normal karena sistem ini menyertakan `//# sourceURL`.

---

> [!IMPORTANT]
> Fitur ini hanya tersedia di **PDS Vue Dev (Steroids Edition)**. Pastikan Anda menggunakan `dist/vue.js` versi terbaru setelah tanggal 14 Mei 2026.
