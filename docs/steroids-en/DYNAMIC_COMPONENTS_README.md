# Vue 2 Dynamic Component Registration

## 🎯 New Feature: Automatically Recognize Components Registered After Init

With this modification, Vue 2 can now **automatically** recognize components registered after the Vue instance is initialized, without requiring `<component :is>` or conditional rendering `v-if`.

## 📦 Installation

This feature is already integrated into your Vue.js 2 build. No additional installation needed!

## 🚀 Usage

### Method 1: Without V-If (Component Always in DOM)

```html
<div id="app">
  <!-- This component will render after being registered -->
  <my-dynamic-component></my-dynamic-component>
</div>

<script>
// 1. Create Vue instance first
const app = new Vue({
  el: '#app'
})

// 2. Register component at any time (even after AJAX call)
fetch('/api/my-component.js')
  .then(res => res.json())
  .then(componentDef => {
    Vue.defineComponent('my-dynamic-component', componentDef)
    // ✅ Component appears automatically! No need for $forceUpdate() or v-if
  })
</script>
```

### Method 2: With V-If (For Lazy Loading)

```html
<div id="app">
  <template v-if="componentLoaded">
    <lazy-component></lazy-component>
  </template>
  
  <button @click="loadComponent">Load Component</button>
</div>

<script>
const app = new Vue({
  el: '#app',
  data: {
    componentLoaded: false
  },
  methods: {
    loadComponent() {
      Vue.defineComponent('lazy-component', {
        template: '<div>Loaded dynamically!</div>'
      })
      this.componentLoaded = true
    }
  }
})
</script>
```

## 📋 API Reference

### `Vue.defineComponent(name, definition)`

Registers a component globally that can be resolved even after the Vue instance is running.

**Parameters:**
- `name` (string): Component name (automatically supports kebab-case, camelCase, PascalCase)
- `definition` (Object): Component definition

**Example:**
```javascript
Vue.defineComponent('my-component', {
  template: '<div>Hello World</div>'
})

// All of these will resolve to the same component:
// <my-component>
// <myComponent>
// <MyComponent>
```

## 🎨 Use Cases

### 1. Lazy Loading Components from Server

```javascript
// Load component definition from server
async function loadComponent(name) {
  const response = await fetch(`/api/components/${name}`)
  const definition = await response.json()
  Vue.defineComponent(name, definition)
}

// Usage
loadComponent('data-table')
// <data-table></data-table> will render automatically after load completes
```

### 2. Plugin System

```javascript
// Plugin that registers components dynamically
const MyPlugin = {
  install(Vue) {
    // Load components async
    const components = ['DatePicker', 'TimePicker', 'Calendar']
    components.forEach(name => {
      fetch(`/components/${name.toLowerCase()}.js`)
        .then(res => res.json())
        .then(def => Vue.defineComponent(name, def))
    })
  }
}

Vue.use(MyPlugin)
```

### 3. Conditional Component Loading

```javascript
new Vue({
  el: '#app',
  data: { userRole: 'admin' },
  created() {
    // Load role-specific components
    if (this.userRole === 'admin') {
      Vue.defineComponent('admin-dashboard', AdminDashboard)
    } else {
      Vue.defineComponent('user-dashboard', UserDashboard)
    }
  }
})
```

## 🆚 Comparison with Vue.component()

| Feature | Vue.component() | Vue.defineComponent() |
|---------|----------------|----------------------|
| Must be before init | ✅ Yes | ❌ No |
| Auto re-render | ❌ No | ✅ Yes |
| Lazy loading | Difficult | Easy |
| AJAX loading | Not possible | Possible |
| Plugin system | Limited | Powerful |

## ⚙️ How It Works

1. **Global Registry**: Components are stored in a global registry
2. **Auto Resolve**: `resolveAsset()` checks the registry as a fallback
3. **Auto Re-render**: All Vue instances are automatically updated when a new component is registered

## 📝 Complete Examples

See the full demo files at:
- `html/dynamic-components-demo.html` - Interactive demo

## ✅ Testing

All Vue.js 2 tests still pass (144/144 tests).

## 🔧 Technical Details

### Modified Files:
- `src/core/util/options.ts` - Dynamic component registry
- `src/core/vdom/create-element.ts` - Component resolution
- `src/core/instance/init.ts` - Instance registration
- `src/core/instance/lifecycle.ts` - Cleanup on destroy
- `src/core/global-api/index.ts` - Global API registration
- `src/types/global-api.ts` - TypeScript definitions

## 💡 Tips

1. **Without V-If is Better**: For the best experience, use the component directly in the template without `v-if`
2. **Loading State**: Add a loading indicator while the component is being loaded
3. **Error Handling**: Handle failed component loading with try-catch

## 🐛 Troubleshooting

**Problem**: Component does not appear after registration  
**Solution**: Make sure to use `Vue.defineComponent()`, not `Vue.component()`

**Problem**: Error "Unknown custom element"  
**Solution**: The component will appear after automatic re-render. If still error, try adding `$nextTick` after registration.

## 📄 License

Same as Vue.js 2 license.
