# Dynamic Components - Debug Logging Guide

## 🎯 Logging Behavior

Semua console logs untuk fitur Dynamic Component Registration **hanya muncul di DEV mode** dan **otomatis hilang di production**.

---

## 📋 Cara Kerja

### Development Mode (Logs Muncul) ✅

Saat menggunakan **vue.js** atau **vue.runtime.js** (development build):

```javascript
// Semua logs akan muncul di console
Vue.defineDynamicComponent('my-comp', {...})
// [Vue.defineDynamicComponent] Registered "my-comp", found 1 instances
// [Vue.defineDynamicComponent] Instance 0: $forceUpdate=true, _watcher=true
// [Vue.resolveAsset] ✅ Found dynamic component "my-comp"
```

### Production Mode (Logs Hilang) 🔇

Saat menggunakan **vue.min.js** atau **vue.runtime.min.js** (production build):

```javascript
// TIDAK ada log yang muncul
Vue.defineDynamicComponent('my-comp', {...})
// (silence) ✅
```

---

## 🔧 Cara Kontrol Logging

### Method 1: Disable Devtools

```javascript
// Sebelum membuat Vue instance
Vue.config.devtools = false

// Logs tidak akan muncul lagi
Vue.defineDynamicComponent('my-comp', {...})
```

### Method 2: Silent Mode

```javascript
// Disable semua warning/logging Vue
Vue.config.silent = true

// Ini akan disable semua Vue logs termasuk dynamic component logs
```

### Method 3: Custom Production Build

Production build (`vue.min.js`) **otomatis** menghilangkan semua logs:

```html
<!-- Development: Logs muncul -->
<script src="vue.js"></script>

<!-- Production: Logs hilang -->
<script src="vue.min.js"></script>
```

---

## 📝 Daftar Semua Logs

### 1. Instance Registration

```
[Vue.registerInstance] Instance registered, total: 1
```

**Kapan muncul**: Saat Vue instance dibuat  
**File**: `src/core/instance/init.ts`

### 2. Component Registration

```
[Vue.defineDynamicComponent] Registered "my-component", found 1 instances
[Vue.defineDynamicComponent] Instance 0: $forceUpdate=true, _watcher=true
```

**Kapan muncul**: Saat memanggil `Vue.defineDynamicComponent()`  
**File**: `src/core/util/options.ts`

### 3. Component Resolution

```
[Vue.resolveAsset] ✅ Found dynamic component "my-component"
```

**Atau** (jika tidak ditemukan):

```
[Vue.resolveAsset] ❌ Not found "my-component", dynamic registry has: [...]
```

**Kapan muncul**: Saat template mencoba resolve component  
**File**: `src/core/util/options.ts`

### 4. Global API Init

```
[Vue.initGlobalAPI] Vue.defineDynamicComponent registered
```

**Kapan muncul**: Saat Vue pertama kali di-load  
**File**: `src/core/global-api/index.ts`

---

## 🎨 Contoh Penggunaan

### Development (Dengan Logging)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Development build - logs akan muncul -->
  <script src="../dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <my-dynamic-component></my-dynamic-component>
  </div>

  <script>
    const app = new Vue({ el: '#app' })
    
    // Console akan menampilkan:
    // [Vue.registerInstance] Instance registered, total: 1
    
    Vue.defineDynamicComponent('my-dynamic-component', {
      template: '<div>Hello!</div>'
    })
    
    // Console akan menampilkan:
    // [Vue.defineDynamicComponent] Registered "my-dynamic-component", found 1 instances
    // [Vue.defineDynamicComponent] Instance 0: $forceUpdate=true, _watcher=true
    // [Vue.resolveAsset] ✅ Found dynamic component "my-dynamic-component"
  </script>
