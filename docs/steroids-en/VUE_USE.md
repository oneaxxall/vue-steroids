
# Vue Use 

- useBluetooth
- useBreakpoints
- useBroadcastChannel
- useBrowserLocation
- useClipboard
- useClipboardItems
- useColorMode
- useCssSupports
- useCssVar
- useDark
- useEventListener
- useEyeDropper
- useFavicon
- useFileDialog
- useFileSystemAccess
- useFullscreen
- useGamepad
- useImage
- useMediaControls
- useMediaQuery
- useMemory
- useObjectUrl
- usePerformanceObserver
- usePermission
- usePreferredColorScheme
- usePreferredContrast
- usePreferredDark
- usePreferredLanguages
- usePreferredReducedMotion
- usePreferredReducedTransparency
- useScreenOrientation
- useScreenSafeArea
- useScriptTag
- useShare
- useSSRWidth
- useStyleTag
- useTextareaAutosize
- useTextDirection
- useTitle
- useUrlSearchParams
- useVibrate
- useWakeLock
- useWebNotification
- useWebWorker
- useWebWorkerFn

# Vue 2 Built-in Hooks / Composables Helpers

## 🎯 Overview

Vue 2 now has **Built-in Hooks / Composables Helpers** integrated directly! This feature is similar to the concept of **VueUse** or **Composables** in Vue 3, but specifically adapted for Vue 2 so it can be used easily via the `hooks` option or built-in methods.

No need to install additional libraries - everything is already inside Vue!

---

## ✨ Key Features

- ✅ **Hooks Option** - New option on components: `hooks: function() {}`
- ✅ **Built-in Helpers** - Ready-to-use methods (onClickOutside, onEscape, etc.)
- ✅ **Auto Cleanup** - Event listeners are automatically cleaned up when the component is destroyed
- ✅ **Context Ready** - Can access `this` (data, methods, computed) inside hooks
- ✅ **Zero Dependencies** - Pure Vue, no additional libraries

---

## 📖 Basic Usage

Use the `hooks` option in the component definition. This function automatically runs when the component is created (right after the `created` lifecycle).

### Example 1: Simple onClickOutside

```javascript
Vue.component('my-dropdown', {
  data() {
    return {
      show: false
    }
  },
  
  template: `
    <div ref="dropdown">
      <button @click="show = !show">Toggle Dropdown</button>
      <ul v-if="show">
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  `,
  
  // Hooks run automatically
  hooks() {
    // Close dropdown when user clicks outside the element
    this.onClickOutside('dropdown', () => {
      this.show = false
    })
  } , 
})
```

---

### Example 2: Modal with Escape Key

```javascript
Vue.component('my-modal', {
  data() {
    return { isOpen: true }
  },
  
  template: `
    <div v-if="isOpen" ref="modal" class="modal-backdrop">
      <div class="modal-content">
        <h2>Modal Title</h2>
        <button @click="isOpen = false">Close</button>
      </div>
    </div>
  `,
  
  hooks() {
    // 1. Close if click outside the modal
    this.onClickOutside('modal', () => {
      this.isOpen = false
    })
    
    // 2. Close if ESC key is pressed
    this.onEscape(() => {
      this.isOpen = false
    })
  }
})
```

---

## 🔧 API Reference

### 1. `this.onClickOutside(refName, callback)`

Detects clicks outside the element referenced by `$ref`. Very useful for dropdowns, modals, and popovers.

*   **refName**: String name of the ref (e.g., `'myDropdown'`).
*   **callback**: Function to execute when a click outside is detected.

```javascript
// Usage example
this.onClickOutside('popover', () => {
  this.showPopover = false
})
```

---

### 2. `this.onWindowResize(callback, options?)`

Detects browser window resize events.

*   **callback**: Function to execute on resize.
*   **options**: Configuration object.
    *   `immediate` (Boolean): Execute callback immediately on mount (default: false).

```javascript
// Usage example
this.onWindowResize(() => {
  this.windowWidth = window.innerWidth
  this.calculateLayout()
}, { immediate: true })
```

---

### 3. `this.onScroll(target, callback)`

Detects scroll events on a specific element or the window.

*   **target**: CSS selector string (e.g., `'.sidebar'`) or Element object.
*   **callback**: Function to execute on scroll.

```javascript
// Usage example with selector
this.onScroll('.main-content', (event) => {
  if (event.target.scrollTop > 100) {
    this.showBackToTop = true
  }
})

// Usage example with Window object
this.onScroll(window, () => {
  // Handle window scroll
})
```

---

### 4. `this.onKeyPress(key, callback)`

Detects specific keyboard key presses.

*   **key**: String name of the key (e.g., `'Enter'`, `'Escape'`, `'a'`). Can use `e.key` or `e.code`.
*   **callback**: Function to execute.

```javascript
// Usage example
this.onKeyPress('Enter', () => {
  this.submitForm()
})
```

---

### 5. `this.onEscape(callback)`

Shorthand for `this.onKeyPress('Escape', callback)`. Commonly used to close modals.

*   **callback**: Function to execute when the ESC key is pressed.

