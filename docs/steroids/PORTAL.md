# Vue 2 Built-in Portal

## 🎯 Overview

Vue 2 sekarang memiliki **Portal** built-in yang memungkinkan Anda me-render component ke tempat lain di DOM, mirip dengan `react-portal` atau `portal-vue`, tapi terintegrasi langsung ke dalam Vue!

---

## ✨ Use Cases

Portal sangat berguna untuk:

- ✅ **Modals & Dialogs** - Render di luar component tree
- ✅ **Tooltips & Popovers** - Position relative to body
- ✅ **Notifications & Toasts** - Global notification area
- ✅ **Dropdowns** - Avoid overflow:hidden issues
- ✅ **Sidebars & Drawers** - Fixed position elements
- ✅ **Full-screen overlays** - Render above everything

---

## 📦 Quick Start

### 1. Basic Usage

```html
<template>
  <div>
    <button @click="showModal = true">Open Modal</button>
    
    <!-- Modal akan di-render ke body, bukan di component ini -->
    <portal to="modal">
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h2>Modal Title</h2>
          <p>This is rendered in body!</p>
          <button @click="showModal = false">Close</button>
        </div>
      </div>
    </portal>
  </div>
</template>

<script>
export default {
  data: () => ({
    showModal: false
  })
}
</script>
```

### 2. Create Portal Target

```html
<!-- Di layout utama atau App.vue -->
<body>
  <div id="app"></div>
  
  <!-- Portal targets -->
  <portal-target name="modal"></portal-target>
  <portal-target name="notification"></portal-target>
  <portal-target name="tooltip"></portal-target>
</body>
```

---

## 📖 API Reference

### `<portal>` Component

Render content to a different location in the DOM.

```html
<portal
  to="target-name"
  :disabled="false"
  :order="0"
  :append="true"
  container="body"
  @mounted="onMounted"
  @unmounted="onUnmounted"
  @sent="onSent"
>
  <!-- Content to teleport -->
  <div>Hello Portal!</div>
</portal>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | String | `'default'` | Portal target name |
| `disabled` | Boolean | `false` | Disable portal (render in place) |
| `order` | Number | `0` | Order for multiple portals |
| `append` | Boolean | `true` | Append or replace target content |
| `container` | String | `'body'` | CSS selector for target container |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `mounted` | - | When portal content is mounted |
| `unmounted` | `targetName` | When portal content is unmounted |
| `sent` | `targetName` | When content is sent to target |

### `<portal-target>` Component

Defines where portal content should be rendered.

```html
<portal-target
  name="target-name"
  :create="true"
  container="body"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | String | **required** | Target name |
| `create` | Boolean | `true` | Auto-create target element |
| `container` | String | `'body'` | Container CSS selector |

### Global Methods

```javascript
// Create portal target manually
Vue.createPortalTarget('modal', document.body)

// Remove portal target
Vue.removePortalTarget('modal')

// Clear portal content
Vue.clearPortal('modal')

// Get target element
const target = Vue.getPortalTarget('modal')

// Check if target exists
const exists = Vue.hasPortalTarget('modal')

// Get all targets
const allTargets = Vue.getAllPortalTargets()

// Debug: log all portals
Vue.debugPortals()
```

---

## 💡 Examples

### Example 1: Modal Dialog

```html
<template>
  <div>
    <button @click="showModal = true">Open Modal</button>
    
    <portal to="modal" :disabled="!showModal">
      <div class="modal-overlay" @click="showModal = false">
        <div class="modal" @click.stop>
          <slot></slot>
          <button @click="showModal = false">Close</button>
        </div>
      </div>
    </portal>
  </div>
</template>

<script>
export default {
  data: () => ({
    showModal: false
  })
}
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
}
</style>
```

### Example 2: Notification System

```html
<!-- App.vue -->
<template>
  <div id="app">
    <router-view></router-view>
    
    <!-- Notification portal -->
    <portal-target name="notifications" container="#app"></portal-target>
  </div>
</template>

<!-- NotificationComponent.vue -->
<template>
  <portal to="notifications" :order="timestamp">
    <div class="notification" :class="type">
      <span>{{ message }}</span>
      <button @click="close">×</button>
    </div>
  </portal>
</template>

<script>
export default {
  props: ['message', 'type'],
  data: () => ({
    timestamp: Date.now()
  }),
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>
```

### Example 3: Tooltip

```html
<template>
  <div class="tooltip-wrapper">
    <div @mouseenter="show = true" @mouseleave="show = false">
      <slot name="trigger"></slot>
    </div>
    
    <portal to="tooltips" :disabled="!show">
      <div class="tooltip" :style="tooltipStyle">
        <slot name="content"></slot>
      </div>
    </portal>
  </div>
</template>

<script>
export default {
  data: () => ({
    show: false,
    tooltipStyle: {}
  }),
  
  watch: {
    show(val) {
      if (val) {
        this.$nextTick(() => {
          const trigger = this.$el.querySelector('[slot="trigger"]')
          const rect = trigger.getBoundingClientRect()
          
          this.tooltipStyle = {
            position: 'fixed',
            top: `${rect.bottom + 10}px`,
            left: `${rect.left}px`
          }
        })
      }
    }
  }
}
</script>
```

### Example 4: Multiple Portals