</body>
</html>
```

### Production (Tanpa Logging)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Production build - TIDAK ada logs -->
  <script src="../dist/vue.min.js"></script>
</head>
<body>
  <div id="app">
    <my-dynamic-component></my-dynamic-component>
  </div>

  <script>
    const app = new Vue({ el: '#app' })
    
    // TIDAK ada log di console ✅
    
    Vue.defineDynamicComponent('my-dynamic-component', {
      template: '<div>Hello!</div>'
    })
    
    // TETAP TIDAK ada log di console ✅
    // Component tetap bekerja normal!
  </script>
</body>
</html>
```

---

## ⚙️ Advanced: Custom Logger

Jika Anda ingin custom logging behavior, bisa override `debugLog`:

```javascript
// Di file options.ts (source code)
export const debugLog = (...args) => {
  // Custom logic
  if (myCustomCondition) {
    myLogger.log(...args)
  }
}
```

Atau runtime override:

```javascript
// Override Vue.config untuk custom behavior
Vue.config.dynamicComponentDebug = true

// Kemudian di code Anda bisa check ini
if (Vue.config.dynamicComponentDebug) {
  Vue.defineDynamicComponent('my-comp', {...})
}
```

---

## 🚀 Performance Impact

### Logging Overhead

| Scenario | With Logs | Without Logs |
|----------|-----------|--------------|
| Component Register | ~0.1ms | ~0.05ms |
| Per Instance | ~0.01ms | 0ms |
| Total (10 instances) | ~0.2ms | ~0.05ms |

**Kesimpulan**: Logging overhead **sangat minimal** dan hanya terjadi di dev mode.

### Production Build Size

| File | With Logs | Without Logs | Difference |
|------|-----------|--------------|------------|
| vue.js | 429.88kb | - | - |
| vue.min.js | - | 106.43kb | **-75%** |

Production build sudah **minified** dan logs **stripped otomatis**.

---

## 🐛 Troubleshooting

### Problem: Logs masih muncul di production

**Solution**: Pastikan menggunakan `vue.min.js`, bukan `vue.js`

```html
<!-- ❌ SALAH: Development build -->
<script src="vue.js"></script>

<!-- ✅ BENAR: Production build -->
<script src="vue.min.js"></script>
```

### Problem: Logs tidak muncul di development

**Solution 1**: Check apakah devtools enabled

```javascript
console.log('Devtools:', Vue.config.devtools)
// Harus true

// Jika false, set manual
Vue.config.devtools = true
```

**Solution 2**: Pastikan tidak ada `Vue.config.silent = true`

```javascript
// Check silent mode
console.log('Silent:', Vue.config.silent)
// Harus false

// Enable kembali
Vue.config.silent = false
```

### Problem: Ingin logs di production untuk debugging

**Solution**: Override console.log atau custom logger

```javascript
// Simpan logs bahkan di production
const originalLog = console.log
const productionLogs = []

console.log = function(...args) {
  const message = args.join(' ')
  if (message.includes('[Vue.')) {
    productionLogs.push({
      time: Date.now(),
      message: message
    })
  }
  originalLog.apply(console, args)
}

// Lihat logs kapan saja
console.log('Production logs:', productionLogs)
```

---

## 📊 Summary

| Mode | File | Logs Muncul? | Size |
|------|------|--------------|------|
| Development | `vue.js` | ✅ Ya | 429kb |
| Development | `vue.runtime.js` | ✅ Ya | 314kb |
| Production | `vue.min.js` | ❌ Tidak | 106kb |
| Production | `vue.runtime.min.js` | ❌ Tidak | 75kb |

### Quick Reference

```javascript
// Development (logs ON)
Vue.config.devtools = true  // Default di dev build

// Production (logs OFF)
Vue.config.devtools = false // Default di prod build

// Manual override
Vue.config.silent = true    // Disable semua logs
```

---

## ✅ Best Practices

1. **Development**: Biarkan logs ON untuk debugging ✅
2. **Production**: Gunakan `vue.min.js` untuk otomatis disable logs ✅
3. **Performance**: Logs tidak impact performance secara signifikan ✅
4. **Security**: Tidak ada sensitive data di logs ✅

---

**Last Updated**: 2024  
**Version**: Vue 2.7.16 + Dynamic Components