```javascript
// Usage example
this.onEscape(() => {
  this.closeDialog()
})
```

---

### 6. `this.useDebounce(callback, delay)`

Creates a "debounce" function. The new function will only be called after the user stops calling it for `delay` milliseconds. Useful for search inputs.

*   **callback**: Original function.
*   **delay**: Wait time in ms (default: 300).
*   **Returns**: New debounced function.

```javascript
// Usage example
hooks() {
  // Create a search function with 500ms delay
  const search = this.useDebounce((query) => {
    this.fetchResults(query)
  }, 500)
  
  // Save to instance so it can be used in methods/template
  this.debouncedSearch = search
},

methods: {
  handleInput(e) {
    this.debouncedSearch(e.target.value)
  }
}
```

---

### 7. `this.useThrottle(callback, delay)`

Creates a "throttle" function. The new function will be called at most once per `delay` milliseconds. Useful for events that fire very frequently, such as scroll or mouse move.

*   **callback**: Original function.
*   **delay**: Minimum call interval in ms (default: 300).
*   **Returns**: New throttled function.

```javascript
// Usage example
hooks() {
  const handleScroll = this.useThrottle(() => {
    console.log('Scroll event handled max once per 100ms')
  }, 100)
  
  this.onScroll(window, handleScroll)
}
```

---

## 🔄 Lifecycle & Auto Cleanup

One of the advantages of using built-in hooks is **Auto Cleanup**.

When you use a helper like `onClickOutside` or `onWindowResize`, Vue automatically adds the event listener. More importantly, Vue also automatically **removes** the listener in the `beforeDestroy` lifecycle.

**Without Hooks (Manual):**
```javascript
mounted() {
  this._handler = () => { ... }
  window.addEventListener('resize', this._handler)
},
beforeDestroy() {
  window.removeEventListener('resize', this._handler) // Must do it manually!
}
```

**With Hooks (Automatic):**
```javascript
hooks() {
  this.onWindowResize(() => { ... })
  // Automatically cleaned up when component is destroyed! ✅
}
```

---

## 💡 Advanced Examples

### Example: Infinite Scroll

Combining `onScroll` and `useThrottle` for maximum performance.

```javascript
Vue.component('infinite-list', {
  data() {
    return { page: 1, loading: false }
  },
  template: `
    <div ref="list" class="scroll-container">
      <div v-for="item in items" :key="item.id">{{ item.name }}</div>
      <div v-if="loading">Loading...</div>
    </div>
  `,
  
  hooks() {
    // Use throttle to avoid checking too frequently
    const checkBottom = this.useThrottle(() => {
      const el = this.$refs.list
      // Check if the user has scrolled near the bottom
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
        this.loadMore()
      }
    }, 200)

    this.onScroll(this.$refs.list, checkBottom)
  },
  
  methods: {
    async loadMore() {
      if (this.loading) return
      this.loading = true
      // Fetch data...
      this.page++
      this.loading = false
    }
  }
})
```

---

### Example: Search Input with Debounce

```javascript
Vue.component('smart-search', {
  data() {
    return { query: '', results: [] }
  },
  template: `<input v-model="query" @input="onInput" placeholder="Search..." />`,
  
  hooks() {
    // Debounce 300ms
    this.debouncedFetch = this.useDebounce(async (val) => {
      if (!val) {
        this.results = []
        return
      }
      const res = await fetch(`/api/search?q=${val}`)
      this.results = await res.json()
    }, 300)
  },
  
  methods: {
    onInput() {
      // Call the debounced function
      this.debouncedFetch(this.query)
    }
  }
})
```

---

## 🐛 Troubleshooting

### Problem: "Ref not found"

**Solution:** Make sure the `ref="name"` attribute exists in the template. Remember, `ref` can only be accessed after the component is mounted, but since hooks run after created (and helpers usually wait for `$nextTick`), make sure the element actually exists (not wrapped in a `v-if` that is false initially).

```html
<!-- Wrong: ref does not exist if v-if is false -->
<div v-if="false" ref="myElement"></div>

<!-- Correct: Use v-show or ensure it's true -->
<div v-show="true" ref="myElement"></div>
```

### Problem: "this is undefined in callback"

**Solution:** Make sure the callback uses an **Arrow Function** `() => {}` so the `this` context still points to the Vue instance.

```javascript
// ❌ Wrong (this will point to window/element)
this.onClickOutside('el', function() {
  console.log(this.show) // undefined
})

// ✅ Correct
this.onClickOutside('el', () => {
  console.log(this.show) // defined
})
```

---

## 📊 Comparison

| Feature | Manual AddEventListener | Vue Hooks / Composables |
|---------|-------------------------|-------------------------|
| Setup Code | Verbose (many lines) | Simple (1 line) |
| Cleanup | Manual (`beforeDestroy`) | ✅ **Automatic** |
| Context (`this`) | Must bind/arrow func | ✅ Arrow func ready |
| Reusability | Difficult | ✅ Can create custom helpers |
| Debounce/Throttle | Manual / other libraries | ✅ Built-in |

---

**Version**: Vue 2.7.16 + Built-in Hooks  
**Last Updated**: 2024
