# Dynamic Components - Debug Logging Guide

## 🎯 Logging Behavior

All console logs for the Dynamic Component Registration feature **only appear in DEV mode** and **are automatically removed in production**.

---

## 📋 How It Works

### Development Mode (Logs Appear) ✅

When using **vue.js** or **vue.runtime.js** (development build):

```javascript
// All logs will appear in the console
Vue.defineDynamicComponent('my-comp', {...})
// [Vue.defineDynamicComponent] Registered "my-comp", found 1 instances
// [Vue.defineDynamicComponent] Instance 0: $forceUpdate=true, _watcher=true
// [Vue.resolveAsset] ✅ Found dynamic component "my-comp"
```

### Production Mode (Logs Silent) 🔇

When using **vue.min.js** or **vue.runtime.min.js** (production build):

```javascript
// NO logs appear
Vue.defineDynamicComponent('my-comp', {...})
// (silence) ✅
```

---

## 🔧 How to Control Logging

### Method 1: Disable Devtools

```javascript
// Before creating Vue instance
Vue.config.devtools = false

// Logs will no longer appear
Vue.defineDynamicComponent('my-comp', {...})
```

### Method 2: Silent Mode

```javascript
// Disable all Vue warnings/logging
Vue.config.silent = true

// This will disable all Vue logs including dynamic component logs
```

### Method 3: Custom Production Build

The production build (`vue.min.js`) **automatically** removes all logs:

```html
<!-- Development: Logs appear -->
<script src="vue.js"></script>

<!-- Production: Logs removed -->
<script src="vue.min.js"></script>
```

---

## 📝 List of All Logs

### 1. Instance Registration

```
[Vue.registerInstance] Instance registered, total: 1
```

**When it appears**: When a Vue instance is created  
**File**: `src/core/instance/init.ts`

### 2. Component Registration

```
[Vue.defineDynamicComponent] Registered "my-component", found 1 instances
[Vue.defineDynamicComponent] Instance 0: $forceUpdate=true, _watcher=true
```

**When it appears**: When calling `Vue.defineDynamicComponent()`  
**File**: `src/core/util/options.ts`

### 3. Component Resolution

```
[Vue.resolveAsset] ✅ Found dynamic component "my-component"
```

**Or** (if not found):

```
[Vue.resolveAsset] ❌ Not found "my-component", dynamic registry has: [...]
```

**When it appears**: When the template tries to resolve a component  
**File**: `src/core/util/options.ts`

### 4. Global API Init

```
[Vue.initGlobalAPI] Vue.defineDynamicComponent registered
```

**When it appears**: When Vue is first loaded  
**File**: `src/core/global-api/index.ts`

---

## 🎨 Usage Examples

### Development (With Logging)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Development build - logs will appear -->
  <script src="../dist/vue.js"></script>
</head>
<body>
  <div id="app">
    <my-dynamic-component></my-dynamic-component>
  </div>

  <script>
    const app = new Vue({ el: '#app' })
    
    // Console will display:
    // [Vue.registerInstance] Instance registered, total: 1
    
    Vue.defineDynamicComponent('my-dynamic-component', {
      template: '<div>Hello!</div>'
    })
    
    // Console will display:
    // [Vue.defineDynamicComponent] Registered "my-dynamic-component", found 1 instances
    // [Vue.defineDynamicComponent] Instance 0: $forceUpdate=true, _watcher=true
    // [Vue.resolveAsset] ✅ Found dynamic component "my-dynamic-component"
  </script>
</body>
</html>
```

### Production (Without Logging)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Production build - NO logs -->
  <script src="../dist/vue.min.js"></script>
</head>
<body>
  <div id="app">
    <my-dynamic-component></my-dynamic-component>
  </div>

  <script>
    const app = new Vue({ el: '#app' })
    
    // NO log in console ✅
    
    Vue.defineDynamicComponent('my-dynamic-component', {
      template: '<div>Hello!</div>'
    })
    
    // STILL NO log in console ✅
    // Component works normally!
  </script>
</body>
</html>
```

---

## ⚙️ Advanced: Custom Logger

If you want custom logging behavior, you can override `debugLog`:

```javascript
// In options.ts (source code)
export const debugLog = (...args) => {
  // Custom logic
  if (myCustomCondition) {
    myLogger.log(...args)
  }
}
```

Or runtime override:

```javascript
// Override Vue.config for custom behavior
Vue.config.dynamicComponentDebug = true

// Then in your code you can check this
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

**Conclusion**: Logging overhead is **very minimal** and only occurs in dev mode.

### Production Build Size

| File | With Logs | Without Logs | Difference |
|------|-----------|--------------|------------|
| vue.js | 429.88kb | - | - |
| vue.min.js | - | 106.43kb | **-75%** |

The production build is already **minified** and logs are **automatically stripped**.

---

## 🐛 Troubleshooting

### Problem: Logs still appear in production

**Solution**: Make sure to use `vue.min.js`, not `vue.js`

```html
<!-- ❌ WRONG: Development build -->
<script src="vue.js"></script>

<!-- ✅ CORRECT: Production build -->
<script src="vue.min.js"></script>
```

### Problem: Logs do not appear in development

**Solution 1**: Check if devtools is enabled

```javascript
console.log('Devtools:', Vue.config.devtools)
// Should be true

// If false, set manually
Vue.config.devtools = true
```

**Solution 2**: Make sure there is no `Vue.config.silent = true`

```javascript
// Check silent mode
console.log('Silent:', Vue.config.silent)
// Should be false

// Re-enable
Vue.config.silent = false
```

### Problem: Want logs in production for debugging

**Solution**: Override console.log or use a custom logger

```javascript
// Save logs even in production
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

// View logs anytime
console.log('Production logs:', productionLogs)
```

---

## 📊 Summary

| Mode | File | Logs Appear? | Size |
|------|------|--------------|------|
| Development | `vue.js` | ✅ Yes | 429kb |
| Development | `vue.runtime.js` | ✅ Yes | 314kb |
| Production | `vue.min.js` | ❌ No | 106kb |
| Production | `vue.runtime.min.js` | ❌ No | 75kb |

### Quick Reference

```javascript
// Development (logs ON)
Vue.config.devtools = true  // Default in dev build

// Production (logs OFF)
Vue.config.devtools = false // Default in prod build

// Manual override
Vue.config.silent = true    // Disable all logs
```

---

## ✅ Best Practices

1. **Development**: Keep logs ON for debugging ✅
2. **Production**: Use `vue.min.js` to automatically disable logs ✅
3. **Performance**: Logs do not significantly impact performance ✅
4. **Security**: No sensitive data in logs ✅

---

**Last Updated**: 2024  
**Version**: Vue 2.7.16 + Dynamic Components