```html
<template>
  <div>
    <!-- Multiple portals to same target -->
    <portal to="sidebar" :order="1">
      <div class="sidebar-item">Item 1</div>
    </portal>
    
    <portal to="sidebar" :order="2">
      <div class="sidebar-item">Item 2</div>
    </portal>
    
    <portal to="sidebar" :order="3">
      <div class="sidebar-item">Item 3</div>
    </portal>
  </div>
</template>
```

### Example 5: Conditional Portal

```html
<template>
  <div>
    <button @click="enablePortal = !enablePortal">
      {{ enablePortal ? 'Disable' : 'Enable' }} Portal
    </button>
    
    <!-- Portal can be toggled -->
    <portal to="content" :disabled="!enablePortal">
      <div>This content can be teleported</div>
    </portal>
  </div>
</template>

<script>
export default {
  data: () => ({
    enablePortal: false
  })
}
</script>
```

### Example 6: Full-Screen Overlay

```html
<template>
  <portal to="overlay" :disabled="!showOverlay">
    <transition name="fade">
      <div v-if="showOverlay" class="full-screen-overlay">
        <div class="overlay-content">
          <h1>Full Screen Content</h1>
          <button @click="showOverlay = false">Close</button>
        </div>
      </div>
    </transition>
  </portal>
</template>

<script>
export default {
  data: () => ({
    showOverlay: false
  })
}
</script>

<style>
.full-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 9999;
  overflow: auto;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 🔧 Advanced Usage

### Manual Target Creation

```javascript
// Create target programmatically
Vue.createPortalTarget('my-target', document.querySelector('#custom-container'))

// Use in component
export default {
  mounted() {
    Vue.createPortalTarget('dynamic-target')
  },
  
  beforeDestroy() {
    Vue.removePortalTarget('dynamic-target')
  }
}
```

### Dynamic Target Switching

```html
<template>
  <div>
    <select v-model="targetName">
      <option value="sidebar-left">Left Sidebar</option>
      <option value="sidebar-right">Right Sidebar</option>
      <option value="footer">Footer</option>
    </select>
    
    <!-- Content will switch target based on selection -->
    <portal :to="targetName">
      <div>Dynamic Content</div>
    </portal>
  </div>
</template>

<script>
export default {
  data: () => ({
    targetName: 'sidebar-left'
  })
}
</script>
```

### Programmatic Portal Control

```javascript
export default {
  methods: {
    showModal() {
      // Manually send content to portal
      Vue.sendToPortal('modal', modalVNode, {
        order: 0,
        append: true,
        onMounted: () => {
          console.log('Modal mounted')
        }
      })
    },
    
    hideModal() {
      Vue.clearPortal('modal')
    }
  }
}
```

---

## ⚠️ Best Practices

### 1. Create Targets in Main Layout

```html
<!-- App.vue or main layout -->
<template>
  <div id="app">
    <header>...</header>
    
    <main>
      <router-view></router-view>
    </main>
    
    <!-- All portal targets in one place -->
    <portal-target name="modal"></portal-target>
    <portal-target name="notification"></portal-target>
    <portal-target name="tooltip"></portal-target>
    <portal-target name="sidebar"></portal-target>
  </div>
</template>
```

### 2. Use Descriptive Names

```html
<!-- ✅ GOOD -->
<portal to="modal-confirm">...</portal>
<portal to="notification-success">...</portal>

<!-- ❌ BAD -->
<portal to="modal">...</portal>
<portal to="target1">...</portal>
```

### 3. Handle Cleanup

```javascript
export default {
  beforeDestroy() {
    // Clean up portals when component is destroyed
    this.$emit('close-modal')
  }
}
```

### 4. Use Order for Z-Index

```html
<!-- Lower order = behind -->
<portal to="overlay" :order="1">
  <div class="backdrop"></div>
</portal>

<!-- Higher order = in front -->
<portal to="overlay" :order="2">
  <div class="modal-content"></div>
</portal>
```

---

## 🐛 Troubleshooting

### Problem: Portal content not appearing

**Solution:**
- Check if target exists: `Vue.hasPortalTarget('name')`
- Create target first: `<portal-target name="name">`
- Check console for warnings

### Problem: Multiple portals conflicting

**Solution:**
- Use different `order` values
- Use different target names
- Check `append` prop

### Problem: Portal not updating

**Solution:**
- Portal watches `to` prop for changes
- Force update with key: `<portal :key="updateKey">`

---

## 📊 Comparison

| Feature | portal-vue | Vue 2 Reborn Portal |
|---------|-----------|---------------------|
| Install Required | ✅ Yes | ❌ **Built-in** |
| Size | +3kb | **0kb** (included) |
| API | Complex | **Simple** |
| Multiple Targets | ✅ Yes | ✅ Yes |
| Dynamic Switching | ✅ Yes | ✅ Yes |
| Programmatic API | ✅ Yes | ✅ Yes |
| TypeScript | ✅ Yes | ✅ Yes |

---

## ✅ Summary

Vue 2 Portal provides:

- ✅ **Zero dependencies** - Built into Vue
- ✅ **Simple API** - Easy to learn
- ✅ **Flexible** - Multiple targets, ordering, dynamic switching
- ✅ **Reactive** - Updates with component state
- ✅ **Lifecycle aware** - Proper cleanup
- ✅ **TypeScript ready** - Full type support

---

**Version**: Vue 2.7.16 + Built-in Portal  
**Last Updated**: 2024
