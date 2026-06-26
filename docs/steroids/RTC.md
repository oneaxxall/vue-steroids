# PDS Vue Native RTC (Real-Time Communication)

Fitur RTC ini adalah implementasi WebSocket native yang terintegrasi langsung ke dalam core Vue. Fitur ini dirancang untuk menggantikan dependency eksternal seperti `pusher-js` dan `laravel-echo`, sehingga mengurangi ukuran bundle dan meningkatkan performa.

## 🚀 Fitur Utama
- **Zero Dependency**: Menggunakan native `WebSocket` browser (~80KB lebih ringan).
- **Auto-Authentication**: Mendukung Private dan Presence channel dengan handshake otomatis.
- **Echo-Compatible API**: Sintaks yang familiar bagi pengguna Laravel Echo.
- **Integrated Options**: Mendukung block `rtc` langsung di dalam struktur komponen.
- **Echo Compatibility**: Tersedia via `this.$echo` untuk kemudahan migrasi.
- **Global Access**: Tersedia via `this.$rtc`, `this.$echo`, dan `window.HelperRTC`.

## ⚙️ Konfigurasi
Tambahkan konfigurasi berikut pada file `app.config.json` aplikasi Anda:

```json
{
  "socket": {
    "enabled": true,
    "broadcaster": "pusher",
    "key": "pds_reverb_key",
    "host": "ws.pusher.local",
    "port": 80,
    "forceTLS": false,
    "authEndpoint": "/broadcasting/auth"
  }
}
```

## 🔌 Inisialisasi (Otomatis)
Fitur RTC ini sudah mendukung **Auto-Initialization**. Anda **TIDAK PERLU** lagi memanggil `Vue.rtc.init()` secara manual.

### Cara Kerja:
Begitu aplikasi melakukan set konfigurasi ke `Vue.config.socket` (biasanya saat bootstrap), RTC Driver akan mendeteksi perubahan tersebut dan otomatis melakukan koneksi jika `enabled: true`.

```javascript
// Di libraries/core/main.js, cukup lakukan ini (Standard Steroids):
setVueConfig : function (appConfig) {
    Object.entries(appConfig).forEach(([key, value]) => {
        Vue.config[key] = value; // RTC otomatis connect di sini!
    });
}
```

## 🔐 Autentikasi (Bearer Token)
Fitur RTC ini **otomatis** menggunakan sistem autentikasi yang ada di core framework. Anda tidak perlu menyetel header Authorization secara manual untuk socket.

### Cara Kerja:
1. Saat melakukan subscribe ke `private-` atau `presence-` channel, driver akan memicu handshake ke `authEndpoint`.
2. Handshake ini menggunakan helper `httpPost` internal.
3. Helper tersebut secara otomatis mengambil token dari `Vue.config.axiosToken` atau storage.

## 📖 Penggunaan (API)

### 1. RTC Option (Recommended)
Cara paling rapi untuk mendefinisikan listener realtime di dalam komponen. Opsi ini otomatis dijalankan saat komponen diinisialisasi.

```javascript
module.exports = {
    rtc: function() {
        this.$echo.channel('chat-room')
            .listen('.NewMessage', this.onNewMessage)
            .listen('.UserJoined', (data) => {
                this.users.push(data.user);
            });
    },
    methods: {
        onNewMessage: function(data) {
            this.messages.push(data);
        }
    }
}
```

### 2. Echo API (Preferred for Migration)
Cara paling mudah untuk memigrasi kode Laravel Echo lama Anda. Sintaksnya identik.

```javascript
// Mendengarkan channel publik
this.$echo.channel('news').listen('.Update', (e) => { ... });

// Mendengarkan channel privat (Auto-prefix 'private-')
this.$echo.private('user.1').listen('.Notify', (e) => { ... });

// Bergabung ke Presence channel (Auto-prefix 'presence-')
this.$echo.join('whiteboard')
    .here(users => ...)
    .joining(user => ...)
    .leaving(user => ...);

// Keluar dari channel
this.$echo.leave('news');
```

### 3. Simple Listen Shortcuts
Cara cepat untuk mendengarkan event di channel tertentu (Shortcut).

```javascript
this.$channel('chat')
    .listen('MessageSent', (data) => {
        console.log('Pesan baru:', data.message);
    });

// Berhenti mendengarkan event spesifik
this.$channel('chat').stopListening('MessageSent');

// Keluar dari channel sepenuhnya
this.$leave('chat');
```

### 🔐 Private Channels
Untuk channel yang membutuhkan autentikasi backend (handshake otomatis):

```javascript
this.$private('user.' + userId)
    .listen('.UpdateEvent', (data) => {
        console.log('Update khusus:', data);
    });
```

### 💨 Whisper (Client Events)
Kirim data antar client secara langsung (P2P via socket server) tanpa lewat database/backend. Driver akan otomatis menangani prefix `client-`:

```javascript
// Kirim whisper
this.$channel('chat').whisper('typing', { user: 'Gue' });

// Terima whisper
this.$channel('chat').listenForWhisper('typing', (data) => {
    console.log(data.user + ' sedang mengetik...');
});
```

### 👥 Presence Channels (Kolaborasi)
Untuk fitur yang butuh daftar pengguna online (seperti whiteboard atau chat grup):

```javascript
this.$join('whiteboard')
    .here((users) => {
        console.log('User online:', users);
    })
    .joining((user) => {
        console.log(user.name + ' baru gabung');
    })
    .leaving((user) => {
        console.log(user.name + ' keluar');
    })
    .listen('.WhiteboardUpdated', (data) => {
        this.syncBoard(data);
    });
```

### 3. Manual Channel Management
Untuk penggunaan di dalam methods atau lifecycle hooks lainnya.

```javascript
this.$channel('chat-room')
    .listen('.NewMessage', (e) => { ... });
```

## 📦 Migrasi (Menghapus Dependency Lama)
Setelah menggunakan fitur native ini, Anda wajib menghapus library lama untuk optimalisasi:
1. Hapus `pusher.min.js` dan `echo.min.js` dari `libraries/app.assets.js`.
2. Hapus entry library tersebut dari script `scripts/packjs`.
3. Re-build aplikasi Anda untuk mendapatkan ukuran bundle yang lebih kecil.

## 📡 Monitoring Status Koneksi

Anda tidak perlu lagi menggunakan `addEventListener` manual. Ada dua cara yang jauh lebih mudah:

### 1. Cara Reaktif (Dalam Template)
Status koneksi sekarang bersifat reaktif. Anda bisa menggunakannya langsung di HTML atau Computed Properties.

```html
<!-- Status akan berubah otomatis: disconnected -> connecting -> connected -->
<div :class="['status-badge', $rtc.state.status]">
    Status: {{ $rtc.state.status }}
</div>
```

### 2. Event Listener (Dalam RTC Block)
Gunakan method `.on()` untuk menangkap perubahan status secara spesifik.

```javascript
rtc: function() {
    this.$rtc
        .on('connected', (data) => {
            console.log('Mantap! Terhubung dengan ID:', data.socketId);
        })
        .on('disconnected', () => {
            console.warn('Waduh, koneksi putus...');
        })
        .on('error', (err) => {
            console.error('Ada masalah socket:', err);
        });
}
```

## 🛠️ Troubleshooting
- Ketik **`window.HelperRTC.state`** atau **`this.$echo`** di console untuk melihat state aktif.
- Status koneksi reaktif! Anda bisa pakai di template: `<div v-if="$rtc.state.status === 'connected'">...</div>`.
- Gunakan **`this.$echo.leave('channel-name')`** di hook `beforeDestroy` untuk menghemat resource socket.
